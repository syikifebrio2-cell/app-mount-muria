import { useState, useEffect } from "react";
import {
  AlertTriangle,
  PhoneCall,
  MessageSquare,
  MapPin,
  ShieldAlert,
  X,
  Copy,
  Check,
  Compass,
  HeartPulse,
} from "lucide-react";
import { toast } from "sonner";

// Kontak resmi penanganan darurat kawasan Gunung Muria
const KONTAK_DARURAT = [
  { nama: "Basarnas / SAR Nasional", nomor: "115", tel: "115" },
  { nama: "BPBD Kab. Kudus", nomor: "0291-4251113", tel: "02914251113" },
  { nama: "Basecamp Rahtawu (Pokdarwis)", nomor: "081228994567", tel: "081228994567" },
  { nama: "Polsek Gebog (Kudus)", nomor: "0291-438110", tel: "0291438110" },
];

export function EmergencySosModal({
  isOpen,
  onClose,
  namaPendaki = "Pendaki",
}: {
  isOpen: boolean;
  onClose: () => void;
  namaPendaki?: string;
}) {
  const [coords, setCoords] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
    altitude: number | null;
  } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tabAktif, setTabAktif] = useState<"sos" | "p3k">("sos");

  // Baca koordinat GPS perangkat
  useEffect(() => {
    if (!isOpen) {
      setHoldProgress(0);
      setIsHolding(false);
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError("Perangkat tidak mendukung pembacaan GPS.");
      setGpsLoading(false);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          altitude: pos.coords.altitude ? Math.round(pos.coords.altitude) : null,
        });
        setGpsLoading(false);
      },
      (err) => {
        setGpsError("Aktifkan izin lokasi (GPS) pada perangkat.");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isOpen]);

  // Efek tombol hold 3 detik untuk mencegah kepencet tidak sengaja
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isHolding && holdProgress < 100) {
      timer = setInterval(() => {
        setHoldProgress((prev) => {
          if (prev >= 100) {
            triggerEmergencySms();
            setIsHolding(false);
            return 100;
          }
          return prev + 5;
        });
      }, 100);
    } else if (!isHolding && holdProgress > 0 && holdProgress < 100) {
      setHoldProgress(0);
    }
    return () => clearInterval(timer);
  }, [isHolding, holdProgress]);

  function triggerEmergencySms() {
    const latStr = coords ? coords.lat.toFixed(6) : "Tidak terdeteksi";
    const lngStr = coords ? coords.lng.toFixed(6) : "Tidak terdeteksi";
    const akurasiStr = coords ? `(±${coords.accuracy}m)` : "";
    const altStr = coords?.altitude ? `, elevasi ±${coords.altitude} mdpl` : "";

    const pesan = `[DARURAT GUNUNG MURIA] Saya ${namaPendaki} butuh pertolongan darurat SAR! Lokasi GPS: https://maps.google.com/?q=${latStr},${lngStr} ${akurasiStr}${altStr}. Kondisi: Butuh evakuasi segera.`;

    const smsUrl = `sms:081228994567?body=${encodeURIComponent(pesan)}`;
    window.location.href = smsUrl;
    toast.error("Format SMS Darurat dibuat! Kirim ke nomor SAR/Basecamp.");
  }

  function salinKoordinat() {
    if (!coords) return;
    const teks = `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
    navigator.clipboard.writeText(teks);
    setCopied(true);
    toast.success("Koordinat disalin ke clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="relative flex w-full max-w-md flex-col max-h-[90vh] overflow-hidden rounded-t-[2.5rem] sm:rounded-3xl border border-destructive/30 bg-card text-foreground shadow-2xl">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-border bg-destructive/10 px-5 py-4">
          <div className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="h-6 w-6 animate-pulse" />
            <div>
              <h2 className="text-base font-extrabold tracking-tight">SOS & Pusat Darurat</h2>
              <p className="text-[11px] font-medium text-destructive/80">
                Gunung Muria · Beroperasi tanpa internet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground hover:bg-secondary/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Pilihan */}
        <div className="flex border-b border-border bg-muted/40 p-1.5">
          <button
            onClick={() => setTabAktif("sos")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all ${
              tabAktif === "sos"
                ? "bg-card text-destructive shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" /> Sinyal Darurat
          </button>
          <button
            onClick={() => setTabAktif("p3k")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all ${
              tabAktif === "p3k"
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            <HeartPulse className="h-3.5 w-3.5" /> Panduan P3K
          </button>
        </div>

        {/* Isi Modal */}
        <div className="no-scrollbar flex-1 overflow-y-auto p-5 space-y-4">
          {tabAktif === "sos" ? (
            <>
              {/* Kartu Status Koordinat GPS */}
              <div className="rounded-2xl border border-border bg-secondary/50 p-3.5">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Compass className="h-3.5 w-3.5 text-primary" /> Koordinat Lokasi Anda (GPS)
                  </span>
                  {coords && (
                    <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">
                      Akurat ±{coords.accuracy}m
                    </span>
                  )}
                </div>

                {gpsLoading ? (
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Mengunci satelit GPS offline...
                  </div>
                ) : coords ? (
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div>
                      <p className="font-mono text-sm font-bold tracking-tight text-foreground">
                        {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                      </p>
                      {coords.altitude && (
                        <p className="text-[11px] text-muted-foreground">
                          Perkiraan Elevasi: ±{coords.altitude} mdpl
                        </p>
                      )}
                    </div>
                    <button
                      onClick={salinKoordinat}
                      className="flex items-center gap-1 rounded-xl border border-border bg-card px-2.5 py-1.5 text-[11px] font-bold text-primary active:bg-secondary"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? "Tersalin" : "Salin"}
                    </button>
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-destructive">
                    {gpsError || "Gagal membaca lokasi satelit."}
                  </p>
                )}
                <p className="mt-2 text-[10px] text-muted-foreground">
                  *GPS tetap aktif walau tidak ada kuota/sinyal internet.
                </p>
              </div>

              {/* Tombol SOS Utama (Hold to Activate) */}
              <div className="flex flex-col items-center justify-center py-2 text-center">
                <div className="relative">
                  {/* Lingkaran Pulsa Efek Radar */}
                  <span className="absolute -inset-3 animate-ping rounded-full bg-destructive/20 opacity-75" />
                  <button
                    onMouseDown={() => setIsHolding(true)}
                    onMouseUp={() => setIsHolding(false)}
                    onTouchStart={() => setIsHolding(true)}
                    onTouchEnd={() => setIsHolding(false)}
                    className="relative flex h-32 w-32 flex-col items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-2xl transition-transform active:scale-95 select-none"
                  >
                    <AlertTriangle className="h-9 w-9 mb-1" />
                    <span className="text-sm font-extrabold tracking-wider">TEKAN SOS</span>
                    <span className="text-[9px] opacity-80">Tahan 3 Detik</span>

                    {/* Progress Fill Lingkaran */}
                    {holdProgress > 0 && (
                      <div
                        className="absolute inset-0 rounded-full border-4 border-white transition-all"
                        style={{ opacity: holdProgress / 100 }}
                      />
                    )}
                  </button>
                </div>
                <div className="mt-3 w-48 overflow-hidden rounded-full bg-secondary h-1.5">
                  <div
                    className="h-full bg-destructive transition-all duration-100"
                    style={{ width: `${holdProgress}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] font-medium text-muted-foreground">
                  Otomatis membuka SMS darurat berkoordinat ke SAR Muria.
                </p>
              </div>

              {/* Kontak Cepat Telepon Darurat */}
              <div>
                <h3 className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1.5">
                  <PhoneCall className="h-3.5 w-3.5 text-destructive" /> Panggilan Darurat Langsung
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {KONTAK_DARURAT.map((k) => (
                    <a
                      key={k.nomor}
                      href={`tel:${k.tel}`}
                      className="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-sm active:bg-secondary transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{k.nama}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">{k.nomor}</p>
                      </div>
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                        <PhoneCall className="h-3.5 w-3.5" />
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Tab Panduan P3K Lapangan */
            <div className="space-y-3">
              <div className="rounded-2xl border border-border bg-card p-3.5">
                <h4 className="text-xs font-bold text-destructive flex items-center gap-1.5">
                  🥶 Penanganan Hipotermia (Kedinginan Akut)
                </h4>
                <ul className="mt-2 space-y-1.5 text-[11px] text-foreground/80 list-disc pl-4 leading-relaxed">
                  <li>Ganti segera pakaian basah dengan pakaian kering tebal.</li>
                  <li>Masukkan korban ke dalam sleeping bag & lindungi dari angin.</li>
                  <li>Beri minuman manis hangat (JANGAN beri kopi atau alkohol).</li>
                  <li>Hangatkan bagian dada dan ketiak korban dengan botol air hangat.</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-card p-3.5">
                <h4 className="text-xs font-bold text-accent flex items-center gap-1.5">
                  🦶 Kaki Terkilir / Cedera Otot Jalur
                </h4>
                <ul className="mt-2 space-y-1.5 text-[11px] text-foreground/80 list-disc pl-4 leading-relaxed">
                  <li><strong>Istirahatkan</strong> kaki yang cedera, jangan dipaksa berjalan.</li>
                  <li>Kompres dingin bila tersedia air mengalir untuk meredakan bengkak.</li>
                  <li>Balut dengan perban elastis tapi jangan terlalu kencang.</li>
                  <li>Jika cedera parah di tebing Natas Angin, hubungi SAR untuk tandu.</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-card p-3.5">
                <h4 className="text-xs font-bold text-primary flex items-center gap-1.5">
                  🧭 Tersesat di Jalur Kabut (Metode S.T.O.P)
                </h4>
                <ul className="mt-2 space-y-1.5 text-[11px] text-foreground/80 list-disc pl-4 leading-relaxed">
                  <li><strong>Stop</strong>: Jangan panik dan berhenti bergerak lebih jauh.</li>
                  <li><strong>Think</strong>: Ingat kapan terakhir kali melihat tanda pos/jalur.</li>
                  <li><strong>Observe</strong>: Amati sumber air, jurang, dan arah angin.</li>
                  <li><strong>Plan</strong>: Tiup peluit (3 tiupan = kode darurat internasional) atau nyalakan SOS aplikasi.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-muted/30 px-5 py-3 text-center">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-secondary py-2.5 text-xs font-bold text-foreground hover:bg-secondary/80"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
