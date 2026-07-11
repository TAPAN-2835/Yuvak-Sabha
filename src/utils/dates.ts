/** JavaScript day number: 0=Sunday … 6=Saturday */
export const SABHA_DAY = 6;

export function isSaturday(date: Date = new Date()): boolean {
  return date.getDay() === SABHA_DAY;
}

/** Default attendance date: today if Saturday, else next Saturday */
export function defaultAttendanceDate(base: Date = new Date()): string {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  if (d.getDay() === SABHA_DAY) return toISODate(d);
  d.setDate(d.getDate() + (SABHA_DAY - d.getDay()));
  return toISODate(d);
}

/** Next Saturday strictly after today; if today is Saturday, returns next week's Saturday */
export function nextSaturday(from: Date = new Date()): Date {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const day = d.getDay();
  if (day === SABHA_DAY) {
    d.setDate(d.getDate() + 7);
  } else {
    d.setDate(d.getDate() + (SABHA_DAY - day));
  }
  return d;
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function monthDayFromISO(iso: string): string {
  return iso.slice(5, 10);
}

export function isBirthdayToday(
  birthDate: string | null | undefined,
  today: Date = new Date(),
): boolean {
  if (!birthDate || birthDate.length < 10) return false;
  const md = birthDate.slice(5, 10);
  const todayMd = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return md === todayMd;
}

/** Parse Excel serial or string date to ISO YYYY-MM-DD */
export function parseExcelDate(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number" && value > 1000) {
    const epoch = new Date(Date.UTC(1899, 11, 30));
    epoch.setUTCDate(epoch.getUTCDate() + Math.floor(value));
    return toISODate(new Date(epoch.getUTCFullYear(), epoch.getUTCMonth(), epoch.getUTCDate()));
  }
  if (value instanceof Date) return toISODate(value);
  const s = String(value).trim();
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return toISODate(d);
  return null;
}
