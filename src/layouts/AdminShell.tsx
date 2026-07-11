import { useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AdminBottomNav, AdminSidebar } from "@/layouts/AdminNav";
import { BAPSLogo } from "@/components/BAPSLogo";
import { LogOut } from "lucide-react";
import { logout } from "@/services/authService";
import { Button } from "@/components/ui/button";

export function AdminShell({ title, children }: { title: string; children: ReactNode }) {
  const auth = useAuth();
  const nav = useNavigate();
  useEffect(() => {
    if (!auth || auth.role !== "admin") nav({ to: "/admin" });
  }, [auth, nav]);
  if (!auth || auth.role !== "admin") return null;
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-card/95 px-4 backdrop-blur">
          <div className="flex min-w-0 items-center gap-2 md:hidden">
            <BAPSLogo size={30} />
            <p className="truncate text-sm font-semibold text-maroon">{title}</p>
          </div>
          <p className="hidden truncate text-base font-semibold text-maroon md:block">{title}</p>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Logout"
            onClick={() => {
              logout();
              nav({ to: "/admin" });
            }}
          >
            <LogOut className="mr-1 h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </header>
        <main className="flex-1 pb-20 md:pb-6">{children}</main>
      </div>
      <AdminBottomNav />
    </div>
  );
}
