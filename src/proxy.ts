import { NextRequest, NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "./lib/auth-cookies";

const protectedRoutes = [
  "/dashboard",
  "/ai-companion",
  "/journals-reflections",
  "/reframing-insights",
  "/exercises",
  "/settings",
  "/privacy",
  "/help-support",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAccessToken = request.cookies.has(ACCESS_TOKEN_COOKIE);

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (!hasAccessToken && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/ai-companion/:path*",
    "/journals-reflections/:path*",
    "/reframing-insights/:path*",
    "/exercises/:path*",
    "/settings/:path*",
    "/privacy/:path*",
    "/help-support/:path*",
    "/login",
    "/signup",
  ],
};
