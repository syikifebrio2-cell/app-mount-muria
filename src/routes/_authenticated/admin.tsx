import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ShieldCheck, QrCode, CalendarDays, Users, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { PhoneShell, ScreenHeader, LoadingBar } from "@/components/PhoneShell";
import { JALUR, rupiah } from "@/data/muria";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useIsAdmin } from "@/hooks/useAuth";
import { validasiTiket as validasiTiketFn } from "@/lib/booking.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Dashboard Basecamp — Muria Trail" },
      {
        name: "description",
        content:
          "Panel pengelola basecamp Muria Trail: pantau pemesanan harian, atur kuota jalur, ubah status jalur, dan validasi e-tiket pendaki.",
      },
      { property: "og:title", content: "Dashboard Basecamp — Muria Trail" },
      {
        property: "og:description",
        content: "Kelola kuota, status jalur, dan validasi e-tiket pendakian Gunung Muria.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Admin,
});

type BookingRow = {
  id: string;
  kode_booking: string;
  jalur_nama: string;
  jalur_id: string;
  tanggal_naik: string;
  jumlah_pendaki: number;
  total_biaya: number;
  status_pembayaran: string;
  status_pendakian: string;
  checkin_at: string | null;
};

const STATUS_JALUR = ["buka", "waspada", "tutup_sementara"] as const;

function hariIniIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function Admin() {
  const { user, loading: loadingAuth } = useAuth();
  const { isAdmin, loading: loadingRole, setIsAdmin } = useIsAdmin(user?.id);
  const validasiFn = useServerFn(validasiTiketFn);


  const [tanggal, setTanggal] = useState(hariIniIso());
  const [jalurId, setJalurId] = useState(JALUR[0].id);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [kuota, setKuota] = useState<{ kuota: number; terpakai: number } | null>(null);
  const [inputKuota, setInputKuota] = useState("150");
  const [statusJalur, setStatusJalur] = useState<string>("buka");
  const [kode, setKode] = useState("");
  const [memuat, setMemuat] = useState(true);

  const muat = useCallback(async () => {
    setMemuat(true);
    const [b, q, s] = await Promise.all([
      supabase
        .from("bookings")
        .select(
          "id,kode_booking,jalur_nama,jalur_id,tanggal_naik,jumlah_pendaki,total_biaya,status_pembayaran,status_pendakian,checkin_at",
        )
        .eq("tanggal_naik", tanggal)
        .order("created_at", { ascending: false }),
      supabase
        .from("daily_quotas")
        .select("kuota,terpakai")
        .eq("jalur_id", jalurId)
        .eq("tanggal", tanggal)
        .maybeSingle(),
      supabase.from("trail_status").select("status").eq("jalur_id", jalurId).maybeSingle(),
    ]);
    setBookings((b.data as BookingRow[]) ?? []);
    setKuota(q.data ?? null);
    setInputKuota(String(q.data?.kuota ?? 150));
    setStatusJalur((s.data?.status as string) ?? "buka");
    setMemuat(false);
  }, [tanggal, jalurId]);

  useEffect(() => {
    if (isAdmin) void muat();
  }, [isAdmin, muat]);

  const simpanKuota = async () => {
    const nilai = Number(inputKuota);
    if (!Number.isFinite(nilai) || nilai < 0) return toast.error("Kuota tidak valid");
    const { error } = await supabase
      .from("daily_quotas")
      .upsert(
        { jalur_id: jalurId, tanggal, kuota: nilai, terpakai: kuota?.terpakai ?? 0 },
        { onConflict: "jalur_id,tanggal" },
      );
    if (error) return toast.error(error.message);
    toast.success("Kuota harian diperbarui");
    void muat();
  };

  const simpanStatus = async (nilai: string) => {
    setStatusJalur(nilai);
    const { error } = await supabase
      .from("trail_status")
      .upsert({ jalur_id: jalurId, status: nilai }, { onConflict: "jalur_id" });
    if (error) return toast.error(error.message);
    toast.success("Status jalur diperbarui");
  };

  const validasiTiket = async () => {
    const cari = kode.trim().toUpperCase();
    if (!cari) return;
    const { data, error } = await supabase
      .from("bookings")
      .select("id,kode_booking,jalur_nama,jumlah_pendaki,status_pembayaran,checkin_at")
      .eq("kode_booking", cari)
      .maybeSingle();
    if (error) return toast.error(error.message);
    if (!data) return toast.error("Kode booking tidak ditemukan");
    if (data.status_pembayaran !== "lunas") return toast.error("Tiket belum lunas");
    if (data.checkin_at) return toast.info("Tiket ini sudah check-in sebelumnya");
    const { error: errUp } = await supabase
      .from("bookings")
      .update({ checkin_at: new Date().toISOString(), status_pendakian: "berlangsung" })
      .eq("id", data.id);
    if (errUp) return toast.error(errUp.message);
    toast.success(`Check-in berhasil — ${data.jalur_nama} (${data.jumlah_pendaki} orang)`);
    setKode("");
    void muat();
  };

  const klaimAdmin = async () => {
    const { data, error } = await supabase.rpc("jadikan_admin_pertama");
    if (error) return toast.error(error.message);
    if (!data) return toast.error("Admin sudah ada. Minta akses ke admin yang aktif.");
    setIsAdmin(true);
    toast.success("Kamu sekarang admin basecamp");
  };

  if (loadingAuth || loadingRole) {
    return (
      <PhoneShell nav>
        <ScreenHeader title="Dashboard Basecamp" back="/profil" />
        <div className="px-5">
          <LoadingBar label="Memeriksa akses admin…" />
        </div>
      </PhoneShell>
    );
  }

  if (!user) {
    return (
      <PhoneShell nav>
        <ScreenHeader title="Dashboard Basecamp" back="/profil" />
        <div className="space-y-3 px-5 py-6 text-sm">
          <p className="text-muted-foreground">Masuk dulu untuk membuka panel pengelola.</p>
          <Link
            to="/masuk"
            className="inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Masuk akun
          </Link>
        </div>
      </PhoneShell>
    );
  }

  if (!isAdmin) {
    return (
      <PhoneShell nav>
        <ScreenHeader title="Dashboard Basecamp" back="/profil" />
        <div className="space-y-3 px-5 py-6 text-sm">
          <p className="text-muted-foreground">
            Akun ini belum punya peran admin. Jika kamu pengelola basecamp dan belum ada admin
            terdaftar, klaim akses sekarang.
          </p>
          <button
            onClick={klaimAdmin}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <ShieldCheck className="h-4 w-4" strokeWidth={1.75} /> Klaim akses admin
          </button>
        </div>
      </PhoneShell>
    );
  }

  const totalPendaki = bookings
    .filter((b) => b.status_pembayaran === "lunas")
    .reduce((s, b) => s + b.jumlah_pendaki, 0);

  return (
    <PhoneShell nav>
      <ScreenHeader
        title="Dashboard Basecamp"
        subtitle="Kuota, status jalur & validasi tiket"
        back="/profil"
        action={
          <button
            onClick={() => void muat()}
            aria-label="Muat ulang"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card"
          >
            <RefreshCw className="h-4 w-4" strokeWidth={1.75} />
          </button>
        }
      />

      <div className="flex-1 space-y-4 overflow-y-auto px-5 pb-6">
        <div className="grid grid-cols-2 gap-2">
          <label className="rounded-2xl border border-border bg-card p-3">
            <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.75} /> Tanggal
            </span>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="mt-1 w-full bg-transparent text-sm font-semibold outline-none"
            />
          </label>
          <label className="rounded-2xl border border-border bg-card p-3">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Jalur
            </span>
            <select
              value={jalurId}
              onChange={(e) => setJalurId(e.target.value)}
              className="mt-1 w-full bg-transparent text-sm font-semibold outline-none"
            >
              {JALUR.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.nama}
                </option>
              ))}
            </select>
          </label>
        </div>

        {memuat ? <LoadingBar label="Memuat data basecamp…" /> : null}

        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-sm font-bold">Kuota harian</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Terpakai {kuota?.terpakai ?? 0} dari {kuota?.kuota ?? 150} slot
          </p>
          <div className="mt-3 flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={inputKuota}
              onChange={(e) => setInputKuota(e.target.value)}
              className="w-24 rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
            <button
              onClick={simpanKuota}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Simpan kuota
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-sm font-bold">Status jalur</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {STATUS_JALUR.map((s) => (
              <button
                key={s}
                onClick={() => void simpanStatus(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  statusJalur === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {s === "tutup_sementara" ? "Tutup sementara" : s === "waspada" ? "Waspada" : "Buka"}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-bold">
            <QrCode className="h-4 w-4" strokeWidth={1.75} /> Validasi e-tiket
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Masukkan kode booking dari QR pendaki, contoh MTR-AB12C.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <input
              value={kode}
              onChange={(e) => setKode(e.target.value)}
              placeholder="MTR-XXXXX"
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm uppercase"
            />
            <button
              onClick={() => void validasiTiket()}
              className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
            >
              Check-in
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold">Pemesanan {tanggal}</h2>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" strokeWidth={1.75} /> {totalPendaki} pendaki lunas
            </span>
          </div>
          <ul className="mt-3 space-y-2">
            {bookings.length === 0 ? (
              <li className="rounded-xl bg-secondary px-3 py-4 text-center text-xs text-muted-foreground">
                Belum ada pemesanan pada tanggal ini.
              </li>
            ) : (
              bookings.map((b) => (
                <li key={b.id} className="rounded-xl bg-secondary px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">{b.kode_booking}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        b.status_pembayaran === "lunas"
                          ? "bg-success/12 text-success"
                          : "bg-accent/15 text-accent"
                      }`}
                    >
                      {b.status_pembayaran}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{b.jalur_nama}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {b.jumlah_pendaki} orang · {rupiah(b.total_biaya)} ·{" "}
                    {b.checkin_at ? "sudah check-in" : "belum check-in"}
                  </p>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </PhoneShell>
  );
}
