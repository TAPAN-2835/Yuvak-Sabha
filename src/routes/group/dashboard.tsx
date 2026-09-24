import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Users, Phone, MessageCircle, Cake } from "lucide-react";
import { LeaderShell } from "@/layouts/LeaderShell";
import { StatCard } from "@/components/StatCard";
import { SearchInput } from "@/components/SearchInput";
import { YuvakCard } from "@/components/YuvakCard";
import { BirthdayCard } from "@/components/BirthdayCard";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { birthdaysToday } from "@/services/yuvakService";
import { useYuvaksByGroup, useTodayFollowups, useGroups } from "@/hooks/useQueries";
import { ListSkeleton } from "@/components/LoadingSkeleton";
import { QueryErrorState } from "@/components/QueryErrorState";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";

export const Route = createFileRoute("/group/dashboard")({
  head: () => ({ meta: [{ title: "My Group — BAPS Yuvak Sabha" }] }),
  component: LeaderDashboard,
});

function LeaderDashboard() {
  const auth = useAuth();
  const groupId = auth?.groupId ?? "";
  const leaderName = auth?.leaderName ?? "";
  const [q, setQ] = useState("");
  const [statuses, setStatuses] = useState<Record<string, string>>({});

  const { data: groups = [] } = useGroups();
  const {
    data: yuvaks = [],
    isLoading,
    isError,
    refetch,
  } = useYuvaksByGroup(groupId, Boolean(groupId));
  const { data: todaysFollowups = [] } = useTodayFollowups(groupId, Boolean(groupId));

  const group = groups.find((g) => g.id === groupId);

  const sortedYuvaks = useMemo(
    () => [...yuvaks].sort((a, b) => a.name.localeCompare(b.name)),
    [yuvaks],
  );

  const calledToday = new Set(
    todaysFollowups.filter((f) => f.type === "call").map((f) => f.yuvakId),
  ).size;
  const waToday = new Set(
    todaysFollowups.filter((f) => f.type === "whatsapp").map((f) => f.yuvakId),
  ).size;

  const bdays = birthdaysToday(sortedYuvaks);

  const filtered = q
    ? sortedYuvaks.filter((y) => y.name.toLowerCase().includes(q.toLowerCase()))
    : sortedYuvaks;

  if (isError) {
    return (
      <LeaderShell>
        <div className="mx-auto max-w-3xl px-4 py-5">
          <QueryErrorState onRetry={() => void refetch()} />
        </div>
      </LeaderShell>
    );
  }

  return (
    <LeaderShell>
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-5">
        <div>
          <p className="font-gujarati text-lg font-semibold text-maroon">
            જય સ્વામિનારાયણ, {auth?.leaderName}
          </p>
          <p className="text-xs text-muted-foreground">
            {group ? `${sortedYuvaks.length} yuvaks in your group` : ""}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Total Yuvaks"
            value={sortedYuvaks.length}
            icon={<Users className="h-4 w-4" />}
          />
          <StatCard
            label="Called Today"
            value={calledToday}
            icon={<Phone className="h-4 w-4" />}
            tone="maroon"
          />
          <StatCard
            label="WhatsApp Today"
            value={waToday}
            icon={<WhatsAppIcon className="h-4 w-4" />}
            tone="success"
          />
          <StatCard
            label="Birthdays"
            value={bdays.length}
            icon={<Cake className="h-4 w-4" />}
            tone="gold"
          />
        </div>

        {bdays.length > 0 ? (
          <div className="space-y-2">
            {bdays.map((y) => (
              <BirthdayCard
                key={y.id}
                yuvak={y}
                group={group}
                groupId={groupId}
                leaderName={leaderName}
              />
            ))}
          </div>
        ) : null}

        <div className="sticky top-14 z-20 -mx-4 border-b border-border bg-background/95 px-4 py-2 backdrop-blur md:top-0 md:mx-0 md:rounded-xl md:border md:px-3">
          <SearchInput value={q} onChange={setQ} placeholder="Search yuvaks by name" />
        </div>

        {isLoading ? (
          <ListSkeleton rows={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No yuvaks found"
            description="Try a different name or check with admin."
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {filtered.map((y) => (
              <YuvakCard
                key={y.id}
                yuvak={y}
                groupId={groupId}
                leaderName={leaderName}
                status={statuses[y.id]}
                onStatusChange={(status) => setStatuses((prev) => ({ ...prev, [y.id]: status }))}
              />
            ))}
          </div>
        )}
      </div>

      {Object.keys(statuses).length > 0 && (
        <button
          className="fixed bottom-[80px] right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-success text-white shadow-lg transition-transform hover:scale-105 active:scale-95 md:bottom-8 md:right-8"
          onClick={() => {
            const date = new Date().toLocaleDateString("en-GB");
            const parts = [`*Follow-Up Report* (${date})`, `*By:* ${leaderName}`];
            sortedYuvaks
              .filter((y) => statuses[y.id])
              .forEach((y) => {
                parts.push(`${y.name} - *${statuses[y.id]}*`);
              });
            const text = encodeURIComponent(parts.join("\n"));
            const target = import.meta.env.VITE_WHATSAPP_REPORT_TARGET;
            const url = target ? `https://wa.me/${target}?text=${text}` : `https://wa.me/?text=${text}`;
            window.open(url, "_blank");
          }}
          aria-label="Send Report via WhatsApp"
        >
          <WhatsAppIcon className="h-7 w-7" />
        </button>
      )}
    </LeaderShell>
  );
}
