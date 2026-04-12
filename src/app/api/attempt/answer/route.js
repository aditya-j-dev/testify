import { verifyToken } from "@/lib/middlewares/auth.middleware.js";
import { requireRole } from "@/lib/middlewares/role.middleware.js";
import { syncAnswers } from "@/lib/services/attempt.service.js";

export async function POST(req) {

  try {

    const decoded = verifyToken(req);

    requireRole("STUDENT")(decoded);

    const body = await req.json();

    // body: { attemptId, questionId, selectedOptions, subjectiveText, clientSavedAt }
    const { attemptId, ...answerData } = body;
    const result = await syncAnswers(decoded.userId, attemptId, [answerData]);

    return Response.json({
      success: true,
      result
    });


  } catch (error) {

    return Response.json({
      success: false,
      message: error.message
    }, { status: 400 });

  }

}