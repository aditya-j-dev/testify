import { getPendingGradingExams, getExamAttemptsForGrading, getFullAttemptForGrading } from "@/lib/services/grading.service.js";
import { cookies } from "next/headers";

function extractUserId() {
  const cookieStore = cookies();
  const token = cookieStore.get("testify-token")?.value;
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.userId;
  } catch(e) { return null; }
}

export async function GET(req) {
  try {
    const teacherId = extractUserId();
    if (!teacherId) return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const examId = searchParams.get("examId");
    const attemptId = searchParams.get("attemptId");

    if (attemptId) {
      const attempt = await getFullAttemptForGrading(teacherId, attemptId);
      return Response.json({ success: true, attempt }, { status: 200 });
    }

    if (examId) {
      const attempts = await getExamAttemptsForGrading(teacherId, examId);
      return Response.json({ success: true, attempts }, { status: 200 });
    }

    const exams = await getPendingGradingExams(teacherId);
    return Response.json({ success: true, exams }, { status: 200 });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}
