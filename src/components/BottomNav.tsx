import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Compass, Plus, Bookmark, User } from "lucide-react";

const items = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/discover", icon: Compass, label: "Discover" },
  { to: "/watchlist", icon: Bookmark, label: "Watchlist" },
  { to: "/profile", icon: User, label: "Profile" },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40">
      <div className="mx-auto max-w-[480px] px-3 pb-3">
        <nav className="pointer-events-auto relative grid grid-cols-5 items-end gap-1 rounded-3xl glass px-3 py-2 shadow-card">
          {items.slice(0, 2).map((it) => (
            <NavBtn key={it.to} {...it} active={pathname === it.to} />
          ))}
          <Link
            to="/create"
            className="relative -mt-7 grid h-14 w-14 place-items-center justify-self-center rounded-full btn-gradient"
            aria-label="Create"
          >
            <Plus className="h-7 w-7" strokeWidth={2.5} />
          </Link>
          {items.slice(2).map((it) => (
            <NavBtn key={it.to} {...it} active={pathname.startsWith(it.to)} />
          ))}
        </nav>
      </div>
    </div>
  );
}

function NavBtn({ to, icon: Icon, label, active }: { to: string; icon: typeof Home; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center gap-1 rounded-2xl py-2 text-[10px] font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}
    >
      <Icon className={`h-5 w-5 ${active ? "text-brand-2" : ""}`} />
      <span>{label}</span>
    </Link>
  );
}
