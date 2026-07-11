import { getSupabase } from "@/lib/supabase";
import { mapFollowup } from "@/lib/mappers";
import type { FollowupLog, FollowupType } from "@/types";
import type { DbFollowupLog } from "@/types/database";
import { toISODate } from "@/utils/dates";

function friendlyError(context: string, err: { message: string }) {
  if (import.meta.env.DEV) console.error(`[followupService] ${context}`, err);
  throw new Error("Unable to load follow-up logs. Please try again.");
}

export async function createFollowupLog(input: {
  yuvakId: string;
  groupId: string | null;
  leaderName: string;
  actionType: FollowupType;
}): Promise<FollowupLog | null> {
  const { data, error } = await getSupabase()
    .from("followup_logs")
    .insert({
      yuvak_id: input.yuvakId,
      group_id: input.groupId,
      leader_name: input.leaderName,
      action_type: input.actionType,
    })
    .select("id, yuvak_id, group_id, leader_name, action_type, created_at")
    .single();
  if (error) {
    if (import.meta.env.DEV) console.error("[followupService] createFollowupLog", error);
    return null;
  }
  return mapFollowup(data as DbFollowupLog);
}

export async function listFollowups(): Promise<FollowupLog[]> {
  const { data, error } = await getSupabase()
    .from("followup_logs")
    .select("id, yuvak_id, group_id, leader_name, action_type, created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) friendlyError("listFollowups", error);
  return (data as DbFollowupLog[]).map(mapFollowup);
}

export async function listFollowupsByGroup(groupId: string): Promise<FollowupLog[]> {
  const { data, error } = await getSupabase()
    .from("followup_logs")
    .select("id, yuvak_id, group_id, leader_name, action_type, created_at")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) friendlyError("listFollowupsByGroup", error);
  return (data as DbFollowupLog[]).map(mapFollowup);
}

export async function listTodayFollowups(groupId: string): Promise<FollowupLog[]> {
  const today = toISODate(new Date());
  const { data, error } = await getSupabase()
    .from("followup_logs")
    .select("id, yuvak_id, group_id, leader_name, action_type, created_at")
    .eq("group_id", groupId)
    .gte("created_at", `${today}T00:00:00`)
    .lte("created_at", `${today}T23:59:59.999`)
    .order("created_at", { ascending: false });
  if (error) friendlyError("listTodayFollowups", error);
  return (data as DbFollowupLog[]).map(mapFollowup);
}

/** Fire-and-forget log; returns false on failure */
export async function logFollowup(
  yuvakId: string,
  groupId: string,
  leaderName: string,
  type: FollowupType,
): Promise<boolean> {
  const result = await createFollowupLog({
    yuvakId,
    groupId,
    leaderName,
    actionType: type,
  });
  return result !== null;
}
