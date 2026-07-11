import { Link, useRouterState } from "@tanstack/react-router";
import { Users, Cake, ClipboardList, LogOut } from "lucide-react";
import { cn } from "@/utils";
import { logout } from "@/services/authService";
import { useNavigate } from "@tanstack/react-router";

const items = [
  { to: "/group/dashboard", label: "My Group", icon: Users },
  { to: "/group/birthdays", label: "Birthdays", icon: Cake },
  { to: "/group/followups", label: "Follow-ups", icon: ClipboardList },
] as const;

export function LeaderBottomNav() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const nav = useNavigate();
  return (
    <nav
      data-lenis-prevent
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      aria-label="Group leader navigation"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {items.map((it) => {
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
        <li className="flex-1">
          <button
            type="button"
            onClick={() => {
              logout();
              nav({ to: "/" });
            }}
            className="flex h-14 w-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-muted-foreground"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}
