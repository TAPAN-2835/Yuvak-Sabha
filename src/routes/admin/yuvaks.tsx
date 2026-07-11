import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, UserX, UserCheck } from "lucide-react";
import { AdminShell } from "@/layouts/AdminShell";
import { SearchInput } from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { EmptyState } from "@/components/EmptyState";
import { useGroups, useYuvaks, useYuvakMutations } from "@/hooks/useQueries";
import type { Yuvak } from "@/types";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ListSkeleton } from "@/components/LoadingSkeleton";
import { QueryErrorState } from "@/components/QueryErrorState";

export const Route = createFileRoute("/admin/yuvaks")({
  head: () => ({ meta: [{ title: "Yuvaks — BAPS Yuvak Sabha" }] }),
  component: AdminYuvaks,
});

const schema = z.object({
  name: z.string().min(1, "Required"),
  mobile: z
    .string()
    .optional()
    .refine((v) => !v || /^\d{10}$/.test(v.replace(/\D/g, "")), "Must be a 10-digit number"),
  birthDate: z.string().optional(),
  studyJob: z.string().optional(),
  address: z.string().optional(),
  groupId: z.string().min(1, "Required"),
  notes: z.string().optional(),
  active: z.boolean(),
});
type FormData = z.infer<typeof schema>;

