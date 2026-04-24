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

  // Check user role for MHP routes
  if (isMHPRoute && !isMHPAuth && hasAccessToken) {
    try {
      const meResponse = await fetch(new URL("/api/auth/me", request.nextUrl), {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      });

      if (meResponse.ok) {
        const user = await meResponse.json();
        const isMHP = user?.roles?.includes("MHP");

        // Regular user trying to access MHP pages
        if (!isMHP) {
          return NextResponse.redirect(new URL("/mentalhealth-professionals/login", request.url));
        }
      }
    } catch {
      return NextResponse.redirect(new URL("/mentalhealth-professionals/login", request.url));
    }
  }

  // Check user role for regular routes
  if (isProtected && hasAccessToken && !isMHPRoute) {
    try {
      const meResponse = await fetch(new URL("/api/auth/me", request.nextUrl), {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      });

      if (meResponse.ok) {
        const user = await meResponse.json();
        const isMHP = user?.roles?.includes("MHP");

        // MHP user trying to access regular user pages
        if (isMHP) {
          return NextResponse.redirect(new URL("/mentalhealth-professionals", request.url));
        }
      }
    } catch {
      // Continue if auth check fails
    }
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
