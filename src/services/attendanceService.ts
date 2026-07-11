import { getSupabase } from "@/lib/supabase";
import { mapAttendance } from "@/lib/mappers";
export { ensureSabha } from "@/services/sabhaService";
import type { AttendanceRecord } from "@/types";
import type { DbAttendance } from "@/types/database";

function friendlyError(context: string, err: { message: string }) {
  if (import.meta.env.DEV) console.error(`[attendanceService] ${context}`, err);
  throw new Error(
    `Unable to load attendance. Please check your internet connection and try again.`,
  );
}

export async function getAttendanceForSabha(sabhaId: string): Promise<AttendanceRecord[]> {
  const { data, error } = await getSupabase()
    .from("attendance")
    .select("id, sabha_id, yuvak_id, status")
    .eq("sabha_id", sabhaId);
  if (error) friendlyError("getAttendanceForSabha", error);
  return (data as DbAttendance[]).map(mapAttendance);
}

export async function attendanceMapForSabha(sabhaId: string): Promise<Map<string, boolean>> {
  const rows = await getAttendanceForSabha(sabhaId);
  const m = new Map<string, boolean>();
  rows.forEach((a) => m.set(a.yuvakId, a.present));
  return m;
}

export async function saveAttendance(
  sabhaId: string,
  presentYuvakIds: Set<string>,
  allActiveYuvakIds: string[],
): Promise<void> {
  const rows = allActiveYuvakIds.map((yuvakId) => ({
    sabha_id: sabhaId,
    yuvak_id: yuvakId,
    status: presentYuvakIds.has(yuvakId) ? "present" : "absent",
  }));

  const { error } = await getSupabase()
    .from("attendance")
    .upsert(rows, { onConflict: "sabha_id,yuvak_id" });
  if (error) {
    if (import.meta.env.DEV) console.error("[attendanceService] saveAttendance", error);
    throw new Error("Unable to save attendance. Please try again.");
  }

  await getSupabase().from("sabhas").update({ status: "completed" }).eq("id", sabhaId);
}

export async function getAttendanceByDateRange(
  from: string,
  to: string,
): Promise<AttendanceRecord[]> {
  const { data: sabhas, error: sabhaErr } = await getSupabase()
    .from("sabhas")
    .select("id")
    .gte("sabha_date", from)
    .lte("sabha_date", to)
    .neq("status", "cancelled");
  if (sabhaErr) friendlyError("getAttendanceByDateRange/sabhas", sabhaErr);
  if (!sabhas?.length) return [];

  const ids = sabhas.map((s) => s.id);
  const { data, error } = await getSupabase()
    .from("attendance")
    .select("id, sabha_id, yuvak_id, status")
    .in("sabha_id", ids);
  if (error) friendlyError("getAttendanceByDateRange", error);
  return (data as DbAttendance[]).map(mapAttendance);
}
