import { deleteExam, getExamById, updateExam } from "@/lib/services/exam.service";
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

export async function GET(req, { params }) {
  try {
    const auth = await getAuthContext();
    if (!auth) return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const exam = await getExamById(id, auth.userId);
    return Response.json({ success: true, exam });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 404 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const auth = await getAuthContext();
    if (!auth) return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const exam = await updateExam(id, auth.userId, body);
    return Response.json({ success: true, exam });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const auth = await getAuthContext();
    if (!auth) return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await deleteExam(id, auth.userId);
    return Response.json({ success: true, message: "Exam deleted" });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}
