import { submitAttempt } from "@/lib/services/attempt.service";
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

export async function POST(req, { params }) {
  try {
    const auth = await getAuthContext();
    if (!auth) return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    
    const attempt = await submitAttempt(auth.userId, id);
    return Response.json({ success: true, attempt });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}
