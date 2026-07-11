import { createFileRoute } from "@tanstack/react-router";
import { Cake } from "lucide-react";
import { LeaderShell } from "@/layouts/LeaderShell";
import { BirthdayCard } from "@/components/BirthdayCard";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { birthdaysToday } from "@/services/yuvakService";
import { useGroups, useYuvaksByGroup } from "@/hooks/useQueries";
import { ListSkeleton } from "@/components/LoadingSkeleton";
import { QueryErrorState } from "@/components/QueryErrorState";
import { useMemo } from "react";

export const Route = createFileRoute("/group/birthdays")({
  head: () => ({ meta: [{ title: "Birthdays — BAPS Yuvak Sabha" }] }),
  component: LeaderBirthdays,
});

function LeaderBirthdays() {
  const auth = useAuth();
  const groupId = auth?.groupId ?? "";
  const leaderName = auth?.leaderName ?? "";
  const { data: groups = [] } = useGroups();
  const {
    data: yuvaks = [],
    isLoading,
    isError,
    refetch,
  } = useYuvaksByGroup(groupId, Boolean(groupId));
  const group = groups.find((item) => item.id === groupId);
  const today = birthdaysToday(yuvaks);

  // Upcoming this month
  const now = new Date();
  const m = now.getMonth() + 1;
  const upcoming = useMemo(
    () =>
      yuvaks
        .filter((y) => y.birthDate)
        .filter((y) => Number(y.birthDate!.slice(5, 7)) === m)
        .sort((a, b) => (a.birthDate! < b.birthDate! ? -1 : 1)),
    [yuvaks, m],
  );

  return (
    <LeaderShell>
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-5">
        <div>
          <h2 className="text-lg font-semibold text-maroon">Group Birthdays</h2>
          <p className="text-xs text-muted-foreground">
            {group?.leaderName ? `${group.leaderName}'s group` : ""}
          </p>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Today
          </p>
          {isLoading ? (
            <ListSkeleton rows={2} />
          ) : isError ? (
            <QueryErrorState onRetry={() => void refetch()} />
          ) : today.length === 0 ? (
            <EmptyState
              title="No birthdays today"
              description="Come back tomorrow to celebrate."
              icon={<Cake className="h-6 w-6" />}
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {today.map((y) => (
                <BirthdayCard
                  key={y.id}
                  yuvak={y}
                  group={group}
                  groupId={groupId}
                  leaderName={leaderName}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            This month
          </p>
          {upcoming.length === 0 ? (
            <EmptyState title="No birthdays this month" icon={<Cake className="h-6 w-6" />} />
          ) : (
            <div className="space-y-2">
              {upcoming.map((y) => (
                <div
                  key={y.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{y.name}</p>
                    <p className="text-xs text-muted-foreground">{y.studyJob || "—"}</p>
                  </div>
                  <span className="font-numeric text-sm font-semibold text-maroon">
                    {new Date(y.birthDate!).toLocaleDateString("en", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </LeaderShell>
  );
}
