import { CRON_JOBS } from "@/lib/services/cron.service.js";

// GET|POST /api/cron/[job]
// Protected by Authorization: Bearer CRON_SECRET
// Returns: { success: true, job: "...", processed: N }

async function runJob(req, { params }) {
  // 1. Authenticate
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token || token !== process.env.CRON_SECRET) {
    return Response.json(
      { success: false, message: "Unauthorized — invalid or missing CRON_SECRET" },
      { status: 401 }
    );
  }

  // 2. Resolve job
  const { job } = await params;
  const jobFn = CRON_JOBS[job];

  if (!jobFn) {
    return Response.json(
      {
        success: false,
        message: `Unknown job: "${job}". Available: ${Object.keys(CRON_JOBS).join(", ")}`,
      },
      { status: 404 }
    );
  }

  // 3. Execute
  const startTime = Date.now();
  try {
    const result = await jobFn();
    const duration = Date.now() - startTime;

    console.log(`[CRON] ${job} completed in ${duration}ms — processed: ${result.processed}`);
    return Response.json({
      success: true,
      job,
      processed: result.processed,
      durationMs: duration,
    });
  } catch (error) {
    console.error(`[CRON] ${job} failed:`, error);
    return Response.json(
      { success: false, job, message: error.message },
      { status: 500 }
    );
  }
}

export { runJob as GET, runJob as POST };
