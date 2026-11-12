import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { deleteMyAccount } from "@/lib/account.functions";
import { PLANS, CREDIT_PACK } from "@/lib/pricing";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "Settings — Shopsite AI" }, { name: "description", content: "Manage your plan, data and email preferences." }, { property: "og:title", content: "Account — Shopsite AI" }, { property: "og:description", content: "Manage your account." }, { name: "robots", content: "noindex" }] }),
  component: Account,
});

function Account() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const del = useServerFn(deleteMyAccount);
  const p = useQuery({ queryKey: ["profile"], queryFn: async () => { const { data: u } = await supabase.auth.getUser(); const { data } = await supabase.from("profiles").select("*").eq("id", u.user!.id).single(); return data!; } });

  async function setMarketing(v: boolean) {
    const { error } = await supabase.from("profiles").update({ marketing_opt_in: v }).eq("id", p.data!.id);
    if (error) { toast.error("Couldn't save"); return; }
    qc.invalidateQueries({ queryKey: ["profile"] });
    toast.success(v ? "Subscribed to product tips" : "Unsubscribed from product tips");
  }
  async function exportData() {
    const [sites, usage] = await Promise.all([supabase.from("sites").select("*"), supabase.from("usage_events").select("*")]);
    const blob = new Blob([JSON.stringify({ profile: p.data, sites: sites.data, usage: usage.data }, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "shopsite-my-data.json"; a.click();
  }
  async function deleteAccount() {
    if (!confirm("Delete your account and all websites forever? This cannot be undone.")) return;
    try { await del(); qc.clear(); await supabase.auth.signOut(); toast.success("Account deleted"); navigate({ to: "/", replace: true }); }
    catch { toast.error("Couldn't delete account. Please contact us."); }
  }

  const box = "rounded-3xl border border-border bg-card p-6";
  return (
    <AppShell>
      <main className="mx-auto max-w-3xl space-y-6 px-5 pb-20 pt-10">
        <h1 className="text-5xl">Settings</h1>
        <section className={box}>
          <h2 className="text-3xl">Plan & billing</h2>
          <p className="mt-2">You're on <b className="capitalize">{p.data?.plan}</b> with <b>{p.data?.credits}</b> AI edits left.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {(["starter", "pro"] as const).map((k) => <div key={k} className="rounded-2xl bg-secondary p-4"><p className="font-display text-2xl">{PLANS[k].name}</p><p>${PLANS[k].priceCents / 100}/mo · {PLANS[k].monthlyCredits} edits</p></div>)}
            <div className="rounded-2xl bg-secondary p-4"><p className="font-display text-2xl">Credit pack</p><p>${CREDIT_PACK.priceCents / 100} · {CREDIT_PACK.credits} edits</p></div>
          </div>
          <p className="mt-4 rounded-xl bg-accent p-3 text-sm text-accent-foreground">Paid plans open very soon. We'll never charge you without your clear consent.</p>
        </section>
        <section className={box}>
          <h2 className="text-3xl">Emails</h2>
          <p className="mt-2 text-sm text-muted-foreground">Account emails (sign-in, password reset) are always sent. Product tips are optional.</p>
          <label className="mt-4 flex items-center gap-3"><input type="checkbox" checked={!!p.data?.marketing_opt_in} onChange={(e) => setMarketing(e.target.checked)} /> Send me product tips</label>
        </section>
        <section className={box}>
          <h2 className="text-3xl">Your data</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={exportData} className="rounded-full border-2 border-ink px-5 py-2">Download my data</button>
            <button onClick={deleteAccount} className="rounded-full border-2 border-destructive px-5 py-2 text-destructive">Delete my account</button>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
