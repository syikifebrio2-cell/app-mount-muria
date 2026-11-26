import { useState } from "react";
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
  ChevronRight,
  Info,
} from "lucide-react";
import { PhoneShell, ScreenHeader, OfflineBadge } from "@/components/PhoneShell";
import { PosDetailDrawer, type PosDetail } from "@/components/PosDetailDrawer";
import { FullScreenMapModal } from "@/components/FullScreenMapModal";
import trailMap from "@/assets/trail-map.jpg";
import { PUNCAK, LARANGAN } from "@/data/muria";

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

const DATA_POS_LENGKAP: PosDetail[] = [
  {
    nama: "Basecamp Rahtawu",
    mdpl: "650 mdpl",
    eta: "Titik Awal",
    air: true,
    airDetail: "Toilet, kran air bersih, warung logistik, dan gubuk istirahat tersedia di basecamp.",
    sinyal: "4G Telkomsel",
    kamping: true,
    medan: "Jalan aspal desa wisata, area parkir resmi Pokdarwis Rahtawu.",
  },
  {
    nama: "Pos 1",
    mdpl: "820 mdpl",
    eta: "30 menit (jalan) / 6 mnt (ojek)",
    air: false,
    airDetail: "Tidak ada sumber air alami. Disarankan mengisi perbekalan air dari basecamp.",
    sinyal: "4G Telkomsel",
    kamping: false,
    medan: "Jalan cor semen menanjak sejauh 1 km. Tersedia ojek gunung lokal.",
  },
  {
    nama: "Pos 2",
    mdpl: "980 mdpl",
    eta: "10 menit dari Pos 1",
    air: false,
    airDetail: "Tidak tersedia sumber air.",
    sinyal: "Edge/Lemah",
    kamping: true,
    medan: "Mulai memasuki vegetasi hutan tropis Gunung Muria, tanah padat berakar.",
  },
  {
    nama: "Pos 3",
    mdpl: "1.210 mdpl",
    eta: "30 menit dari Pos 2",
    air: false,
    airDetail: "Kering. Sumber air berikutnya ada di Pos 4 (Sendang Bunton).",
    sinyal: "Edge/Lemah",
    kamping: true,
    medan: "Tanjakan hutan mulai terjal berbatu. Punggungan bukit mulai menyempit.",
    peringatan: "Waspada hembusan angin dingin saat kabut mulai turun di sore hari.",
  },
  {
    nama: "Pos 4 — Sendang Bunton",
    mdpl: "1.420 mdpl",
    eta: "20 menit dari Pos 3",
    air: true,
    airDetail:
      "Mata air alami Sendang Bunton mengalir jernih sepanjang tahun. Titik air paling vital di Gunung Muria, aman diminum langsung atau dimasak.",
    sinyal: "Edge/Lemah",
    kamping: true,
    medan: "Lahan datar teduh di bawah kanopi pohon besar, shelter dan petilasan spiritual.",
    peringatan: "Area sakral & sumber air minum. Dilarang mencuci peralatan kotor langsung di dalam sendang.",
  },
  {
    nama: "Puncak Bayangan → Natas Angin",
    mdpl: "1.515 mdpl",
    eta: "20 menit dari Pos 4",
    air: false,
    airDetail: "Tidak ada sumber air. Bawa bekal air cukup dari Pos 4 Sendang Bunton.",
    sinyal: "Tidak Ada Sinyal",
    kamping: false,
    medan: "Punggungan sempit 'Jalur Naga' selebar 1 meter dengan jurang curam di kanan dan kiri.",
    peringatan:
      "SANGAT BERBAHAYA saat badai atau angin kencang. Hindari melintas di malam hari tanpa headlamp terang.",
  },
  {
    nama: "Puncak 29 (Songolikur / Saptorenggo)",
    mdpl: "1.602 mdpl",
    eta: "30 menit dari Pos 4",
    air: false,
    airDetail: "Tidak ada air. Nikmati pemandangan laut Jawa dan Jepara dari puncak tertinggi Muria.",
    sinyal: "Edge/Lemah",
    kamping: true,
    medan: "Puncak tertinggi Gunung Muria, terdapat tugu triangulasi dan petilasan.",
    peringatan: "Suhu malam hari dapat mencapai 12°C. Pastikan mengenakan jaket windproof tebal.",
  },
];

