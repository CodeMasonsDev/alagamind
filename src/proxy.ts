import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "./lib/auth-cookies";
import { hasRole } from "./lib/auth-roles";

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
  const isPublicAuthRoute = pathname === "/login" || pathname === "/signup";

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

  if (!hasAccessToken) {
    return NextResponse.next();
  }

  let user:
    | {
        roles?: unknown;
      }
    | null = null;

  try {
    const meResponse = await fetch(new URL("/api/auth/me", request.nextUrl), {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
      cache: "no-store",
    });

    if (!meResponse.ok) {
      const loginRedirect = isMHPRoute
        ? new URL("/mentalhealth-professionals/login", request.url)
        : new URL("/login", request.url);

      const response = NextResponse.redirect(loginRedirect);
      response.cookies.delete(ACCESS_TOKEN_COOKIE);
      response.cookies.delete(REFRESH_TOKEN_COOKIE);
      return response;
    }

    user = await meResponse.json();
  } catch {
    const fallbackRedirect =
      isMHPRoute && !isMHPAuth
        ? new URL("/mentalhealth-professionals/login", request.url)
        : isProtected || isPublicAuthRoute
          ? new URL("/login", request.url)
          : null;

    return fallbackRedirect
      ? NextResponse.redirect(fallbackRedirect)
      : NextResponse.next();
  }

  const isMHP = hasRole(user?.roles, "MHP");

  // Check user role for MHP routes
  if (isMHPRoute && !isMHPAuth) {
    if (!isMHP) {
      return NextResponse.redirect(
        new URL("/mentalhealth-professionals/login", request.url),
      );
    }
  }

  // Check user role for regular routes
  if (isProtected && !isMHPRoute) {
    if (isMHP) {
      return NextResponse.redirect(
        new URL("/mentalhealth-professionals", request.url),
      );
    }
  }

  if (isMHPAuth && isMHP) {
    return NextResponse.redirect(new URL("/mentalhealth-professionals", request.url));
  }

  if (isPublicAuthRoute && !isMHP) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
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
