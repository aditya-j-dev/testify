import prisma from "@/lib/prisma.js";
import { verifyToken } from "@/lib/middlewares/auth.middleware.js";
import { requireRole } from "@/lib/middlewares/role.middleware.js";

export async function POST(req) {

  try {

    const decoded = verifyToken(req);

    // Only TEACHER allowed
    requireRole("TEACHER")(decoded);

    const body = await req.json();

    const { title, description, duration, totalMarks } = body;

    const exam = await prisma.exam.create({
      data: {
        title,
        description,
        duration,
        totalMarks,
        creatorId: decoded.userId,
      },
    });

    return Response.json({
      success: true,
      exam,
    });

  } catch (error) {

    return Response.json({
      success: false,
      message: error.message,
    }, { status: 403 });

  }

}