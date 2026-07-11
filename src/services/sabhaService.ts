import { getSupabase } from "@/lib/supabase";
import { mapSabha } from "@/lib/mappers";
import type { Sabha } from "@/types";
import type { DbSabha } from "@/types/database";

function friendlyError(context: string, err: { message: string }) {
  if (import.meta.env.DEV) console.error(`[sabhaService] ${context}`, err);
  throw new Error(
    `Unable to load sabha records. Please check your internet connection and try again.`,
  );
}

const SELECT = "id, sabha_date, sabha_time, title, status";

export async function getOrCreateSabhaByDate(date: string): Promise<Sabha> {
  const existing = await getSabhaByDate(date);
  if (existing) return existing;

  const { data, error } = await getSupabase()
    .from("sabhas")
    .insert({ sabha_date: date })
    .select(SELECT)
    .single();
  if (error) {
    if (error.code === "23505") {
      const retry = await getSabhaByDate(date);
      if (retry) return retry;
    }
    if (import.meta.env.DEV) console.error("[sabhaService] getOrCreateSabhaByDate", error);
    throw new Error("Unable to create sabha for this date. Please try again.");
  }
  return mapSabha(data as DbSabha);
}

async function getSabhaByDate(date: string): Promise<Sabha | undefined> {
  const { data, error } = await getSupabase()
    .from("sabhas")
    .select(SELECT)
    .eq("sabha_date", date)
    .maybeSingle();
  if (error) friendlyError("getSabhaByDate", error);
  return data ? mapSabha(data as DbSabha) : undefined;
}

export async function getSabhasByRange(from: string, to: string): Promise<Sabha[]> {
  const { data, error } = await getSupabase()
    .from("sabhas")
    .select(SELECT)
    .gte("sabha_date", from)
    .lte("sabha_date", to)
    .neq("status", "cancelled")
    .order("sabha_date");
  if (error) friendlyError("getSabhasByRange", error);
  return (data as DbSabha[]).map(mapSabha);
}

export async function getLatestSabha(): Promise<Sabha | undefined> {
  const { data, error } = await getSupabase()
    .from("sabhas")
    .select(SELECT)
    .neq("status", "cancelled")
    .order("sabha_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) friendlyError("getLatestSabha", error);
  return data ? mapSabha(data as DbSabha) : undefined;
}

// Back-compat for attendance page
export const ensureSabha = getOrCreateSabhaByDate;
export const listSabhas = async () => {
  const { data, error } = await getSupabase().from("sabhas").select(SELECT).order("sabha_date");
  if (error) friendlyError("listSabhas", error);
  return (data as DbSabha[]).map(mapSabha);
};
