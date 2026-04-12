import prisma from "@/lib/prisma.js";
import { cookies } from "next/headers";

async function getAuthContext() {
  const cookieStore = await cookies();
  const token = cookieStore.get("testify-token")?.value;
  if (!token) return null;
  try {
    return JSON.parse(
      Buffer.from(
        token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"),
        "base64"
      ).toString("utf8")
    );
  } catch {
    return null;
  }
}

// GET /api/dashboard
// Returns role-specific stats for the dashboard overview
export async function GET() {
  try {
    const auth = await getAuthContext();
    if (!auth) return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { userId, role, collegeId } = auth;
    let stats = {};

    if (role === "TEACHER" || role === "ADMIN") {
      const [examCount, draftCount, activeAttempts, pendingGrades] = await Promise.all([
        prisma.exam.count({ where: { creatorId: userId } }),
        prisma.exam.count({ where: { creatorId: userId, status: "DRAFT" } }),
        prisma.attempt.count({
          where: { exam: { creatorId: userId }, status: "IN_PROGRESS" },
        }),
        prisma.result.count({
          where: {
            exam: { creatorId: userId },
            gradingStatus: "MANUAL_REVIEW_PENDING",
          },
        }),
      ]);

      stats = {
        role,
        totalExams: examCount,
        draftExams: draftCount,
        activeAttempts,
        pendingGrades,
      };
    }

    if (role === "ADMIN") {
      // Also add college-level stats
      const [branchCount, teacherCount, studentCount, examTotal] = await Promise.all([
        prisma.branch.count({ where: { collegeId } }),
        prisma.user.count({ where: { collegeId, role: "TEACHER" } }),
        prisma.user.count({ where: { collegeId, role: "STUDENT" } }),
        prisma.exam.count({ where: { collegeId } }),
      ]);
      stats.college = { branchCount, teacherCount, studentCount, examTotal };
    }

    if (role === "STUDENT") {
      const [availableExams, completedAttempts, inProgressAttempt] = await Promise.all([
        prisma.exam.count({
          where: {
            collegeId,
            status: { in: ["PUBLISHED", "ACTIVE"] },
            access: {
              some: {
                OR: [
                  { batchId: auth.batchId },
                  { branchId: auth.branchId, batchId: null },
                  { branchId: null, batchId: null },
                ],
              },
            },
          },
        }),
        prisma.attempt.count({
          where: { userId, status: { in: ["SUBMITTED", "TIMED_OUT", "CHEATED"] } },
        }),
        prisma.attempt.findFirst({
          where: { userId, status: "IN_PROGRESS" },
          include: { exam: { select: { title: true, duration: true } } },
        }),
      ]);

      // Calculate average score
      const avgResult = await prisma.result.aggregate({
        where: { studentId: userId },
        _avg: { percentage: true },
      });

      stats = {
        role,
        availableExams,
        completedAttempts,
        inProgressAttempt,
        avgPercentage: avgResult._avg.percentage
          ? Math.round(avgResult._avg.percentage)
          : null,
      };
    }

    if (role === "SUPER_ADMIN") {
      const [collegeCount, trialCount, activeCount, suspendedCount] = await Promise.all([
        prisma.college.count({ where: { deletedAt: null } }),
        prisma.college.count({ where: { subscriptionStatus: "TRIAL", deletedAt: null } }),
        prisma.college.count({ where: { subscriptionStatus: "ACTIVE", deletedAt: null } }),
        prisma.college.count({
          where: { subscriptionStatus: { in: ["SUSPENDED", "TRIAL_EXPIRED"] }, deletedAt: null },
        }),
      ]);
      stats = { role, collegeCount, trialCount, activeCount, suspendedCount };
    }

    return Response.json({ success: true, stats });
  } catch (error) {
    console.error("[GET /api/dashboard]", error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}