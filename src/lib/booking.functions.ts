import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { BookingDraft } from "@/lib/booking-draft";

export type BookingResult = {
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

const ABJAD = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function buatKodeBooking() {
  let kode = "";
  for (let i = 0; i < 5; i++) kode += ABJAD[Math.floor(Math.random() * ABJAD.length)];
  return `MTR-${kode}`;
}

const draftSchema = z.object({
  jalur_id: z.string().min(1),
  jalur_nama: z.string().min(1),
  tanggal_naik: z.string().min(1),
  jam_mulai: z.string().optional().nullable(),
  tipe: z.string(),
  jumlah_pendaki: z.number().int().min(1).max(10),
  jumlah_motor: z.number().int().min(0),
  pakai_ojek: z.boolean(),
  ketua: z.object({
    nama: z.string().min(1),
    nik: z.string().optional().nullable(),
    no_hp: z.string().optional().nullable(),
    golongan_darah: z.string().optional().nullable(),
    kontak_darurat_nama: z.string().optional().nullable(),
    kontak_darurat_hp: z.string().optional().nullable(),
  }),
  anggota: z.array(
    z.object({
      nama: z.string(),
      nik: z.string().optional().nullable(),
      no_hp: z.string().optional().nullable(),
      golongan_darah: z.string().optional().nullable(),
    }),
  ),
  rincian: z.array(z.object({ label: z.string(), nominal: z.number() })),
  total: z.number().int().min(0),
  metode: z.string(),
});

/**
 * Membuat booking dari draft: potong kuota → simpan booking → simpan anggota → tandai lunas.
 * Berjalan di server dengan RLS sebagai pengguna yang login.
 */
export const buatBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => draftSchema.parse(data))
  .handler(async ({ data, context }) => {
    const supabase = context.supabase;
    const userId = context.userId;
    const draft = data as BookingDraft;
    const tanggal = draft.tanggal_naik || new Date().toISOString().slice(0, 10);
    const kode = buatKodeBooking();

    // 1. Potong slot kuota harian — gagal di sini berarti kuota habis.
    const { error: errKuota } = await supabase.rpc("pakai_kuota", {
      _jalur_id: draft.jalur_id,
      _tanggal: tanggal,
      _jumlah: draft.jumlah_pendaki,
    });
    if (errKuota) throw new Error(errKuota.message);

    // 2. Simpan booking dengan status pending.
    const { data: bookingRow, error: errInsert } = await supabase
      .from("bookings")
      .insert({
        user_id: userId,
        kode_booking: kode,
        jalur_id: draft.jalur_id,
        jalur_nama: draft.jalur_nama,
        tanggal_naik: tanggal,
        jam_mulai: draft.jam_mulai ?? null,
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

    if (errInsert || !bookingRow) {
      // Kembalikan slot kuota bila insert booking gagal.
      await supabase.rpc("batal_kuota", {
        _jalur_id: draft.jalur_id,
        _tanggal: tanggal,
        _jumlah: draft.jumlah_pendaki,
      });
      throw new Error(errInsert?.message ?? "Gagal membuat booking");
    }

    // 3. Simpan anggota rombongan.
    const anggota = [
      {
        booking_id: bookingRow.id,
        nama: draft.ketua.nama || "Ketua rombongan",
        nik: draft.ketua.nik ?? null,
        no_hp: draft.ketua.no_hp ?? null,
        golongan_darah: draft.ketua.golongan_darah ?? null,
        is_ketua: true,
      },
      ...draft.anggota
        .filter((a) => a.nama.trim())
        .map((a) => ({
          booking_id: bookingRow.id,
          nama: a.nama,
          nik: a.nik ?? null,
          no_hp: a.no_hp ?? null,
          golongan_darah: a.golongan_darah ?? null,
          is_ketua: false,
        })),
    ];
    if (anggota.length) {
      await supabase.from("booking_members").insert(anggota);
    }

    // 4. Simulasi gateway pembayaran (mock).
    await new Promise((r) => setTimeout(r, 1600));

    // 5. Tandai lunas.
    const { data: lunasRow, error: errLunas } = await supabase
      .from("bookings")
      .update({ status_pembayaran: "lunas" })
      .eq("id", bookingRow.id)
      .select()
      .single();

    if (errLunas || !lunasRow) {
      throw new Error(errLunas?.message ?? "Gagal menandai pembayaran");
    }

    return lunasRow as unknown as BookingResult;
  });

const idSchema = z.object({ id: z.string().uuid() });

/**
 * Batalkan booking milik pengguna: hanya bila belum check-in & belum dibatalkan.
 * Mengembalikan slot kuota harian.
 */
export const batalBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => idSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: b, error } = await supabase
      .from("bookings")
      .select("id,user_id,jalur_id,tanggal_naik,jumlah_pendaki,status_pembayaran,checkin_at")
      .eq("id", data.id)
      .eq("user_id", userId)
      .maybeSingle();
    if (error || !b) return { ok: false, pesan: "Booking tidak ditemukan" };
    if (b.status_pembayaran === "batal") return { ok: false, pesan: "Booking sudah dibatalkan" };
    if (b.checkin_at) return { ok: false, pesan: "Tiket sudah check-in, tidak bisa dibatalkan" };
    const hariIni = new Date().toISOString().slice(0, 10);
    if (b.tanggal_naik < hariIni) return { ok: false, pesan: "Tanggal pendakian sudah lewat" };

    // Tandai batal dulu (kondisional) agar kuota tidak dikembalikan dua kali.
    const { data: up, error: errUp } = await supabase
      .from("bookings")
      .update({ status_pembayaran: "batal", status_pendakian: "dibatalkan" })
      .eq("id", b.id)
      .neq("status_pembayaran", "batal")
      .select("id");
    if (errUp || !up?.length) return { ok: false, pesan: errUp?.message ?? "Gagal membatalkan" };

    await supabase.rpc("batal_kuota", {
      _jalur_id: b.jalur_id,
      _tanggal: b.tanggal_naik,
      _jumlah: b.jumlah_pendaki,
    });
    return { ok: true, pesan: "Booking dibatalkan, kuota dikembalikan" };
  });

