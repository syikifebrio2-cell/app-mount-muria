import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
import { EmptyState } from "@/components/States";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useProfil, useIsAdmin } from "@/hooks/useAuth";
import { rupiah } from "@/data/muria";

export const Route = createFileRoute("/_authenticated/profil")({
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

type RiwayatRow = {
  id: string;
  jalur_nama: string;
  tanggal_naik: string;
  status_pendakian: string;
  total_biaya: number;
};

const TGL = new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" });

function Profil() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profil } = useProfil(user?.id);
  const { isAdmin } = useIsAdmin(user?.id);
  const [riwayat, setRiwayat] = useState<RiwayatRow[]>([]);

  useEffect(() => {
    let aktif = true;
    if (!user?.id) return;
    supabase
      .from("bookings")
      .select("id,jalur_nama,tanggal_naik,status_pendakian,total_biaya")
      .eq("user_id", user.id)
      .order("tanggal_naik", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (aktif) setRiwayat((data as RiwayatRow[]) ?? []);
      });
    return () => {
      aktif = false;
    };
  }, [user?.id]);

  const nama = profil?.nama_lengkap?.trim() || user?.email?.split("@")[0] || "Pendaki";
  const inisial = nama
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  const selesai = riwayat.filter((r) => r.status_pendakian === "selesai").length;
  const totalBiaya = riwayat.reduce((a, r) => a + (r.total_biaya ?? 0), 0);

  const keluar = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/masuk", replace: true });
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
            {inisial || "MT"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-extrabold">{nama}</p>
            <p className="truncate text-[11px] text-primary-foreground/70">
              {user?.email ?? profil?.no_hp ?? "-"}
              {profil?.golongan_darah ? ` · Gol. darah ${profil.golongan_darah}` : ""}
            </p>
            <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground">
              <Mountain className="h-3 w-3" strokeWidth={2} /> {isAdmin ? "Admin basecamp" : "Pendaki terdaftar"} ·{" "}
              {selesai} summit
            </span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <Stat value={String(riwayat.length)} label="Pemesanan" />
          <Stat value={String(selesai)} label="Selesai" />
          <Stat value={rupiah(totalBiaya)} label="Total biaya" />
        </div>


        <h2 className="mt-6 text-xs font-bold text-muted-foreground">RIWAYAT PENDAKIAN</h2>
        <ul className="mt-2.5 space-y-2">
          {riwayat.length === 0 && (
            <li>
              <EmptyState
                icon={Mountain}
                title="Belum ada riwayat"
                body="Pendakian yang sudah kamu pesan akan tampil di sini."
              />
            </li>
          )}
          {riwayat.map((r) => (
            <li
              key={r.id}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-earth/12 text-earth">
                <Mountain className="h-4.5 w-4.5" strokeWidth={1.5} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{r.jalur_nama}</span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {TGL.format(new Date(r.tanggal_naik))}
                </span>
              </span>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${
                  r.status_pendakian === "selesai"
                    ? "bg-success/12 text-success"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {r.status_pendakian}
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

        {isAdmin && (
          <Link
            to="/admin"
            className="mt-4 flex w-full items-center justify-between rounded-2xl border border-border bg-card px-4 py-3.5 text-sm font-semibold shadow-card"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" strokeWidth={1.75} /> Dashboard basecamp (admin)
            </span>
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
          </Link>
        )}


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
