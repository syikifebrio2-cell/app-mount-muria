import { useEffect, useId, useState } from "react";
import {
  Check,
  ChevronDown,
  Compass,
  Droplets,
  Mountain,
  Signal,
  Tent,
  TriangleAlert,
  X,
} from "lucide-react";

export type PosDetail = {
  nama: string;
  mdpl: string;
  eta: string;
  air: boolean;
  airDetail: string;
  sinyal: "4G Telkomsel" | "Edge/Lemah" | "Tidak Ada Sinyal";
  kamping: boolean;
  medan: string;
  peringatan?: string;
};

type PosDetailDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  pos: PosDetail | null;
};

const signalTone: Record<PosDetail["sinyal"], string> = {
  "4G Telkomsel": "border-emerald-200 bg-emerald-50 text-emerald-800",
  "Edge/Lemah": "border-amber-200 bg-amber-50 text-amber-800",
  "Tidak Ada Sinyal": "border-stone-200 bg-stone-100 text-stone-700",
};

export function PosDetailDrawer({
  isOpen,
  onClose,
  pos,
}: PosDetailDrawerProps) {
  const titleId = useId();
  const [isMarked, setIsMarked] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) setIsMarked(false);
  }, [isOpen, pos]);

  if (!isOpen || !pos) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6 animate-in fade-in duration-200">
      <button
        type="button"
        aria-label="Tutup detail pos"
        onClick={onClose}
        className="absolute inset-0 bg-stone-950/60 backdrop-blur-[2px]"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-[28px] bg-card px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 text-foreground shadow-2xl animate-in slide-in-from-bottom duration-300 sm:max-w-lg sm:rounded-[28px] border border-border"
      >
        <div className="mx-auto mb-3 flex h-6 w-full items-center justify-center sm:hidden">
          <span className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold tracking-wide text-primary">
              <Mountain className="h-3.5 w-3.5" aria-hidden="true" />
              GUNUNG MURIA <span className="opacity-50">/</span> JALUR RAHTAWU
            </p>
            <h2 id={titleId} className="text-xl font-bold leading-tight tracking-tight text-foreground">
              {pos.nama}
            </h2>
            <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 font-bold text-accent">
                <Mountain className="h-3.5 w-3.5" aria-hidden="true" /> {pos.mdpl}
              </span>
              <span aria-hidden="true">·</span>
              <span>{pos.eta}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground transition hover:bg-secondary/80 focus-visible:outline-none"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* 3 Indikator Utama */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-border bg-secondary/40 p-3 text-center">
            <Droplets className={`mx-auto mb-1.5 h-5 w-5 ${pos.air ? "text-sky-600" : "text-muted-foreground/50"}`} aria-hidden="true" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Mata Air</p>
            <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${pos.air ? "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300" : "bg-muted text-muted-foreground"}`}>
              {pos.air ? "Tersedia" : "Tidak Ada"}
            </span>
          </div>
          <div className="rounded-2xl border border-border bg-secondary/40 p-3 text-center">
            <Signal className="mx-auto mb-1.5 h-5 w-5 text-primary" aria-hidden="true" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Sinyal HP</p>
            <span className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${signalTone[pos.sinyal]}`}>
              {pos.sinyal}
            </span>
          </div>
          <div className="rounded-2xl border border-border bg-secondary/40 p-3 text-center">
            <Tent className={`mx-auto mb-1.5 h-5 w-5 ${pos.kamping ? "text-accent" : "text-muted-foreground/50"}`} aria-hidden="true" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Kamping</p>
            <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${pos.kamping ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"}`}>
              {pos.kamping ? "Bisa" : "Tidak Bisa"}
            </span>
          </div>
        </div>

        {/* Rincian Medan & Air */}
        <div className="mt-4 space-y-2.5 text-xs">
          <div className="rounded-2xl bg-primary/8 p-3.5 border border-primary/15">
            <h3 className="flex items-center gap-1.5 font-bold text-primary">
              <Droplets className="h-4 w-4" aria-hidden="true" /> Informasi Mata Air
            </h3>
            <p className="mt-1 leading-relaxed text-foreground/80">{pos.airDetail}</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-3.5 shadow-sm">
            <h3 className="flex items-center gap-1.5 font-bold text-foreground">
              <Compass className="h-4 w-4 text-accent" aria-hidden="true" /> Karakter Medan & Jalur
            </h3>
            <p className="mt-1 leading-relaxed text-muted-foreground">{pos.medan}</p>
          </div>

          {pos.peringatan && (
            <div role="note" className="flex gap-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-amber-900 dark:text-amber-200">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              <div>
                <h3 className="font-bold">Peringatan Keselamatan</h3>
                <p className="mt-0.5 leading-relaxed text-[11px] opacity-90">{pos.peringatan}</p>
              </div>
            </div>
          )}
        </div>

        {/* Tombol Check-in Tandai Pos */}
        <button
          type="button"
          onClick={() => setIsMarked(true)}
          disabled={isMarked}
          className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-xs font-bold text-primary-foreground shadow-card transition active:scale-95 disabled:bg-primary/50"
        >
          {isMarked ? <Check className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
          {isMarked ? "Pos Ini Sudah Ditandai" : "Tandai Sudah Sampai di Pos Ini"}
        </button>
        <p className="mt-2.5 text-center text-[10px] text-muted-foreground">
          Tetap berada di jalur resmi dan bawa kembali sampahmu turun ke basecamp.
        </p>
      </section>
    </div>
  );
}
