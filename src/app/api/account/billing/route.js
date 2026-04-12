import { getCollegeUsage } from "@/lib/services/subscription.service.js";
import { resolveCollegeSubscription } from "@/lib/middlewares/subscription.middleware.js";
import { cookies } from "next/headers";

async function getAuthContext() {
  const cookieStore = await cookies();
  const token = cookieStore.get("testify-token")?.value;
  if (!token) return null;
  try {
    return JSON.parse(
      Buffer.from(
        token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"),
        "base64"
      ).toString("utf8")
    );
  } catch {
    return null;
  }
}

// GET /api/account/billing
// Returns: college subscription status + resource usage
export async function GET() {
  try {
    const auth = await getAuthContext();
    if (!auth || auth.role !== "ADMIN") {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const [college, usage] = await Promise.all([
      resolveCollegeSubscription(auth.collegeId),
      getCollegeUsage(auth.collegeId),
    ]);

    return Response.json({
      success: true,
      billing: {
        subscriptionStatus: college.subscriptionStatus,
        planType: college.planType,
        plan: usage?.plan || college.planType,
        trialEndsAt: college.trialEndsAt,
        currentPeriodEnd: college.currentPeriodEnd,
        usage: usage?.usage || null,
        features: usage?.features || null,
      },
    });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: error.statusCode || 500 }
    );
  }
}