const validasiSchema = z.object({ kode: z.string().min(1) });

/**
 * Validasi e-tiket oleh admin: cari booking berdasarkan kode, tandai check-in.
 * Memverifikasi peran admin sebelum memproses.
 */
export const validasiTiket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => validasiSchema.parse(data))
  .handler(async ({ data, context }) => {
    const supabase = context.supabase;
    const userId = context.userId;

    // Verifikasi peran admin.
    const { data: isAdmin, error: errRole } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (errRole || !isAdmin) {
      return { ok: false, pesan: "Akses ditolak — hanya admin yang dapat memvalidasi tiket" };
    }

    const kode = data.kode.trim().toUpperCase();
    const { data: booking, error: errCari } = await supabase
      .from("bookings")
      .select("id,kode_booking,jalur_nama,jumlah_pendaki,status_pembayaran,checkin_at")
      .eq("kode_booking", kode)
      .maybeSingle();

    if (errCari || !booking) {
      return { ok: false, pesan: "Kode booking tidak ditemukan" };
    }
    if (booking.status_pembayaran !== "lunas") {
      return { ok: false, pesan: "Tiket belum lunas" };
    }
    if (booking.checkin_at) {
      return { ok: false, pesan: "Tiket ini sudah check-in sebelumnya" };
    }

    const { error: errUp } = await supabase
      .from("bookings")
      .update({ checkin_at: new Date().toISOString(), status_pendakian: "berlangsung" })
      .eq("id", booking.id);

    if (errUp) {
      return { ok: false, pesan: errUp.message };
    }

    return {
      ok: true,
      pesan: `Check-in berhasil — ${booking.jalur_nama} (${booking.jumlah_pendaki} orang)`,
    };
  });
