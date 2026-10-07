import prisma from "@/lib/prisma.js";
import { cookies } from "next/headers";

async function requireSuperAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("testify-token")?.value;
  if (!token) throw Object.assign(new Error("Unauthorized"), { status: 401 });
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8")
    );
    if (payload.role !== "SUPER_ADMIN") throw Object.assign(new Error("Forbidden"), { status: 403 });
    return payload;
  } catch (e) {
    if (e.status) throw e;
    throw Object.assign(new Error("Invalid token"), { status: 401 });
  }
}

// GET /api/super-admin/plans — list all plans
export async function GET() {
  try {
    await requireSuperAdmin();
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { priceInPaise: "asc" },
    });
    return Response.json({ success: true, plans });
  } catch (err) {
    return Response.json({ success: false, message: err.message }, { status: err.status || 500 });
  }
}

// PATCH /api/super-admin/plans — update a plan by planType
export async function PATCH(req) {
  try {
    await requireSuperAdmin();
    const body = await req.json();
    const { planType, ...updates } = body;

    if (!planType) return Response.json({ success: false, message: "planType is required" }, { status: 400 });

    // Only allow safe numeric/boolean fields to be updated
    const allowed = ["maxBranches", "maxBatches", "maxTeachers", "maxStudents", "maxExams",
                     "priceInPaise", "durationDays", "isActive", "features", "name"];
    const safeUpdates = {};
    for (const key of allowed) {
      if (key in updates) safeUpdates[key] = updates[key];
    }

    const plan = await prisma.subscriptionPlan.update({
      where: { planType },
      data: safeUpdates,
    });

    return Response.json({ success: true, plan });
  } catch (err) {
    return Response.json({ success: false, message: err.message }, { status: err.status || 500 });
  }
}
