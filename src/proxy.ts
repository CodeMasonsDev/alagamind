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
  "/insights-reports",
];

const mhpRoutes = [
  "/mentalhealth-professionals",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAccessToken = request.cookies.has(ACCESS_TOKEN_COOKIE);

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const isMHPRoute = mhpRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const isMHPAuth = pathname.startsWith("/mentalhealth-professionals/login") ||
                    pathname.startsWith("/mentalhealth-professionals/register");

  // Regular user routes
  if (isProtected && !hasAccessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // MHP routes must also require a token.
  if (isMHPRoute && !isMHPAuth && !hasAccessToken) {
    return NextResponse.redirect(
      new URL("/mentalhealth-professionals/login", request.url),
    );
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
    "/insights-reports/:path*",
    "/mentalhealth-professionals/:path*",
    "/login",
    "/signup",
  ],
};
