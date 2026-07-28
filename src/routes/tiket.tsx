import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Share2, CheckCircle2, Users, CalendarDays, MapPin } from "lucide-react";
import { PhoneShell, ScreenHeader, OfflineBadge } from "@/components/PhoneShell";

export const Route = createFileRoute("/tiket")({
  head: () => ({
    meta: [
      { title: "E-Tiket Pendakian — Muria Trail" },
      {
        name: "description",
        content:
          "E-tiket QR pendakian Gunung Muria: detail rombongan, syarat & ketentuan, dan akses offline saat sinyal lemah di gunung.",
      },
      { property: "og:title", content: "E-Tiket Pendakian — Muria Trail" },
      {
        property: "og:description",
        content: "QR code tiket digital, detail rombongan, dan syarat pendakian Gunung Muria.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Tiket,
});

const anggota = [
  { nama: "Raka Wibowo", nik: "3319•••••••0012", darah: "O" },
  { nama: "Dimas Ardhana", nik: "3319•••••••0847", darah: "B" },
  { nama: "Sinta Larasati", nik: "3319•••••••1123", darah: "A" },
];

const syarat = [
  "Wajib lapor di basecamp maksimal 30 menit sebelum jam masuk.",
  "Dilarang membuat api unggun & memetik tumbuhan di kawasan konservasi.",
  "Sampah wajib dibawa turun dan ditimbang saat kembali.",
  "Turun paling lambat pukul 16.00 WIB pada hari terakhir.",
];

function Tiket() {
  return (
    <PhoneShell nav>
      <ScreenHeader
        title="Tiket Saya"
        subtitle="1 tiket aktif"
        action={<OfflineBadge label="Offline siap" />}
      />
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-6">
        <div className="flex items-center gap-2 rounded-2xl bg-success/10 px-3 py-2.5">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-success" strokeWidth={1.75} />
          <p className="text-[11px] font-semibold text-success">
            Pembayaran berhasil · Registrasi terverifikasi
          </p>
        </div>

        <div className="mt-3 overflow-hidden rounded-3xl bg-card shadow-lifted">
          <div className="surface-summit px-4 py-3.5 text-primary-foreground">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-primary-foreground/60">
                  E-Tiket Pendakian
                </p>
                <p className="truncate text-base font-extrabold">Gunung Muria · Jalur Colo</p>
              </div>
              <span className="shrink-0 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold text-accent-foreground">
                AKTIF
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center px-4 py-5">
            <div className="rounded-2xl border border-border bg-background p-3">
              <QrPlaceholder />
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">Kode booking</p>
            <p className="text-lg font-extrabold tracking-[0.2em]">MTR-8F42K</p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Tunjukkan QR ini di pos registrasi basecamp
            </p>
          </div>

          <div className="relative">
            <span className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-background" />
            <span className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-background" />
            <div className="border-t border-dashed border-border" />
          </div>

          <div className="grid grid-cols-3 gap-2 px-4 py-4">
            <Fact icon={CalendarDays} label="Tanggal" value="12 Jun 2026" />
            <Fact icon={Users} label="Rombongan" value="3 pendaki" />
            <Fact icon={MapPin} label="Basecamp" value="Colo 1" />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <button className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 text-xs font-bold shadow-card">
            <Download className="h-4 w-4" strokeWidth={1.75} /> Simpan offline
          </button>
          <button className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 text-xs font-bold shadow-card">
            <Share2 className="h-4 w-4" strokeWidth={1.75} /> Bagikan
          </button>
        </div>

        <h2 className="mt-6 text-xs font-bold text-muted-foreground">DETAIL ROMBONGAN</h2>
        <ul className="mt-2.5 space-y-2">
          {anggota.map((a, i) => (
            <li
              key={a.nik}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{a.nama}</span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  NIK {a.nik}
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive">
                Gol. {a.darah}
              </span>
            </li>
          ))}
        </ul>

        <h2 className="mt-6 text-xs font-bold text-muted-foreground">SYARAT & KETENTUAN</h2>
        <ol className="mt-2.5 space-y-2 rounded-2xl border border-border bg-card p-4 shadow-card">
          {syarat.map((s, i) => (
            <li key={s} className="flex gap-2.5 text-[11px] leading-relaxed text-foreground/80">
              <span className="font-bold text-accent">{i + 1}.</span>
              {s}
            </li>
          ))}
        </ol>

        <Link
          to="/jalur"
          className="mt-4 flex items-center justify-center rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-card"
        >
          Lihat info jalur Colo
        </Link>
      </div>
    </PhoneShell>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-secondary px-2.5 py-2">
      <Icon className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
      <p className="mt-1 truncate text-[10px] text-muted-foreground">{label}</p>
      <p className="truncate text-[11px] font-bold">{value}</p>
    </div>
  );
}

function QrPlaceholder() {
  const cells = Array.from({ length: 169 }, (_, i) => {
    const r = Math.floor(i / 13);
    const c = i % 13;
    const corner =
      (r < 4 && c < 4) || (r < 4 && c > 8) || (r > 8 && c < 4);
    const on = corner
      ? (r === 0 || r === 3 || c === 0 || c === 3 || (r === 1 && c === 1)) ||
        (r % 3 === 1 && c % 3 === 1)
      : (r * 7 + c * 5 + ((r * c) % 5)) % 3 !== 0;
    return on;
  });
  return (
    <div className="grid h-36 w-36 grid-cols-13 gap-px" aria-label="QR code e-tiket">
      {cells.map((on, i) => (
        <span
          key={i}
          className={on ? "rounded-[1px] bg-primary-deep" : "bg-transparent"}
        />
      ))}
    </div>
  );
}
