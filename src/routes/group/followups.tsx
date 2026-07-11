import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Phone, MessageCircle, Cake, ClipboardList } from "lucide-react";
import { LeaderShell } from "@/layouts/LeaderShell";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { useFollowupsByGroup, useYuvaksByGroup } from "@/hooks/useQueries";
import { ListSkeleton } from "@/components/LoadingSkeleton";
import { QueryErrorState } from "@/components/QueryErrorState";
import { cn } from "@/utils";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/group/followups")({
  head: () => ({ meta: [{ title: "Follow-ups — BAPS Yuvak Sabha" }] }),
  component: LeaderFollowups,
});

type Filter = "all" | "call" | "whatsapp" | "birthday";

function typeMeta(t: Filter) {
  if (t === "call") return { icon: Phone, color: "text-saffron bg-saffron-soft", label: "Call" };
  if (t === "whatsapp")
    return {
      icon: MessageCircle,
      color: "text-success bg-success-soft",
      label: "WhatsApp",
    };
  if (t === "birthday") return { icon: Cake, color: "text-gold bg-[#fff3d6]", label: "Birthday" };
  return { icon: ClipboardList, color: "text-muted-foreground bg-muted", label: "All" };
}

function LeaderFollowups() {
  const auth = useAuth();
  const groupId = auth?.groupId ?? "";
  const [filter, setFilter] = useState<Filter>("all");
  const {
    data: followups = [],
    isLoading,
    isError,
    refetch,
  } = useFollowupsByGroup(groupId, Boolean(groupId));
  const { data: yuvaks = [] } = useYuvaksByGroup(groupId, Boolean(groupId));

  const logs = useMemo(
    () => followups.filter((f) => (filter === "all" ? true : f.type === filter)),
    [followups, filter],
  );

  const yuvakName = (id: string) => yuvaks.find((y) => y.id === id)?.name ?? "Unknown";

  const filters: Filter[] = ["all", "call", "whatsapp", "birthday"];

  return (
    <LeaderShell>
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-5">
        <div>
          <h2 className="text-lg font-semibold text-maroon">Follow-up Activity</h2>
          <p className="text-xs text-muted-foreground">Your recent calls and WhatsApp messages</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((f) => {
            const meta = typeMeta(f);
            const active = filter === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium",
                  active
                    ? "border-saffron bg-saffron text-white"
                    : "border-border bg-card text-muted-foreground",
                )}
              >
                {f === "all"
                  ? "All"
                  : f === "call"
                    ? "Calls"
                    : f === "whatsapp"
                      ? "WhatsApp"
                      : "Birthday Wishes"}
                <span className="ml-1">{meta.label === "All" ? "" : ""}</span>
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <ListSkeleton rows={5} />
        ) : isError ? (
          <QueryErrorState onRetry={() => void refetch()} />
        ) : logs.length === 0 ? (
          <EmptyState
            title="No follow-up activity yet"
            description="Tap Call or WhatsApp on a yuvak to record it here."
          />
        ) : (
          <ol className="space-y-2">
            {logs.map((l) => {
              const meta = typeMeta(l.type as Filter);
              const Icon = meta.icon;
              return (
                <li
                  key={l.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-3"
                >
                  <span className={cn("grid h-9 w-9 place-items-center rounded-full", meta.color)}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{yuvakName(l.yuvakId)}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {meta.label} •{" "}
                      {new Date(l.at).toLocaleString("en", {
                        day: "numeric",
                        month: "short",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className="font-numeric text-[11px] text-muted-foreground">
                    {formatDistanceToNow(new Date(l.at), { addSuffix: true })}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </LeaderShell>
  );
}
