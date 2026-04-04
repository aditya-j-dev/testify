import { startAttempt, submitAttempt } from "@/lib/services/attempt.service.js";
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
    const studentId = extractUserId();
    if (!studentId) return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    
    // Distinguish between Start and Submit based on action flag
    if (body.action === "START") {
       const attempt = await startAttempt(studentId, body.examId);
       return Response.json({ success: true, attempt }, { status: 201 });
    }
    
    if (body.action === "SUBMIT") {
       const attempt = await submitAttempt(studentId, body.attemptId);
       return Response.json({ success: true, attempt }, { status: 200 });
    }

    return Response.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}
