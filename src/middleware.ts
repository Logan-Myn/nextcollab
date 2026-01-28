import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/onboarding", "/settings", "/brand"];
const authRoutes = ["/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for session token (Better-Auth uses this cookie name)
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if accessing auth routes with session
  if (isAuthRoute && sessionToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/settings/:path*",
    "/brand/:path*",
    "/login",
    "/signup",
  ],
};
