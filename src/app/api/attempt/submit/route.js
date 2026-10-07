import { verifyToken } from "@/lib/middlewares/auth.middleware.js";
import { requireRole } from "@/lib/middlewares/role.middleware.js";
import { submitAttempt } from "@/lib/services/attempt.service.js";

export async function POST(req) {

  try {

    const decoded = verifyToken(req);

    requireRole("STUDENT")(decoded);

    const body = await req.json();

    const { attemptId } = body;

    const result = await submitAttempt(decoded.userId, attemptId);


    return Response.json({
      success: true,
      attempt: result
    });

  } catch (error) {

    return Response.json({
      success: false,
      message: error.message
    }, { status: 400 });

  }

}