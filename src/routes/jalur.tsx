import { createFileRoute } from "@tanstack/react-router";
import {
  Clock,
  Droplet,
  Ban,
  Flag,
  Mountain,
  Navigation,
  TriangleAlert,
} from "lucide-react";
import { PhoneShell, ScreenHeader, OfflineBadge } from "@/components/PhoneShell";
import trailMap from "@/assets/trail-map.jpg";

export const Route = createFileRoute("/jalur")({
  head: () => ({
    meta: [
      { title: "Info Jalur Pendakian Gunung Muria — Muria Trail" },
      {
        name: "description",
        content:
          "Peta jalur Colo, daftar pos pendakian, estimasi waktu tempuh, titik sumber air, dan larangan di kawasan Gunung Muria.",
      },
      { property: "og:title", content: "Info Jalur Pendakian Gunung Muria" },
      {
        property: "og:description",
        content: "Peta, pos pendakian, estimasi waktu, titik air, dan larangan jalur Muria.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Jalur,
});

const pos = [
  { nama: "Basecamp Colo", jam: "0 menit", ket: "Registrasi & pengecekan barang", air: true },
  { nama: "Pos 1 — Watu Gedhe", jam: "45 menit", ket: "Tanjakan batu, hutan pinus", air: false },
  { nama: "Pos 2 — Sendang Rejeki", jam: "1 jam 20 mnt", ket: "Shelter kecil", air: true },
  { nama: "Pos 3 — Lembah Kabut", jam: "1 jam 40 mnt", ket: "Area camp utama", air: true },
  { nama: "Puncak Songolikur", jam: "1 jam", ket: "1.602 mdpl · sunrise point", air: false },
];

const larangan = [
  "Membuat api unggun di luar area yang ditentukan",
  "Membawa turun tanaman, batu, atau satwa",
  "Menggunakan pengeras suara di area camp",
  "Mendaki tanpa tiket & registrasi resmi",
];

function Jalur() {
  return (
    <PhoneShell nav>
      <ScreenHeader
        title="Info Gunung"
        subtitle="Jalur Colo · 5–6 jam"
        action={<OfflineBadge label="Peta offline" />}
      />
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-6">
        <div className="relative overflow-hidden rounded-3xl shadow-card">
          <img
            src={trailMap}
            alt="Peta topografi jalur pendakian Colo Gunung Muria"
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
          <Stat icon={Mountain} label="Ketinggian" value="1.602 m" />
          <Stat icon={Clock} label="Naik" value="5–6 jam" />
          <Stat icon={Flag} label="Pos" value="4 pos" />
        </div>

        <h2 className="mt-6 text-xs font-bold text-muted-foreground">POS PENDAKIAN</h2>
        <ol className="mt-3 space-y-0">
          {pos.map((p, i) => (
            <li key={p.nama} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    i === pos.length - 1
                      ? "surface-sunrise text-accent-foreground"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {i === pos.length - 1 ? <Flag className="h-3.5 w-3.5" strokeWidth={2} /> : i}
                </span>
                {i < pos.length - 1 ? <span className="my-1 w-px flex-1 bg-border" /> : null}
              </div>
              <div className="min-w-0 pb-4">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                  <p className="truncate text-sm font-bold">{p.nama}</p>
                  <span className="shrink-0 text-[10px] font-semibold text-muted-foreground">
                    {p.jam}
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
            Sinyal hilang antara Pos 2–Pos 3. Unduh peta & e-tiket sebelum berangkat.
          </p>
        </div>

        <h2 className="mt-6 text-xs font-bold text-muted-foreground">LARANGAN</h2>
        <ul className="mt-2.5 space-y-2 rounded-2xl border border-border bg-card p-4 shadow-card">
          {larangan.map((l) => (
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
