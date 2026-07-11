import { getSupabase } from "@/lib/supabase";
import { mapSettings } from "@/lib/mappers";
import type { AppSettings } from "@/types";
import type { DbAppSettings } from "@/types/database";

const DEFAULT_SETTINGS: AppSettings = {
  mandalName: "BAPS Yuvak Mandal",
  sabhaDay: "Saturday",
  sabhaDayNumber: 6,
  sabhaTime: "8:30 PM",
  sabhaTimeRaw: "20:30",
  reminderMessage:
    "જય સ્વામિનારાયણ 🙏\nઆજે રાત્રે 8:30 વાગ્યે યુવક સભા છે.\nતમારે જરૂરથી સભામાં પધારવું. 😊",
  birthdayMessage:
    "જય સ્વામિનારાયણ 🙏\nઆપને જન્મદિવસની હાર્દિક શુભકામનાઓ 🎂\nમહારાજ-સ્વામી આપ પર સદા રાજી રહે અને આપનું જીવન સત્સંગ, સેવા અને સફળતાથી ભરપૂર રહે. 🙏",
};

export async function getSettings(): Promise<AppSettings> {
  const { data, error } = await getSupabase()
    .from("app_settings")
    .select("id, mandal_name, sabha_day, sabha_time, reminder_message, birthday_message")
    .eq("id", 1)
    .maybeSingle();
  if (error) {
    if (import.meta.env.DEV) console.error("[settingsService] getSettings", error);
    return DEFAULT_SETTINGS;
  }
  if (!data) return DEFAULT_SETTINGS;
  return mapSettings(data as DbAppSettings);
}

export async function updateSettings(
  patch: Partial<{
    mandalName: string;
    sabhaDayNumber: number;
    sabhaTimeRaw: string;
    reminderMessage: string;
    birthdayMessage: string;
  }>,
): Promise<void> {
  const row: Record<string, unknown> = {};
  if (patch.mandalName !== undefined) row.mandal_name = patch.mandalName;
  if (patch.sabhaDayNumber !== undefined) row.sabha_day = patch.sabhaDayNumber;
  if (patch.sabhaTimeRaw !== undefined) row.sabha_time = patch.sabhaTimeRaw;
  if (patch.reminderMessage !== undefined) row.reminder_message = patch.reminderMessage;
  if (patch.birthdayMessage !== undefined) row.birthday_message = patch.birthdayMessage;

  const { error } = await getSupabase().from("app_settings").update(row).eq("id", 1);
  if (error) {
    if (import.meta.env.DEV) console.error("[settingsService] updateSettings", error);
    throw new Error("Unable to save settings. Please try again.");
  }
}
