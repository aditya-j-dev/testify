import { getAvailableExams } from "@/lib/services/attempt.service";
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
    if (!auth) return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const exams = await getAvailableExams(auth.userId);
    return Response.json({ success: true, exams });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}
