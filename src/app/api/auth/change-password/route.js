import { updateUserPassword } from "@/lib/services/auth.service.js";
import jwt from "jsonwebtoken";

/**
 * POST /api/auth/change-password
 * Body: { password: string }
 *
 * Securely updates the logged-in user's password and removes the 
 * requirePasswordChange flag.
 */
export async function POST(req) {
  try {
    const token = req.cookies.get("testify-token")?.value || req.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { password } = await req.json();

    if (!password || password.length < 8) {
      return Response.json({ success: false, message: "Password must be at least 8 characters" }, { status: 400 });
    }

    await updateUserPassword(decoded.userId, password);

    return Response.json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (error) {
    console.error("[CHANGE_PASSWORD_API_ERROR]", error);
    return Response.json({
      success: false,
      message: error.message || "An unexpected error occurred"
    }, { status: 400 });
  }
}
