import type { ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { BottomNav } from "./BottomNav";

/**
 * Mobile application shell.
 * Renders full-bleed on mobile devices with native safe-area insets,
 * and neatly centered on desktop/tablet screens.
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
    <div
      className={`min-h-screen w-full flex justify-center ${
        dark ? "bg-primary-deep" : "bg-background"
      }`}
    >
      <div
        className={`relative flex w-full max-w-md flex-col min-h-screen ${
          dark ? "bg-primary-deep text-primary-foreground" : "bg-background text-foreground"
        }`}
      >
        {/* Top Safe Area Inset for Notches / Dynamic Island */}
        <div
          className="w-full shrink-0"
          style={{ height: "env(safe-area-inset-top, 0px)" }}
        />

        {/* Main Content Area */}
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>

        {/* Bottom Navigation */}
        {nav ? <BottomNav /> : null}
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
  const router = useRouter();
  return (
    <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
      {back ? (
        <button
          type="button"
          onClick={() => {
            // Utamakan riwayat browser agar tombol kembali terasa natural.
            if (typeof window !== "undefined" && window.history.length > 1) router.history.back();
            else router.navigate({ to: back });
          }}
          aria-label="Kembali"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors active:bg-secondary"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
        </button>
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
