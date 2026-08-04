/**
 * Data jalur & basecamp Gunung Muria — dirangkum dari dokumen lanjutan project
 * (riset publik 2023–2026). Tarif masih perlu verifikasi ulang ke Pokdarwis desa.
 */

export type Kategori = "pendakian" | "religi";

export type Biaya = { label: string; nominal: number; satuan: string };

export type Jalur = {
  id: string;
  nama: string;
  desa: string;
  kategori: Kategori;
  puncak: string;
  mdpl: string;
  level: "Ringan" | "Sedang" | "Sulit" | "Belum terverifikasi";
  naik: string;
  turun: string;
  status: "buka" | "waspada" | "tutup_sementara";
  ojek: { tersedia: boolean; tarif: string; durasi: string } | null;
  air: string;
  biaya: Biaya[];
  catatan: string;
};

export const JALUR: Jalur[] = [
  {
    id: "rahtawu_songolikur",
    nama: "Rahtawu — Puncak 29 (Songolikur)",
    desa: "Ds. Rahtawu, Gebog, Kudus",
    kategori: "pendakian",
    puncak: "Puncak 29 / Songolikur / Saptorenggo",
    mdpl: "1.602 mdpl",
    level: "Sedang",
    naik: "3–4 jam",
    turun: "±2 jam",
    status: "buka",
    ojek: { tersedia: true, tarif: "Rp 20.000–25.000", durasi: "±6 menit" },
    air: "Sendang Bunton (Pos 4)",
    biaya: [
      { label: "Retribusi desa wisata", nominal: 3000, satuan: "/orang" },
      { label: "Simaksi / tiket jalur", nominal: 5000, satuan: "/orang" },
      { label: "Parkir motor", nominal: 10000, satuan: "/unit" },
    ],
    catatan: "Puncak tertinggi Muria. Sebagian sumber menyebut 1.625 mdpl.",
  },
  {
    id: "rahtawu_natasangin",
    nama: "Rahtawu — Natas Angin (Jalur Naga)",
    desa: "Ds. Rahtawu, Gebog, Kudus",
    kategori: "pendakian",
    puncak: "Puncak Natas Angin",
    mdpl: "±1.515 mdpl",
    level: "Sulit",
    naik: "3–4 jam",
    turun: "±2 jam",
    status: "waspada",
    ojek: { tersedia: true, tarif: "Rp 20.000–25.000", durasi: "±6 menit" },
    air: "Sendang Bunton (Pos 4)",
    biaya: [
      { label: "Retribusi desa wisata", nominal: 3000, satuan: "/orang" },
      { label: "Simaksi / tiket jalur", nominal: 5000, satuan: "/orang" },
      { label: "Parkir motor", nominal: 10000, satuan: "/unit" },
    ],
    catatan: "Punggungan sempit dengan jurang kanan-kiri. Jalur paling menantang.",
  },
  {
    id: "tempur",
    nama: "Tempur — Kawasan Puncak",
    desa: "Ds. Tempur, Keling, Jepara",
    kategori: "pendakian",
    puncak: "Bertemu jalur Rahtawu setelah Pos 4",
    mdpl: "—",
    level: "Belum terverifikasi",
    naik: "Belum terverifikasi",
    turun: "—",
    status: "buka",
    ojek: null,
    air: "Sendang Bunton (jalur gabungan)",
    biaya: [{ label: "Tarif resmi", nominal: 0, satuan: "menunggu Pokdarwis" }],
    catatan: "Data pos & tarif belum lengkap — koordinasi dengan Pokdarwis Desa Tempur.",
  },
  {
    id: "colo_ziarah",
    nama: "Colo — Ziarah Makam Sunan Muria",
    desa: "Ds. Colo, Dawe, Kudus",
    kategori: "religi",
    puncak: "Kompleks Makam Sunan Muria",
    mdpl: "±500 mdpl",
    level: "Ringan",
    naik: "Tangga & jalan setapak",
    turun: "—",
    status: "buka",
    ojek: { tersedia: true, tarif: "Ojek gunung beraspal", durasi: "beberapa menit" },
    air: "Tersedia di kawasan",
    biaya: [
      { label: "Tiket masuk kawasan", nominal: 0, satuan: "terjangkau, dihitung terpisah" },
      { label: "Parkir", nominal: 0, satuan: "dihitung terpisah" },
    ],
    catatan: "Wisata religi, bukan jalur pendakian puncak. Buka subuh–malam.",
  },
];

/** Estimasi antar pos jalur Rahtawu (menit). */
export const POS_RAHTAWU = [
  { nama: "Basecamp Rahtawu", eta: "0 menit", ket: "Parkir, toilet, warung, gubuk istirahat", air: false },
  { nama: "Pos 1", eta: "30 menit", ket: "Jalan cor 1 km — bisa naik ojek ±6 menit", air: false },
  { nama: "Pos 2", eta: "10 menit", ket: "Tanjakan hutan", air: false },
  { nama: "Pos 3", eta: "30 menit", ket: "Punggungan mulai menyempit", air: false },
  { nama: "Pos 4 — Sendang Bunton", eta: "20 menit", ket: "Sumber air & titik spiritual", air: true },
  { nama: "Puncak Bayangan → Natas Angin", eta: "20 menit", ket: "Jurang di kanan-kiri jalur", air: false },
];

export const PUNCAK = [
  { nama: "Puncak 29 / Songolikur", mdpl: "1.602 mdpl", via: "Rahtawu", level: "Sedang" },
  { nama: "Puncak Natas Angin", mdpl: "±1.515 mdpl", via: "Rahtawu (Jalur Naga)", level: "Sulit" },
  { nama: "Puncak Argo Piloso", mdpl: "—", via: "Rahtawu", level: "Sedang" },
  { nama: "Puncak Abiyoso", mdpl: "—", via: "Rahtawu", level: "Sedang" },
  { nama: "Puncak Argo Jembangan", mdpl: "—", via: "Rahtawu / Tempur", level: "Belum terverifikasi" },
  { nama: "Puncak Candi Angin", mdpl: "—", via: "Tempur", level: "Ringan" },
  { nama: "Puncak Termulus", mdpl: "—", via: "Rahtawu", level: "Belum terverifikasi" },
];

export const LARANGAN = [
  "Membuat api unggun di luar area yang ditentukan",
  "Vandalisme di petilasan & area sakral",
  "Mengganggu peziarah yang sedang beribadah",
  "Membawa turun tanaman, batu, atau satwa",
  "Mendaki tanpa registrasi di basecamp desa",
];

export const rupiah = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;
