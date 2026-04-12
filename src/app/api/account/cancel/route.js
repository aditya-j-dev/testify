import { requestCancellation } from "@/lib/services/cancellation.service.js";
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

// POST /api/account/cancel
// Body: { reason?: string }
export async function POST(req) {
  try {
    const auth = await getAuthContext();
    if (!auth || auth.role !== "ADMIN") {
      return Response.json(
        { success: false, message: "Unauthorized — Admin only" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { reason } = body;

    const result = await requestCancellation(auth.collegeId, auth.userId, reason);

    return Response.json({
      success: true,
      message: "Cancellation request submitted. Your data will be retained during the grace period.",
      scheduledAt: result.cancellationRequest.scheduledAt,
    });
  } catch (error) {
    console.error("[POST /api/account/cancel]", error);
    return Response.json(
      { success: false, message: error.message },
      { status: error.statusCode || 400 }
    );
  }
}
