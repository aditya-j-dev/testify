import { resendSetupLink } from "@/lib/services/onboarding.service.js";

/**
 * POST /api/auth/resend-setup
 * Body: { email: string }
 *
 * Generates a new setup token and sends a fresh setup email.
 * Called when the admin's previous setup link has expired (24h).
 */
export async function POST(req) {
  try {
    const { email } = await req.json();
    await resendSetupLink(email);

    return Response.json({
      success: true,
      message: "A new setup link has been sent to your email.",
    });
  } catch (error) {
    console.error("[RESEND SETUP ERROR]", error);
    return Response.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
