import { createQuestion, getQuestionsBySubject } from "@/lib/services/question.service.js";
import { getToken } from "@/lib/auth";
// Note: In real Next.js API, you'd use cookies() from next/headers to get server-side token 
// and decode to get user id.
import { cookies } from "next/headers";

function extractUserId(req) {
  const cookieStore = cookies();
  const token = cookieStore.get("testify-token")?.value;
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.userId;
  } catch(e) { return null; }
}

export async function POST(req) {
  try {
    const teacherId = extractUserId(req);
    if (!teacherId) return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const question = await createQuestion(teacherId, body);
    
    return Response.json({ success: true, question }, { status: 201 });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');
    if (!subjectId) return Response.json({ success: false, message: "subjectId required" }, { status: 400 });

    const questions = await getQuestionsBySubject(subjectId);
    return Response.json({ success: true, questions });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}
