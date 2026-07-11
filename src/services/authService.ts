import { getGroup, listActiveGroups } from "@/services/groupService";
import {
  generateLeaderPassword,
  validateAdminPassword,
  validateLeaderPassword,
} from "@/utils/auth";
import type { AuthSession } from "@/types";

const KEY = "baps.auth.v1";

/**
 * Intentionally simple internal authentication stored in sessionStorage.
 * This is NOT production-grade security. Replace with server-side
 * authentication (e.g. Supabase Auth + RLS) if the app becomes publicly sensitive.
 */
export { generateLeaderPassword, generateLeaderPassword as leaderPasswordFor } from "@/utils/auth";

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession & { leaderId?: string };
    if (parsed.role === "leader" && parsed.leaderId && !parsed.groupId) {
      parsed.groupId = parsed.leaderId;
      delete parsed.leaderId;
    }
    return parsed;
  } catch {
    return null;
  }
}

function setSession(s: AuthSession | null) {
  if (typeof window === "undefined") return;
  if (s) sessionStorage.setItem(KEY, JSON.stringify(s));
  else sessionStorage.removeItem(KEY);
  window.dispatchEvent(new Event("baps-auth-change"));
}

export async function loginLeader(groupId: string, password: string): Promise<AuthSession | null> {
  const g = await getGroup(groupId);
  if (!g || !g.active) return null;
  if (!validateLeaderPassword(g.leaderName, password)) return null;
  const session: AuthSession = {
    role: "leader",
    groupId: g.id,
    leaderName: g.leaderName,
  };
  setSession(session);
  return session;
}

export function loginAdmin(password: string): AuthSession | null {
  if (!validateAdminPassword(password)) return null;
  const session: AuthSession = { role: "admin" };
  setSession(session);
  return session;
}

export function logout() {
  setSession(null);
}

export async function listLeadersForLogin() {
  return listActiveGroups();
}
