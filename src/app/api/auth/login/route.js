import { loginUser } from "@/lib/services/auth.service.js";

export async function POST(req) {

  try {

    const body = await req.json();

    const result = await loginUser(body);

    return Response.json({
      success: true,
      token: result.token,
      user: result.user,
    });

  } catch (error) {

    return Response.json({
      success: false,
      message: error.message,
    }, { status: 400 });
  }

}