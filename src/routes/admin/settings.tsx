import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/layouts/AdminShell";
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
import { useSettings, useSettingsMutation } from "@/hooks/useQueries";
import { ListSkeleton } from "@/components/LoadingSkeleton";
import { QueryErrorState } from "@/components/QueryErrorState";

const DAY_OPTIONS = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — BAPS Yuvak Sabha" }] }),
  component: AdminSettings,
});

function AdminSettings() {
  const { data: settings, isLoading, isError, refetch } = useSettings();
  const saveMutation = useSettingsMutation();
  const [form, setForm] = useState({
    mandalName: "",
    sabhaDayNumber: "6",
    sabhaTimeRaw: "20:30",
    reminderMessage: "",
    birthdayMessage: "",
  });

  useEffect(() => {
    if (settings) {
      setForm({
        mandalName: settings.mandalName,
        sabhaDayNumber: String(settings.sabhaDayNumber),
        sabhaTimeRaw: settings.sabhaTimeRaw,
        reminderMessage: settings.reminderMessage,
        birthdayMessage: settings.birthdayMessage,
      });
    }
  }, [settings]);

  const save = async () => {
    try {
      await saveMutation.mutateAsync({
        mandalName: form.mandalName,
        sabhaDayNumber: Number(form.sabhaDayNumber),
        sabhaTimeRaw: form.sabhaTimeRaw,
        reminderMessage: form.reminderMessage,
        birthdayMessage: form.birthdayMessage,
      });
      toast.success("Settings saved");
    } catch {
      toast.error("Unable to save settings");
    }
  };

  if (isLoading) {
    return (
      <AdminShell title="Settings">
        <div className="mx-auto max-w-2xl px-4 py-5">
          <ListSkeleton rows={5} />
        </div>
      </AdminShell>
    );
  }

  if (isError) {
    return (
      <AdminShell title="Settings">
        <div className="mx-auto max-w-2xl px-4 py-5">
          <QueryErrorState onRetry={() => void refetch()} />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Settings">
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-5">
        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold text-maroon">Mandal</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="mn">Mandal Name</Label>
              <Input
                id="mn"
                className="mt-1 h-11"
                value={form.mandalName}
                onChange={(e) => setForm({ ...form, mandalName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="sd">Sabha Day</Label>
                <Select
                  value={form.sabhaDayNumber}
                  onValueChange={(v) => setForm({ ...form, sabhaDayNumber: v })}
                >
                  <SelectTrigger id="sd" className="mt-1 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAY_OPTIONS.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="st">Sabha Time</Label>
                <Input
                  id="st"
                  type="time"
                  className="mt-1 h-11"
                  value={form.sabhaTimeRaw}
                  onChange={(e) => setForm({ ...form, sabhaTimeRaw: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold text-maroon">Default Messages</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="rm">WhatsApp reminder</Label>
              <Textarea
                id="rm"
                rows={4}
                className="mt-1 font-gujarati"
                value={form.reminderMessage}
                onChange={(e) => setForm({ ...form, reminderMessage: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="bm">Birthday message</Label>
              <Textarea
                id="bm"
                rows={4}
                className="mt-1 font-gujarati"
                value={form.birthdayMessage}
                onChange={(e) => setForm({ ...form, birthdayMessage: e.target.value })}
              />
            </div>
          </div>
        </div>

        <Button
          className="h-11 w-full bg-saffron text-white hover:bg-saffron-deep"
          onClick={() => void save()}
          disabled={saveMutation.isPending}
        >
          Save settings
        </Button>
      </div>
    </AdminShell>
  );
}
