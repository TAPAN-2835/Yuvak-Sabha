import { getAttendanceByDateRange, getAttendanceForSabha } from "@/services/attendanceService";
import { listActiveYuvaks } from "@/services/yuvakService";
import { getLatestSabha, getSabhasByRange } from "@/services/sabhaService";
import { listGroups } from "@/services/groupService";
import { attendancePercentage, isMonthlyRegular } from "@/utils/stats";
import type { Yuvak } from "@/types";

export interface SabhaSummary {
  sabhaId: string;
  date: string;
  present: number;
  absent: number;
  total: number;
  percentage: number;
}

export interface YuvakStat {
  yuvakId: string;
  name: string;
  attended: number;
  total: number;
  percentage: number;
}

export async function summarizeSabha(sabhaId: string, date: string): Promise<SabhaSummary> {
  const [attendance, yuvaks] = await Promise.all([
    getAttendanceForSabha(sabhaId),
    listActiveYuvaks(),
  ]);
  const map = new Map(attendance.map((a) => [a.yuvakId, a.present]));
  let present = 0;
  yuvaks.forEach((y) => {
    if (map.get(y.id)) present++;
  });
  const total = yuvaks.length;
  return {
    sabhaId,
    date,
    present,
    absent: total - present,
    total,
    percentage: attendancePercentage(present, total),
  };
}

export async function latestSabhaSummary(): Promise<SabhaSummary | null> {
  const sabha = await getLatestSabha();
  if (!sabha) return null;
  return summarizeSabha(sabha.id, sabha.date);
}

export async function weeklyStats(weeks = 8): Promise<SabhaSummary[]> {
  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - weeks * 7);
  const sabhas = await getSabhasByRange(
    from.toISOString().slice(0, 10),
    now.toISOString().slice(0, 10),
  );
  const recent = sabhas.slice(-weeks);
  return Promise.all(recent.map((s) => summarizeSabha(s.id, s.date)));
}

export async function yearlyStats(year?: number): Promise<YuvakStat[]> {
  return yearlyRanking(year);
}

export async function yearlyRanking(year?: number): Promise<YuvakStat[]> {
  const y = year ?? new Date().getFullYear();
  const from = `${y}-01-01`;
  const to = `${y}-12-31`;
  const [sabhas, yuvaks, attendance] = await Promise.all([
    getSabhasByRange(from, to),
    listActiveYuvaks(),
    getAttendanceByDateRange(from, to),
  ]);
  const sabhaIds = new Set(sabhas.map((s) => s.id));
  const total = sabhas.length;
  const presentByYuvak = new Map<string, number>();
  attendance.forEach((a) => {
    if (sabhaIds.has(a.sabhaId) && a.present) {
      presentByYuvak.set(a.yuvakId, (presentByYuvak.get(a.yuvakId) ?? 0) + 1);
    }
  });
  return yuvaks
    .map((yv) => {
      const attended = presentByYuvak.get(yv.id) ?? 0;
      return {
        yuvakId: yv.id,
        name: yv.name,
        attended,
        total,
        percentage: attendancePercentage(attended, total),
      };
    })
    .sort((a, b) => b.attended - a.attended || a.name.localeCompare(b.name));
}

export async function yearlyLeaderboard(year?: number) {
  return (await yearlyRanking(year)).slice(0, 3);
}

export async function monthlyStats(year: number, month: number) {
  const mm = String(month).padStart(2, "0");
  const from = `${year}-${mm}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${year}-${mm}-${String(lastDay).padStart(2, "0")}`;

  const [sabhas, yuvaks, attendance] = await Promise.all([
    getSabhasByRange(from, to),
    listActiveYuvaks(),
    getAttendanceByDateRange(from, to),
  ]);

  const sabhaIds = new Set(sabhas.map((s) => s.id));
  const summaries = await Promise.all(sabhas.map((s) => summarizeSabha(s.id, s.date)));
  const avg =
    summaries.length === 0
      ? 0
      : Math.round(summaries.reduce((s, x) => s + x.percentage, 0) / summaries.length);

  const presentByYuvak = new Map<string, number>();
  attendance.forEach((a) => {
    if (sabhaIds.has(a.sabhaId) && a.present) {
      presentByYuvak.set(a.yuvakId, (presentByYuvak.get(a.yuvakId) ?? 0) + 1);
    }
  });

  const regular = yuvaks
    .map((yv) => {
      const attended = presentByYuvak.get(yv.id) ?? 0;
      return {
        yuvak: yv,
        attended,
        total: sabhas.length,
        percentage: sabhas.length ? attended / sabhas.length : 0,
      };
    })
    .filter((r) => isMonthlyRegular(r.attended, r.total))
    .sort((a, b) => b.attended - a.attended);

  return {
    sabhas,
    summaries,
    avgPercentage: avg,
    regular,
  };
}

export async function monthlyRegularYuvaks(year: number, month: number) {
  const st = await monthlyStats(year, month);
  return st.regular;
}

export async function groupComparison(sabhaId: string, date: string) {
  return groupWiseSummary(sabhaId, date);
}

export async function groupWiseSummary(sabhaId: string, date?: string) {
  const [groups, yuvaks, attendance, sabha] = await Promise.all([
    listGroups(),
    listActiveYuvaks(),
    getAttendanceForSabha(sabhaId),
    date ? Promise.resolve({ date }) : getLatestSabha(),
  ]);
  void sabha;
  const map = new Map(attendance.map((a) => [a.yuvakId, a.present]));
  return groups
    .filter((g) => g.active)
    .map((g) => {
      const active = yuvaks.filter((y) => y.groupId === g.id);
      const present = active.filter((y) => map.get(y.id)).length;
      return {
        groupId: g.id,
        leaderName: g.leaderName,
        present,
        total: active.length,
        percentage: attendancePercentage(present, active.length),
      };
    })
    .filter((g) => g.total > 0);
}

export async function monthlyTrend(year: number) {
  const res: { month: string; percentage: number }[] = [];
  for (let m = 1; m <= 12; m++) {
    const st = await monthlyStats(year, m);
    res.push({
      month: new Date(year, m - 1, 1).toLocaleString("en", { month: "short" }),
      percentage: st.avgPercentage,
    });
  }
  return res;
}

// Back-compat sync name used in dashboards
export const weeklySeries = weeklyStats;
