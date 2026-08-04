import { createFileRoute } from "@tanstack/react-router";
import {
  Clock,
  Droplet,
  Ban,
  Flag,
  Mountain,
  Navigation,
  TriangleAlert,
  Bike,
} from "lucide-react";
import { PhoneShell, ScreenHeader, OfflineBadge } from "@/components/PhoneShell";
import trailMap from "@/assets/trail-map.jpg";
import { POS_RAHTAWU, PUNCAK, LARANGAN } from "@/data/muria";

export const Route = createFileRoute("/jalur")({
  head: () => ({
    meta: [
      { title: "Info Jalur Rahtawu & Puncak Gunung Muria — Muria Trail" },
      {
        name: "description",
        content:
          "Peta jalur Rahtawu, estimasi waktu antar pos, Sendang Bunton sebagai titik air, daftar puncak Muria, serta larangan dan etika kawasan sakral.",
      },
      { property: "og:title", content: "Info Jalur Pendakian Gunung Muria" },
      {
        property: "og:description",
        content: "Estimasi antar pos jalur Rahtawu, titik air Sendang Bunton, dan daftar puncak Muria.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Jalur,
});

function Jalur() {
  return (
    <PhoneShell nav>
      <ScreenHeader
        title="Info Gunung"
        subtitle="Jalur Rahtawu · naik 3–4 jam · turun 2 jam"
        action={<OfflineBadge label="Peta offline" />}
      />
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-6">
        <div className="relative overflow-hidden rounded-3xl shadow-card">
          <img
            src={trailMap}
            alt="Peta topografi jalur pendakian Rahtawu Gunung Muria"
            width={1024}
            height={768}
            loading="lazy"
            className="h-48 w-full object-cover"
          />
          <button className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-card/95 px-3 py-1.5 text-[10px] font-bold shadow-card backdrop-blur">
            <Navigation className="h-3 w-3 text-primary" strokeWidth={2} /> Buka peta penuh
          </button>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <Stat icon={Mountain} label="Puncak 29" value="1.602 m" />
          <Stat icon={Clock} label="Naik" value="3–4 jam" />
          <Stat icon={Flag} label="Pos" value="4 pos" />
        </div>

        <div className="mt-3 flex items-start gap-2.5 rounded-2xl border border-earth/25 bg-earth/8 p-3">
          <Bike className="mt-0.5 h-4 w-4 shrink-0 text-earth" strokeWidth={1.75} />
          <p className="text-[11px] leading-relaxed text-foreground/80">
            Ojek gunung Basecamp–Pos 1 (jalan cor 1 km): Rp 20.000–25.000, ±6 menit. Memotong 30
            menit jalan kaki.
          </p>
        </div>

        <h2 className="mt-6 text-xs font-bold text-muted-foreground">
          ESTIMASI ANTAR POS · JALUR RAHTAWU
        </h2>
        <ol className="mt-3 space-y-0">
          {POS_RAHTAWU.map((p, i) => (
            <li key={p.nama} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    i === POS_RAHTAWU.length - 1
                      ? "surface-sunrise text-accent-foreground"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {i === POS_RAHTAWU.length - 1 ? (
                    <Flag className="h-3.5 w-3.5" strokeWidth={2} />
                  ) : (
                    i
                  )}
                </span>
                {i < POS_RAHTAWU.length - 1 ? (
                  <span className="my-1 w-px flex-1 bg-border" />
                ) : null}
              </div>
              <div className="min-w-0 pb-4">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                  <p className="truncate text-sm font-bold">{p.nama}</p>
                  <span className="shrink-0 text-[10px] font-semibold text-muted-foreground">
                    {p.eta}
                  </span>
                </div>
                <p className="truncate text-[11px] text-muted-foreground">{p.ket}</p>
                {p.air ? (
                  <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-primary/8 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    <Droplet className="h-3 w-3" strokeWidth={1.75} /> Titik air
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ol>

        <div className="flex items-start gap-2.5 rounded-2xl border border-accent/30 bg-accent/10 p-3">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={1.75} />
          <p className="text-[11px] leading-relaxed text-foreground/80">
            Punggungan sempit dengan jurang di kanan-kiri menjelang Natas Angin. Desember–Februari
            cuaca berat, jalur berpotensi ditutup sementara. Unduh peta & e-tiket sebelum berangkat.
          </p>
        </div>

        <h2 className="mt-6 text-xs font-bold text-muted-foreground">PUNCAK-PUNCAK MURIA</h2>
        <ul className="mt-2.5 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          {PUNCAK.map((p) => (
            <li key={p.nama} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 p-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-bold">{p.nama}</p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {p.mdpl} · via {p.via}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[9px] font-semibold text-secondary-foreground">
                {p.level}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
          Catatan: sebagian sumber menyebut puncak tertinggi 1.602 mdpl, sebagian 1.625 mdpl. Data
          perlu verifikasi ulang ke Pokdarwis desa.
        </p>

        <h2 className="mt-6 text-xs font-bold text-muted-foreground">LARANGAN & ETIKA KAWASAN</h2>
        <ul className="mt-2.5 space-y-2 rounded-2xl border border-border bg-card p-4 shadow-card">
          {LARANGAN.map((l) => (
            <li key={l} className="flex gap-2.5 text-[11px] leading-relaxed text-foreground/80">
              <Ban className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" strokeWidth={1.75} />
              {l}
            </li>
          ))}
        </ul>
      </div>
    </PhoneShell>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card px-2.5 py-2.5 shadow-card">
      <Icon className="h-4 w-4 text-primary" strokeWidth={1.5} />
      <p className="mt-1 truncate text-[10px] text-muted-foreground">{label}</p>
      <p className="truncate text-xs font-bold">{value}</p>
    </div>
  );
}
