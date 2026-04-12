import prisma from "../prisma.js";
import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Subscription Decision Tree (Section 12 of spec)
// ---------------------------------------------------------------------------
// 1. Extract collegeId from JWT cookie (decoded client-side in routes already;
//    here we get it from a helper or from the parsed cookie).
// 2. Fetch college (404 if deletedAt set or not found).
// 3. TRIAL        → check trialEndsAt, auto-flip to TRIAL_EXPIRED if past.
//                   On write ops: enforce resource limits (done in service layer).
// 4. TRIAL_EXPIRED / SUSPENDED / CANCELLED → 402 (allow GET for TRIAL_EXPIRED).
// 5. ACTIVE       → check currentPeriodEnd, auto-flip to SUSPENDED if past.
// ---------------------------------------------------------------------------

/**
 * Resolves the college for a given collegeId, applying automatic status
 * transitions (TRIAL→TRIAL_EXPIRED, ACTIVE→SUSPENDED) in-band.
 *
 * Returns the college row (with updated status) or throws a structured error.
 */
export async function resolveCollegeSubscription(collegeId) {
  if (!collegeId) {
    throw Object.assign(new Error("No college context"), { statusCode: 400 });
  }

  const college = await prisma.college.findUnique({
    where: { id: collegeId },
    select: {
      id: true,
      name: true,
      subscriptionStatus: true,
      planType: true,
      trialEndsAt: true,
      currentPeriodEnd: true,
      deletedAt: true,
    },
  });

  // 404: college deleted or not found
  if (!college || college.deletedAt) {
    throw Object.assign(new Error("College not found"), { statusCode: 404 });
  }

  let status = college.subscriptionStatus;
  const now = new Date();

  // ── Auto-transition: TRIAL → TRIAL_EXPIRED ──────────────────────────────
  if (status === "TRIAL" && college.trialEndsAt && college.trialEndsAt < now) {
    await prisma.college.update({
      where: { id: collegeId },
      data: { subscriptionStatus: "TRIAL_EXPIRED" },
    });
    status = "TRIAL_EXPIRED";
  }

  // ── Auto-transition: ACTIVE → SUSPENDED ─────────────────────────────────
  if (
    status === "ACTIVE" &&
    college.currentPeriodEnd &&
    college.currentPeriodEnd < now
  ) {
    await prisma.college.update({
      where: { id: collegeId },
      data: { subscriptionStatus: "SUSPENDED" },
    });
    status = "SUSPENDED";
  }

  return { ...college, subscriptionStatus: status };
}

/**
 * Higher-Order Function: wraps an API route handler with subscription checks.
 *
 * Usage:
 *   export const POST = withSubscriptionCheck(async (req, ctx) => { ... });
 *   export const GET  = withSubscriptionCheck(async (req, ctx) => { ... }, { allowReadOnly: true });
 *
 * Options:
 *   allowReadOnly  — if true, TRIAL_EXPIRED colleges may still perform GET-like
 *                    operations. This lets admins see dashboards but not mutate.
 *   requireCollegeId — if false, skips the check (for SUPER_ADMIN-only routes).
 */
export function withSubscriptionCheck(handler, options = {}) {
  const { allowReadOnly = false, requireCollegeId = true } = options;

  return async function (req, ctx) {
    // ── Extract collegeId from cookie (JWT already decoded by client) ──────
    const collegeId = await extractCollegeIdFromCookie(req);

    if (!collegeId) {
      if (!requireCollegeId) {
        // SUPER_ADMIN routes that don't need a collegeId: skip check
        return handler(req, ctx);
      }
      return Response.json(
        { success: false, message: "Unauthorized — no college context" },
        { status: 401 }
      );
    }

    let college;
    try {
      college = await resolveCollegeSubscription(collegeId);
    } catch (err) {
      return Response.json(
        { success: false, message: err.message },
        { status: err.statusCode || 500 }
      );
    }

    const status = college.subscriptionStatus;
    const isReadRequest = req.method === "GET" || req.method === "HEAD";

    // ── Status gate ──────────────────────────────────────────────────────────
    if (status === "CANCELLED") {
      return Response.json(
        {
          success: false,
          message: "This account has been cancelled.",
          subscriptionStatus: status,
        },
        { status: 404 }
      );
    }

    if (status === "TRIAL_EXPIRED" || status === "SUSPENDED") {
      if (isReadRequest && allowReadOnly) {
        // Allow read — inject college context and continue
        req._college = college;
        return handler(req, ctx);
      }
      return Response.json(
        {
          success: false,
          message:
            status === "TRIAL_EXPIRED"
              ? "Your free trial has ended. Please upgrade to continue."
              : "Your subscription is suspended. Please renew to continue.",
          subscriptionStatus: status,
        },
        { status: 402 }
      );
    }

    // ── Status OK (TRIAL or ACTIVE): inject college context and proceed ──────
    req._college = college;
    return handler(req, ctx);
  };
}

// ---------------------------------------------------------------------------
// Cookie helper — reads the testify-token JWT and extracts collegeId
// ---------------------------------------------------------------------------
async function extractCollegeIdFromCookie(req) {
  try {
    // Get cookie from the request headers (works in Next.js App Router)
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/testify-token=([^;]+)/);
    if (!match) return null;

    const token = match[1];
    // Decode JWT payload (base64url) without verifying signature here —
    // auth middleware MUST run before this in the actual route.
    const payload = JSON.parse(
      Buffer.from(
        token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"),
        "base64"
      ).toString("utf8")
    );
    return payload?.collegeId || null;
  } catch {
    return null;
  }
}
