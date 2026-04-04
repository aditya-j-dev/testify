import { verifyToken } from "@/lib/middlewares/auth.middleware.js";
import { requireRole } from "@/lib/middlewares/role.middleware.js";
import { saveAnswerService } from "@/lib/services/attempt.service.js";

export async function POST(req) {

  try {

    const decoded = verifyToken(req);

    requireRole("STUDENT")(decoded);

    const body = await req.json();

    const answer = await saveAnswerService(decoded.userId, body);

    return Response.json({
      success: true,
      answer
    });

  } catch (error) {

    return Response.json({
      success: false,
      message: error.message
    }, { status: 400 });

  }

}