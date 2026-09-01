import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Phone, Mail, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PhoneShell } from "@/components/PhoneShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo-muria.png";

export const Route = createFileRoute("/masuk")({
  head: () => ({
    meta: [
      { title: "Masuk atau Daftar — Muria Trail" },
      {
        name: "description",
        content:
          "Masuk ke Muria Trail dengan nomor HP, email, atau akun Google untuk memesan tiket pendakian Gunung Muria.",
      },
      { property: "og:title", content: "Masuk atau Daftar — Muria Trail" },
      {
        property: "og:description",
        content: "Masuk dengan nomor HP, email, atau Google untuk mulai mendaki Gunung Muria.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Masuk,
});

function Masuk() {
  const [mode, setMode] = useState<"masuk" | "daftar">("masuk");
  const [via, setVia] = useState<"hp" | "email">("email");
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [sandi, setSandi] = useState("");
  const [proses, setProses] = useState(false);
  const [galat, setGalat] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/beranda" });
  }, [user, loading, navigate]);

  // Nomor HP dipetakan ke email internal agar bisa dipakai sebagai kredensial.
  const emailLogin = () =>
    via === "email" ? email.trim() : `${hp.replace(/\D/g, "")}@hp.muriatrail.app`;

  function validasi() {
    const e: Record<string, string> = {};
    if (mode === "daftar" && nama.trim().length < 3) e.nama = "Nama minimal 3 huruf";
    if (via === "email") {
      if (!email.trim()) e.email = "Email wajib diisi";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()))
        e.email = "Format email belum benar";
    } else {
      const digit = hp.replace(/\D/g, "");
      if (!digit) e.hp = "Nomor HP wajib diisi";
      else if (!/^08\d{8,11}$/.test(digit)) e.hp = "Nomor HP harus diawali 08, 10–13 digit";
    }
    if (!sandi) e.sandi = "Kata sandi wajib diisi";
    else if (sandi.length < 6) e.sandi = "Kata sandi minimal 6 karakter";
    setGalat(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!validasi()) {
      toast.error("Periksa kembali data yang kamu isi");
      return;
    }
    setProses(true);
    try {
      if (mode === "daftar") {
        const { error } = await supabase.auth.signUp({
          email: emailLogin(),
          password: sandi,
          options: {
            emailRedirectTo: `${window.location.origin}/beranda`,
            data: { nama_lengkap: nama, no_hp: hp },
          },
        });
        if (error) throw error;
        toast.success("Akun dibuat. Selamat datang, pendaki!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailLogin(),
          password: sandi,
        });
        if (error) throw error;
        toast.success("Berhasil masuk");
      }
      navigate({ to: "/beranda" });
    } catch (e) {
      const pesan = e instanceof Error ? e.message : "Gagal memproses";
      toast.error(
        pesan.includes("Invalid login")
          ? "Email/nomor atau kata sandi salah"
          : pesan.includes("already registered")
            ? "Akun sudah terdaftar, silakan masuk"
            : pesan,
      );
    } finally {
      setProses(false);
    }
  }

  async function google() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/beranda` },
    });
    if (error) toast.error(error.message);
  }

  return (
    <PhoneShell>
      <div className="flex flex-1 flex-col px-6 pb-8 pt-6">
        <img src={logo} alt="Logo Muria Trail" width={512} height={512} loading="lazy" className="h-12 w-12" />
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight">
          {mode === "masuk" ? "Selamat datang kembali" : "Buat akun pendaki"}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Satu akun untuk tiket, registrasi, dan riwayat pendakianmu.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-1 rounded-2xl bg-secondary p-1">
          {(["masuk", "daftar"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setGalat({});
              }}
              className={`rounded-xl py-2 text-xs font-bold capitalize transition-colors ${
                mode === m ? "bg-card text-primary shadow-card" : "text-secondary-foreground/70"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="mt-5 flex gap-2">
          <TabPill
            active={via === "hp"}
            onClick={() => {
              setVia("hp");
              setGalat({});
            }}
            icon={Phone}
            label="Nomor HP"
          />
          <TabPill
            active={via === "email"}
            onClick={() => {
              setVia("email");
              setGalat({});
            }}
            icon={Mail}
            label="Email"
          />
        </div>

        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          {mode === "daftar" ? (
            <Field
              label="Nama lengkap"
              placeholder="Nama sesuai KTP"
              value={nama}
              onChange={setNama}
              error={galat.nama}
            />
          ) : null}
          {via === "hp" ? (
            <Field
              label="Nomor HP"
              placeholder="08xx xxxx xxxx"
              prefix="ID"
              value={hp}
              onChange={setHp}
              type="tel"
              error={galat.hp}
            />
          ) : (
            <Field
              label="Email"
              placeholder="nama@email.com"
              value={email}
              onChange={setEmail}
              type="email"
              error={galat.email}
            />
          )}
          <Field
            label="Kata sandi"
            placeholder="minimal 6 karakter"
            value={sandi}
            onChange={setSandi}
            type="password"
            error={galat.sandi}
          />
          <button
            type="submit"
            disabled={proses}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-card disabled:opacity-60"
          >
            {proses ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} /> : null}
            {mode === "masuk" ? "Masuk" : "Daftar sekarang"}
          </button>
        </form>


        <div className="my-5 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> atau <span className="h-px flex-1 bg-border" />
        </div>

        <button
          onClick={google}
          className="flex items-center justify-center gap-2.5 rounded-2xl border border-border bg-card py-3.5 text-sm font-semibold shadow-card"
        >
          <GoogleMark />
          Lanjutkan dengan Google
        </button>

        <Link to="/jalur" className="mt-4 text-center text-[11px] font-semibold text-muted-foreground">
          Lihat info jalur tanpa masuk
        </Link>

        <div className="mt-auto flex items-start gap-2 pt-6 text-[11px] leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
          <p>
            Data pendaki dienkripsi dan hanya dipakai untuk keperluan keselamatan serta pendataan
            resmi pengelola kawasan.
          </p>
        </div>
      </div>
    </PhoneShell>
  );
}

function TabPill({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Phone;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border py-2.5 text-xs font-semibold transition-colors ${
        active
          ? "border-primary bg-primary/8 text-primary"
          : "border-border bg-card text-muted-foreground"
      }`}
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
      {label}
    </button>
  );
}

function Field({
  label,
  placeholder,
  prefix,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  placeholder: string;
  prefix?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
      <div className="mt-1.5 flex items-center gap-2 rounded-2xl border border-input bg-card px-4 py-3 shadow-card focus-within:border-ring">
        {prefix ? (
          <span className="shrink-0 border-r border-border pr-2 text-xs font-bold text-muted-foreground">
            {prefix}
          </span>
        ) : null}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
        />
      </div>
    </label>
  );
}

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2.5 24 .5 14.6.5 6.5 5.9 2.6 13.7l7.8 6.1C12.3 13.9 17.6 9.5 24 9.5Z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.1-10 7.1-17.5Z" />
      <path fill="#FBBC05" d="M10.4 28.2a14.6 14.6 0 0 1 0-8.4l-7.8-6.1a23.6 23.6 0 0 0 0 20.6l7.8-6.1Z" />
      <path fill="#34A853" d="M24 47.5c6.2 0 11.5-2 15.4-5.6l-7.5-5.8c-2.1 1.4-4.8 2.2-7.9 2.2-6.4 0-11.7-4.3-13.6-10.1l-7.8 6.1C6.5 42.1 14.6 47.5 24 47.5Z" />
    </svg>
  );
}
