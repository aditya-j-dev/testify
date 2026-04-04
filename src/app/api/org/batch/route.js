import { createBatch, getBatchesByBranch } from "@/lib/services/org.service.js";

// GET /api/org/batch?branchId=123
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get('branchId');

    if (!branchId) {
       return Response.json({ success: false, message: "branchId query param required" }, { status: 400 });
    }

    const batches = await getBatchesByBranch(branchId);
    return Response.json({ success: true, batches });
  } catch (error) {
    console.error("GET Batch Error:", error);
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST /api/org/batch
export async function POST(req) {
  try {
    const body = await req.json();
    const batch = await createBatch(body);
    
    return Response.json({ success: true, batch }, { status: 201 });
  } catch (error) {
    console.error("POST Batch Error:", error);
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}
