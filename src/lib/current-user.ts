export const DEFAULT_USER_ID = "7e9793a6-c652-4b3a-8bed-780c221ee33a";

export function resolveUserId(userId?: string | null) {
  const trimmedUserId = userId?.trim();
  return trimmedUserId || DEFAULT_USER_ID;
}
