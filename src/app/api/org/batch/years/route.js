import { getCollegeBatchYears } from "@/lib/services/org.service.js";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const collegeId = searchParams.get('collegeId');
    if (!collegeId) return Response.json({ success: false, message: "collegeId required" }, { status: 400 });

    const years = await getCollegeBatchYears(collegeId);
    return Response.json({ success: true, years });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}
