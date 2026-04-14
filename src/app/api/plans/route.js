import prisma from "@/lib/prisma.js";

// GET /api/plans
// Public/Authenticated endpoint to fetch available subscription tiers.
// Excludes 'TRIAL' as it's not an upgradeable option.
export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: {
        isActive: true,
        planType: {
          not: "TRIAL"
        }
      },
      orderBy: {
        priceInPaise: "asc",
      },
    });

    return Response.json({ success: true, plans });
  } catch (error) {
    console.error("[GET /api/plans]", error);
    return Response.json(
      { success: false, message: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}
