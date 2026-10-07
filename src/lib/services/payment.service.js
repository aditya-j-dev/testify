import prisma from "../prisma.js";
import { getPlanByType } from "./subscription.service.js";
import crypto from "crypto";


// ---------------------------------------------------------------------------
// Payment Service — gateway-agnostic payment lifecycle
// ---------------------------------------------------------------------------
// Gateway integrations are thin wrappers. The spec includes both Razorpay and
// Stripe. Razorpay is the default for INR. Stripe is included as an alternative.
// ---------------------------------------------------------------------------

// ── Razorpay helper ──────────────────────────────────────────────────────────
async function createRazorpayOrder(amountInPaise, currency, receiptId) {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) throw new Error("Razorpay credentials not configured");

  const credentials = Buffer.from(`${key_id}:${key_secret}`).toString("base64");

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency,
      receipt: receiptId,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Razorpay order creation failed: ${err.error?.description || response.statusText}`);
  }

  return response.json(); // { id, amount, currency, receipt, ... }
}

// ── Razorpay signature verification ──────────────────────────────────────────
function verifyRazorpaySignature(orderId, paymentId, signature) {
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return expectedSignature === signature;
}

// ---------------------------------------------------------------------------
// initiatePayment — creates a Payment row (PENDING) and a gateway order
// ---------------------------------------------------------------------------
export async function initiatePayment(collegeId, planType, gateway = "razorpay") {
  const plan = await getPlanByType(planType);

  const college = await prisma.college.findUnique({
    where: { id: collegeId },
    select: { id: true, name: true, subscriptionStatus: true },
  });
  if (!college) throw new Error("College not found");

  const receiptId = `testify_${collegeId.slice(0, 8)}_${Date.now()}`;
  let gatewayOrderId = null;

  if (gateway === "razorpay") {
    const order = await createRazorpayOrder(plan.priceInPaise, plan.currency, receiptId);
    gatewayOrderId = order.id;
  } else {
    throw new Error(`Gateway "${gateway}" not supported yet`);
  }

  const payment = await prisma.payment.create({
    data: {
      collegeId,
      amountInPaise: plan.priceInPaise,
      currency: plan.currency,
      status: "PENDING",
      planType,
      gateway,
      gatewayOrderId,
    },
  });

  return {
    payment,
    gatewayOrderId,
    amount: plan.priceInPaise,
    currency: plan.currency,
    key: process.env.RAZORPAY_KEY_ID, // sent to frontend for Razorpay checkout
  };
}

// ---------------------------------------------------------------------------
// handlePaymentWebhook — verifies signature, idempotent, activates subscription
// ---------------------------------------------------------------------------
export async function handlePaymentWebhook(gateway, body, signature) {
  if (gateway !== "razorpay") throw new Error("Unsupported gateway");

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, event } = body;

  // Only handle successful payment events
  if (event && event !== "payment.captured") return { skipped: true, event };

  // Verify signature
  if (!verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature || signature)) {
    throw Object.assign(new Error("Invalid webhook signature"), { statusCode: 400 });
  }

  // Idempotency: skip if already processed
  const existing = await prisma.payment.findFirst({
    where: { gatewayPaymentId: razorpay_payment_id, status: "SUCCESS" },
  });
  if (existing) return { idempotent: true, paymentId: existing.id };

  // Find the pending payment by gateway order ID
  const payment = await prisma.payment.findFirst({
    where: { gatewayOrderId: razorpay_order_id },
  });
  if (!payment) throw new Error(`Payment not found for order: ${razorpay_order_id}`);

  // Activate subscription
  await activateSubscription(payment.collegeId, payment.id, payment.planType, razorpay_payment_id);

  return { success: true, paymentId: payment.id };
}

// ---------------------------------------------------------------------------
// activateSubscription — atomic: deactivate old sub, create new, update College
// ---------------------------------------------------------------------------
export async function activateSubscription(collegeId, paymentId, planType, gatewayPaymentId = null) {
  const plan = await getPlanByType(planType);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

  await prisma.$transaction(async (tx) => {
    // 1. Deactivate previous subscriptions
    await tx.collegeSubscription.updateMany({
      where: { collegeId, isActive: true },
      data: { isActive: false },
    });

    // 2. Create new subscription
    await tx.collegeSubscription.create({
      data: {
        collegeId,
        paymentId,
        planType,
        startedAt: now,
        expiresAt,
        isActive: true,
      },
    });

    // 3. Update payment to SUCCESS
    await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: "SUCCESS",
        gatewayPaymentId: gatewayPaymentId || undefined,
        paidAt: now,
        billingPeriodStart: now,
        billingPeriodEnd: expiresAt,
      },
    });

    // 4. Update College
    await tx.college.update({
      where: { id: collegeId },
      data: {
        subscriptionStatus: "ACTIVE",
        planType,
        currentPeriodStart: now,
        currentPeriodEnd: expiresAt,
      },
    });
  });

  return { activated: true, expiresAt };
}

// ---------------------------------------------------------------------------
// handlePaymentFailure — marks payment as FAILED
// ---------------------------------------------------------------------------
export async function handlePaymentFailure(gatewayOrderId, reason) {
  const payment = await prisma.payment.findFirst({
    where: { gatewayOrderId },
  });
  if (!payment) throw new Error("Payment not found");

  return prisma.payment.update({
    where: { id: payment.id },
    data: { status: "FAILED", failureReason: reason || "Unknown" },
  });
}

// ---------------------------------------------------------------------------
// getPaymentHistory — for the billing dashboard
// ---------------------------------------------------------------------------
export async function getPaymentHistory(collegeId) {
  return prisma.payment.findMany({
    where: { collegeId },
    orderBy: { createdAt: "desc" },
  });
}
