import { getSupabase } from "@/lib/supabase";
import { groupToInsert, mapGroup } from "@/lib/mappers";
import { leaderLoginKey } from "@/utils/auth";
import type { Group } from "@/types";
import type { DbGroup } from "@/types/database";

function friendlyError(context: string, err: { message: string }) {
  if (import.meta.env.DEV) console.error(`[groupService] ${context}`, err);
  throw new Error(`Unable to load groups. Please check your internet connection and try again.`);
}

export async function listGroups(): Promise<Group[]> {
  const { data, error } = await getSupabase()
    .from("groups")
    .select("id, leader_name, leader_mobile, login_key, is_active")
    .order("leader_name");
  if (error) friendlyError("listGroups", error);
  return (data as DbGroup[]).map(mapGroup);
}

export async function listActiveGroups(): Promise<Group[]> {
  const { data, error } = await getSupabase()
    .from("groups")
    .select("id, leader_name, leader_mobile, login_key, is_active")
    .eq("is_active", true)
    .order("leader_name");
  if (error) friendlyError("listActiveGroups", error);
  return (data as DbGroup[]).map(mapGroup);
}

export async function getGroup(id: string): Promise<Group | undefined> {
  const { data, error } = await getSupabase()
    .from("groups")
    .select("id, leader_name, leader_mobile, login_key, is_active")
    .eq("id", id)
    .maybeSingle();
  if (error) friendlyError("getGroup", error);
  return data ? mapGroup(data as DbGroup) : undefined;
}

export async function createGroup(leaderName: string, leaderMobile: string | null): Promise<Group> {
  const login_key = leaderLoginKey(leaderName);
  const { data, error } = await getSupabase()
    .from("groups")
    .insert(groupToInsert(leaderName.trim(), leaderMobile, login_key))
    .select("id, leader_name, leader_mobile, login_key, is_active")
    .single();
  if (error) {
    if (import.meta.env.DEV) console.error("[groupService] createGroup", error);
    throw new Error("Unable to create group. Please try again.");
  }
  return mapGroup(data as DbGroup);
}

export async function updateGroup(
  id: string,
  patch: Partial<Pick<Group, "leaderName" | "leaderMobile" | "active">>,
): Promise<void> {
  const row: Record<string, unknown> = {};
  if (patch.leaderName !== undefined) {
    row.leader_name = patch.leaderName;
    row.login_key = leaderLoginKey(patch.leaderName);
  }
  if (patch.leaderMobile !== undefined) row.leader_mobile = patch.leaderMobile;
  if (patch.active !== undefined) row.is_active = patch.active;
  const { error } = await getSupabase().from("groups").update(row).eq("id", id);
  if (error) {
    if (import.meta.env.DEV) console.error("[groupService] updateGroup", error);
    throw new Error("Unable to update group. Please try again.");
  }
}

export async function deactivateGroup(id: string): Promise<void> {
  await updateGroup(id, { active: false });
}

export async function countInGroup(groupId: string): Promise<number> {
  const { count, error } = await getSupabase()
    .from("yuvaks")
    .select("id", { count: "exact", head: true })
    .eq("group_id", groupId)
    .eq("is_active", true);
  if (error) friendlyError("countInGroup", error);
  return count ?? 0;
}

// Back-compat aliases used by admin UI
export const addGroup = createGroup;
export { moveYuvak } from "@/services/yuvakService";
