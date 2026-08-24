import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Clock,
  Users,
  ArrowRight,
  Mountain,
  Landmark,
  Bike,
  Minus,
  Plus,
  Info,
} from "lucide-react";
import { PhoneShell, ScreenHeader, LoadingBar } from "@/components/PhoneShell";
import { JALUR, rupiah, type Jalur } from "@/data/muria";
import { supabase } from "@/integrations/supabase/client";
import { simpanDraft } from "@/lib/booking-draft";

export const Route = createFileRoute("/pesan")({
  head: () => ({
    meta: [
      { title: "Pilih Jalur Rahtawu, Tempur & Colo — Muria Trail" },
      {
        name: "description",
        content:
          "Pilih jalur pendakian Gunung Muria (Rahtawu, Tempur) atau wisata religi Colo, lengkap dengan rincian retribusi desa, simaksi, parkir, dan opsi ojek ke Pos 1.",
      },
      { property: "og:title", content: "Pilih Jalur & Tanggal — Muria Trail" },
      {
        property: "og:description",
        content: "Kartu jalur Rahtawu, Tempur, dan Colo dengan breakdown biaya dan kuota harian.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pesan,
});

const KUOTA_DEFAULT = 150;
const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const statusLabel: Record<string, { text: string; cls: string }> = {
  buka: { text: "Jalur dibuka", cls: "bg-success/12 text-success" },
  waspada: { text: "Waspada cuaca", cls: "bg-accent/15 text-accent" },
  tutup_sementara: { text: "Ditutup sementara", cls: "bg-destructive/10 text-destructive" },
};

type Kuota = { jalur_id: string; tanggal: string; kuota: number; terpakai: number };

function isoTanggal(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function Pesan() {
  const navigate = useNavigate();
  const [jalurId, setJalurId] = useState(JALUR[0].id);
  const [rombongan, setRombongan] = useState(3);
  const [motor, setMotor] = useState(1);
  const [ojek, setOjek] = useState(false);
  const [kuota, setKuota] = useState<Kuota[]>([]);
  const [statusDb, setStatusDb] = useState<Record<string, string>>({});
  const [memuat, setMemuat] = useState(true);

  const hariIni = useMemo(() => new Date(), []);
  const days = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => {
        const d = new Date(hariIni);
        d.setDate(d.getDate() + i);
        return { iso: isoTanggal(d), tgl: d.getDate(), date: d };
      }),
    [hariIni],
  );
  const [tanggal, setTanggal] = useState(days[1].iso);

  useEffect(() => {
    let aktif = true;
    setMemuat(true);
    Promise.all([
      supabase.from("daily_quotas").select("jalur_id,tanggal,kuota,terpakai"),
      supabase.from("trail_status").select("jalur_id,status"),
    ]).then(([q, s]) => {
      if (!aktif) return;
      setKuota((q.data as Kuota[]) ?? []);
      const map: Record<string, string> = {};
      (s.data ?? []).forEach((r) => (map[r.jalur_id as string] = r.status as string));
      setStatusDb(map);
      setMemuat(false);
    });
    return () => {
      aktif = false;
    };
  }, []);

  const sisaSlot = (iso: string) => {
    const row = kuota.find((k) => k.jalur_id === jalurId && k.tanggal === iso);
    return row ? Math.max(0, row.kuota - row.terpakai) : KUOTA_DEFAULT;
  };

  const aktif = JALUR.find((j) => j.id === jalurId)!;
  const status = statusDb[aktif.id] ?? aktif.status;
  const religi = aktif.kategori === "religi";
  const dipilih = days.find((d) => d.iso === tanggal) ?? days[0];

  const perOrang = aktif.biaya.filter((b) => b.satuan === "/orang");
  const parkir = aktif.biaya.find((b) => b.satuan === "/unit")?.nominal ?? 0;
  const ojekFee = ojek && aktif.ojek?.tersedia ? 25000 * rombongan : 0;
  const rincian = [
    ...perOrang
      .filter((b) => b.nominal > 0)
      .map((b) => ({ label: `${b.label} (${rombongan} × ${rupiah(b.nominal)})`, nominal: b.nominal * rombongan })),
    ...(parkir > 0 && motor > 0
      ? [{ label: `Parkir motor (${motor} unit)`, nominal: parkir * motor }]
      : []),
    ...(ojekFee > 0
      ? [{ label: `Ojek Basecamp–Pos 1 (${rombongan} × Rp 25.000)`, nominal: ojekFee }]
      : []),
  ];
  const total = rincian.reduce((a, b) => a + b.nominal, 0);

  function lanjut() {
    simpanDraft({
      jalur_id: aktif.id,
      jalur_nama: aktif.nama,
      tanggal_naik: tanggal,
      jumlah_pendaki: rombongan,
      jumlah_motor: motor,
      pakai_ojek: ojek,
      rincian,
      total,
    });
    navigate({ to: "/registrasi" });
  }

  return (
    <PhoneShell>
      <ScreenHeader title="Pilih jalur & tanggal" subtitle="Langkah 1 dari 4" back="/beranda" />
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-4">
        <div className="mb-4 h-1 overflow-hidden rounded-full bg-secondary">
          <div className="surface-sunrise h-full w-1/4 rounded-full" />
        </div>

        <h2 className="text-xs font-bold text-muted-foreground">PENDAKIAN PUNCAK</h2>
        <div className="mt-2.5 space-y-2.5">
          {JALUR.filter((j) => j.kategori === "pendakian").map((j) => (
            <JalurCard
              key={j.id}
              j={j}
              status={statusDb[j.id] ?? j.status}
              active={jalurId === j.id}
              onSelect={() => setJalurId(j.id)}
            />
          ))}
        </div>

        <h2 className="mt-5 text-xs font-bold text-muted-foreground">WISATA RELIGI</h2>
        <div className="mt-2.5 space-y-2.5">
          {JALUR.filter((j) => j.kategori === "religi").map((j) => (
            <JalurCard
              key={j.id}
              j={j}
              status={statusDb[j.id] ?? j.status}
              active={jalurId === j.id}
              onSelect={() => setJalurId(j.id)}
            />
          ))}
        </div>

        <div className="mt-3 flex items-start gap-2.5 rounded-2xl bg-secondary p-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
          <p className="text-[11px] leading-relaxed text-secondary-foreground">
            Tidak ada basecamp terpusat di Muria — tiap jalur dikelola desa masing-masing. Tarif di
            aplikasi masih menunggu verifikasi Pokdarwis.
          </p>
        </div>

        <h2 className="mt-5 text-xs font-bold text-muted-foreground">ROMBONGAN & KENDARAAN</h2>
        <div className="mt-2.5 space-y-2.5 rounded-3xl border border-border bg-card p-4 shadow-card">
          <Counter label="Jumlah pendaki" value={rombongan} onChange={setRombongan} min={1} />
          <Counter label="Motor diparkir" value={motor} onChange={setMotor} min={0} />
          {aktif.ojek?.tersedia ? (
            <button
              onClick={() => setOjek((v) => !v)}
              className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border p-3 text-left"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-earth/12 text-earth">
                <Bike className="h-4 w-4" strokeWidth={1.5} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold">Naik ojek ke Pos 1</span>
                <span className="block truncate text-[10px] text-muted-foreground">
                  {aktif.ojek.tarif} · {aktif.ojek.durasi} · hemat 30 menit jalan
                </span>
              </span>
              <span
                className={`flex h-6 w-10 shrink-0 items-center rounded-full p-0.5 transition-colors ${
                  ojek ? "bg-primary" : "bg-secondary"
                }`}
              >
                <span
                  className={`h-5 w-5 rounded-full bg-card transition-transform ${
                    ojek ? "translate-x-4" : ""
                  }`}
                />
              </span>
            </button>
          ) : null}
        </div>

        <h2 className="mt-5 text-xs font-bold text-muted-foreground">RINCIAN BIAYA</h2>
        <ul className="mt-2.5 space-y-2 rounded-3xl border border-border bg-card p-4 shadow-card">
          {rincian.map((b) => (
            <li key={b.label} className="flex items-start justify-between gap-3 text-xs">
              <span className="min-w-0 text-muted-foreground">{b.label}</span>
              <span className="shrink-0 font-semibold">{rupiah(b.nominal)}</span>
            </li>
          ))}
          {rincian.length === 0 ? (
            <li className="text-[11px] text-muted-foreground">
              Tarif {aktif.nama} belum terverifikasi — dibayar langsung di lokasi.
            </li>
          ) : null}
        </ul>

        <div className="mt-5 flex items-center justify-between">
          <h2 className="text-xs font-bold text-muted-foreground">
            KETERSEDIAAN · {BULAN[dipilih.date.getMonth()].toUpperCase()}
          </h2>
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
              const sisa = sisaSlot(d.iso);
              const penuh = sisa === 0;
              const active = tanggal === d.iso;
              return (
                <button
                  key={d.iso}
                  disabled={penuh}
                  onClick={() => setTanggal(d.iso)}
                  className={`flex aspect-square flex-col items-center justify-center rounded-xl text-xs font-semibold transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : penuh
                        ? "text-muted-foreground/40"
                        : "bg-secondary text-foreground"
                  }`}
                >
                  {d.tgl}
                  <span
                    className={`mt-0.5 h-1 w-1 rounded-full ${
                      penuh ? "bg-destructive" : sisa < 60 ? "bg-accent" : "bg-success"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {memuat ? (
          <div className="mt-3">
            <LoadingBar label="Menyegarkan kuota & status jalur dari admin basecamp…" />
          </div>
        ) : null}
      </div>

      <div className="border-t border-border bg-card px-5 pb-6 pt-3">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <p className="truncate text-[11px] text-muted-foreground">
              {aktif.nama} · {dipilih.tgl} {BULAN[dipilih.date.getMonth()]}{" "}
              {dipilih.date.getFullYear()}
            </p>
            <p className="flex items-center gap-1.5 text-sm font-bold">
              <Users className="h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={1.75} />
              {rupiah(total)} · sisa {sisaSlot(tanggal)} slot
            </p>
          </div>
          <button
            onClick={lanjut}
            disabled={status === "tutup_sementara"}
            className="flex shrink-0 items-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground shadow-card disabled:opacity-50"
          >
            {religi ? "Daftar ziarah" : "Lanjut"}
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </PhoneShell>
  );
}

function JalurCard({
  j,
  status,
  active,
  onSelect,
}: {
  j: Jalur;
  status: string;
  active: boolean;
  onSelect: () => void;
}) {
  const st = statusLabel[status] ?? statusLabel.buka;
  const religi = j.kategori === "religi";
  return (
    <button
      onClick={onSelect}
      className={`w-full rounded-3xl border p-3.5 text-left transition-colors ${
        active ? "border-primary bg-primary/8" : "border-border bg-card shadow-card"
      }`}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{j.nama}</p>
          <p className="truncate text-[11px] text-muted-foreground">{j.desa}</p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[9px] font-bold ${
            religi ? "bg-earth/12 text-earth" : "bg-primary/10 text-primary"
          }`}
        >
          {religi ? (
            <Landmark className="h-3 w-3" strokeWidth={2} />
          ) : (
            <Mountain className="h-3 w-3" strokeWidth={2} />
          )}
          {religi ? "Wisata Religi" : "Jalur Pendakian"}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Chip>{j.mdpl}</Chip>
        <Chip>
          <Clock className="h-3 w-3" strokeWidth={1.75} /> {j.naik}
        </Chip>
        <Chip>Level {j.level}</Chip>
        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${st.cls}`}>{st.text}</span>
      </div>

      <div className="mt-2.5 space-y-1 rounded-2xl bg-secondary/70 p-2.5">
        {j.biaya.map((b) => (
          <p key={b.label} className="flex justify-between gap-2 text-[10px]">
            <span className="min-w-0 truncate text-muted-foreground">{b.label}</span>
            <span className="shrink-0 font-semibold">
              {b.nominal > 0 ? `${rupiah(b.nominal)}${b.satuan}` : b.satuan}
            </span>
          </p>
        ))}
      </div>
      <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">{j.catatan}</p>
    </button>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[9px] font-semibold text-secondary-foreground">
      {children}
    </span>
  );
}

function Counter({
  label,
  value,
  onChange,
  min,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
      <span className="min-w-0 truncate text-xs font-semibold">{label}</span>
      <span className="flex shrink-0 items-center gap-2">
        <button
          aria-label={`Kurangi ${label}`}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-border"
        >
          <Minus className="h-3 w-3" strokeWidth={2} />
        </button>
        <span className="w-5 text-center text-sm font-bold">{value}</span>
        <button
          aria-label={`Tambah ${label}`}
          onClick={() => onChange(value + 1)}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-border"
        >
          <Plus className="h-3 w-3" strokeWidth={2} />
        </button>
      </span>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className={`h-1.5 w-1.5 rounded-full ${className}`} /> {label}
    </span>
  );
}
