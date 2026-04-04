import { gradeSubjectiveAnswer } from "@/lib/services/grading.service.js";
import { cookies } from "next/headers";

function extractUserId() {
  const cookieStore = cookies();
  const token = cookieStore.get("testify-token")?.value;
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).userId;
  } catch(e) { return null; }
}

export async function POST(req) {
  try {
    const teacherId = extractUserId();
    if (!teacherId) return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { answerId, marksObtained, feedback } = body;
    
    if (!answerId || marksObtained === undefined) {
      return Response.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const result = await gradeSubjectiveAnswer(teacherId, answerId, parseFloat(marksObtained), feedback);
    return Response.json(result, { status: 200 });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}
