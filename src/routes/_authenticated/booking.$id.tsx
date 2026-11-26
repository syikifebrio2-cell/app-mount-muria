import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Award,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { PhoneShell, ScreenHeader } from "@/components/PhoneShell";
import { LoadingState, ErrorState } from "@/components/States";
import { SummitCertificateModal } from "@/components/SummitCertificateModal";
import { supabase } from "@/integrations/supabase/client";
import { batalBooking } from "@/lib/booking.functions";
import { rupiah } from "@/data/muria";

export const Route = createFileRoute("/_authenticated/booking/$id")({
  head: () => ({
    meta: [
      { title: "Detail Booking — Muria Trail" },
      { name: "description", content: "Rincian booking pendakian Gunung Muria, sertifikat, dan laporan kepulangan." },
      { property: "og:title", content: "Detail Booking — Muria Trail" },
      { property: "og:description", content: "Rincian booking dan pembatalan tiket pendakian." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DetailBooking,
});

type Row = {
  id: string;
  kode_booking: string;
  jalur_nama: string;
  tanggal_naik: string;
  jam_mulai: string | null;
  tipe: string;
  jumlah_pendaki: number;
  total_biaya: number;
  metode_pembayaran: string | null;
  status_pembayaran: string;
  status_pendakian: string;
  checkin_at: string | null;
  rincian_biaya: { label: string; nominal: number }[];
};
type Member = { nama: string; is_ketua: boolean; golongan_darah: string | null };

function DetailBooking() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const batal = useServerFn(batalBooking);
  const [b, setB] = useState<Row | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [status, setStatus] = useState<"load" | "ok" | "err">("load");
  const [konfirmasi, setKonfirmasi] = useState(false);
  const [proses, setProses] = useState(false);

  // Fitur Baru: Sertifikat & Lapor Turun
  const [sertifikatBuka, setSertifikatBuka] = useState(false);
  const [modalCheckoutBuka, setModalCheckoutBuka] = useState(false);
  const [kantongSampah, setKantongSampah] = useState(1);
  const [prosesCheckout, setProsesCheckout] = useState(false);

  async function muat() {
    setStatus("load");
    const [{ data, error }, { data: m }] = await Promise.all([
      supabase.from("bookings").select("*").eq("id", id).maybeSingle(),
      supabase.from("booking_members").select("nama,is_ketua,golongan_darah").eq("booking_id", id),
    ]);
    if (error || !data) return setStatus("err");
    setB(data as unknown as Row);
    setMembers((m as Member[]) ?? []);
    setStatus("ok");
  }

  useEffect(() => {
    muat();
  }, [id]);

  async function onBatal() {
    setProses(true);
    try {
      const r = await batal({ data: { id } });
      if (r && "ok" in r && r.ok) {
        toast.success("Booking dibatalkan. Kuota dikembalikan.");
        muat();
      } else {
        toast.error("Gagal membatalkan");
      }
    } catch {
      toast.error("Gagal membatalkan");
    } finally {
      setProses(false);
      setKonfirmasi(false);
    }
  }

  async function selesaikanPendakian() {
    setProsesCheckout(true);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status_pendakian: "selesai" })
        .eq("id", id);

      if (error) throw error;

      toast.success("Selamat! Anda telah lapor turun dengan selamat & bebas sampah.");
      setModalCheckoutBuka(false);
      muat();
      setTimeout(() => setSertifikatBuka(true), 500);
    } catch {
      toast.error("Gagal memperbarui status pendakian.");
    } finally {
      setProsesCheckout(false);
    }
  }

  const bisaBatal =
    b && b.status_pembayaran !== "batal" && b.status_pendakian !== "selesai" && !b.checkin_at &&
    b.tanggal_naik >= new Date().toISOString().slice(0, 10);

  const ketua = members.find((m) => m.is_ketua)?.nama || "Pendaki Muria";
  const sudahSelesai = b?.status_pendakian === "selesai";

  return (
    <PhoneShell>
      <ScreenHeader title="Detail Booking" subtitle={b?.kode_booking} back="/tiket" />
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-6">
        {status === "load" ? <LoadingState label="Memuat booking…" /> : null}
        {status === "err" ? (
          <ErrorState title="Booking tidak ditemukan" body="Booking ini tidak ada atau bukan milikmu." onRetry={muat} />
        ) : null}
        {status === "ok" && b ? (
          <>
            {/* Banner Status */}
            <div className="rounded-3xl bg-card p-4 shadow-card border border-border">
              <div className="flex items-center justify-between gap-2">
                <p className="min-w-0 truncate text-sm font-extrabold">{b.jalur_nama}</p>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                    b.status_pembayaran === "batal"
                      ? "bg-destructive/10 text-destructive"
                      : sudahSelesai
                        ? "bg-emerald-500/15 text-emerald-600 font-extrabold"
                        : b.checkin_at
                          ? "bg-primary/10 text-primary"
                          : "bg-success/10 text-success"
                  }`}
                >
                  {b.status_pembayaran === "batal"
                    ? "Dibatalkan"
                    : sudahSelesai
                      ? "Ekspedisi Selesai"
                      : b.checkin_at
                        ? "Check-in"
                        : "Aktif"}
                </span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                <Info k="Tanggal" v={b.tanggal_naik} />
                <Info k="Jam mulai" v={b.jam_mulai ?? "-"} />
                <Info k="Tipe" v={b.tipe} />
                <Info k="Pendaki" v={`${b.jumlah_pendaki} orang`} />
                <Info k="Metode" v={b.metode_pembayaran ?? "-"} />
                <Info k="Status Jalur" v={sudahSelesai ? "Tuntas (Kembali)" : b.status_pendakian} />
              </dl>
            </div>

            {/* Tombol E-Sertifikat jika sudah selesai */}
            {sudahSelesai && (
              <div className="mt-4 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-emerald-500/10 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md">
                    <Award className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" /> E-Sertifikat Terbuka!
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Bukti penaklukan puncak Gunung Muria resmi.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSertifikatBuka(true)}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 py-3 text-xs font-bold text-white shadow-md active:scale-[0.98] transition-transform"
                >
                  <Award className="h-4 w-4" /> Buka E-Sertifikat Puncak
                </button>
              </div>
            )}

            {/* Tombol Lapor Turun & Selesai jika belum checkout */}
            {!sudahSelesai && b.status_pembayaran === "lunas" && (
              <div className="mt-4 rounded-2xl border border-emerald-600/30 bg-emerald-600/8 p-3.5">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-xs font-bold">Sudah kembali ke Basecamp?</span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Lapor kepulangan selamat dan timbang sampah bawaan untuk klaim E-Sertifikat.
                </p>
                <button
                  onClick={() => setModalCheckoutBuka(true)}
                  className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-2.5 text-xs font-bold text-white active:scale-95 transition-transform"
                >
                  <CheckCircle2 className="h-4 w-4" /> Lapor Selesai Mendaki & Bawa Sampah
                </button>
              </div>
            )}

            <h2 className="mt-5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Anggota Rombongan ({members.length})
            </h2>
            <ul className="mt-2 space-y-1.5 rounded-2xl border border-border bg-card p-3 shadow-sm">
              {members.map((m, i) => (
                <li key={i} className="flex justify-between items-center text-xs py-1">
                  <span className="truncate font-semibold">{m.nama}{m.is_ketua ? " 👑" : ""}</span>
                  <span className="text-muted-foreground font-mono text-[11px]">
                    Gol. Darah: {m.golongan_darah || "-"}
                  </span>
                </li>
              ))}
            </ul>

            <h2 className="mt-5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Rincian Biaya Simaksi & Retribusi
            </h2>
            <ul className="mt-2 space-y-1.5 rounded-2xl border border-border bg-card p-3.5 text-xs shadow-sm">
              {(b.rincian_biaya ?? []).map((r) => (
                <li key={r.label} className="flex justify-between gap-2 py-0.5">
                  <span className="truncate text-muted-foreground">{r.label}</span>
                  <span className="font-semibold">{rupiah(r.nominal)}</span>
                </li>
              ))}
              <li className="flex justify-between border-t border-border pt-2 font-bold text-sm text-foreground">
                <span>Total Pembayaran</span>
                <span className="text-primary">{rupiah(b.total_biaya)}</span>
              </li>
            </ul>

            {bisaBatal ? (
              konfirmasi ? (
                <div className="mt-5 rounded-2xl border border-destructive/40 bg-destructive/5 p-4">
                  <p className="text-xs font-semibold">Yakin batalkan booking ini? Kuota akan dikembalikan.</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setKonfirmasi(false)}
                      disabled={proses}
                      className="rounded-2xl border border-border py-3 text-xs font-bold"
                    >
                      Tidak
                    </button>
                    <button
                      onClick={onBatal}
                      disabled={proses}
                      className="rounded-2xl bg-destructive py-3 text-xs font-bold text-destructive-foreground disabled:opacity-60"
                    >
                      {proses ? "Memproses…" : "Ya, batalkan"}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setKonfirmasi(true)}
                  className="mt-5 w-full rounded-2xl border border-destructive/40 py-3 text-xs font-bold text-destructive hover:bg-destructive/5 active:scale-95 transition-all"
                >
                  Batalkan booking
                </button>
              )
            ) : null}
            {b.status_pembayaran === "batal" ? (
              <button
                onClick={() => navigate({ to: "/pesan" })}
                className="mt-5 w-full rounded-2xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow-card"
              >
                Pesan tiket baru
              </button>
            ) : null}
          </>
        ) : null}
      </div>

      {/* Modal Dialog Lapor Turun & Timbang Sampah */}
      {modalCheckoutBuka && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-card border border-border p-5 shadow-2xl">
            <div className="flex items-center gap-2 text-emerald-600">
              <ShieldCheck className="h-6 w-6" />
              <h3 className="text-base font-extrabold">Verifikasi Lapor Turun</h3>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Konfirmasi seluruh anggota rombongan telah tiba di basecamp dengan selamat dan membawa turun sampah.
            </p>

            <div className="mt-4 rounded-2xl border border-border bg-secondary/50 p-3.5">
              <span className="text-[11px] font-bold text-muted-foreground block mb-1">
                Kantong Sampah Dibawa Turun (Trash Bag)
              </span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs font-semibold">Jumlah kantong:</span>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setKantongSampah(Math.max(1, kantongSampah - 1))}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-card border border-border"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="font-bold text-sm w-4 text-center">{kantongSampah}</span>
                  <button
                    onClick={() => setKantongSampah(kantongSampah + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-card border border-border"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                onClick={() => setModalCheckoutBuka(false)}
                disabled={prosesCheckout}
                className="rounded-xl border border-border py-2.5 text-xs font-bold"
              >
                Kembali
              </button>
              <button
                onClick={selesaikanPendakian}
                disabled={prosesCheckout}
                className="rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-sm disabled:opacity-50"
              >
                {prosesCheckout ? "Menyimpan…" : "Konfirmasi Selesai"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal E-Sertifikat */}
      {b && (
        <SummitCertificateModal
          isOpen={sertifikatBuka}
          onClose={() => setSertifikatBuka(false)}
          namaPendaki={ketua}
          jalurNama={b.jalur_nama}
          tanggal={b.tanggal_naik}
          kodeBooking={b.kode_booking}
        />
      )}
    </PhoneShell>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl bg-secondary px-2.5 py-2">
      <dt className="text-[10px] text-muted-foreground">{k}</dt>
      <dd className="truncate font-bold capitalize">{v}</dd>
    </div>
  );
}
