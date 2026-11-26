import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  CloudSun,
  Droplets,
  Wind,
  Users,
  ArrowRight,
  MapPin,
  TriangleAlert,
  Mountain,
  Landmark,
  ShieldAlert,
  CheckSquare,
  Navigation,
} from "lucide-react";
import { PhoneShell, OfflineBadge } from "@/components/PhoneShell";
import { EmergencySosModal } from "@/components/EmergencySosModal";
import { PackingChecklistModal } from "@/components/PackingChecklistModal";
import { useAuth, useProfil } from "@/hooks/useAuth";
import hero from "@/assets/hero-muria.jpg";

export const Route = createFileRoute("/_authenticated/beranda")({
  head: () => ({
    meta: [
      { title: "Beranda Pendaki — Muria Trail" },
      {
        name: "description",
        content:
          "Status jalur, cuaca, dan kuota harian pendakian Gunung Muria via Rahtawu dan Tempur, plus akses wisata religi Colo.",
      },
      { property: "og:title", content: "Beranda Pendaki — Muria Trail" },
      {
        property: "og:description",
        content: "Status jalur Rahtawu & Tempur, cuaca, kuota harian, dan wisata religi Colo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Beranda,
});

const jalur = [
  { nama: "Rahtawu — Puncak 29", desa: "Gebog, Kudus", jam: "3–4 jam", level: "Sedang", kuota: 168 },
  {
    nama: "Rahtawu — Natas Angin",
    desa: "Jalur Naga",
    jam: "3–4 jam",
    level: "Sulit",
    kuota: 74,
  },
  {
    nama: "Tempur — kawasan puncak",
    desa: "Keling, Jepara",
    jam: "Belum terverifikasi",
    level: "—",
    kuota: 41,
  },
];

function salam() {
  const jam = new Date().getHours();
  if (jam < 11) return "Selamat pagi,";
  if (jam < 15) return "Selamat siang,";
  if (jam < 18) return "Selamat sore,";
  return "Selamat malam,";
}

function Beranda() {
  const { user } = useAuth();
  const { profil, loading: memuatProfil } = useProfil(user?.id);
  const [sosBuka, setSosBuka] = useState(false);
  const [checklistBuka, setChecklistBuka] = useState(false);

  const nama =
    profil?.nama_lengkap?.trim() ||
    (user?.user_metadata?.nama_lengkap as string | undefined)?.trim() ||
    user?.email?.split("@")[0] ||
    "Pendaki";

  return (
    <PhoneShell nav>
      <div className="no-scrollbar flex-1 overflow-y-auto pb-6">
        <div className="relative overflow-hidden rounded-b-[2rem]">
          <img
            src={hero}
            alt="Gunung Muria di atas lautan awan"
            width={1024}
            height={1280}
            className="h-56 w-full object-cover"
          />
          <div className="absolute inset-0 overlay-fog" />
          <div className="absolute inset-x-0 top-0 flex items-start justify-between px-5 pt-4">
            <div className="min-w-0">
              <p className="text-[11px] text-primary-foreground/70">{salam()}</p>
              {memuatProfil ? (
                <span className="mt-1 block h-4 w-28 animate-pulse rounded bg-primary-foreground/25" />
              ) : (
                <p className="truncate text-base font-bold text-primary-foreground">{nama}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSosBuka(true)}
                className="flex items-center gap-1 rounded-full bg-destructive px-2.5 py-1 text-[11px] font-extrabold text-destructive-foreground shadow-sm animate-pulse active:scale-95 transition-transform"
              >
                <ShieldAlert className="h-3.5 w-3.5" /> SOS
              </button>
              <button
                aria-label="Notifikasi"
                className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15 text-primary-foreground backdrop-blur"
              >
                <Bell className="h-4 w-4" strokeWidth={1.75} />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent" />
              </button>
            </div>
          </div>
          <div className="absolute inset-x-5 bottom-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/90 px-2.5 py-1 text-[10px] font-bold text-accent-foreground">
              <Mountain className="h-3 w-3" strokeWidth={2} /> 1.602 mdpl
            </span>
            <h2 className="mt-2 text-xl font-extrabold leading-tight text-primary-foreground">
              Gunung Muria, Jepara
            </h2>
            <p className="text-[11px] text-primary-foreground/70">
              Kawasan konservasi · Pendakian dibuka 04.00–16.00 WIB
            </p>
          </div>
        </div>

        <div className="space-y-4 px-5 pt-4">
          {/* Fitur Lapangan & Keamanan (SOS, Checklist, Navigasi) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Alat Lapangan & Keamanan
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setSosBuka(true)}
                className="flex flex-col items-start rounded-2xl border border-destructive/30 bg-destructive/8 p-3 text-left transition-all active:scale-[0.98] shadow-sm"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-destructive text-destructive-foreground shadow-sm mb-2">
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <span className="text-xs font-extrabold text-destructive">Tombol Darurat SOS</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  GPS Offline & SMS SAR
                </span>
              </button>

              <button
                onClick={() => setChecklistBuka(true)}
                className="flex flex-col items-start rounded-2xl border border-primary/30 bg-primary/8 p-3 text-left transition-all active:scale-[0.98] shadow-sm"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm mb-2">
                  <CheckSquare className="h-4 w-4" />
                </div>
                <span className="text-xs font-extrabold text-primary">Checklist Barang</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  Cek bawaan mendaki
                </span>
              </button>
            </div>
          </div>

          {/* Cuaca Puncak */}
          <div className="rounded-3xl border border-border bg-card p-4 shadow-card">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-muted-foreground">
                  Cuaca puncak · diperbarui 5 mnt lalu
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight">17°</span>
                  <span className="truncate text-xs font-medium text-muted-foreground">
                    Berkabut ringan
                  </span>
                </div>
              </div>
              <CloudSun className="h-10 w-10 shrink-0 text-accent" strokeWidth={1.25} />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <Metric icon={Droplets} label="Curah" value="30%" />
              <Metric icon={Wind} label="Angin" value="11 km/j" />
              <Metric icon={CloudSun} label="Visibilitas" value="1,4 km" />
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-2xl border border-accent/30 bg-accent/10 p-3">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={1.75} />
            <p className="text-[11px] leading-relaxed text-foreground/80">
              <span className="font-bold">Status jalur: Dibuka · Waspada cuaca.</span> Diperbarui
              admin basecamp Rahtawu 04.50 WIB. Desember–Februari jalur berpotensi ditutup
              sementara.
            </p>
          </div>

          {/* Kuota & Tiket */}
          <div className="surface-summit rounded-3xl p-4 text-primary-foreground shadow-lifted">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold text-primary-foreground/70">
                  <Users className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} /> Kuota pendaki hari ini
                </p>
                <p className="mt-1 text-2xl font-extrabold">283 / 600</p>
              </div>
              <span className="shrink-0 rounded-full bg-primary-foreground/15 px-3 py-1 text-[10px] font-bold">
                Tersedia
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-primary-foreground/20">
              <div className="surface-sunrise h-full w-[47%] rounded-full" />
            </div>
            <Link
              to="/pesan"
              className="surface-sunrise mt-4 flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-accent-foreground shadow-sunrise"
            >
              Pesan Tiket Sekarang <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>

          {/* Jalur Pendakian */}
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Jalur pendakian</h3>
              <Link to="/jalur" className="text-[11px] font-semibold text-primary">
                Lihat semua
              </Link>
            </div>
            <ul className="mt-3 space-y-2.5">
              {jalur.map((j) => (
                <li key={j.nama}>
                  <Link
                    to="/pesan"
                    className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <MapPin className="h-5 w-5" strokeWidth={1.5} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold">{j.nama}</span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {j.desa} · {j.jam} · {j.level}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        j.kuota > 0
                          ? "bg-success/12 text-success"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {j.kuota > 0 ? `${j.kuota} slot` : "Penuh"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigasi Petunjuk Arah ke Basecamp */}
          <div className="rounded-2xl border border-border bg-card p-3.5 shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-accent" />
                <h4 className="text-xs font-bold">Rute Google Maps ke Basecamp</h4>
              </div>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Petunjuk arah langsung ke pos registrasi resmi:
            </p>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=-6.671375,110.887222"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary py-2 text-[11px] font-bold text-foreground active:bg-secondary/80"
              >
                Basecamp Rahtawu
              </a>
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=-6.661139,110.906944"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary py-2 text-[11px] font-bold text-foreground active:bg-secondary/80"
              >
                Basecamp Colo
              </a>
            </div>
          </div>

          {/* Wisata Religi */}
          <div>
            <h3 className="text-sm font-bold">Wisata religi</h3>
            <Link
              to="/pesan"
              className="mt-3 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-earth/25 bg-earth/8 p-3"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-earth/15 text-earth">
                <Landmark className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold">
                  Colo — Ziarah Makam Sunan Muria
                </span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  ±500 mdpl · Dawe, Kudus · buka subuh–malam
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-earth/15 px-2.5 py-1 text-[10px] font-bold text-earth">
                Religi
              </span>
            </Link>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-dashed border-border px-3 py-2.5">
            <OfflineBadge label="Data jalur tersimpan offline" />
            <span className="text-[10px] text-muted-foreground">Sinkron 05.07 WIB</span>
          </div>
        </div>
      </div>

      {/* Modal SOS Darurat */}
      <EmergencySosModal
        isOpen={sosBuka}
        onClose={() => setSosBuka(false)}
        namaPendaki={nama}
      />

      {/* Modal Checklist Perlengkapan */}
      <PackingChecklistModal
        isOpen={checklistBuka}
        onClose={() => setChecklistBuka(false)}
      />
    </PhoneShell>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Droplets;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-secondary px-2.5 py-2">
      <Icon className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
      <p className="mt-1 truncate text-[10px] text-muted-foreground">{label}</p>
      <p className="truncate text-xs font-bold">{value}</p>
    </div>
  );
}
