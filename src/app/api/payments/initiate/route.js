import { initiatePayment } from "@/lib/services/payment.service.js";
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

// POST /api/payments/initiate
// Body: { planType: "STARTER" | "PROFESSIONAL" | "ENTERPRISE", gateway?: "razorpay" }
export async function POST(req) {
  try {
    const auth = await getAuthContext();
    if (!auth || auth.role !== "ADMIN") {
      return Response.json(
        { success: false, message: "Unauthorized — Admin only" },
        { status: 401 }
      );
    }

    const { planType, gateway = "razorpay" } = await req.json();

    if (!planType) {
      return Response.json(
        { success: false, message: "planType is required" },
        { status: 400 }
      );
    }

    const result = await initiatePayment(auth.collegeId, planType, gateway);

    return Response.json({ success: true, ...result }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/payments/initiate]", error);
    return Response.json(
      { success: false, message: error.message },
      { status: error.statusCode || 400 }
    );
  }
}
