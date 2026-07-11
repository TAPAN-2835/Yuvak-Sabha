import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";
import { AdminShell } from "@/layouts/AdminShell";
import { SearchInput } from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useActiveYuvaks,
  useGroups,
  useSabhaByDate,
  useAttendanceForSabha,
  useAttendanceMutation,
} from "@/hooks/useQueries";
import { EmptyState } from "@/components/EmptyState";
import { ListSkeleton } from "@/components/LoadingSkeleton";
import { QueryErrorState } from "@/components/QueryErrorState";

export const Route = createFileRoute("/admin/attendance")({
  head: () => ({ meta: [{ title: "Attendance — BAPS Yuvak Sabha" }] }),
  component: AdminAttendance,
});

function nearestSaturdayISO() {
  const d = new Date();
  const day = d.getDay();
  const target = new Date(d);
  if (day <= 6) {
    target.setDate(d.getDate() - ((day + 1) % 7));
  }
  return target.toISOString().slice(0, 10);
}

function AdminAttendance() {
  const { data: groups = [] } = useGroups();
  const { data: activeYuvaks = [], isLoading: yuvaksLoading } = useActiveYuvaks();
  const [date, setDate] = useState(nearestSaturdayISO());
  const [q, setQ] = useState("");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const {
    data: sabha,
    isLoading: sabhaLoading,
    isError: sabhaError,
    refetch: refetchSabha,
  } = useSabhaByDate(date);
  const { data: attendance = [], isLoading: attendanceLoading } = useAttendanceForSabha(sabha?.id);
  const saveMutation = useAttendanceMutation();

  const [presentSet, setPresentSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    const next = new Set(attendance.filter((a) => a.present).map((a) => a.yuvakId));
    setPresentSet(next);
  }, [attendance, sabha?.id]);

  const sortedYuvaks = useMemo(
    () => [...activeYuvaks].sort((a, b) => a.name.localeCompare(b.name)),
    [activeYuvaks],
  );

  const filtered = useMemo(
    () =>
      sortedYuvaks
        .filter((y) => (groupFilter === "all" ? true : y.groupId === groupFilter))
        .filter((y) =>
          q ? y.name.toLowerCase().includes(q.toLowerCase()) || (y.mobile ?? "").includes(q) : true,
        ),
    [sortedYuvaks, groupFilter, q],
  );

  const toggle = (id: string, val: boolean) => {
    setPresentSet((prev) => {
      const next = new Set(prev);
      if (val) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const markAll = (v: boolean) => {
    setPresentSet(v ? new Set(filtered.map((y) => y.id)) : new Set());
  };

  const clearSel = () => setPresentSet(new Set());

  const present = presentSet.size;
  const total = activeYuvaks.length;
  const absent = total - present;
  const dateObj = new Date(date);
  const isSat = dateObj.getDay() === 6;

  const groupName = (id: string) => groups.find((g) => g.id === id)?.leaderName ?? "—";

  const isLoading = yuvaksLoading || sabhaLoading || attendanceLoading;

  if (sabhaError) {
    return (
      <AdminShell title="Attendance">
        <div className="mx-auto max-w-5xl px-4 py-5">
          <QueryErrorState onRetry={() => void refetchSabha()} />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Attendance">
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-5 pb-32">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-end">
          <div>
            <Label htmlFor="date">Sabha Date</Label>
            <Input
              id="date"
              type="date"
              className="h-11 mt-1"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              {isSat ? (
                <span className="rounded-full bg-saffron-soft px-2 py-0.5 text-maroon">
                  Sabha Day • 8:30 PM
                </span>
              ) : (
                `Nearest Saturday: ${nearestSaturdayISO()}`
              )}
            </p>
          </div>
          <SearchInput value={q} onChange={setQ} placeholder="Search name or mobile" />
          <div>
            <Label>Group</Label>
            <Select value={groupFilter} onValueChange={setGroupFilter}>
              <SelectTrigger className="h-11 mt-1 min-w-[10rem]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All groups</SelectItem>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.leaderName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => markAll(true)}>
            Mark all present
          </Button>
          <Button variant="outline" size="sm" onClick={() => markAll(false)}>
            Mark all absent
          </Button>
          <Button variant="ghost" size="sm" onClick={clearSel}>
            Clear selection
          </Button>
        </div>

        {isLoading ? (
          <ListSkeleton rows={8} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No yuvaks match" description="Adjust search or group filter." />
        ) : (
          <>
            <ul className="space-y-2 md:hidden">
              {filtered.map((y) => (
                <li
                  key={y.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{y.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {groupName(y.groupId)}
                      {y.mobile ? ` • ${y.mobile}` : ""}
                    </p>
                  </div>
                  <Switch
                    checked={presentSet.has(y.id)}
                    onCheckedChange={(v) => toggle(y.id, v)}
                    aria-label={`Mark ${y.name} present`}
                  />
                </li>
              ))}
            </ul>

            <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Group Leader</th>
                    <th className="px-4 py-2">Mobile</th>
                    <th className="px-4 py-2 text-right">Present</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((y) => (
                    <tr key={y.id} className="border-t border-border">
                      <td className="px-4 py-2 font-medium">{y.name}</td>
                      <td className="px-4 py-2 text-muted-foreground">{groupName(y.groupId)}</td>
                      <td className="px-4 py-2 font-numeric text-muted-foreground">
                        {y.mobile ?? "—"}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Switch
                          checked={presentSet.has(y.id)}
                          onCheckedChange={(v) => toggle(y.id, v)}
                          aria-label={`Mark ${y.name} present`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-14 z-30 border-t border-border bg-card/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:bottom-0">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-success">
              <CheckCircle2 className="h-3 w-3" /> Present {present}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-danger-soft px-2 py-0.5 text-danger">
              <XCircle className="h-3 w-3" /> Absent {absent}
            </span>
            <span className="hidden text-muted-foreground sm:inline">Total {total}</span>
          </div>
          <Button
            className="h-11 bg-saffron text-white hover:bg-saffron-deep"
            onClick={() => setConfirmOpen(true)}
            disabled={!sabha || saveMutation.isPending}
          >
            Save Attendance
          </Button>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save attendance?</AlertDialogTitle>
            <AlertDialogDescription>
              Sabha date {date}. {present} present, {absent} absent. Existing records for this date
              will be replaced.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!sabha) return;
                try {
                  await saveMutation.mutateAsync({
                    sabhaId: sabha.id,
                    presentIds: presentSet,
                    allIds: activeYuvaks.map((y) => y.id),
                  });
                  toast.success("Attendance saved");
                } catch {
                  toast.error("Unable to save attendance");
                }
              }}
            >
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminShell>
  );
}
