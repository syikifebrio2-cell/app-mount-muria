import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Ticket, Mountain, User } from "lucide-react";

const items = [
  { to: "/beranda", label: "Home", icon: Home },
  { to: "/tiket", label: "Tiket Saya", icon: Ticket },
  { to: "/jalur", label: "Info Gunung", icon: Mountain },
  { to: "/profil", label: "Profil", icon: User },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="sticky bottom-0 z-30 border-t border-border bg-card/95 px-2 pb-2 pt-1.5 backdrop-blur">
      <ul className="grid grid-cols-4">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <li key={to}>
              <Link
                to={to}
                className="flex flex-col items-center gap-1 rounded-xl py-1.5 transition-colors"
              >
                <span
                  className={`flex h-8 w-14 items-center justify-center rounded-full transition-colors ${
                    active ? "bg-primary/12 text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                </span>
                <span
                  className={`text-[10px] font-medium tracking-tight ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
