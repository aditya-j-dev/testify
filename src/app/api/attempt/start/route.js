import { verifyToken } from "@/lib/middlewares/auth.middleware.js";
import { requireRole } from "@/lib/middlewares/role.middleware.js";
import { startAttempt } from "@/lib/services/attempt.service.js";

export async function POST(req) {

  try {

    const decoded = verifyToken(req);

    requireRole("STUDENT")(decoded);

    const body = await req.json();

    const { examId } = body;

    const attempt = await startAttempt(decoded.userId, examId);

    return Response.json({
      success: true,
      attempt
    });

  } catch (error) {

    return Response.json({
      success: false,
      message: error.message
    }, { status: 400 });

  }

}

