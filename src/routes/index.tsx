import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import logo from "@/assets/logo-muria.png";
import hero from "@/assets/hero-muria.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Muria Trail — Tiket & Registrasi Pendakian Gunung Muria" },
      {
        name: "description",
        content:
          "Pesan tiket pendakian Gunung Muria, Jepara: registrasi pendaki, kuota harian, info jalur Colo & Rahtawu, cuaca real-time, dan e-tiket QR offline.",
      },
      { property: "og:title", content: "Muria Trail — Tiket & Registrasi Pendakian Gunung Muria" },
      {
        property: "og:description",
        content:
          "Pesan tiket pendakian Gunung Muria, Jepara: registrasi pendaki, kuota harian, info jalur Colo & Rahtawu, cuaca real-time, dan e-tiket QR offline.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Splash,
});

function Splash() {
  return (
    <PhoneShell dark statusBarLight>
      <div className="relative flex flex-1 flex-col">
        <img
          src={hero}
          alt="Puncak Gunung Muria berselimut kabut saat matahari terbit"
          width={1024}
          height={1280}
          className="absolute inset-0 h-full w-full animate-fog object-cover opacity-70"
        />
        <div className="absolute inset-0 overlay-fog" />

        <div className="relative flex flex-1 flex-col items-center justify-center px-8 text-center">
          <img
            src={logo}
            alt="Logo Muria Trail"
            width={512}
            height={512}
            className="h-24 w-24 animate-rise drop-shadow-lg"
          />
          <h1 className="mt-5 animate-rise text-3xl font-extrabold tracking-tight text-primary-foreground">
            Muria Trail
          </h1>
          <p className="mt-2 animate-rise text-sm text-primary-foreground/75">
            Pendakian Gunung Muria · Jepara
          </p>
          <div className="mt-8 flex items-center gap-2 text-[11px] font-medium text-primary-foreground/60">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground/25 border-t-accent" />
            Menyiapkan data jalur & kuota…
          </div>
        </div>

        <div className="relative px-6 pb-8">
          <Link
            to="/onboarding"
            className="surface-sunrise flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-accent-foreground shadow-sunrise"
          >
            Mulai <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
          <p className="mt-3 text-center text-[10px] text-primary-foreground/50">
            Balai Pengelola Pendakian Gunung Muria
          </p>
        </div>
      </div>
    </PhoneShell>
  );
}
