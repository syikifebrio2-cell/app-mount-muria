import type { ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import { ChevronLeft, Signal, Wifi, BatteryMedium } from "lucide-react";
import { BottomNav } from "./BottomNav";

/**
 * Mobile device shell. Every screen renders inside this frame so the
 * prototype reads as an app, not a website.
 */
export function PhoneShell({
  children,
  nav = false,
  dark = false,
  statusBarLight = false,
}: {
  children: ReactNode;
  nav?: boolean;
  dark?: boolean;
  statusBarLight?: boolean;
}) {
  return (
    <div className="flex min-h-screen justify-center bg-muted p-0 sm:p-6">
      <div
        className={`relative flex w-full max-w-[420px] flex-col overflow-hidden shadow-lifted sm:rounded-[2.5rem] sm:border-8 sm:border-primary-deep ${
          dark ? "bg-primary-deep" : "bg-background"
        }`}
        style={{ minHeight: "min(100vh, 880px)" }}
      >
        <StatusBar light={statusBarLight || dark} />
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        {nav ? <BottomNav /> : null}
      </div>
    </div>
  );
}

function StatusBar({ light }: { light?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between px-6 pb-1 pt-3 text-[11px] font-semibold ${
        light ? "text-primary-foreground" : "text-foreground"
      }`}
    >
      <span>05:12</span>
      <div className="flex items-center gap-1.5 opacity-80">
        <Signal className="h-3.5 w-3.5" strokeWidth={2} />
        <Wifi className="h-3.5 w-3.5" strokeWidth={2} />
        <BatteryMedium className="h-4 w-4" strokeWidth={2} />
      </div>
    </div>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  back,
  action,
}: {
  title: string;
  subtitle?: string;
  back?: string;
  action?: ReactNode;
}) {
  return (
    <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3">
      {back ? (
        <Link
          to={back}
          aria-label="Kembali"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
        </Link>
      ) : (
        <span className="h-9 w-0" />
      )}
      <div className="min-w-0">
        <h1 className="truncate text-base font-bold tracking-tight">{title}</h1>
        {subtitle ? (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      <div className="shrink-0">{action}</div>
    </header>
  );
}

export function OfflineBadge({ label = "Tersimpan offline" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-success/12 px-2.5 py-1 text-[10px] font-semibold text-success">
      <span className="h-1.5 w-1.5 rounded-full bg-success" />
      {label}
    </span>
  );
}

export function LoadingBar({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2">
      <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
      <span className="text-[11px] font-medium text-secondary-foreground">{label}</span>
    </div>
  );
}
