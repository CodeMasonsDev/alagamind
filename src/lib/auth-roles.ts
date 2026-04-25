export function normalizeRoles(roles: unknown): string[] {
  if (!Array.isArray(roles)) {
    return [];
  }

  return roles
    .filter((role): role is string => typeof role === "string")
    .map((role) => role.trim())
    .filter(Boolean);
}

export function hasRole(
  roles: unknown,
  expectedRole: string,
): boolean {
  const normalizedExpectedRole = expectedRole.trim().toLowerCase();

  return normalizeRoles(roles).some(
    (role) => role.toLowerCase() === normalizedExpectedRole,
  );
}