function Jalur() {
  const [selectedPos, setSelectedPos] = useState<PosDetail | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [petaPenuhOpen, setPetaPenuhOpen] = useState(false);

  function bukaPos(pos: PosDetail) {
    setSelectedPos(pos);
    setDrawerOpen(true);
  }

  return (
    <PhoneShell nav>
      <ScreenHeader
        title="Info Gunung"
        subtitle="Jalur Rahtawu · naik 3–4 jam · turun 2 jam"
        action={<OfflineBadge label="Peta offline" />}
      />
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-6">
        {/* Banner Peta Topografi */}
        <div className="relative overflow-hidden rounded-3xl shadow-card border border-border">
          <img
            src={trailMap}
            alt="Peta topografi jalur pendakian Rahtawu Gunung Muria"
            width={1024}
            height={768}
            loading="lazy"
            className="h-48 w-full object-cover"
          />
          <button
            onClick={() => setPetaPenuhOpen(true)}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-card/95 px-3 py-1.5 text-[10px] font-bold shadow-card backdrop-blur active:scale-95 transition-transform"
          >
            <Navigation className="h-3 w-3 text-primary" strokeWidth={2} /> Buka peta penuh
          </button>
        </div>

        {/* Ringkasan Statistik Jalur */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Stat icon={Mountain} label="Puncak 29" value="1.602 m" />
          <Stat icon={Clock} label="Naik" value="3–4 jam" />
          <Stat icon={Flag} label="Pos Jalur" value="6 titik" />
        </div>

        {/* Info Ojek Gunung */}
        <div className="mt-3 flex items-start gap-2.5 rounded-2xl border border-earth/25 bg-earth/8 p-3">
          <Bike className="mt-0.5 h-4 w-4 shrink-0 text-earth" strokeWidth={1.75} />
          <p className="text-[11px] leading-relaxed text-foreground/80">
            Ojek gunung Basecamp–Pos 1 (jalan cor 1 km): Rp 20.000–25.000, ±6 menit. Memotong 30
            menit jalan kaki.
          </p>
        </div>

        {/* Daftar Pos Interaktif */}
        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Pos Pendakian Rahtawu
          </h2>
          <span className="text-[10px] font-medium text-primary flex items-center gap-1">
            <Info className="h-3 w-3" /> Ketuk untuk detail
          </span>
        </div>

        <ol className="mt-3 space-y-0">
          {DATA_POS_LENGKAP.map((p, i) => (
            <li
              key={p.nama}
              onClick={() => bukaPos(p)}
              className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 cursor-pointer group active:bg-secondary/40 rounded-2xl p-1.5 transition-colors"
            >
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-transform group-hover:scale-105 ${
                    i === DATA_POS_LENGKAP.length - 1
                      ? "surface-sunrise text-accent-foreground"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {i === DATA_POS_LENGKAP.length - 1 ? (
                    <Flag className="h-3.5 w-3.5" strokeWidth={2} />
                  ) : (
                    i
                  )}
                </span>
                {i < DATA_POS_LENGKAP.length - 1 ? (
                  <span className="my-1 w-px flex-1 bg-border" />
                ) : null}
              </div>
              <div className="min-w-0 pb-3.5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                  <p className="truncate text-sm font-bold group-hover:text-primary transition-colors">
                    {p.nama}
                  </p>
                  <span className="shrink-0 text-[10px] font-semibold text-muted-foreground">
                    {p.eta}
                  </span>
                </div>
                <p className="truncate text-[11px] text-muted-foreground mt-0.5">
                  {p.mdpl} · {p.medan}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {p.air && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 text-[10px] font-semibold text-sky-700 dark:text-sky-300">
                      <Droplet className="h-3 w-3" strokeWidth={1.75} /> Titik air
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {p.sinyal}
                  </span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground ml-auto opacity-60 group-hover:opacity-100" />
                </div>
              </div>
            </li>
          ))}
        </ol>

        {/* Peringatan Jalur Naga */}
        <div className="flex items-start gap-2.5 rounded-2xl border border-accent/30 bg-accent/10 p-3 mt-2">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={1.75} />
          <p className="text-[11px] leading-relaxed text-foreground/80">
            Punggungan sempit dengan jurang di kanan-kiri menjelang Natas Angin. Desember–Februari
            cuaca berat, jalur berpotensi ditutup sementara. Unduh peta & e-tiket sebelum berangkat.
          </p>
        </div>

        {/* Daftar Puncak Muria */}
        <h2 className="mt-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Puncak-Puncak Muria
        </h2>
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

        {/* Larangan & Etika Kawasan */}
        <h2 className="mt-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Larangan & Etika Kawasan
        </h2>
        <ul className="mt-2.5 space-y-2 rounded-2xl border border-border bg-card p-4 shadow-card">
          {LARANGAN.map((l) => (
            <li key={l} className="flex gap-2.5 text-[11px] leading-relaxed text-foreground/80">
              <Ban className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" strokeWidth={1.75} />
              {l}
            </li>
          ))}
        </ul>
      </div>

      {/* Drawer Detail Pos dari v0 */}
      <PosDetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        pos={selectedPos}
      />

      {/* Modal Zoom Peta Layar Penuh */}
      <FullScreenMapModal
        isOpen={petaPenuhOpen}
        onClose={() => setPetaPenuhOpen(false)}
        imageSrc={trailMap}
      />
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
