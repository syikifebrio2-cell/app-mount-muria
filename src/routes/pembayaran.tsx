import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Wallet, Landmark, QrCode, ShieldCheck, ChevronRight, Lock } from "lucide-react";
import { PhoneShell, ScreenHeader } from "@/components/PhoneShell";

export const Route = createFileRoute("/pembayaran")({
  head: () => ({
    meta: [
      { title: "Ringkasan Biaya Retribusi & Simaksi — Muria Trail" },
      {
        name: "description",
        content:
          "Rincian biaya pendakian Rahtawu per pos: retribusi desa wisata, simaksi jalur, parkir, dan ojek Pos 1. Bayar lewat e-wallet, transfer bank, atau QRIS.",
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

const rincian = [
  { label: "Retribusi Desa Wisata Rahtawu (3 × Rp 3.000)", value: "Rp 9.000" },
  { label: "Simaksi / tiket jalur (3 × Rp 5.000)", value: "Rp 15.000" },
  { label: "Parkir motor (1 unit)", value: "Rp 10.000" },
  { label: "Ojek Basecamp–Pos 1 (3 × Rp 25.000)", value: "Rp 75.000" },
  { label: "Biaya layanan aplikasi", value: "Rp 2.500" },
];

function Pembayaran() {
  const [pilih, setPilih] = useState("qris");

  return (
    <PhoneShell>
      <ScreenHeader title="Ringkasan pemesanan" subtitle="Langkah 3 dari 4" back="/registrasi" />
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-4">
        <div className="mb-4 h-1 overflow-hidden rounded-full bg-secondary">
          <div className="surface-sunrise h-full w-3/4 rounded-full" />
        </div>

        <div className="rounded-3xl border border-border bg-card p-4 shadow-card">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">
                Rahtawu — Puncak 29 · Ds. Rahtawu, Gebog
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                Sabtu, 12 Juni 2026 · 05.00 WIB · 3 pendaki · naik ojek
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
              Tektok
            </span>
          </div>
          <div className="my-3 border-t border-dashed border-border" />
          <ul className="space-y-2">
            {rincian.map((r) => (
              <li key={r.label} className="flex items-start justify-between gap-3 text-xs">
                <span className="min-w-0 text-muted-foreground">{r.label}</span>
                <span className="shrink-0 font-semibold">{r.value}</span>
              </li>
            ))}
          </ul>
          <div className="my-3 border-t border-dashed border-border" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">Total bayar</span>
            <span className="text-lg font-extrabold text-primary">Rp 111.500</span>
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
            Estimasi turun otomatis 15.30 WIB (naik 3–4 jam, turun ±2 jam) dikirim ke kontak
            darurat bila belum check-out.
          </p>
        </div>

        <div className="mt-3 flex items-start gap-2.5 rounded-2xl bg-secondary p-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
          <p className="text-[11px] leading-relaxed text-secondary-foreground">
            Asuransi mencakup evakuasi darurat dan biaya medis dasar selama 48 jam pendakian.
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

        <button className="mt-3 flex w-full items-center justify-between rounded-2xl border border-dashed border-border px-3.5 py-3">
          <span className="text-xs font-semibold text-muted-foreground">Punya kode promo?</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
        </button>
      </div>

      <div className="border-t border-border bg-card px-5 pb-6 pt-3">
        <Link
          to="/tiket"
          className="surface-sunrise flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-accent-foreground shadow-sunrise"
        >
          <Lock className="h-4 w-4" strokeWidth={2} /> Bayar Rp 72.500
        </Link>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          Pembayaran diproses aman. E-tiket otomatis tersimpan offline.
        </p>
      </div>
    </PhoneShell>
  );
}
