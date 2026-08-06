import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Profil = {
  id: string;
  nama_lengkap: string | null;
  no_hp: string | null;
  nik: string | null;
  tanggal_lahir: string | null;
  golongan_darah: string | null;
  alamat: string | null;
  kontak_darurat_nama: string | null;
  kontak_darurat_hp: string | null;
};

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, user, loading };
}

export function useProfil(userId?: string) {
  const [profil, setProfil] = useState<Profil | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let aktif = true;
    if (!userId) {
      setProfil(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!aktif) return;
        setProfil((data as Profil) ?? null);
        setLoading(false);
      });
    return () => {
      aktif = false;
    };
  }, [userId]);

  return { profil, loading, setProfil };
}
