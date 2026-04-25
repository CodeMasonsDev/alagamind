export function handleUnauthorized(): never {
  try {
    void fetch("/api/auth/logout", { method: "POST" });
  } catch {
    // Logout endpoint call failed, but continue with redirect
  }

  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "";
  const loginUrl = pathname.includes("/mentalhealth-professionals")
    ? "/mentalhealth-professionals/login"
    : "/login";

  if (typeof window !== "undefined") {
    window.location.href = loginUrl;
  }

  throw new Error("Unauthorized");
}
