import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Ticket, IdCard, CloudSun, ArrowRight } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import hero from "@/assets/hero-muria.jpg";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Kenali Muria Trail — Onboarding Pendaki" },
      {
        name: "description",
        content:
          "Tiga langkah singkat: pesan tiket online, registrasi pendaki resmi, dan pantau info jalur serta cuaca Gunung Muria.",
      },
      { property: "og:title", content: "Kenali Muria Trail" },
      {
        property: "og:description",
        content: "Pesan tiket, registrasi pendaki, dan pantau jalur & cuaca Gunung Muria.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Onboarding,
});

const slides = [
  {
    icon: Ticket,
    title: "Pesan tiket online",
    body: "Tanpa antre di basecamp. Pilih jalur, tanggal, dan bayar langsung dari genggaman.",
  },
  {
    icon: IdCard,
    title: "Registrasi pendaki resmi",
    body: "Data rombongan, NIK, kontak darurat, dan surat sehat tersimpan aman untuk keselamatanmu.",
  },
  {
    icon: CloudSun,
    title: "Info jalur & cuaca",
    body: "Pos pendakian, titik air, estimasi waktu, dan peringatan cuaca Muria secara real-time.",
  },
];

function Onboarding() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const slide = slides[step];
  const Icon = slide.icon;

  const next = () => {
    if (step < slides.length - 1) setStep(step + 1);
    else navigate({ to: "/masuk" });
  };

  return (
    <PhoneShell dark statusBarLight>
      <div className="relative flex flex-1 flex-col">
        <img
          src={hero}
          alt="Punggungan Gunung Muria berkabut"
          width={1024}
          height={1280}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 overlay-fog" />

        <div className="relative flex items-center justify-end px-6 pt-2">
          <Link to="/masuk" className="text-xs font-semibold text-primary-foreground/70">
            Lewati
          </Link>
        </div>

        <div className="relative flex flex-1 flex-col justify-end px-6 pb-8">
          <div key={step} className="animate-rise">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/18 text-accent">
              <Icon className="h-7 w-7" strokeWidth={1.5} />
            </span>
            <h2 className="mt-5 text-2xl font-extrabold leading-tight tracking-tight text-primary-foreground">
              {slide.title}
            </h2>
            <p className="mt-2.5 text-sm leading-relaxed text-primary-foreground/70">
              {slide.body}
            </p>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <div className="flex gap-1.5">
              {slides.map((s, i) => (
                <span
                  key={s.title}
                  className={`h-1.5 rounded-full transition-all ${
                    i === step ? "w-6 bg-accent" : "w-1.5 bg-primary-foreground/30"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="surface-sunrise flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-accent-foreground shadow-sunrise"
            >
              {step === slides.length - 1 ? "Masuk" : "Lanjut"}
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </PhoneShell>
  );
}
