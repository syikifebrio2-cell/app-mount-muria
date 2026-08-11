import { supabase } from "@/integrations/supabase/client";
import type { BookingDraft } from "./booking-draft";

export type Booking = {
  id: string;
  kode_booking: string;
  jalur_id: string;
  jalur_nama: string;
  tanggal_naik: string;
  jam_mulai: string | null;
  tipe: string;
  jumlah_pendaki: number;
  pakai_ojek: boolean;
  jumlah_motor: number;
  rincian_biaya: { label: string; nominal: number }[];
  total_biaya: number;
  metode_pembayaran: string | null;
  status_pembayaran: string;
  status_pendakian: string;
  created_at: string;
};

export const TIKET_CACHE_KEY = "muria:tiket-offline";

export function buatKodeBooking() {
  const abjad = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let kode = "";
  for (let i = 0; i < 5; i++) kode += abjad[Math.floor(Math.random() * abjad.length)];
  return `MTR-${kode}`;
}

/** Pembayaran mock: menunda sejenak lalu menandai lunas tanpa transaksi nyata. */
export async function bayarMock(draft: BookingDraft, userId: string) {
  const kode = buatKodeBooking();
  const tanggal = draft.tanggal_naik || new Date().toISOString().slice(0, 10);

  // Ambil slot kuota harian dulu — gagal di sini berarti kuota habis.
  const { error: errKuota } = await supabase.rpc("pakai_kuota", {
    _jalur_id: draft.jalur_id,
    _tanggal: tanggal,
    _jumlah: draft.jumlah_pendaki,
  });
  if (errKuota) throw errKuota;

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      user_id: userId,
      kode_booking: kode,
      jalur_id: draft.jalur_id,
      jalur_nama: draft.jalur_nama,
      tanggal_naik: draft.tanggal_naik || new Date().toISOString().slice(0, 10),
      jam_mulai: draft.jam_mulai,
      tipe: draft.tipe,
      jumlah_pendaki: draft.jumlah_pendaki,
      pakai_ojek: draft.pakai_ojek,
      jumlah_motor: draft.jumlah_motor,
      rincian_biaya: draft.rincian,
      total_biaya: draft.total,
      metode_pembayaran: draft.metode,
      status_pembayaran: "pending",
    })
    .select()
    .single();

  if (error) throw error;

  const anggota = [
    {
      booking_id: data.id,
      nama: draft.ketua.nama || "Ketua rombongan",
      nik: draft.ketua.nik,
      no_hp: draft.ketua.no_hp,
      golongan_darah: draft.ketua.golongan_darah,
      is_ketua: true,
    },
    ...draft.anggota
      .filter((a) => a.nama.trim())
      .map((a) => ({
        booking_id: data.id,
        nama: a.nama,
        nik: a.nik,
        no_hp: a.no_hp ?? null,
        golongan_darah: a.golongan_darah ?? null,
        is_ketua: false,
      })),
  ];
  if (anggota.length) await supabase.from("booking_members").insert(anggota);

  // simulasi proses gateway
  await new Promise((r) => setTimeout(r, 1600));

  const { data: lunas, error: errUpdate } = await supabase
    .from("bookings")
    .update({ status_pembayaran: "lunas" })
    .eq("id", data.id)
    .select()
    .single();
  if (errUpdate) throw errUpdate;

  return lunas as unknown as Booking;
}

export function cacheTiket(bookings: Booking[]) {
  try {
    localStorage.setItem(TIKET_CACHE_KEY, JSON.stringify(bookings));
  } catch {
    /* kuota penuh — abaikan */
  }
}

export function tiketDariCache(): Booking[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(TIKET_CACHE_KEY) ?? "[]") as Booking[];
  } catch {
    return [];
  }
}
