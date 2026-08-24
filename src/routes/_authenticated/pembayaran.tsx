import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Wallet, Landmark, QrCode, ShieldCheck, Lock, Loader2, FlaskConical } from "lucide-react";
import { toast } from "sonner";
import { PhoneShell, ScreenHeader } from "@/components/PhoneShell";
import { useAuth } from "@/hooks/useAuth";
import { useBookingDraft, simpanDraft, hapusDraft } from "@/lib/booking-draft";
import { bayarMock } from "@/lib/booking";
import { rupiah } from "@/data/muria";

export const Route = createFileRoute("/pembayaran")({
  head: () => ({
    meta: [
      { title: "Ringkasan Biaya Retribusi & Simaksi — Muria Trail" },
      {
        name: "description",
        content:
          "Rincian biaya pendakian per pos: retribusi desa wisata, simaksi jalur, parkir, dan ojek Pos 1. Bayar lewat e-wallet, transfer bank, atau QRIS.",
      },
      { property: "og:title", content: "Ringkasan & Pembayaran — Muria Trail" },
      {
        property: "og:description",
        content: "Breakdown retribusi desa, simaksi, parkir, ojek Pos 1, dan pembayaran QRIS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pembayaran,
});

const metode = [
  { id: "ewallet", nama: "E-wallet", detail: "GoPay · OVO · DANA", icon: Wallet },
  { id: "bank", nama: "Transfer bank", detail: "BCA · Mandiri · BRI", icon: Landmark },
  { id: "qris", nama: "QRIS", detail: "Semua aplikasi pembayaran", icon: QrCode },
];

function Pembayaran() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { draft } = useBookingDraft();
  const [pilih, setPilih] = useState(draft.metode || "qris");
  const [proses, setProses] = useState(false);

  const layanan = draft.total > 0 ? 2500 : 0;
  const total = draft.total + layanan;

  async function bayar() {
    if (!user) {
      toast.error("Masuk dulu untuk menyelesaikan pemesanan");
      navigate({ to: "/masuk" });
      return;
    }
    setProses(true);
    try {
      simpanDraft({ metode: pilih, total });
      const booking = await bayarMock(
        { ...draft, metode: pilih, total, rincian: [...draft.rincian, { label: "Biaya layanan aplikasi", nominal: layanan }] },
        user.id,
      );
      hapusDraft();
      toast.success(`Pembayaran (mock) berhasil · ${booking.kode_booking}`);
      navigate({ to: "/tiket" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal memproses pembayaran");
    } finally {
      setProses(false);
    }
  }

  return (
    <PhoneShell>
      <ScreenHeader title="Ringkasan pemesanan" subtitle="Langkah 3 dari 4" back="/registrasi" />
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-4">
        <div className="mb-4 h-1 overflow-hidden rounded-full bg-secondary">
          <div className="surface-sunrise h-full w-3/4 rounded-full" />
        </div>

        <div className="mb-3 flex items-start gap-2.5 rounded-2xl border border-accent/30 bg-accent/8 p-3">
          <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={1.75} />
          <p className="text-[11px] leading-relaxed text-foreground/80">
            <span className="font-bold">Mode pembayaran simulasi.</span> Tidak ada uang yang
            ditarik — tiket tetap tersimpan agar alur bisa diuji sebelum gateway asli aktif.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-4 shadow-card">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{draft.jalur_nama}</p>
              <p className="truncate text-[11px] text-muted-foreground">
                {draft.tanggal_naik || "Tanggal belum dipilih"} · {draft.jam_mulai} ·{" "}
                {draft.jumlah_pendaki} pendaki {draft.pakai_ojek ? "· naik ojek" : ""}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold capitalize text-primary">
              {draft.tipe}
            </span>
          </div>
          <div className="my-3 border-t border-dashed border-border" />
          <ul className="space-y-2">
            {draft.rincian.map((r) => (
              <li key={r.label} className="flex items-start justify-between gap-3 text-xs">
                <span className="min-w-0 text-muted-foreground">{r.label}</span>
                <span className="shrink-0 font-semibold">{rupiah(r.nominal)}</span>
              </li>
            ))}
            {layanan > 0 ? (
              <li className="flex items-start justify-between gap-3 text-xs">
                <span className="min-w-0 text-muted-foreground">Biaya layanan aplikasi</span>
                <span className="shrink-0 font-semibold">{rupiah(layanan)}</span>
              </li>
            ) : null}
            {draft.rincian.length === 0 ? (
              <li className="text-[11px] text-muted-foreground">
                Belum ada rincian biaya — kembali ke langkah 1 untuk memilih jalur.
              </li>
            ) : null}
          </ul>
          <div className="my-3 border-t border-dashed border-border" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">Total bayar</span>
            <span className="text-lg font-extrabold text-primary">{rupiah(total)}</span>
          </div>
        </div>

        <div className="mt-3 flex items-start gap-2.5 rounded-2xl bg-secondary p-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
          <p className="text-[11px] leading-relaxed text-secondary-foreground">
            Retribusi & simaksi dibayar ke pengelola desa. Tarif mengikuti data terakhir Pokdarwis
            dan dapat berubah di lapangan.
          </p>
        </div>

        <h2 className="mt-6 text-xs font-bold text-muted-foreground">METODE PEMBAYARAN</h2>
        <div className="mt-2.5 space-y-2.5">
          {metode.map((m) => (
            <button
              key={m.id}
              onClick={() => setPilih(m.id)}
              className={`grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border p-3.5 text-left ${
                pilih === m.id ? "border-primary bg-primary/8" : "border-border bg-card shadow-card"
              }`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-earth/12 text-earth">
                <m.icon className="h-4.5 w-4.5" strokeWidth={1.5} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{m.nama}</span>
                <span className="block truncate text-[11px] text-muted-foreground">{m.detail}</span>
              </span>
              <span
                className={`h-4 w-4 shrink-0 rounded-full border-[5px] ${
                  pilih === m.id ? "border-primary" : "border-border"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border bg-card px-5 pb-6 pt-3">
        <button
          onClick={bayar}
          disabled={proses}
          className="surface-sunrise flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-accent-foreground shadow-sunrise disabled:opacity-70"
        >
          {proses ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
          ) : (
            <Lock className="h-4 w-4" strokeWidth={2} />
          )}
          {proses ? "Memproses pembayaran…" : `Bayar ${rupiah(total)}`}
        </button>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          Simulasi pembayaran. E-tiket otomatis tersimpan offline.
        </p>
      </div>
    </PhoneShell>
  );
}
