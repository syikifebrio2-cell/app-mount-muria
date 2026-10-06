import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Akun Nomor HP memakai email sintetis yang tidak bisa menerima email konfirmasi.
// Fungsi ini mengonfirmasi akun lama yang tertahan (pendaftaran baru sudah auto-confirm).
export const konfirmasiAkunHp = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ email: z.string().regex(/^[0-9]{9,15}@hp\.muriatrail\.app$/) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    if (error) throw error;
    const user = list.users.find((u) => u.email === data.email);
    if (!user || user.email_confirmed_at) return { ok: true };
    await supabaseAdmin.auth.admin.updateUserById(user.id, { email_confirm: true });
    return { ok: true };
  });
