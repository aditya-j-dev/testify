import { logProctorEvent } from "@/lib/services/attempt.service.js";
import { cookies } from "next/headers";

function extractUserId() {
  const cookieStore = cookies();
  const token = cookieStore.get("testify-token")?.value;
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).userId;
  } catch(e) { return null; }
}

export async function POST(req, { params }) {
  try {
    const studentId = extractUserId();
    if (!studentId) return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const attemptId = params.id;
    const body = await req.json();
    
    if (!body.event) return Response.json({ success: false, message: "Event required" }, { status: 400 });

    const log = await logProctorEvent(studentId, attemptId, body.event, body.metadata);
    
    return Response.json({ success: true, log }, { status: 201 });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}
