import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Users, ArrowRight, Tent } from "lucide-react";
import { PhoneShell, ScreenHeader, LoadingBar } from "@/components/PhoneShell";

export const Route = createFileRoute("/pesan")({
  head: () => ({
    meta: [
      { title: "Pilih Jalur & Tanggal Pendakian — Muria Trail" },
      {
        name: "description",
        content:
          "Pilih jalur pendakian Gunung Muria, basecamp keberangkatan, dan tanggal sesuai ketersediaan kuota harian.",
      },
      { property: "og:title", content: "Pilih Jalur & Tanggal — Muria Trail" },
      {
        property: "og:description",
        content: "Kalender kuota harian dan pilihan basecamp pendakian Gunung Muria.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pesan,
});

const jalur = [
  { nama: "Colo", jam: "5–6 jam", level: "Sedang" },
  { nama: "Rahtawu", jam: "6–7 jam", level: "Sulit" },
  { nama: "Tempur", jam: "4–5 jam", level: "Sedang" },
];

const basecamp = [
  { nama: "Basecamp Colo 1", alamat: "Ds. Colo, Dawe, Kudus", buka: "24 jam" },
  { nama: "Basecamp Rahtawu", alamat: "Ds. Rahtawu, Gebog", buka: "04.00–20.00" },
];

// 30 hari kuota contoh
const days = Array.from({ length: 30 }, (_, i) => {
  const kuota = [180, 120, 60, 0, 240][i % 5];
  return { day: i + 1, kuota };
});

function Pesan() {
  const [jalurAktif, setJalurAktif] = useState("Colo");
  const [camp, setCamp] = useState(basecamp[0].nama);
  const [tanggal, setTanggal] = useState(12);

  const dipilih = days.find((d) => d.day === tanggal);

  return (
    <PhoneShell>
      <ScreenHeader title="Pilih jalur & tanggal" subtitle="Langkah 1 dari 4" back="/beranda" />
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-4">
        <div className="mb-4 h-1 overflow-hidden rounded-full bg-secondary">
          <div className="surface-sunrise h-full w-1/4 rounded-full" />
        </div>

        <h2 className="text-xs font-bold text-muted-foreground">JALUR PENDAKIAN</h2>
        <div className="no-scrollbar mt-2.5 flex gap-2.5 overflow-x-auto pb-1">
          {jalur.map((j) => (
            <button
              key={j.nama}
              onClick={() => setJalurAktif(j.nama)}
              className={`w-36 shrink-0 rounded-2xl border p-3 text-left transition-colors ${
                jalurAktif === j.nama
                  ? "border-primary bg-primary/8"
                  : "border-border bg-card shadow-card"
              }`}
            >
              <p className="text-sm font-bold">{j.nama}</p>
              <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="h-3 w-3" strokeWidth={1.75} /> {j.jam}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Level {j.level}</p>
            </button>
          ))}
        </div>

        <h2 className="mt-5 text-xs font-bold text-muted-foreground">BASECAMP KEBERANGKATAN</h2>
        <div className="mt-2.5 space-y-2.5">
          {basecamp.map((b) => (
            <button
              key={b.nama}
              onClick={() => setCamp(b.nama)}
              className={`grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border p-3 text-left ${
                camp === b.nama ? "border-primary bg-primary/8" : "border-border bg-card shadow-card"
              }`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-earth/12 text-earth">
                <Tent className="h-4.5 w-4.5" strokeWidth={1.5} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{b.nama}</span>
                <span className="block truncate text-[11px] text-muted-foreground">{b.alamat}</span>
              </span>
              <span className="shrink-0 text-[10px] font-semibold text-muted-foreground">
                {b.buka}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <h2 className="text-xs font-bold text-muted-foreground">KETERSEDIAAN KUOTA · JUNI</h2>
          <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
            <Legend className="bg-success" label="Longgar" />
            <Legend className="bg-accent" label="Terbatas" />
            <Legend className="bg-destructive" label="Penuh" />
          </div>
        </div>

        <div className="mt-2.5 rounded-3xl border border-border bg-card p-3 shadow-card">
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-muted-foreground">
            {["S", "S", "R", "K", "J", "S", "M"].map((d, i) => (
              <span key={`${d}${i}`}>{d}</span>
            ))}
          </div>
          <div className="mt-1.5 grid grid-cols-7 gap-1">
            {days.map((d) => {
              const penuh = d.kuota === 0;
              const active = tanggal === d.day;
              return (
                <button
                  key={d.day}
                  disabled={penuh}
                  onClick={() => setTanggal(d.day)}
                  className={`flex aspect-square flex-col items-center justify-center rounded-xl text-xs font-semibold transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : penuh
                        ? "text-muted-foreground/40"
                        : "bg-secondary text-foreground"
                  }`}
                >
                  {d.day}
                  <span
                    className={`mt-0.5 h-1 w-1 rounded-full ${
                      penuh ? "bg-destructive" : d.kuota < 100 ? "bg-accent" : "bg-success"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-3">
          <LoadingBar label="Menyegarkan kuota real-time…" />
        </div>
      </div>

      <div className="border-t border-border bg-card px-5 pb-6 pt-3">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <p className="truncate text-[11px] text-muted-foreground">
              Jalur {jalurAktif} · {tanggal} Juni 2026
            </p>
            <p className="flex items-center gap-1.5 text-sm font-bold">
              <Users className="h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={1.75} />
              Sisa {dipilih?.kuota ?? 0} slot
            </p>
          </div>
          <Link
            to="/registrasi"
            className="flex shrink-0 items-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground shadow-card"
          >
            Lanjut <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </PhoneShell>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className={`h-1.5 w-1.5 rounded-full ${className}`} /> {label}
    </span>
  );
}
