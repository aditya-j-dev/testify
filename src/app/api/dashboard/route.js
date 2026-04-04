import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/middlewares/auth.middleware";

export async function GET(req) {
  try {

    const decoded = verifyToken(req);

    let stats = {
      totalExams: 0,
      totalAttempts: 0,
      avgScore: 0,
    };

    // Count ALL active exams (for both roles)
    const totalExams = await prisma.exam.count({
      where: { isActive: true },
    });

    stats.totalExams = totalExams;

    if (decoded.role === "TEACHER") {

      const attempts = await prisma.attempt.count({
        where: {
          exam: {
            creatorId: decoded.userId,
          },
        },
      });

      stats.totalAttempts = attempts;

    } else {

      const attempts = await prisma.attempt.count({
        where: { studentId: decoded.userId },
      });

      const avg = await prisma.attempt.aggregate({
        where: { studentId: decoded.userId },
        _avg: {
          score: true,
        },
      });

      stats.totalAttempts = attempts;
      stats.avgScore = avg._avg.score || 0;

    }

    return Response.json({
      success: true,
      stats,
    });

  } catch (error) {

    return Response.json({
      success: false,
      message: error.message,
    }, { status: 401 });

  }
}