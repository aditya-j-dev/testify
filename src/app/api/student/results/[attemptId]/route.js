import { getStudentAttemptDetail } from "@/lib/services/grading.service.js";
import { cookies } from "next/headers";

async function extractUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("testify-token")?.value;
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.userId;
  } catch(e) { return null; }
}

export async function GET(req, { params }) {
  try {
    const studentId = await extractUserId();
    if (!studentId) return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { attemptId } = await params;
    const attempt = await getStudentAttemptDetail(studentId, attemptId);

    return Response.json({ success: true, attempt }, { status: 200 });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}
