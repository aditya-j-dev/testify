import { getStudentResultSummary, calculateSemesterGPA } from "@/lib/services/grading.service.js";
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
    const studentId = extractUserId();
    if (!studentId) return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const semester = searchParams.get("semester");

    if (semester) {
      const gpa = await calculateSemesterGPA(studentId, parseInt(semester, 10));
      return Response.json({ success: true, gpa }, { status: 200 });
    }

    const summary = await getStudentResultSummary(studentId);
    return Response.json({ success: true, summary }, { status: 200 });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}
