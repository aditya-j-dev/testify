import { createDraftExam, getExamsByCreator } from "@/lib/services/exam.service.js";
import { cookies } from "next/headers";

async function extractUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("testify-token")?.value;
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).userId;
  } catch(e) { return null; }
}

export async function GET() {
  try {
    const teacherId = await extractUserId();
    if (!teacherId) return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const exams = await getExamsByCreator(teacherId);
    return Response.json({ success: true, exams }, { status: 200 });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function POST(req) {
  try {
    const teacherId = await extractUserId();
    if (!teacherId) return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const exam = await createDraftExam(teacherId, body);
    
    return Response.json({ success: true, exam }, { status: 201 });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}