
-- roles
CREATE TYPE public.app_role AS ENUM ('admin','pendaki');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "admins read all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama_lengkap text,
  no_hp text,
  nik text,
  tanggal_lahir date,
  golongan_darah text,
  alamat text,
  kontak_darurat_nama text,
  kontak_darurat_hp text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nama_lengkap, no_hp)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'nama_lengkap', NEW.raw_user_meta_data->>'no_hp')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'pendaki') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- trail status
CREATE TABLE public.trail_status (
  jalur_id text PRIMARY KEY,
  status text NOT NULL DEFAULT 'buka',
  catatan text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.trail_status TO anon, authenticated;
GRANT ALL ON public.trail_status TO service_role;
ALTER TABLE public.trail_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trail status public read" ON public.trail_status FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin manage trail status" ON public.trail_status FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- quotas
CREATE TABLE public.daily_quotas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jalur_id text NOT NULL,
  tanggal date NOT NULL,
  kuota int NOT NULL DEFAULT 150,
  terpakai int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (jalur_id, tanggal)
);
GRANT SELECT ON public.daily_quotas TO anon, authenticated;
GRANT ALL ON public.daily_quotas TO service_role;
ALTER TABLE public.daily_quotas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quota public read" ON public.daily_quotas FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin manage quota" ON public.daily_quotas FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- bookings
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kode_booking text NOT NULL UNIQUE,
  jalur_id text NOT NULL,
  jalur_nama text NOT NULL,
  tanggal_naik date NOT NULL,
  jam_mulai text,
  tipe text NOT NULL DEFAULT 'tektok',
  jumlah_pendaki int NOT NULL DEFAULT 1,
  pakai_ojek boolean NOT NULL DEFAULT false,
  jumlah_motor int NOT NULL DEFAULT 0,
  rincian_biaya jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_biaya int NOT NULL DEFAULT 0,
  metode_pembayaran text,
  status_pembayaran text NOT NULL DEFAULT 'pending',
  status_pendakian text NOT NULL DEFAULT 'terjadwal',
  checkin_at timestamptz,
  checkout_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own bookings select" ON public.bookings FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own bookings insert" ON public.bookings FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "own bookings update" ON public.bookings FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX bookings_user_idx ON public.bookings(user_id);

-- members
CREATE TABLE public.booking_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  nama text NOT NULL,
  nik text,
  no_hp text,
  golongan_darah text,
  is_ketua boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.booking_members TO authenticated;
GRANT ALL ON public.booking_members TO service_role;
ALTER TABLE public.booking_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members via booking" ON public.booking_members FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND (b.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))))
WITH CHECK (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND b.user_id = auth.uid()));
CREATE INDEX booking_members_booking_idx ON public.booking_members(booking_id);

-- seed
INSERT INTO public.trail_status (jalur_id, status, catatan) VALUES
 ('rahtawu_songolikur','buka','Jalur normal, kabut tebal setelah pukul 14.00 WIB.'),
 ('rahtawu_natasangin','waspada','Punggungan licin setelah hujan. Wajib pendamping berpengalaman.'),
 ('tempur','buka','Data pos & tarif masih menunggu verifikasi Pokdarwis.'),
 ('colo_ziarah','buka','Kawasan ziarah buka subuh hingga malam.');

INSERT INTO public.daily_quotas (jalur_id, tanggal, kuota, terpakai) VALUES
 ('rahtawu_songolikur', CURRENT_DATE, 150, 92),
 ('rahtawu_songolikur', CURRENT_DATE + 1, 150, 41),
 ('rahtawu_songolikur', CURRENT_DATE + 2, 150, 18),
 ('rahtawu_natasangin', CURRENT_DATE, 60, 37),
 ('rahtawu_natasangin', CURRENT_DATE + 1, 60, 12),
 ('tempur', CURRENT_DATE, 80, 9),
 ('colo_ziarah', CURRENT_DATE, 300, 120);
