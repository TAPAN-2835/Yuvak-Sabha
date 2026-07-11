import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Users, Layers, CheckCircle2, XCircle, Percent, Cake, Trophy } from "lucide-react";
import { AdminShell } from "@/layouts/AdminShell";
import { StatCard } from "@/components/StatCard";
import { BirthdayCard } from "@/components/BirthdayCard";
import { EmptyState } from "@/components/EmptyState";
import { birthdaysToday } from "@/services/yuvakService";
import {
  useActiveGroups,
  useActiveYuvaks,
  useLatestSabhaSummary,
  useWeeklyStats,
  useYearlyRanking,
  useGroupWiseSummary,
} from "@/hooks/useQueries";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { StatGridSkeleton } from "@/components/LoadingSkeleton";
import { QueryErrorState } from "@/components/QueryErrorState";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin Dashboard — BAPS Yuvak Sabha" }] }),
  component: AdminDashboard,
});

const rankColors = [
  "bg-gold/20 text-maroon border-gold",
  "bg-muted text-foreground border-border",
  "bg-[#f5e6d0] text-maroon border-[#c99b6c]",
];

function AdminDashboard() {
  const { data: activeYuvaks = [] } = useActiveYuvaks();
  const { data: activeGroups = [] } = useActiveGroups();
  const { data: latest, isLoading: latestLoading, isError, refetch } = useLatestSabhaSummary();
  const { data: weekly = [] } = useWeeklyStats();
  const { data: top3 = [] } = useYearlyRanking();
  const { data: groupSummary = [] } = useGroupWiseSummary(latest?.sabhaId);

  const bdays = birthdaysToday(activeYuvaks);
  const top3Slice = top3.slice(0, 3);

  if (isError) {
    return (
      <AdminShell title="Dashboard">
        <div className="mx-auto max-w-6xl px-4 py-5">
          <QueryErrorState onRetry={() => void refetch()} />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Dashboard">
      <div className="mx-auto max-w-6xl space-y-5 px-4 py-5">
        {latestLoading ? (
          <StatGridSkeleton count={6} />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard
              label="Total Yuvaks"
              value={activeYuvaks.length}
              icon={<Users className="h-4 w-4" />}
            />
            <StatCard
              label="Groups"
              value={activeGroups.length}
              icon={<Layers className="h-4 w-4" />}
              tone="maroon"
            />
            <StatCard
              label="Present"
              value={latest?.present ?? 0}
              icon={<CheckCircle2 className="h-4 w-4" />}
              tone="success"
            />
            <StatCard
              label="Absent"
              value={latest?.absent ?? 0}
              icon={<XCircle className="h-4 w-4" />}
              tone="danger"
            />
            <StatCard
              label="Attendance %"
              value={`${latest?.percentage ?? 0}%`}
              icon={<Percent className="h-4 w-4" />}
              tone="gold"
            />
            <StatCard
              label="Birthdays"
              value={bdays.length}
              icon={<Cake className="h-4 w-4" />}
              tone="gold"
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-4 lg:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-maroon">Weekly Attendance</h3>
              <p className="text-xs text-muted-foreground">Last 8 Sabhas</p>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weekly.map((w) => ({
                    name: new Date(w.date).toLocaleDateString("en", {
                      day: "numeric",
                      month: "short",
                    }),
                    present: w.present,
                    absent: w.absent,
                  }))}
                  margin={{ left: -10, right: 8, top: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#EADCCB" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#6B625B" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#6B625B" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #EADCCB" }} />
                  <Bar dataKey="present" stackId="a" fill="#D97706" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="absent" stackId="a" fill="#EADCCB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-gold" />
              <h3 className="text-sm font-semibold text-maroon">Top 3 Regular Yuvaks</h3>
            </div>
            {top3Slice.length === 0 ? (
              <EmptyState title="No statistics available" />
            ) : (
              <ol className="space-y-2">
                {top3Slice.map((y, i) => (
                  <motion.li
                    key={y.yuvakId}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`flex items-center gap-3 rounded-xl border p-3 ${rankColors[i]}`}
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-sm font-semibold shadow-sm">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{y.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {y.attended}/{y.total} Sabhas
                      </p>
                    </div>
                    <span className="font-numeric text-sm font-semibold">{y.percentage}%</span>
                  </motion.li>
                ))}
              </ol>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold text-maroon">
              Group-wise Attendance (Latest)
            </h3>
            {groupSummary.length === 0 ? (
              <EmptyState title="No attendance data" />
            ) : (
              <ul className="space-y-2">
                {groupSummary.map((g) => (
                  <li key={g.groupId} className="rounded-xl border border-border p-3">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">{g.leaderName}</p>
                      <span className="font-numeric text-xs text-muted-foreground">
                        {g.present}/{g.total} • {g.percentage}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-saffron" style={{ width: `${g.percentage}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold text-maroon">Birthdays Today</h3>
            {bdays.length === 0 ? (
              <EmptyState title="No birthdays today" icon={<Cake className="h-6 w-6" />} />
            ) : (
              <div className="space-y-3">
                {bdays.map((y) => (
                  <BirthdayCard
                    key={y.id}
                    yuvak={y}
                    group={activeGroups.find((g) => g.id === y.groupId)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
