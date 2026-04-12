import { onboardCollege } from "@/lib/services/onboarding.service.js";

export async function POST(req) {
  try {
    const body = await req.json();

    const result = await onboardCollege(body);

    return Response.json({
      success: true,
      user: result.user,
      token: result.token,
      college: result.college,
      trialEndsAt: result.trialEndsAt,
    });
  } catch (error) {
    console.error("[ONBOARDING ERROR]", error);
    return Response.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
