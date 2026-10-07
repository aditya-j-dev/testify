import { ensureAnnualBatches } from "@/lib/services/org.service.js";

export async function POST(req) {
  try {
    const { searchParams } = new URL(req.url);
    const collegeId = searchParams.get('collegeId');
    if (!collegeId) return Response.json({ success: false, message: "collegeId required" }, { status: 400 });

    const created = await ensureAnnualBatches(collegeId);
    return Response.json({ success: true, created });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}
