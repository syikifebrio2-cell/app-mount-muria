import { useEffect, useState, useRef } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Minus,
  Plus,
  ArrowRight,
  Camera,
  Upload,
  CheckCircle2,
  Trash2,
  FileCheck,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { PhoneShell, ScreenHeader } from "@/components/PhoneShell";
import { useAuth, useProfil } from "@/hooks/useAuth";
import { useBookingDraft, simpanDraft, type Anggota } from "@/lib/booking-draft";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/registrasi")({
  head: () => ({
    meta: [
      { title: "Form Registrasi Pendaki — Muria Trail" },
      {
        name: "description",
        content:
          "Isi data diri pendaki: nama, NIK, kontak darurat, golongan darah, jumlah rombongan, serta dokumen wajib pendakian Gunung Muria.",
      },
      { property: "og:title", content: "Form Registrasi Pendaki — Muria Trail" },
      {
        property: "og:description",
        content: "Data diri, rombongan, dan dokumen wajib pendakian Gunung Muria.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Registrasi,
});

const golongan = ["A", "B", "AB", "O"];

function Registrasi() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profil } = useProfil(user?.id);
  const { draft } = useBookingDraft();

  const [ketua, setKetua] = useState(draft.ketua);
  const [anggota, setAnggota] = useState<Anggota[]>(draft.anggota);
  const [jumlah, setJumlah] = useState(draft.jumlah_pendaki || 1);
  const [setuju, setSetuju] = useState(true);

  // State Dokumen Pendaki
  const [fotoKtp, setFotoKtp] = useState<string | null>(null);
  const [fotoSuratSehat, setFotoSuratSehat] = useState<string | null>(null);
  const fileInputKtpRef = useRef<HTMLInputElement>(null);
  const fileInputSehatRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!profil) return;
    setKetua((k) => ({
      ...k,
      nama: k.nama || profil.nama_lengkap || "",
      nik: k.nik || profil.nik || "",
      no_hp: k.no_hp || profil.no_hp || "",
      golongan_darah: k.golongan_darah || profil.golongan_darah || "O",
      kontak_darurat_nama: k.kontak_darurat_nama || profil.kontak_darurat_nama || "",
      kontak_darurat_hp: k.kontak_darurat_hp || profil.kontak_darurat_hp || "",
    }));
  }, [profil]);

  useEffect(() => {
    setAnggota((a) => {
      const perlu = Math.max(0, jumlah - 1);
      if (a.length === perlu) return a;
      const next = a.slice(0, perlu);
      while (next.length < perlu) next.push({ nama: "", nik: "" });
      return next;
    });
  }, [jumlah]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>, tipe: "ktp" | "sehat") {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (tipe === "ktp") {
        setFotoKtp(reader.result as string);
        toast.success("Foto KTP berhasil dipilih!");
      } else {
        setFotoSuratSehat(reader.result as string);
        toast.success("Surat Keterangan Sehat berhasil dipilih!");
      }
    };
    reader.readAsDataURL(file);
  }

  async function lanjut() {
    if (!ketua.nama.trim() || !ketua.no_hp?.trim()) {
      toast.error("Nama dan nomor HP ketua wajib diisi");
      return;
    }
    if (!setuju) {
      toast.error("Centang pernyataan tata tertib dulu");
      return;
    }
    const { rincian, total, jumlah_pendaki } = draft;
    const faktor = jumlah_pendaki ? jumlah / jumlah_pendaki : 1;
    simpanDraft({
      ketua,
      anggota,
      jumlah_pendaki: jumlah,
      rincian,
      total: Math.round(total * (rincian.length ? faktor : 1)),
    });

    if (user) {
      await supabase.from("profiles").upsert({
        id: user.id,
        nama_lengkap: ketua.nama,
        no_hp: ketua.no_hp,
        nik: ketua.nik || null,
        golongan_darah: ketua.golongan_darah,
        kontak_darurat_nama: ketua.kontak_darurat_nama || null,
        kontak_darurat_hp: ketua.kontak_darurat_hp || null,
      });
    }
    navigate({ to: "/pembayaran" });
  }

  return (
    <PhoneShell>
      <ScreenHeader title="Registrasi pendaki" subtitle="Langkah 2 dari 4" back="/pesan" />
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-4">
        <div className="mb-4 h-1 overflow-hidden rounded-full bg-secondary">
          <div className="surface-sunrise h-full w-2/4 rounded-full" />
        </div>

        <SectionTitle>DATA KETUA ROMBONGAN</SectionTitle>
        <div className="mt-2.5 space-y-3">
          <Input
            label="Nama lengkap"
            placeholder="Sesuai KTP"
            value={ketua.nama}
            onChange={(v) => setKetua({ ...ketua, nama: v })}
          />
          <Input
            label="NIK"
            placeholder="16 digit"
            value={ketua.nik}
            onChange={(v) => setKetua({ ...ketua, nik: v })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Kontak darurat"
              placeholder="Nama keluarga"
              value={ketua.kontak_darurat_nama}
              onChange={(v) => setKetua({ ...ketua, kontak_darurat_nama: v })}
            />
            <Input
              label="No. HP aktif"
              placeholder="08xx xxxx"
              value={ketua.no_hp ?? ""}
              onChange={(v) => setKetua({ ...ketua, no_hp: v })}
            />
          </div>
          <Input
            label="No. HP kontak darurat"
            placeholder="08xx xxxx xxxx"
            value={ketua.kontak_darurat_hp}
            onChange={(v) => setKetua({ ...ketua, kontak_darurat_hp: v })}
          />
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground">Golongan darah</span>
            <div className="mt-1.5 grid grid-cols-4 gap-2">
              {golongan.map((g) => (
                <button
                  key={g}
                  onClick={() => setKetua({ ...ketua, golongan_darah: g })}
                  className={`rounded-xl border py-2.5 text-sm font-bold transition-colors ${
                    ketua.golongan_darah === g
                      ? "border-primary bg-primary/8 text-primary"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* UPLOAD DOKUMEN IDENTITAS & KESEHATAN */}
        <SectionTitle className="mt-6">DOKUMEN WAJIB PENDAKIAN</SectionTitle>
        <p className="mt-1 text-[11px] text-muted-foreground">
          SOP Balai Pengelola: Foto identitas asli & surat keterangan sehat.
        </p>

        <div className="mt-2.5 space-y-3">
          {/* Box Upload KTP */}
          <div className="rounded-2xl border border-border bg-card p-3.5 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold flex items-center gap-1.5">
                <FileCheck className="h-4 w-4 text-primary" /> Foto KTP / Kartu Identitas
              </span>
              {fotoKtp && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-success">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Terunggah
                </span>
              )}
            </div>

            {fotoKtp ? (
              <div className="relative rounded-xl overflow-hidden border border-border">
                <img src={fotoKtp} alt="Preview KTP" className="h-28 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setFotoKtp(null)}
                  className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-white shadow-sm"
                  title="Hapus foto"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputKtpRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-4 px-3 cursor-pointer hover:bg-secondary/40 active:bg-secondary transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-1.5">
                  <Camera className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-foreground">Ambil Foto / Pilih Berkas KTP</p>
                <p className="text-[10px] text-muted-foreground">JPG, PNG (Maks. 5MB)</p>
              </div>
            )}
            <input
              ref={fileInputKtpRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e, "ktp")}
            />
          </div>

          {/* Box Upload Surat Sehat */}
          <div className="rounded-2xl border border-border bg-card p-3.5 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-accent" /> Surat Keterangan Sehat Puskesmas
              </span>
              {fotoSuratSehat && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-success">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Terunggah
                </span>
              )}
            </div>

            {fotoSuratSehat ? (
              <div className="relative rounded-xl overflow-hidden border border-border">
                <img src={fotoSuratSehat} alt="Preview Surat Sehat" className="h-28 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setFotoSuratSehat(null)}
                  className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-white shadow-sm"
                  title="Hapus foto"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputSehatRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-4 px-3 cursor-pointer hover:bg-secondary/40 active:bg-secondary transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent mb-1.5">
                  <Upload className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-foreground">Upload Surat Sehat (Opsional)</p>
                <p className="text-[10px] text-muted-foreground">Bisa ditunjukkan fisik saat di basecamp</p>
              </div>
            )}
            <input
              ref={fileInputSehatRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => handleFileSelect(e, "sehat")}
            />
          </div>
        </div>

        {/* JUMLAH ANGGOTA ROMBONGAN */}
        <SectionTitle className="mt-6">JUMLAH ANGGOTA ROMBONGAN</SectionTitle>
        <div className="mt-2.5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-card">
          <div className="min-w-0">
            <p className="text-sm font-semibold">Total pendaki</p>
            <p className="truncate text-[11px] text-muted-foreground">
              Termasuk ketua rombongan · maks. 10 orang
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Stepper icon={Minus} onClick={() => setJumlah(Math.max(1, jumlah - 1))} />
            <span className="w-5 text-center text-base font-extrabold">{jumlah}</span>
            <Stepper icon={Plus} onClick={() => setJumlah(Math.min(10, jumlah + 1))} />
          </div>
        </div>
        <div className="mt-2.5 space-y-2">
          {anggota.map((a, i) => (
            <div
              key={i}
              className="grid grid-cols-2 gap-2 rounded-2xl border border-border bg-card p-3 shadow-card"
            >
              <Input
                label={`Anggota ${i + 2} — nama`}
                placeholder="Nama lengkap"
                value={a.nama}
                onChange={(v) =>
                  setAnggota(anggota.map((x, j) => (j === i ? { ...x, nama: v } : x)))
                }
              />
              <Input
                label="NIK"
                placeholder="16 digit"
                value={a.nik}
                onChange={(v) => setAnggota(anggota.map((x, j) => (j === i ? { ...x, nik: v } : x)))}
              />
            </div>
          ))}
        </div>

        <label className="mt-4 flex items-start gap-2.5 rounded-2xl bg-secondary p-3">
          <input
            type="checkbox"
            checked={setuju}
            onChange={(e) => setSetuju(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[oklch(0.365_0.072_154)]"
          />
          <span className="text-[11px] leading-relaxed text-secondary-foreground">
            Saya menyatakan data benar dan bersedia mematuhi tata tertib pendakian Gunung Muria.
          </span>
        </label>
      </div>

      <div className="border-t border-border bg-card px-5 pb-6 pt-3">
        <button
          onClick={lanjut}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-card"
        >
          Lanjut ke ringkasan <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </PhoneShell>
  );
}

function SectionTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <h2 className={`text-xs font-bold text-muted-foreground ${className}`}>{children}</h2>;
}

function Input({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
      <input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm shadow-card outline-none placeholder:text-muted-foreground/60 focus:border-ring"
      />
    </label>
  );
}

function Stepper({ icon: Icon, onClick }: { icon: typeof Plus; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-foreground"
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
    </button>
  );
}
