import { useState, useRef } from "react";
import {
  Award,
  Share2,
  Download,
  X,
  CheckCircle2,
  Mountain,
  Calendar,
  User,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo-muria.png";

export function SummitCertificateModal({
  isOpen,
  onClose,
  namaPendaki,
  jalurNama,
  tanggal,
  kodeBooking,
}: {
  isOpen: boolean;
  onClose: () => void;
  namaPendaki: string;
  jalurNama: string;
  tanggal: string;
  kodeBooking: string;
}) {
  const [downloading, setDownloading] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  function bagikanSertifikat() {
    const text = `🏆 *SERTIFIKAT DIGITAL PENDAKIAN GUNUNG MURIA*\n` +
      `Selamat kepada *${namaPendaki}* yang telah berhasil menaklukkan puncak Gunung Muria (${jalurNama}) pada tanggal ${tanggal}!\n` +
      `Nomor Sertifikat: MTR-CERT-${kodeBooking}\n` +
      `Diverifikasi oleh Balai Pengelola Pendakian Gunung Muria (Muria Trail).`;

    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
  }

  function simpanGambar() {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      toast.success("Sertifikat siap disimpan atau di-screenshot!");
    }, 800);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative flex w-full max-w-sm flex-col max-h-[92vh] overflow-hidden rounded-3xl bg-card border border-border shadow-2xl">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-5 py-3">
          <div className="flex items-center gap-1.5 text-primary">
            <Award className="h-5 w-5 text-accent" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider">E-Sertifikat Resmi</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-foreground hover:bg-secondary/80"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Badan Sertifikat (Desain Elegan Outdoor) */}
        <div className="no-scrollbar flex-1 overflow-y-auto p-4">
          <div
            ref={certRef}
            className="relative overflow-hidden rounded-2xl border-4 border-amber-600/40 bg-gradient-to-b from-[#143023] to-[#0A1A12] p-5 text-center text-primary-foreground shadow-xl select-none"
          >
            {/* Ornamen Sudut */}
            <div className="absolute top-2 left-2 h-4 w-4 border-t-2 border-l-2 border-amber-400/80" />
            <div className="absolute top-2 right-2 h-4 w-4 border-t-2 border-r-2 border-amber-400/80" />
            <div className="absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-amber-400/80" />
            <div className="absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-amber-400/80" />

            <div className="flex flex-col items-center">
              <img src={logo} alt="Logo Muria Trail" className="h-10 w-10 drop-shadow-md mb-2" />
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-amber-400">
                Balai Pengelola Kawasan Muria
              </p>
              <h2 className="mt-0.5 text-base font-extrabold tracking-tight text-white">
                SERTIFIKAT PENDAKIAN
              </h2>
              <div className="my-2 h-0.5 w-16 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

              <p className="text-[10px] text-white/70">Diberikan dengan bangga kepada:</p>
              <p className="mt-1 text-lg font-black text-amber-300 capitalize tracking-wide font-sans">
                {namaPendaki}
              </p>

              <p className="mt-2 text-[10px] text-white/80 leading-relaxed px-2">
                Telah berhasil mencapai puncak dan menyelesaikan pendakian dengan menjaga kelestarian alam:
              </p>

              {/* Box Puncak */}
              <div className="my-3 flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2 border border-white/10 backdrop-blur-sm">
                <Mountain className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-extrabold text-white">{jalurNama}</span>
              </div>

              {/* Rincian Verifikasi */}
              <div className="grid grid-cols-2 gap-2 text-[9px] text-white/70 w-full pt-1 border-t border-white/10">
                <div className="text-left">
                  <span className="block opacity-75">Tanggal Ekspedisi:</span>
                  <span className="font-bold text-white">{tanggal}</span>
                </div>
                <div className="text-right">
                  <span className="block opacity-75">No. Registrasi:</span>
                  <span className="font-mono font-bold text-amber-300">CERT-{kodeBooking}</span>
                </div>
              </div>

              {/* Badge Stempel Resmi */}
              <div className="mt-4 flex items-center justify-between w-full pt-2 text-[8px] text-white/60">
                <div className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Zero Waste Verified</span>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  <Sparkles className="h-3 w-3" />
                  <span>Summit Achiever</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="border-t border-border bg-card p-3 space-y-2">
          <button
            onClick={bagikanSertifikat}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 text-xs font-bold text-white shadow-sm active:scale-[0.98] transition-all"
          >
            <Share2 className="h-4 w-4" /> Bagikan ke WhatsApp & IG Story
          </button>
          <button
            onClick={simpanGambar}
            disabled={downloading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-secondary py-2 text-xs font-bold text-foreground active:bg-secondary/70"
          >
            <Download className="h-3.5 w-3.5 text-primary" />
            {downloading ? "Menyiapkan berkas..." : "Simpan Sertifikat"}
          </button>
        </div>
      </div>
    </div>
  );
}
