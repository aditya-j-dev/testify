import { syncAnswers } from "@/lib/services/attempt.service.js";
import { cookies } from "next/headers";

async function extractUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("testify-token")?.value;
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).userId;
  } catch(e) { return null; }
}

export async function PUT(req, { params }) {
  try {
    const studentId = await extractUserId();
    if (!studentId) return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { id: attemptId } = await params;
    const body = await req.json();
    
    // Body: { questionId, selectedOptions (array), subjectiveText, clientSavedAt }
    const answer = await syncAnswers(studentId, attemptId, [body]);
    
    return Response.json({ success: true, answer }, { status: 200 });

  } catch (error) {
    // Return 409 Conflict if anti-cheat triggers
    const status = error.message.includes("rejected") ? 409 : 400;
    return Response.json({ success: false, message: error.message }, { status });
  }
}
