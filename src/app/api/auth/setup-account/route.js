import { completeAccountSetup } from "@/lib/services/onboarding.service.js";

/**
 * POST /api/auth/setup-account
 * Body: { token: string, password: string }
 *
 * Validates the setup JWT, sets the admin's password, marks setup as complete,
 * and returns a full auth token to immediately log the user in.
 */
export async function POST(req) {
  try {
    const { token, password } = await req.json();

    const result = await completeAccountSetup(token, password);

    return Response.json({
      success: true,
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    console.error("[SETUP ACCOUNT ERROR]", error);

    const status = error.code === "TOKEN_EXPIRED" ? 410 : 400;

    return Response.json(
      {
        success: false,
        message: error.message,
        code: error.code || null,
      },
      { status }
    );
  }
}
