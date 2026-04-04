import { createCollege, getColleges } from "@/lib/services/org.service.js";

// GET /api/org/college
export async function GET() {
  try {
    const colleges = await getColleges();
    return Response.json({ success: true, colleges });
  } catch (error) {
    console.error("GET College Error:", error);
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST /api/org/college
export async function POST(req) {
  try {
    const body = await req.json();
    const college = await createCollege(body);
    
    return Response.json({ success: true, college }, { status: 201 });
  } catch (error) {
    console.error("POST College Error:", error);
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}
