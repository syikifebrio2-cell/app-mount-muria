import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Award,
  Bell,
  ChevronRight,
  CloudLightning,
  LogOut,
  Mountain,
  Settings,
  ShieldAlert,
  ShieldCheck,
  WifiOff,
} from "lucide-react";
import { PhoneShell, ScreenHeader } from "@/components/PhoneShell";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/profil")({
  head: () => ({
    meta: [
      { title: "Profil Pendaki — Muria Trail" },
      {
        name: "description",
        content:
          "Riwayat pendakian Gunung Muria, sertifikat digital, serta pengaturan notifikasi cuaca dan peringatan darurat.",
      },
      { property: "og:title", content: "Profil Pendaki — Muria Trail" },
      {
        property: "og:description",
        content: "Riwayat pendakian, sertifikat digital, dan notifikasi cuaca/darurat.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Profil,
});

const riwayat = [
  { jalur: "Jalur Rahtawu", tgl: "14 Mar 2026", status: "Selesai" },
  { jalur: "Jalur Colo", tgl: "02 Des 2025", status: "Selesai" },
  { jalur: "Jalur Tempur", tgl: "19 Agu 2025", status: "Batal" },
];

function Profil() {
  const navigate = useNavigate();
  const keluar = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/masuk" });
  };
  return (
    <PhoneShell nav>
      <ScreenHeader
        title="Profil"
        subtitle="Akun pendaki terverifikasi"
        action={
          <button
            aria-label="Pengaturan"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card"
          >
            <Settings className="h-4 w-4" strokeWidth={1.75} />
          </button>
        }
      />
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-6">
        <div className="surface-summit grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3.5 rounded-3xl p-4 text-primary-foreground shadow-lifted">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-foreground/15 text-lg font-extrabold">
            RW
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-extrabold">Raka Wibowo</p>
            <p className="truncate text-[11px] text-primary-foreground/70">
              raka.w@email.com · Gol. darah O
            </p>
            <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground">
              <Mountain className="h-3 w-3" strokeWidth={2} /> Pendaki Perak · 8 summit
            </span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <Stat value="8" label="Pendakian" />
          <Stat value="3" label="Sertifikat" />
          <Stat value="42 km" label="Total jarak" />
        </div>

        <h2 className="mt-6 text-xs font-bold text-muted-foreground">RIWAYAT PENDAKIAN</h2>
        <ul className="mt-2.5 space-y-2">
          {riwayat.map((r) => (
            <li
              key={r.tgl}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-earth/12 text-earth">
                <Mountain className="h-4.5 w-4.5" strokeWidth={1.5} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{r.jalur}</span>
                <span className="block truncate text-[11px] text-muted-foreground">{r.tgl}</span>
              </span>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                  r.status === "Selesai"
                    ? "bg-success/12 text-success"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {r.status}
              </span>
            </li>
          ))}
        </ul>

        <h2 className="mt-6 text-xs font-bold text-muted-foreground">SERTIFIKAT DIGITAL</h2>
        <div className="no-scrollbar mt-2.5 flex gap-2.5 overflow-x-auto pb-1">
          {["Summit Muria 2026", "Zero Waste Hiker", "Summit Muria 2025"].map((s) => (
            <div
              key={s}
              className="w-40 shrink-0 rounded-2xl border border-accent/30 bg-accent/8 p-3"
            >
              <Award className="h-5 w-5 text-accent" strokeWidth={1.5} />
              <p className="mt-2 text-xs font-bold leading-snug">{s}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">Unduh PDF</p>
            </div>
          ))}
        </div>

        <h2 className="mt-6 text-xs font-bold text-muted-foreground">NOTIFIKASI & MODE HEMAT</h2>
        <div className="mt-2.5 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <Toggle icon={CloudLightning} label="Peringatan cuaca ekstrem" on />
          <Toggle icon={ShieldAlert} label="Notifikasi darurat & evakuasi" on />
          <Toggle icon={WifiOff} label="Mode offline e-tiket" on />
          <Toggle icon={Bell} label="Promo & info kuota" />
        </div>

        <Link
          to="/admin"
          className="mt-4 flex w-full items-center justify-between rounded-2xl border border-border bg-card px-4 py-3.5 text-sm font-semibold shadow-card"
        >
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" strokeWidth={1.75} /> Dashboard basecamp (admin)
          </span>
          <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
        </Link>

        <button
          onClick={keluar}
          className="mt-4 flex w-full items-center justify-between rounded-2xl border border-border bg-card px-4 py-3.5 text-sm font-semibold text-destructive shadow-card"
        >
          <span className="flex items-center gap-2">
            <LogOut className="h-4 w-4" strokeWidth={1.75} /> Keluar akun
          </span>
          <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>
    </PhoneShell>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-2.5 py-3 text-center shadow-card">
      <p className="text-base font-extrabold">{value}</p>
      <p className="truncate text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

function Toggle({ icon: Icon, label, on }: { icon: typeof Bell; label: string; on?: boolean }) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
      <Icon className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
      <span className="min-w-0 truncate text-xs font-semibold">{label}</span>
      <span
        className={`flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 ${
          on ? "bg-primary" : "bg-border"
        }`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-card transition-transform ${on ? "translate-x-4" : ""}`}
        />
      </span>
    </div>
  );
}
