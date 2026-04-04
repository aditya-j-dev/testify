import { calculateSemesterGPA } from "@/lib/services/grading.service.js";
import { cookies } from "next/headers";

function extractUserId() {
  const cookieStore = cookies();
  const token = cookieStore.get("testify-token")?.value;
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).userId;
  } catch(e) { return null; }
}

export async function GET(req) {
  try {
    const studentId = extractUserId();
    if (!studentId) return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const semester = parseInt(searchParams.get('semester') || "1", 10);

    const result = await calculateSemesterGPA(studentId, semester);
    return Response.json({ success: true, result }, { status: 200 });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}
