/** Admin password is intentionally hardcoded for this internal app version. */
export const ADMIN_PASSWORD = "admin123";

/**
 * Normalize a leader name for login_key and password generation.
 * Lowercase, remove spaces, punctuation, and special characters.
 */
export function normalizeLeaderName(name: string): string {
  return name.toLowerCase().replace(/[\s\p{P}\p{S}]/gu, "");
}

/** Stable login_key stored in groups.login_key */
export function leaderLoginKey(name: string): string {
  return normalizeLeaderName(name);
}

/** Expected leader password: normalized first name + 123. */
export function generateLeaderPassword(name: string): string {
  const firstName = name.trim().split(/\s+/)[0] ?? "";
  return `${normalizeLeaderName(firstName)}123`;
}

export function validateLeaderPassword(leaderName: string, enteredPassword: string): boolean {
  const trimmed = enteredPassword.trim();
  return trimmed === generateLeaderPassword(leaderName);
}

export function validateAdminPassword(enteredPassword: string): boolean {
  return enteredPassword.trim() === ADMIN_PASSWORD;
}
