export const ACCESS_TOKEN_COOKIE = "alagamind_access_token";
export const REFRESH_TOKEN_COOKIE = "alagamind_refresh_token";

export function encodeAuthCookie(value: string) {
  return encodeURIComponent(value);
}

export function decodeAuthCookie(value?: string) {
  if (!value) return undefined;

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
