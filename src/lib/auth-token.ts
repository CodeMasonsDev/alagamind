import { decodeAuthCookie } from "@/lib/auth-cookies";
import { normalizeRoles } from "@/lib/auth-roles";

type JwtPayload = Record<string, unknown>;

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding =
    normalized.length % 4 === 0 ? 0 : 4 - (normalized.length % 4);
  const padded = normalized.padEnd(normalized.length + padding, "=");

  if (typeof atob === "function") {
    return atob(padded);
  }

  return Buffer.from(padded, "base64").toString("utf8");
}

export function getJwtPayload(tokenValue?: string): JwtPayload | null {
  const token = decodeAuthCookie(tokenValue);
  if (!token) {
    return null;
  }

  const [, payload] = token.split(".");
  if (!payload) {
    return null;
  }

  try {
    return JSON.parse(decodeBase64Url(payload)) as JwtPayload;
  } catch {
    return null;
  }
}

export function getJwtRoles(tokenValue?: string): string[] {
  const payload = getJwtPayload(tokenValue);
  if (!payload) {
    return [];
  }

  const roleClaims = [
    payload.role,
    payload.roles,
    payload[
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
    ],
  ];

  return normalizeRoles(roleClaims.flatMap((claim) => claim ?? []));
}
