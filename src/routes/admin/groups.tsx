import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Users, KeyRound } from "lucide-react";
import { AdminShell } from "@/layouts/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGroups, useYuvaks, useGroupMutations } from "@/hooks/useQueries";
import type { Group } from "@/types";
import { EmptyState } from "@/components/EmptyState";
import { leaderPasswordFor } from "@/services/authService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListSkeleton } from "@/components/LoadingSkeleton";
import { QueryErrorState } from "@/components/QueryErrorState";

export const Route = createFileRoute("/admin/groups")({
  head: () => ({ meta: [{ title: "Groups — BAPS Yuvak Sabha" }] }),
  component: AdminGroups,
});

function AdminGroups() {
  const { data: groups = [], isLoading, isError, refetch } = useGroups();
  const { data: yuvaks = [] } = useYuvaks();
  const { create, update, moveYuvak } = useGroupMutations();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Group | null>(null);
  const [viewing, setViewing] = useState<Group | null>(null);
  const [pwGroup, setPwGroup] = useState<Group | null>(null);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [active, setActive] = useState(true);

  const openAdd = () => {
    setEditing(null);
    setName("");
    setMobile("");
    setActive(true);
    setOpen(true);
  };
  const openEdit = (g: Group) => {
    setEditing(g);
    setName(g.leaderName);
    setMobile(g.leaderMobile ?? "");
    setActive(g.active);
    setOpen(true);
  };

  const submit = async () => {
    if (!name.trim()) {
      toast.error("Leader name required");
      return;
    }
    const mob = mobile.replace(/\D/g, "");
    const finalMob = mob.length === 10 ? mob : null;
    try {
      if (editing) {
        await update.mutateAsync({
          id: editing.id,
          patch: {
            leaderName: name.trim(),
            leaderMobile: finalMob,
            active,
          },
        });
        toast.success("Group updated");
      } else {
        await create.mutateAsync({
          leaderName: name.trim(),
          leaderMobile: finalMob,
        });
        toast.success("Group added");
      }
      setOpen(false);
    } catch {
      toast.error("Unable to save group. Please try again.");
    }
  };

  const countInGroup = (id: string) => yuvaks.filter((y) => y.groupId === id && y.active).length;

  const yuvaksIn = (id: string) => yuvaks.filter((y) => y.groupId === id && y.active);

  if (isLoading) {
    return (
      <AdminShell title="Group Management">
        <div className="mx-auto max-w-5xl px-4 py-5">
          <ListSkeleton rows={6} />
        </div>
      </AdminShell>
    );
  }

  if (isError) {
    return (
      <AdminShell title="Group Management">
        <div className="mx-auto max-w-5xl px-4 py-5">
          <QueryErrorState onRetry={() => void refetch()} />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Group Management">
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{groups.length} groups</p>
          <Button className="h-11 bg-saffron text-white hover:bg-saffron-deep" onClick={openAdd}>
            <Plus className="mr-1 h-4 w-4" /> Add group
          </Button>
        </div>

        {groups.length === 0 ? (
          <EmptyState title="No groups yet" description="Add a group leader to start." />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((g) => (
              <div key={g.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-maroon">{g.leaderName}</p>
                    <p className="font-numeric text-xs text-muted-foreground">
                      {g.leaderMobile ?? "no mobile"}
                    </p>
                  </div>
                  {g.active ? (
                    <span className="rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-medium text-success">
                      Active
                    </span>
                  ) : (
                    <span className="rounded-full bg-danger-soft px-2 py-0.5 text-[10px] font-medium text-danger">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  <Users className="mr-1 inline h-3 w-3" />
                  {countInGroup(g.id)} yuvaks
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setViewing(g)}>
                    View
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEdit(g)}>
                    <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setPwGroup(g)}>
                    <KeyRound className="mr-1 h-3.5 w-3.5" /> Password
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit group" : "Add group"}</DialogTitle>
            <DialogDescription>
              Group leader details. Password is generated from the leader's name.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="ln">Leader name</Label>
              <Input
                id="ln"
                className="mt-1 h-11"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="lm">Mobile number</Label>
              <Input
                id="lm"
                inputMode="numeric"
                className="mt-1 h-11"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <p className="text-sm font-medium">Active</p>
              <Switch checked={active} onCheckedChange={setActive} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-saffron text-white hover:bg-saffron-deep"
              onClick={() => void submit()}
              disabled={create.isPending || update.isPending}
            >
              {editing ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewing?.leaderName}'s group</DialogTitle>
            <DialogDescription>
              {viewing ? `${countInGroup(viewing.id)} active yuvaks` : ""}
            </DialogDescription>
          </DialogHeader>
          {viewing && (
            <ul className="space-y-2">
              {yuvaksIn(viewing.id).length === 0 ? (
                <EmptyState title="No group members" />
              ) : (
                yuvaksIn(viewing.id).map((y) => (
                  <li
                    key={y.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border p-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{y.name}</p>
                      <p className="text-[11px] text-muted-foreground">{y.mobile ?? "no mobile"}</p>
                    </div>
                    <Select
                      value={y.groupId}
                      onValueChange={async (v) => {
                        try {
                          await moveYuvak.mutateAsync({
                            yuvakId: y.id,
                            newGroupId: v,
                          });
                          toast.success("Yuvak moved");
                        } catch {
                          toast.error("Unable to move yuvak");
                        }
                      }}
                    >
                      <SelectTrigger className="h-9 w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map((g) => (
                          <SelectItem key={g.id} value={g.id}>
                            {g.leaderName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </li>
                ))
              )}
            </ul>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!pwGroup} onOpenChange={(o) => !o && setPwGroup(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leader password</DialogTitle>
            <DialogDescription>
              Passwords are generated automatically from the leader's name.
            </DialogDescription>
          </DialogHeader>
          {pwGroup && (
            <div className="space-y-2 rounded-lg border border-border bg-muted p-3 text-sm">
              <p>
                <span className="text-muted-foreground">Rule:</span>{" "}
                <span className="font-numeric font-medium">leadername123</span>
              </p>
              <p>
                <span className="text-muted-foreground">Current:</span>{" "}
                <span className="font-numeric font-semibold text-maroon">
                  {leaderPasswordFor(pwGroup.leaderName)}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                Share this only with {pwGroup.leaderName} directly.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
