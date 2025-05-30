import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });

  // Public paths that don't require authentication
  const publicPaths = ["/auth/login", "/auth/signup"];
  const isPublicPath = publicPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // If the user is not logged in and trying to access a protected route
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // If the user is logged in and trying to access auth pages
  if (token && isPublicPath) {
    if (token.role === "candidate") {
      return NextResponse.redirect(new URL("/profile", request.url));
    } else if (token.role === "recruiter") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Handle candidate role restrictions
  if (token?.role === "candidate") {
    // Candidates can only access their profile page
    const allowedPaths = ["/profile"];
    const isAllowedPath = allowedPaths.some((path) =>
      request.nextUrl.pathname.startsWith(path)
    );

    if (!isAllowedPath && !isPublicPath) {
      return NextResponse.redirect(new URL("/profile", request.url));
    }
  }

  // Handle recruiter role restrictions
  if (token?.role === "recruiter") {
    // Recruiters can access everything except profile page
    if (request.nextUrl.pathname.startsWith("/profile")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/profile/:path*",
    "/dashboard/:path*",
    "/candidates/:path*",
    "/interview/:path*",
    "/reports/:path*",
    "/requirements/:path*",
    "/auth/:path*",
  ],
};