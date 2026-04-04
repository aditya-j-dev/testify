import prisma from "@/lib/prisma.js";
import { verifyToken } from "@/lib/middlewares/auth.middleware.js";

export async function GET(req) {
  try {
    const decoded = verifyToken(req);

    let exams;

    if (decoded.role === "TEACHER") {
      // teacher sees own exams
      exams = await prisma.exam.findMany({
        where: {
          creatorId: decoded.userId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      // student sees active exams
      exams = await prisma.exam.findMany({
        where: {
          isActive: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    return Response.json({
      success: true,
      exams,
    });

  } catch (error) {
    return Response.json({
      success: false,
      message: error.message,
    }, { status: 401 });
  }
}