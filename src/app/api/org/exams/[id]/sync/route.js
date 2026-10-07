import { recalculateExamResults } from "@/lib/services/grading.service.js";
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

export async function POST(req, { params }) {
  try {
    const teacherId = await extractUserId();
    if (!teacherId) return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { id: examId } = await params;
    const result = await recalculateExamResults(teacherId, examId);

    return Response.json({ success: true, ...result });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}
