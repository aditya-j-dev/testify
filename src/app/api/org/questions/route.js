import { createQuestion, getQuestionsByCollege } from "@/lib/services/question.service";
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

    const { searchParams } = new URL(req.url);
    const collegeId = auth.role === "SUPER_ADMIN" ? searchParams.get("collegeId") : auth.collegeId;
    
    if (!collegeId) return Response.json({ success: false, message: "Missing college context" }, { status: 400 });

    const filters = {
       subjectId: searchParams.get("subjectId"),
       type: searchParams.get("type"),
       creatorId: searchParams.get("creatorId")
    };

    const questions = await getQuestionsByCollege(collegeId, filters);
    return Response.json({ success: true, questions });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = await getAuthContext();
    // Only teachers and admins can create questions
    if (!auth || (auth.role !== "TEACHER" && auth.role !== "ADMIN")) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const collegeId = auth.collegeId;
    const creatorId = auth.userId;

    if (!collegeId) return Response.json({ success: false, message: "No college context found" }, { status: 400 });

    const question = await createQuestion({ 
      ...body, 
      collegeId, 
      creatorId 
    });
    
    return Response.json({ success: true, question }, { status: 201 });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}
