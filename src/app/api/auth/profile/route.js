import prisma from "@/lib/prisma.js";
import { verifyToken } from "@/lib/middlewares/auth.middleware.js";

export async function GET(req) {

  try {

    const decoded = verifyToken(req);

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
      include: {
        college: {
          select: { name: true }
        }
      }
    });

    if (!user) {
      throw new Error("User not found");
    }

    const { password: _, ...safeUser } = user;

    return Response.json({
      success: true,
      user: safeUser,
    });

  } catch (error) {

    return Response.json({
      success: false,
      message: error.message,
    }, { status: 401 });

  }

}