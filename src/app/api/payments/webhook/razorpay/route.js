import { handlePaymentWebhook } from "@/lib/services/payment.service.js";

// POST /api/payments/webhook/razorpay
// Called by Razorpay after payment capture
// Razorpay sends: razorpay_order_id, razorpay_payment_id, razorpay_signature
export async function POST(req) {
  try {
    // Read raw body for signature verification
    const rawBody = await req.text();
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return Response.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
    }

    // Razorpay sends the signature in the "X-Razorpay-Signature" header for event webhooks
    // For order payment verification, the signature is in the body
    const headerSignature = req.headers.get("x-razorpay-signature") || null;

    const result = await handlePaymentWebhook("razorpay", body, headerSignature);

    return Response.json({ success: true, ...result });
  } catch (error) {
    console.error("[POST /api/payments/webhook/razorpay]", error);
    return Response.json(
      { success: false, message: error.message },
      { status: error.statusCode || 400 }
    );
  }
}
