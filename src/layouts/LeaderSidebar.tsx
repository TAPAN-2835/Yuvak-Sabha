import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Users, Cake, ClipboardList, LogOut } from "lucide-react";
import { cn } from "@/utils";
import { logout } from "@/services/authService";
import { useNavigate } from "@tanstack/react-router";
import { BAPSLogo } from "@/components/BAPSLogo";

export function LeaderSidebar({ leaderName }: { leaderName: string }) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const nav = useNavigate();
  const items = [
    { to: "/group/dashboard", label: "My Group", icon: LayoutDashboard },
    { to: "/group/birthdays", label: "Birthdays", icon: Cake },
    { to: "/group/followups", label: "Follow-ups", icon: ClipboardList },
  ];
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card p-4 md:flex">
      <div className="flex items-center gap-2 pb-4">
        <BAPSLogo size={36} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-maroon">BAPS Yuvak Sabha</p>
          <p className="truncate text-xs text-muted-foreground">{leaderName}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1" aria-label="Leader navigation">
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
              <Users className="hidden" />
              {it.label}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={() => {
          logout();
          nav({ to: "/" });
        }}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
      >
        <LogOut className="h-4 w-4" /> Logout
      </button>
    </aside>
  );
}
