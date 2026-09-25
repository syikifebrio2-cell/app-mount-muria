import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { PhoneShell, ScreenHeader } from "@/components/PhoneShell";
import { LoadingState, ErrorState } from "@/components/States";
import { supabase } from "@/integrations/supabase/client";
import { batalBooking } from "@/lib/booking.functions";
import { rupiah } from "@/data/muria";

export const Route = createFileRoute("/_authenticated/booking/$id")({
  head: () => ({
    meta: [
      { title: "Detail Booking — Muria Trail" },
      { name: "description", content: "Rincian booking pendakian Gunung Muria dan pembatalan tiket." },
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
      if (r.ok) {
        toast.success(r.pesan);
        await muat();
      } else toast.error(r.pesan);
    } catch {
      toast.error("Gagal membatalkan, coba lagi");
    } finally {
      setProses(false);
      setKonfirmasi(false);
    }
  }

  const bisaBatal =
    b && b.status_pembayaran !== "batal" && !b.checkin_at &&
    b.tanggal_naik >= new Date().toISOString().slice(0, 10);

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
            <div className="rounded-3xl bg-card p-4 shadow-card">
              <div className="flex items-center justify-between gap-2">
                <p className="min-w-0 truncate text-sm font-extrabold">{b.jalur_nama}</p>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                    b.status_pembayaran === "batal"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-success/10 text-success"
                  }`}
                >
                  {b.status_pembayaran === "batal" ? "Dibatalkan" : b.checkin_at ? "Check-in" : "Aktif"}
                </span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                <Info k="Tanggal" v={b.tanggal_naik} />
                <Info k="Jam mulai" v={b.jam_mulai ?? "-"} />
                <Info k="Tipe" v={b.tipe} />
                <Info k="Pendaki" v={`${b.jumlah_pendaki} orang`} />
                <Info k="Metode" v={b.metode_pembayaran ?? "-"} />
                <Info k="Status" v={b.status_pendakian} />
              </dl>
            </div>

            <h2 className="mt-5 text-xs font-bold text-muted-foreground">ROMBONGAN</h2>
            <ul className="mt-2 space-y-1.5 rounded-2xl border border-border bg-card p-3">
              {members.map((m, i) => (
                <li key={i} className="flex justify-between text-xs">
                  <span className="truncate">{m.nama}{m.is_ketua ? " (Ketua)" : ""}</span>
                  <span className="text-muted-foreground">{m.golongan_darah ?? "-"}</span>
                </li>
              ))}
            </ul>

            <h2 className="mt-5 text-xs font-bold text-muted-foreground">RINCIAN BIAYA</h2>
            <ul className="mt-2 space-y-1.5 rounded-2xl border border-border bg-card p-3 text-xs">
              {(b.rincian_biaya ?? []).map((r) => (
                <li key={r.label} className="flex justify-between gap-2">
                  <span className="truncate">{r.label}</span>
                  <span>{rupiah(r.nominal)}</span>
                </li>
              ))}
              <li className="flex justify-between border-t border-border pt-1.5 font-bold">
                <span>Total</span>
                <span>{rupiah(b.total_biaya)}</span>
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
                  className="mt-5 w-full rounded-2xl border border-destructive py-3 text-xs font-bold text-destructive"
                >
                  Batalkan booking
                </button>
              )
            ) : null}
            {b.status_pembayaran === "batal" ? (
              <button
                onClick={() => navigate({ to: "/pesan" })}
                className="mt-5 w-full rounded-2xl bg-primary py-3 text-xs font-bold text-primary-foreground"
              >
                Pesan tiket baru
              </button>
            ) : null}
          </>
        ) : null}
      </div>
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
