import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { BAPSLogo } from "@/components/BAPSLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActiveGroups } from "@/hooks/useQueries";
import { loginLeader, getSession } from "@/services/authService";
import { SpiritualFooter } from "@/components/SpiritualFooter";
import { ListSkeleton } from "@/components/LoadingSkeleton";
import { QueryErrorState } from "@/components/QueryErrorState";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BAPS Yuvak Sabha — Group Leader Login" },
      {
        name: "description",
        content: "Group leader sign-in for BAPS Yuvak Mandal weekly Sabha follow-up and seva.",
      },
    ],
  }),
  component: LeaderLogin,
});

function LeaderLogin() {
  const { data: groups = [], isLoading, isError, refetch } = useActiveGroups();
  const [leaderId, setLeaderId] = useState<string>("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    const s = getSession();
    if (s?.role === "leader") nav({ to: "/group/dashboard" });
    if (s?.role === "admin") nav({ to: "/admin/dashboard" });
  }, [nav]);

  const sortedGroups = useMemo(
    () => [...groups].sort((a, b) => a.leaderName.localeCompare(b.leaderName)),
    [groups],
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaderId) {
      toast.error("Please choose your name");
      return;
    }
    setLoading(true);
    const s = await loginLeader(leaderId, password);
    setLoading(false);
    if (!s) {
      toast.error("Incorrect password");
      return;
    }
    toast.success(`જય સ્વામિનારાયણ, ${s.leaderName}`);
    nav({ to: "/group/dashboard" });
  };

  return (
    <div className="mandala-bg min-h-screen bg-cream-gradient">
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 py-10">
        <div className="w-full">
          <div className="flex flex-col items-center text-center">
            <BAPSLogo size={64} />
            <h1 className="mt-4 text-2xl font-semibold text-maroon">BAPS Yuvak Sabha</h1>
            <p className="text-sm text-muted-foreground">Attendance & Follow-up Seva</p>
            <p className="mt-3 font-gujarati text-base text-maroon">જય સ્વામિનારાયણ 🙏</p>
          </div>

          {isLoading ? (
            <div className="mt-6">
              <ListSkeleton rows={3} />
            </div>
          ) : isError ? (
            <div className="mt-6">
              <QueryErrorState onRetry={() => void refetch()} />
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="leader">Group Leader</Label>
                  <Select value={leaderId} onValueChange={setLeaderId}>
                    <SelectTrigger id="leader" className="h-11">
                      <SelectValue placeholder="Select your name" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortedGroups.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.leaderName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pw">Password</Label>
                  <div className="relative">
                    <Input
                      id="pw"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      className="h-11 pr-11"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="h-11 w-full bg-saffron text-white hover:bg-saffron-deep"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-4 rounded-2xl border border-gold/30 bg-saffron-soft/70 p-4 text-center">
            <p className="font-gujarati text-sm font-semibold text-maroon">
              દર શનિવારે રાત્રે 8:30 વાગ્યે યુવક સભા
            </p>
            <p className="mt-2 font-gujarati text-xs text-muted-foreground">
              “સંપ, સુહૃદભાવ અને એકતા એ જ સત્સંગની શક્તિ છે.”
            </p>
          </div>
        </div>
      </div>
      <SpiritualFooter />
    </div>
  );
}
