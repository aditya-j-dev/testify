import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("testify-token")?.value;
  const path = req.nextUrl.pathname;

  // --- Public Paths ---
  if (path === "/login" || path === "/register") {
    if (token) return NextResponse.redirect(new URL("/dashboard", req.url));
    return NextResponse.next();
  }

  // --- Protected Paths ---
  if (path.startsWith("/dashboard")) {
    if (!token) return NextResponse.redirect(new URL("/login", req.url));

    try {
      // Decode JWT payload without verifying signature (safe for routing layer)
      const payloadBase64 = token.split(".")[1];
      // atob is available in Edge Runtime
      const payloadString = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
      const payload = JSON.parse(payloadString);
      const role = payload.role;

      // Restrict Super Admin Routes
      if (path.startsWith("/dashboard/super-admin")) {
        if (role !== "SUPER_ADMIN") {
          return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
      }

      // Restrict Admin Routes
      if (path.startsWith("/dashboard/admin")) {
        if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
          return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
      }

      // Restrict Teacher Routes
      if (path.startsWith("/dashboard/teacher")) {
        if (role !== "TEACHER" && role !== "ADMIN" && role !== "SUPER_ADMIN") {
          return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
      }

      // Restrict Student Routes
      if (path.startsWith("/dashboard/student")) {
        if (role !== "STUDENT") {
          return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
      }

      // Redirect blank /dashboard to role-specific dashboard
      if (path === "/dashboard") {
        if (role === "STUDENT") {
          return NextResponse.redirect(new URL("/dashboard/student", req.url));
        } else if (role === "SUPER_ADMIN") {
          return NextResponse.redirect(new URL("/dashboard/super-admin/colleges", req.url));
        } else if (role === "ADMIN") {
          return NextResponse.redirect(new URL("/dashboard/admin/branches", req.url));
        } else if (role === "TEACHER") {
          return NextResponse.redirect(new URL("/dashboard/teacher", req.url));
        }
      }

    } catch (e) {
      console.error("Middleware JWT Decode Error:", e);
      // If token is mangled, kick them to login
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.delete("testify-token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register"
  ],
};
