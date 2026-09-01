import type { ReactNode } from "react";
import { Loader2, Inbox, TriangleAlert, RotateCw } from "lucide-react";

/** Loading, kosong, dan error state yang dipakai konsisten di seluruh layar. */

export function LoadingState({ label = "Memuat data…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-border bg-card/60 px-5 py-10 text-center">
      <Loader2 className="h-5 w-5 animate-spin text-primary" strokeWidth={2} />
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

export function EmptyState({
  title,
  body,
  icon: Icon = Inbox,
  action,
}: {
  title: string;
  body?: string;
  icon?: typeof Inbox;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-border bg-card/60 px-6 py-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
        <Icon className="h-5 w-5" strokeWidth={1.5} />
      </span>
      <p className="mt-1 text-sm font-bold">{title}</p>
      {body ? (
        <p className="max-w-[26ch] text-[11px] leading-relaxed text-muted-foreground">{body}</p>
      ) : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "Gagal memuat data",
  body = "Periksa koneksi internetmu lalu coba lagi.",
  onRetry,
}: {
  title?: string;
  body?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border border-destructive/25 bg-destructive/5 px-6 py-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <TriangleAlert className="h-5 w-5" strokeWidth={1.5} />
      </span>
      <p className="mt-1 text-sm font-bold">{title}</p>
      <p className="max-w-[28ch] text-[11px] leading-relaxed text-muted-foreground">{body}</p>
      {onRetry ? (
        <button
          onClick={onRetry}
          className="mt-3 inline-flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-card"
        >
          <RotateCw className="h-3.5 w-3.5" strokeWidth={2} /> Coba lagi
        </button>
      ) : null}
    </div>
  );
}
