import { useCallback, useSyncExternalStore } from "react";

export type Anggota = {
  nama: string;
  nik: string;
  no_hp?: string;
  golongan_darah?: string;
};

export type RincianItem = { label: string; nominal: number };

export type BookingDraft = {
  jalur_id: string;
  jalur_nama: string;
  tanggal_naik: string; // yyyy-mm-dd
  jam_mulai: string;
  tipe: "tektok" | "camping";
  jumlah_pendaki: number;
  jumlah_motor: number;
  pakai_ojek: boolean;
  ketua: Anggota & { kontak_darurat_nama: string; kontak_darurat_hp: string };
  anggota: Anggota[];
  rincian: RincianItem[];
  total: number;
  metode: string;
};

const KEY = "muria:booking-draft";

export const draftKosong: BookingDraft = {
  jalur_id: "rahtawu_songolikur",
  jalur_nama: "Rahtawu — Puncak 29 (Songolikur)",
  tanggal_naik: "",
  jam_mulai: "05.00 WIB",
  tipe: "tektok",
  jumlah_pendaki: 1,
  jumlah_motor: 1,
  pakai_ojek: false,
  ketua: {
    nama: "",
    nik: "",
    no_hp: "",
    golongan_darah: "O",
    kontak_darurat_nama: "",
    kontak_darurat_hp: "",
  },
  anggota: [],
  rincian: [],
  total: 0,
  metode: "qris",
};

let cache: BookingDraft = draftKosong;
let cacheRaw = "";
const listeners = new Set<() => void>();

function baca(): BookingDraft {
  if (typeof window === "undefined") return draftKosong;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) {
    cacheRaw = "";
    cache = draftKosong;
    return cache;
  }
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    try {
      cache = { ...draftKosong, ...(JSON.parse(raw) as BookingDraft) };
    } catch {
      cache = draftKosong;
    }
  }
  return cache;
}

function emit() {
  listeners.forEach((l) => l());
}

export function simpanDraft(patch: Partial<BookingDraft>) {
  const next = { ...baca(), ...patch };
  cache = next;
  cacheRaw = JSON.stringify(next);
  window.localStorage.setItem(KEY, cacheRaw);
  emit();
}

export function hapusDraft() {
  window.localStorage.removeItem(KEY);
  cache = draftKosong;
  cacheRaw = "";
  emit();
}

export function useBookingDraft() {
  const subscribe = useCallback((cb: () => void) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
  }, []);
  const draft = useSyncExternalStore(subscribe, baca, () => draftKosong);
  return { draft, simpanDraft, hapusDraft };
}
