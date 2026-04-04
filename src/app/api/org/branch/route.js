import { createBranch, getBranchesByCollege } from "@/lib/services/org.service.js";

// GET /api/org/branch?collegeId=123
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const collegeId = searchParams.get('collegeId');

    if (!collegeId) {
       return Response.json({ success: false, message: "collegeId query param required" }, { status: 400 });
    }

    const branches = await getBranchesByCollege(collegeId);
    return Response.json({ success: true, branches });
  } catch (error) {
    console.error("GET Branch Error:", error);
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST /api/org/branch
export async function POST(req) {
  try {
    const body = await req.json();
    const branch = await createBranch(body);
    
    return Response.json({ success: true, branch }, { status: 201 });
  } catch (error) {
    console.error("POST Branch Error:", error);
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}
