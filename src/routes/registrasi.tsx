import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Upload, CheckCircle2, ArrowRight, FileText } from "lucide-react";
import { PhoneShell, ScreenHeader } from "@/components/PhoneShell";

export const Route = createFileRoute("/registrasi")({
  head: () => ({
    meta: [
      { title: "Form Registrasi Pendaki — Muria Trail" },
      {
        name: "description",
        content:
          "Isi data diri pendaki: nama, NIK, kontak darurat, golongan darah, jumlah rombongan, serta unggah KTP dan surat sehat.",
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
  const [anggota, setAnggota] = useState(3);
  const [darah, setDarah] = useState("O");

  return (
    <PhoneShell>
      <ScreenHeader title="Registrasi pendaki" subtitle="Langkah 2 dari 4" back="/pesan" />
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-4">
        <div className="mb-4 h-1 overflow-hidden rounded-full bg-secondary">
          <div className="surface-sunrise h-full w-2/4 rounded-full" />
        </div>

        <SectionTitle>DATA KETUA ROMBONGAN</SectionTitle>
        <div className="mt-2.5 space-y-3">
          <Input label="Nama lengkap" placeholder="Sesuai KTP" />
          <Input label="NIK" placeholder="16 digit" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Tanggal lahir" placeholder="12/04/1998" />
            <Input label="No. HP aktif" placeholder="+62 8•• ••••" />
          </div>
          <Input label="Kontak darurat" placeholder="Nama & nomor keluarga" />
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground">Golongan darah</span>
            <div className="mt-1.5 grid grid-cols-4 gap-2">
              {golongan.map((g) => (
                <button
                  key={g}
                  onClick={() => setDarah(g)}
                  className={`rounded-xl border py-2.5 text-sm font-bold transition-colors ${
                    darah === g
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

        <SectionTitle className="mt-6">JUMLAH ANGGOTA ROMBONGAN</SectionTitle>
        <div className="mt-2.5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-card">
          <div className="min-w-0">
            <p className="text-sm font-semibold">Total pendaki</p>
            <p className="truncate text-[11px] text-muted-foreground">
              Termasuk ketua rombongan · maks. 10 orang
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Stepper icon={Minus} onClick={() => setAnggota(Math.max(1, anggota - 1))} />
            <span className="w-5 text-center text-base font-extrabold">{anggota}</span>
            <Stepper icon={Plus} onClick={() => setAnggota(Math.min(10, anggota + 1))} />
          </div>
        </div>
        <div className="mt-2.5 space-y-2">
          {Array.from({ length: anggota - 1 }, (_, i) => (
            <button
              key={i}
              className="flex w-full items-center justify-between rounded-2xl border border-dashed border-border px-3.5 py-3 text-left"
            >
              <span className="text-xs font-semibold text-muted-foreground">
                Anggota {i + 2} — isi nama & NIK
              </span>
              <Plus className="h-4 w-4 text-primary" strokeWidth={1.75} />
            </button>
          ))}
        </div>

        <SectionTitle className="mt-6">DOKUMEN WAJIB</SectionTitle>
        <div className="mt-2.5 space-y-2.5">
          <UploadCard title="Foto KTP ketua" state="done" note="ktp-raka.jpg · 420 KB" />
          <UploadCard title="Surat keterangan sehat" state="idle" note="JPG/PDF · maks. 2 MB" />
        </div>

        <label className="mt-4 flex items-start gap-2.5 rounded-2xl bg-secondary p-3">
          <input type="checkbox" defaultChecked className="mt-0.5 h-4 w-4 accent-[oklch(0.365_0.072_154)]" />
          <span className="text-[11px] leading-relaxed text-secondary-foreground">
            Saya menyatakan data benar dan bersedia mematuhi tata tertib pendakian Gunung Muria.
          </span>
        </label>
      </div>

      <div className="border-t border-border bg-card px-5 pb-6 pt-3">
        <Link
          to="/pembayaran"
          className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-card"
        >
          Lanjut ke ringkasan <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </Link>
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

function Input({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
      <input
        placeholder={placeholder}
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

function UploadCard({
  title,
  note,
  state,
}: {
  title: string;
  note: string;
  state: "idle" | "done";
}) {
  const done = state === "done";
  return (
    <button
      className={`grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border p-3.5 text-left ${
        done ? "border-success/40 bg-success/8" : "border-dashed border-border bg-card"
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          done ? "bg-success/15 text-success" : "bg-secondary text-primary"
        }`}
      >
        {done ? (
          <CheckCircle2 className="h-4.5 w-4.5" strokeWidth={1.75} />
        ) : (
          <FileText className="h-4.5 w-4.5" strokeWidth={1.5} />
        )}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold">{title}</span>
        <span className="block truncate text-[11px] text-muted-foreground">{note}</span>
      </span>
      <Upload className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
    </button>
  );
}
