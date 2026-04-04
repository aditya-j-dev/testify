import { getCollegeById, updateCollege } from "@/lib/services/org.service";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const college = await getCollegeById(id);
    if (!college) return Response.json({ success: false, message: "College not found" }, { status: 404 });

    return Response.json({ success: true, college });
  } catch (error) {
    console.error("GET College Detail Error:", error);
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const college = await updateCollege(id, body);
    
    return Response.json({ success: true, college });
  } catch (error) {
    console.error("PATCH College Error:", error);
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}