function AdminYuvaks() {
  const { data: yuvaks = [], isLoading, isError, refetch } = useYuvaks();
  const { data: groups = [] } = useGroups();
  const { create, update, deactivate, activate } = useYuvakMutations();
  const [q, setQ] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");
  const [editing, setEditing] = useState<Yuvak | null>(null);
  const [open, setOpen] = useState(false);
  const [confirmDeact, setConfirmDeact] = useState<Yuvak | null>(null);

  const filtered = useMemo(
    () =>
      [...yuvaks]
        .filter((y) =>
          statusFilter === "all" ? true : statusFilter === "active" ? y.active : !y.active,
        )
        .filter((y) => (groupFilter === "all" ? true : y.groupId === groupFilter))
        .filter((y) =>
          q ? y.name.toLowerCase().includes(q.toLowerCase()) || (y.mobile ?? "").includes(q) : true,
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
    [yuvaks, q, groupFilter, statusFilter],
  );

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      mobile: "",
      birthDate: "",
      studyJob: "",
      address: "",
      notes: "",
      groupId: groups[0]?.id ?? "",
      active: true,
    },
  });

  const openAdd = () => {
    setEditing(null);
    form.reset({
      name: "",
      mobile: "",
      birthDate: "",
      studyJob: "",
      address: "",
      notes: "",
      groupId: groups[0]?.id ?? "",
      active: true,
    });
    setOpen(true);
  };

  const openEdit = (y: Yuvak) => {
    setEditing(y);
    form.reset({
      name: y.name,
      mobile: y.mobile ?? "",
      birthDate: y.birthDate ?? "",
      studyJob: y.studyJob ?? "",
      address: y.address ?? "",
      notes: y.notes ?? "",
      groupId: y.groupId,
      active: y.active,
    });
    setOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      mobile: data.mobile ? data.mobile.replace(/\D/g, "") : null,
      birthDate: data.birthDate || null,
      studyJob: data.studyJob || null,
      address: data.address || null,
      notes: data.notes || null,
    };
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, patch: payload });
        toast.success("Yuvak updated");
      } else {
        await create.mutateAsync(payload);
        toast.success("Yuvak added");
      }
      setOpen(false);
    } catch {
      toast.error("Unable to save yuvak. Please try again.");
    }
  };

  const groupName = (id: string) => groups.find((g) => g.id === id)?.leaderName ?? "—";

  if (isLoading) {
    return (
      <AdminShell title="Yuvak Management">
        <div className="mx-auto max-w-5xl px-4 py-5">
          <ListSkeleton rows={8} />
        </div>
      </AdminShell>
    );
  }

  if (isError) {
    return (
      <AdminShell title="Yuvak Management">
        <div className="mx-auto max-w-5xl px-4 py-5">
          <QueryErrorState onRetry={() => void refetch()} />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Yuvak Management">
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
          <SearchInput value={q} onChange={setQ} placeholder="Search name or mobile" />
          <Select value={groupFilter} onValueChange={setGroupFilter}>
            <SelectTrigger className="h-11 min-w-[9rem]">
              <SelectValue placeholder="Group" />
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-11 min-w-[7rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
          <Button className="h-11 bg-saffron text-white hover:bg-saffron-deep" onClick={openAdd}>
            <Plus className="mr-1 h-4 w-4" /> Add Yuvak
          </Button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="No yuvaks found"
            description="Try changing filters or add a new yuvak."
          />
        ) : (
          <ul className="space-y-2">
            {filtered.map((y) => (
              <li
                key={y.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold">{y.name}</p>
                    {!y.active && (
                      <span className="rounded-full bg-danger-soft px-2 py-0.5 text-[10px] font-medium text-danger">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {groupName(y.groupId)} • {y.studyJob || "—"} • {y.mobile ?? "no mobile"}
                    {y.birthDate
                      ? ` • Born ${new Date(y.birthDate).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })}`
                      : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(y)}>
                    <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                  </Button>
                  {y.active ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-danger"
                      onClick={() => setConfirmDeact(y)}
                    >
                      <UserX className="mr-1 h-3.5 w-3.5" /> Deactivate
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-success"
                      onClick={async () => {
                        try {
                          await activate.mutateAsync(y.id);
                          toast.success("Yuvak activated");
                        } catch {
                          toast.error("Unable to activate yuvak");
                        }
                      }}
                    >
                      <UserCheck className="mr-1 h-3.5 w-3.5" /> Activate
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{editing ? "Edit Yuvak" : "Add Yuvak"}</SheetTitle>
            <SheetDescription>
              {editing ? "Update yuvak details." : "Add a new yuvak to a group."}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 px-4 pb-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" className="mt-1 h-11" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="mt-1 text-xs text-danger">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                inputMode="numeric"
                className="mt-1 h-11"
                {...form.register("mobile")}
              />
              {form.formState.errors.mobile && (
                <p className="mt-1 text-xs text-danger">{form.formState.errors.mobile.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="birthDate">Birth Date</Label>
              <Input
                id="birthDate"
                type="date"
                className="mt-1 h-11"
                {...form.register("birthDate")}
              />
            </div>
            <div>
              <Label htmlFor="studyJob">Study / Job</Label>
              <Input id="studyJob" className="mt-1 h-11" {...form.register("studyJob")} />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" rows={2} className="mt-1" {...form.register("address")} />
            </div>
            <div>
              <Label>Group</Label>
              <Select
                value={form.watch("groupId")}
                onValueChange={(v) => form.setValue("groupId", v)}
              >
                <SelectTrigger className="mt-1 h-11">
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
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={2} className="mt-1" {...form.register("notes")} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">
                  Inactive yuvaks are hidden from attendance and dashboards.
                </p>
              </div>
              <Switch
                checked={form.watch("active")}
                onCheckedChange={(v) => form.setValue("active", v)}
              />
            </div>
            <Button
              type="submit"
              className="h-11 w-full bg-saffron text-white hover:bg-saffron-deep"
              disabled={create.isPending || update.isPending}
            >
              {editing ? "Save changes" : "Add yuvak"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!confirmDeact} onOpenChange={(o) => !o && setConfirmDeact(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate yuvak?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDeact?.name} will be hidden from attendance and dashboards. You can activate
              them again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (confirmDeact) {
                  try {
                    await deactivate.mutateAsync(confirmDeact.id);
                    toast.success("Yuvak deactivated");
                  } catch {
                    toast.error("Unable to deactivate yuvak");
                  }
                }
                setConfirmDeact(null);
              }}
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminShell>
  );
}
