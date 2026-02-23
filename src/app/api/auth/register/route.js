import { registerUser } from "@/lib/services/auth.service.js";

export async function POST(req) {

  try {

    const body = await req.json();

    const user = await registerUser(body);

    return Response.json({
      success: true,
      user,
    });

  } catch (error) {

    console.error(error);

    return Response.json({
      success: false,
      message: error.message,
    }, { status: 400 });
  }

}