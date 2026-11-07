import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const id = context.userId;
    await supabaseAdmin.from("site_messages").delete().eq("user_id", id);
    await supabaseAdmin.from("sites").delete().eq("user_id", id);
    await supabaseAdmin.from("usage_events").delete().eq("user_id", id);
    await supabaseAdmin.from("feedback").delete().eq("user_id", id);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (error) throw new Error("Could not delete account");
    return { ok: true };
  });

export const getAdminStats = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const [p, u, pay, f] = await Promise.all([
      context.supabase.from("profiles").select("id,email,plan,credits,created_at").order("created_at", { ascending: false }).limit(500),
      context.supabase.from("usage_events").select("user_id,cost_usd,credits").limit(10000),
      context.supabase.from("payments").select("user_id,amount_cents").limit(10000),
      context.supabase.from("feedback").select("id,email,message,created_at").order("created_at", { ascending: false }).limit(50),
    ]);
    const rows = (p.data ?? []).map((pr) => {
      const cost = (u.data ?? []).filter((x) => x.user_id === pr.id).reduce((s, x) => s + Number(x.cost_usd), 0);
      const edits = (u.data ?? []).filter((x) => x.user_id === pr.id).reduce((s, x) => s + x.credits, 0);
      const revenue = (pay.data ?? []).filter((x) => x.user_id === pr.id).reduce((s, x) => s + x.amount_cents, 0) / 100;
      return { ...pr, cost, edits, revenue, margin: revenue - cost };
    });
    return { rows, feedback: f.data ?? [] };
  });
