import { logProctorEvent } from "@/lib/services/attempt.service.js";
import { cookies } from "next/headers";

async function extractUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("testify-token")?.value;
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).userId;
  } catch(e) { return null; }
}

export async function POST(req, { params }) {
  try {
    const studentId = await extractUserId();
    if (!studentId) return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { id: attemptId } = await params;
    const body = await req.json();
    
    if (!body.event) return Response.json({ success: false, message: "Event required" }, { status: 400 });

    const result = await logProctorEvent(studentId, attemptId, body.event, body.metadata);
    
    return Response.json({ success: true, ...result }, { status: 201 });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}
