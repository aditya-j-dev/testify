import { createSubject, getSubjectsByCollege } from "@/lib/services/org.service";
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
    if (!auth || (auth.role !== "ADMIN" && auth.role !== "SUPER_ADMIN" && auth.role !== "TEACHER")) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const collegeId = auth.role === "SUPER_ADMIN" ? searchParams.get("collegeId") : auth.collegeId;

    if (!collegeId) return Response.json({ success: false, message: "Missing college context" }, { status: 400 });

    const subjects = await getSubjectsByCollege(collegeId);
    return Response.json({ success: true, subjects });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = await getAuthContext();
    if (!auth || (auth.role !== "ADMIN" && auth.role !== "SUPER_ADMIN")) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const collegeId = auth.role === "SUPER_ADMIN" ? body.collegeId : auth.collegeId;

    if (!collegeId) return Response.json({ success: false, message: "Missing college context" }, { status: 400 });

    const subject = await createSubject({ ...body, collegeId });
    return Response.json({ success: true, subject }, { status: 201 });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}
