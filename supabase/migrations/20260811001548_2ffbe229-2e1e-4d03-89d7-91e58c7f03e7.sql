CREATE OR REPLACE FUNCTION public.pakai_kuota(_jalur_id text, _tanggal date, _jumlah integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sisa integer;
BEGIN
  IF _jumlah IS NULL OR _jumlah < 1 THEN
    RAISE EXCEPTION 'Jumlah pendaki tidak valid';
  END IF;

  INSERT INTO public.daily_quotas (jalur_id, tanggal, kuota, terpakai)
  VALUES (_jalur_id, _tanggal, 150, 0)
  ON CONFLICT DO NOTHING;

  UPDATE public.daily_quotas
     SET terpakai = terpakai + _jumlah,
         updated_at = now()
   WHERE jalur_id = _jalur_id
     AND tanggal = _tanggal
     AND terpakai + _jumlah <= kuota
  RETURNING kuota - terpakai INTO sisa;

  IF sisa IS NULL THEN
    RAISE EXCEPTION 'Kuota jalur pada tanggal tersebut sudah habis';
  END IF;

  RETURN sisa;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS daily_quotas_jalur_tanggal_key
  ON public.daily_quotas (jalur_id, tanggal);

CREATE OR REPLACE FUNCTION public.batal_kuota(_jalur_id text, _tanggal date, _jumlah integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.daily_quotas
     SET terpakai = GREATEST(0, terpakai - COALESCE(_jumlah, 0)),
         updated_at = now()
   WHERE jalur_id = _jalur_id AND tanggal = _tanggal;
END;
$$;

CREATE OR REPLACE FUNCTION public.jadikan_admin_pertama()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Harus masuk terlebih dahulu';
  END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RETURN false;
  END IF;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), 'admin')
  ON CONFLICT DO NOTHING;
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.pakai_kuota(text, date, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.batal_kuota(text, date, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.jadikan_admin_pertama() TO authenticated;