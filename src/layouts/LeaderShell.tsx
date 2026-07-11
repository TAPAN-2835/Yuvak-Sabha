import { useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LeaderBottomNav } from "@/layouts/LeaderBottomNav";
import { LeaderSidebar } from "@/layouts/LeaderSidebar";
import { BAPSLogo } from "@/components/BAPSLogo";
import { LogOut } from "lucide-react";
import { logout } from "@/services/authService";
import { Button } from "@/components/ui/button";

export function LeaderShell({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const nav = useNavigate();
  useEffect(() => {
    if (!auth || auth.role !== "leader") nav({ to: "/" });
  }, [auth, nav]);
  if (!auth || auth.role !== "leader") return null;
  return (
    <div className="flex min-h-screen bg-background">
      <LeaderSidebar leaderName={auth.leaderName ?? ""} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur md:hidden">
          <div className="flex min-w-0 items-center gap-2">
            <BAPSLogo size={30} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-maroon">Yuvak Sabha</p>
              <p className="truncate text-[11px] text-muted-foreground">{auth.leaderName}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Logout"
            onClick={() => {
              logout();
              nav({ to: "/" });
            }}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </header>
        <main className="flex-1 pb-20 md:pb-6">{children}</main>
      </div>
      <LeaderBottomNav />
    </div>
  );
}
