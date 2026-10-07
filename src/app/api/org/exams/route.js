import { createDraftExam, getExamsByCreator } from "@/lib/services/exam.service";
import { cookies } from "next/headers";

async function getAuthContext() {
  const cookieStore = await cookies();
  const token = cookieStore.get("testify-token")?.value;
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload;
  } catch (e) { return null; }
}

export async function GET(req) {
  try {
    const auth = await getAuthContext();
    if (!auth || (auth.role !== "TEACHER" && auth.role !== "ADMIN")) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const exams = await getExamsByCreator(auth.userId);
    return Response.json({ success: true, exams });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = await getAuthContext();
    if (!auth || (auth.role !== "TEACHER" && auth.role !== "ADMIN")) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const collegeId = auth.collegeId;

    if (!collegeId) return Response.json({ success: false, message: "Missing college context" }, { status: 400 });

    const exam = await createDraftExam(auth.userId, { ...body, collegeId });
    return Response.json({ success: true, exam }, { status: 201 });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}
