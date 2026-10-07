import { createUserForCollege, getUsersByCollege, getUsersByBatch } from "@/lib/services/org.service";
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
    if (!auth || (auth.role !== "ADMIN" && auth.role !== "SUPER_ADMIN")) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") || "TEACHER";
    const batchId = searchParams.get("batchId");
    
    // Admins can only see users for their own college. Super Admins might pass collegeId in query.
    const collegeId = auth.role === "SUPER_ADMIN" ? searchParams.get("collegeId") : auth.collegeId;

    if (!collegeId) return Response.json({ success: false, message: "No college context found" }, { status: 400 });

    let users;
    if (batchId && role === "STUDENT") {
      users = await getUsersByBatch(batchId);
    } else {
      users = await getUsersByCollege(collegeId, role);
    }
    
    return Response.json({ success: true, users });
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
    const role = body.role || "TEACHER";
    const batchId = body.batchId;

    if (!collegeId) return Response.json({ success: false, message: "Missing college context" }, { status: 400 });

    const user = await createUserForCollege(collegeId, { ...body, role, batchId });
    const { passwordHash: _, ...safeUser } = user;
    
    return Response.json({ success: true, user: safeUser }, { status: 201 });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}
