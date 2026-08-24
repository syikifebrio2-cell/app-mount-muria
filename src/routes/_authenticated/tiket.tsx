import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Users, CalendarDays, MapPin, Loader2, Ticket } from "lucide-react";
import { PhoneShell, ScreenHeader, OfflineBadge } from "@/components/PhoneShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cacheTiket, tiketDariCache, type Booking } from "@/lib/booking";
import { rupiah } from "@/data/muria";

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

const syarat = [
  "Wajib lapor di basecamp maksimal 30 menit sebelum jam masuk.",
  "Dilarang membuat api unggun & memetik tumbuhan di kawasan konservasi.",
  "Sampah wajib dibawa turun dan ditimbang saat kembali.",
  "Turun paling lambat pukul 16.00 WIB pada hari terakhir.",
];

function Tiket() {
  const { user, loading } = useAuth();
  const [tiket, setTiket] = useState<Booking[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    setTiket(tiketDariCache());
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setMemuat(false);
      return;
    }
    supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error || !data) {
          setOffline(true);
        } else {
          const rows = data as unknown as Booking[];
          setTiket(rows);
          cacheTiket(rows);
        }
        setMemuat(false);
      });
  }, [user, loading]);

  const aktif = tiket.filter((t) => t.status_pembayaran === "lunas");

  return (
    <PhoneShell nav>
      <ScreenHeader
        title="Tiket Saya"
        subtitle={`${aktif.length} tiket aktif`}
        action={<OfflineBadge label={offline ? "Mode offline" : "Offline siap"} />}
      />
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-6">
        {memuat && tiket.length === 0 ? (
          <div className="flex items-center gap-2 rounded-2xl bg-secondary px-3 py-3 text-[11px] font-semibold text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" /> Memuat tiket…
          </div>
        ) : null}

        {!memuat && aktif.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-6 text-center">
            <Ticket className="mx-auto h-6 w-6 text-primary" strokeWidth={1.5} />
            <p className="mt-2 text-sm font-bold">Belum ada tiket</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {user ? "Pesan jalur & tanggal untuk membuat e-tiket." : "Masuk dulu untuk melihat tiketmu."}
            </p>
            <Link
              to={user ? "/pesan" : "/masuk"}
              className="mt-4 inline-flex rounded-2xl bg-primary px-5 py-3 text-xs font-bold text-primary-foreground"
            >
              {user ? "Pesan tiket" : "Masuk"}
            </Link>
          </div>
        ) : null}

        {aktif.map((t) => (
          <div key={t.id} className="mb-4">
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
                    <p className="truncate text-base font-extrabold">{t.jalur_nama}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold text-accent-foreground">
                    AKTIF
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center px-4 py-5">
                <div className="rounded-2xl border border-border bg-background p-3">
                  <QrPlaceholder seed={t.kode_booking} />
                </div>
                <p className="mt-3 text-[11px] text-muted-foreground">Kode booking</p>
                <p className="text-lg font-extrabold tracking-[0.2em]">{t.kode_booking}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Tunjukkan QR ini di pos registrasi basecamp · {rupiah(t.total_biaya)}
                </p>
              </div>

              <div className="relative">
                <span className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-background" />
                <span className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-background" />
                <div className="border-t border-dashed border-border" />
              </div>

              <div className="grid grid-cols-3 gap-2 px-4 py-4">
                <Fact icon={CalendarDays} label="Tanggal" value={t.tanggal_naik} />
                <Fact icon={Users} label="Rombongan" value={`${t.jumlah_pendaki} pendaki`} />
                <Fact icon={MapPin} label="Jalur" value={t.jalur_id.split("_")[0]} />
              </div>
            </div>
          </div>
        ))}

        {aktif.length ? (
          <>
            <h2 className="mt-2 text-xs font-bold text-muted-foreground">SYARAT & KETENTUAN</h2>
            <ol className="mt-2.5 space-y-2 rounded-2xl border border-border bg-card p-4 shadow-card">
              {syarat.map((s, i) => (
                <li key={s} className="flex gap-2.5 text-[11px] leading-relaxed text-foreground/80">
                  <span className="font-bold text-accent">{i + 1}.</span>
                  {s}
                </li>
              ))}
            </ol>
          </>
        ) : null}
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
      <p className="truncate text-[11px] font-bold capitalize">{value}</p>
    </div>
  );
}

function QrPlaceholder({ seed }: { seed: string }) {
  const angka = seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const cells = Array.from({ length: 169 }, (_, i) => {
    const r = Math.floor(i / 13);
    const c = i % 13;
    const corner = (r < 4 && c < 4) || (r < 4 && c > 8) || (r > 8 && c < 4);
    return corner
      ? r === 0 || r === 3 || c === 0 || c === 3 || (r === 1 && c === 1) || (r % 3 === 1 && c % 3 === 1)
      : (r * 7 + c * 5 + angka + ((r * c) % 5)) % 3 !== 0;
  });
  return (
    <div
      className="grid h-36 w-36 grid-cols-[repeat(13,minmax(0,1fr))] gap-px"
      aria-label={`QR code e-tiket ${seed}`}
    >
      {cells.map((on, i) => (
        <span key={i} className={on ? "rounded-[1px] bg-primary-deep" : "bg-transparent"} />
      ))}
    </div>
  );
}
