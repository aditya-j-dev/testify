import { getPaymentHistory } from "@/lib/services/payment.service.js";
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

// GET /api/payments/history
// Admin: returns their own college payments
// Super Admin: ?collegeId= returns any college's payments
export async function GET(req) {
  try {
    const auth = await getAuthContext();
    if (!auth || (auth.role !== "ADMIN" && auth.role !== "SUPER_ADMIN")) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    let collegeId;
    if (auth.role === "SUPER_ADMIN") {
      const { searchParams } = new URL(req.url);
      collegeId = searchParams.get("collegeId");
      if (!collegeId) {
        return Response.json({ success: false, message: "collegeId query param required" }, { status: 400 });
      }
    } else {
      collegeId = auth.collegeId;
    }

    const payments = await getPaymentHistory(collegeId);
    return Response.json({ success: true, payments });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
