import { NextRequest, NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "./lib/auth-cookies";
import { hasRole } from "./lib/auth-roles";
import { getJwtRoles } from "./lib/auth-token";

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

const adminRoutes = ["/admin"];

function applyNoStore(response: NextResponse) {
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.headers.set("x-middleware-cache", "no-cache");
  return response;
}

function redirectTo(path: string, request: NextRequest) {
  return applyNoStore(NextResponse.redirect(new URL(path, request.url)));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const hasAccessToken = typeof accessToken === "string" && accessToken.length > 0;

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const isMHPRoute = mhpRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const isAdminRoute = adminRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const isMHPAuth = pathname.startsWith("/mentalhealth-professionals/login") ||
    pathname.startsWith("/mentalhealth-professionals/register");
  const isAdminAuth = pathname.startsWith("/admin/login");
  const isClientAuth = pathname === "/login" || pathname === "/signup";

  // Regular user routes
  if (isProtected && !hasAccessToken) {
    return redirectTo("/login", request);
  }

  // MHP routes must also require a token.
  if (isMHPRoute && !isMHPAuth && !hasAccessToken) {
    return redirectTo("/mentalhealth-professionals/login", request);
  }

  if (isAdminRoute && !isAdminAuth && !hasAccessToken) {
    return redirectTo("/admin/login", request);
  }

  if (!hasAccessToken) {
    return applyNoStore(NextResponse.next());
  }

  const roles = getJwtRoles(accessToken);
  const isMHP = hasRole(roles, "MHP");
  const isAdmin = hasRole(roles, "Admin");

  if (isClientAuth) {
    if (isAdmin) {
      return redirectTo("/admin", request);
    }

    if (isMHP) {
      return redirectTo("/mentalhealth-professionals", request);
    }

    return redirectTo("/dashboard", request);
  }

  if (isMHPAuth) {
    if (isAdmin) {
      return redirectTo("/admin", request);
    }

    if (isMHP) {
      return redirectTo("/mentalhealth-professionals", request);
    }

    return redirectTo("/dashboard", request);
  }

  if (isAdminAuth) {
    if (isAdmin) {
      return redirectTo("/admin", request);
    }

    if (isMHP) {
      return redirectTo("/mentalhealth-professionals", request);
    }

    return redirectTo("/dashboard", request);
  }

  if (isProtected) {
    if (isAdmin) {
      return redirectTo("/admin", request);
    }

    if (isMHP) {
      return redirectTo("/mentalhealth-professionals", request);
    }
  }

  if (isMHPRoute && !isMHPAuth) {
    if (isAdmin) {
      return redirectTo("/admin", request);
    }

    if (!isMHP) {
      return redirectTo("/dashboard", request);
    }
  }

  if (isAdminRoute && !isAdminAuth) {
    if (isMHP) {
      return redirectTo("/mentalhealth-professionals", request);
    }

    if (!isAdmin) {
      return redirectTo("/dashboard", request);
    }
  }

  return applyNoStore(NextResponse.next());
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
    "/admin/:path*",
    "/login",
    "/signup",
  ],
};
