import { getSupabase } from "@/lib/supabase";
import { mapYuvak, yuvakToInsert } from "@/lib/mappers";
import { isBirthdayToday } from "@/utils/dates";
import type { Yuvak } from "@/types";
import type { DbYuvak } from "@/types/database";

function friendlyError(context: string, err: { message: string }) {
  if (import.meta.env.DEV) console.error(`[yuvakService] ${context}`, err);
  throw new Error(`Unable to load yuvaks. Please check your internet connection and try again.`);
}

const SELECT = "id, name, mobile, birth_date, study_job, address, notes, group_id, is_active";

export async function listYuvaks(): Promise<Yuvak[]> {
  const { data, error } = await getSupabase().from("yuvaks").select(SELECT).order("name");
  if (error) friendlyError("listYuvaks", error);
  return (data as DbYuvak[]).map(mapYuvak);
}

export async function listActiveYuvaks(): Promise<Yuvak[]> {
  const { data, error } = await getSupabase()
    .from("yuvaks")
    .select(SELECT)
    .eq("is_active", true)
    .order("name");
  if (error) friendlyError("listActiveYuvaks", error);
  return (data as DbYuvak[]).map(mapYuvak);
}

export async function listByGroup(groupId: string): Promise<Yuvak[]> {
  const { data, error } = await getSupabase()
    .from("yuvaks")
    .select(SELECT)
    .eq("group_id", groupId)
    .eq("is_active", true)
    .order("name");
  if (error) friendlyError("listByGroup", error);
  return (data as DbYuvak[]).map(mapYuvak);
}

export async function getYuvak(id: string): Promise<Yuvak | undefined> {
  const { data, error } = await getSupabase()
    .from("yuvaks")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) friendlyError("getYuvak", error);
  return data ? mapYuvak(data as DbYuvak) : undefined;
}

export async function createYuvak(data: Omit<Yuvak, "id">): Promise<Yuvak> {
  const { data: row, error } = await getSupabase()
    .from("yuvaks")
    .insert(
      yuvakToInsert({
        name: data.name,
        mobile: data.mobile,
        birthDate: data.birthDate,
        studyJob: data.studyJob,
        address: data.address,
        notes: data.notes,
        groupId: data.groupId,
        active: data.active,
      }),
    )
    .select(SELECT)
    .single();
  if (error) {
    if (import.meta.env.DEV) console.error("[yuvakService] createYuvak", error);
    throw new Error("Unable to create yuvak. Please try again.");
  }
  return mapYuvak(row as DbYuvak);
}

export async function updateYuvak(id: string, patch: Partial<Yuvak>): Promise<void> {
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.mobile !== undefined) row.mobile = patch.mobile;
  if (patch.birthDate !== undefined) row.birth_date = patch.birthDate;
  if (patch.studyJob !== undefined) row.study_job = patch.studyJob;
  if (patch.address !== undefined) row.address = patch.address;
  if (patch.notes !== undefined) row.notes = patch.notes;
  if (patch.groupId !== undefined) row.group_id = patch.groupId;
  if (patch.active !== undefined) row.is_active = patch.active;
  const { error } = await getSupabase().from("yuvaks").update(row).eq("id", id);
  if (error) {
    if (import.meta.env.DEV) console.error("[yuvakService] updateYuvak", error);
    throw new Error("Unable to update yuvak. Please try again.");
  }
}

export async function deactivateYuvak(id: string): Promise<void> {
  await updateYuvak(id, { active: false });
}

export async function activateYuvak(id: string): Promise<void> {
  await updateYuvak(id, { active: true });
}

export async function moveYuvak(yuvakId: string, newGroupId: string): Promise<void> {
  await updateYuvak(yuvakId, { groupId: newGroupId });
}

export function birthdaysToday(yuvaks: Yuvak[]): Yuvak[] {
  return yuvaks.filter((y) => isBirthdayToday(y.birthDate));
}

export const addYuvak = createYuvak;
