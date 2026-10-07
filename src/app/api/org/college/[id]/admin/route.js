import { createUserForCollege } from "@/lib/services/org.service";

export async function POST(req, { params }) {
  try {
    const { id: collegeId } = await params;
    const body = await req.json();
    
    const admin = await createUserForCollege(collegeId, { ...body, role: "ADMIN" });
    
    // Sanitize user object for response
    const { passwordHash: _, ...safeAdmin } = admin;
    
    return Response.json({ success: true, admin: safeAdmin }, { status: 201 });
  } catch (error) {
    console.error("POST Admin Create Error:", error);
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}
