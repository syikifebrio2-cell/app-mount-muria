REVOKE EXECUTE ON FUNCTION public.pakai_kuota(text, date, integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.batal_kuota(text, date, integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.jadikan_admin_pertama() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pakai_kuota(text, date, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.batal_kuota(text, date, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.jadikan_admin_pertama() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;