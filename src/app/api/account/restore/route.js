import { restoreAccount } from "@/lib/services/cancellation.service.js";
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

// POST /api/account/restore
// Body: { collegeId: string }
// SUPER_ADMIN only
export async function POST(req) {
  try {
    const auth = await getAuthContext();
    if (!auth || auth.role !== "SUPER_ADMIN") {
      return Response.json(
        { success: false, message: "Unauthorized — Super Admin only" },
        { status: 403 }
      );
    }

    const { collegeId } = await req.json();
    if (!collegeId) {
      return Response.json(
        { success: false, message: "collegeId is required" },
        { status: 400 }
      );
    }

    const result = await restoreAccount(collegeId);

    return Response.json({
      success: true,
      message: "College account restored. Status set to TRIAL_EXPIRED — admin must re-subscribe.",
      ...result,
    });
  } catch (error) {
    console.error("[POST /api/account/restore]", error);
    return Response.json(
      { success: false, message: error.message },
      { status: error.statusCode || 400 }
    );
  }
}
