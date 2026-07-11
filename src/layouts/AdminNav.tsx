import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Layers,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/utils";
import { logout } from "@/services/authService";
import { BAPSLogo } from "@/components/BAPSLogo";

const items = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/attendance", label: "Attendance", icon: CalendarCheck },
  { to: "/admin/yuvaks", label: "Yuvaks", icon: Users },
  { to: "/admin/groups", label: "Groups", icon: Layers },
  { to: "/admin/statistics", label: "Statistics", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
] as const;

export function AdminSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const nav = useNavigate();
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card p-4 md:flex">
      <div className="flex items-center gap-2 pb-4">
        <BAPSLogo size={36} />
        <div>
          <p className="text-sm font-semibold text-maroon">BAPS Admin</p>
          <p className="text-xs text-muted-foreground">Yuvak Sabha</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1" aria-label="Admin navigation">
        {items.map((it) => {
          const active = pathname.startsWith(it.to);
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                active ? "bg-saffron-soft text-maroon" : "text-muted-foreground hover:bg-muted",
              )}
            >
              <Icon className="h-4 w-4" />
              {it.label}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={() => {
          logout();
          nav({ to: "/admin" });
        }}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
      >
        <LogOut className="h-4 w-4" /> Logout
      </button>
    </aside>
  );
}

export function AdminBottomNav() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const short = items.slice(0, 5);
  return (
    <nav
      data-lenis-prevent
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      aria-label="Admin navigation"
    >
      <ul className="mx-auto flex max-w-2xl items-stretch justify-around">
        {short.map((it) => {
          const active = pathname.startsWith(it.to);
          const Icon = it.icon;
          return (
            <li key={it.to} className="flex-1">
              <Link
                to={it.to}
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
                  active ? "text-saffron" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
