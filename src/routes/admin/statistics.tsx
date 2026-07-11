import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminShell } from "@/layouts/AdminShell";
import { StatCard } from "@/components/StatCard";
import { EmptyState } from "@/components/EmptyState";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  useLatestSabhaSummary,
  useMonthlyStats,
  useMonthlyTrend,
  useYearlyRanking,
  useGroupWiseSummary,
} from "@/hooks/useQueries";
import { Trophy } from "lucide-react";
import { StatGridSkeleton } from "@/components/LoadingSkeleton";
import { QueryErrorState } from "@/components/QueryErrorState";

export const Route = createFileRoute("/admin/statistics")({
  head: () => ({ meta: [{ title: "Statistics — BAPS Yuvak Sabha" }] }),
  component: AdminStatistics,
});

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function AdminStatistics() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { data: latest, isLoading: latestLoading, isError, refetch } = useLatestSabhaSummary();
  const { data: monthly, isLoading: monthlyLoading } = useMonthlyStats(year, month);
  const { data: trend = [] } = useMonthlyTrend(year);
  const { data: ranking = [] } = useYearlyRanking(year);
  const { data: groupSummary = [] } = useGroupWiseSummary(latest?.sabhaId);

  const top3 = ranking.slice(0, 3);
  const years = Array.from({ length: 3 }, (_, i) => now.getFullYear() - i);

  if (isError) {
    return (
      <AdminShell title="Statistics">
        <div className="mx-auto max-w-6xl px-4 py-5">
          <QueryErrorState onRetry={() => void refetch()} />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Statistics">
      <div className="mx-auto max-w-6xl space-y-5 px-4 py-5">
        <section>
          <h2 className="mb-2 text-sm font-semibold text-maroon">Weekly (Latest Sabha)</h2>
          {latestLoading ? (
            <StatGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="Present" value={latest?.present ?? 0} tone="success" />
              <StatCard label="Absent" value={latest?.absent ?? 0} tone="danger" />
              <StatCard label="Total" value={latest?.total ?? 0} />
              <StatCard label="Attendance %" value={`${latest?.percentage ?? 0}%`} tone="gold" />
            </div>
          )}
          {groupSummary.length > 0 && (
            <div className="mt-3 rounded-2xl border border-border bg-card p-4">
              <h3 className="mb-2 text-sm font-semibold text-maroon">Group-wise (Latest)</h3>
              <div className="h-56">
                <ResponsiveContainer>
                  <BarChart
                    data={groupSummary.map((g) => ({
                      name: g.leaderName.split(" ")[0],
                      percentage: g.percentage,
                    }))}
                    margin={{ left: -10, right: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#EADCCB" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="percentage" fill="#D97706" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </section>

        <section>
          <div className="mb-2 flex flex-wrap items-end gap-3">
            <h2 className="text-sm font-semibold text-maroon">Monthly</h2>
            <div>
              <Label className="text-xs">Month</Label>
              <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                <SelectTrigger className="h-9 w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m, i) => (
                    <SelectItem key={m} value={String(i + 1)}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Year</Label>
              <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                <SelectTrigger className="h-9 w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {monthlyLoading || !monthly ? (
            <StatGridSkeleton count={4} />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard label="Sabhas held" value={monthly.sabhas.length} />
                <StatCard label="Avg attendance" value={`${monthly.avgPercentage}%`} tone="gold" />
                <StatCard label="Regular yuvaks" value={monthly.regular.length} tone="success" />
                <StatCard label="Groups" value={groupSummary.length} tone="maroon" />
              </div>

              <div className="mt-3 rounded-2xl border border-border bg-card p-4">
                <h3 className="mb-2 text-sm font-semibold text-maroon">
                  Regular yuvaks this month
                </h3>
                {monthly.regular.length === 0 ? (
                  <EmptyState
                    title="No regular yuvaks"
                    description="No attendance data yet for this month."
                  />
                ) : (
                  <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {monthly.regular.map((r) => (
                      <li
                        key={r.yuvak.id}
                        className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                      >
                        <span className="truncate text-sm font-medium">{r.yuvak.name}</span>
                        <span className="font-numeric text-xs text-muted-foreground">
                          {r.attended}/{r.total}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold text-maroon">Yearly Trend</h2>
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="h-56">
              <ResponsiveContainer>
                <LineChart data={trend} margin={{ left: -10, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EADCCB" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    stroke="#7F1D1D"
                    strokeWidth={2}
                    dot={{ fill: "#D97706" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-2 flex items-center gap-1 text-sm font-semibold text-maroon">
            <Trophy className="h-4 w-4 text-gold" /> Yearly Ranking ({year})
          </h2>
          <div className="rounded-2xl border border-border bg-card p-4">
            {top3.length > 0 && (
              <ol className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {top3.map((y, i) => {
                  const colors = [
                    "bg-gold/20 border-gold",
                    "bg-muted border-border",
                    "bg-[#f5e6d0] border-[#c99b6c]",
                  ];
                  return (
                    <li key={y.yuvakId} className={`rounded-xl border p-3 ${colors[i]}`}>
                      <p className="text-xs font-medium text-muted-foreground">Rank {i + 1}</p>
                      <p className="truncate text-sm font-semibold text-maroon">{y.name}</p>
                      <p className="font-numeric text-xs">
                        {y.attended}/{y.total} • {y.percentage}%
                      </p>
                    </li>
                  );
                })}
              </ol>
            )}
            {ranking.length === 0 ? (
              <EmptyState title="No statistics available" />
            ) : (
              <ol className="divide-y divide-border">
                {ranking.map((y, i) => (
                  <li key={y.yuvakId} className="flex items-center justify-between py-2">
                    <span className="flex items-center gap-2 text-sm">
                      <span className="w-6 font-numeric text-xs text-muted-foreground">
                        {i + 1}.
                      </span>
                      <span className="truncate">{y.name}</span>
                    </span>
                    <span className="font-numeric text-xs text-muted-foreground">
                      {y.attended}/{y.total} • {y.percentage}%
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
