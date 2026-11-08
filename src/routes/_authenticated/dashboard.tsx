import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { siteLimit } from "@/lib/pricing";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Shopsite AI" }, { name: "description", content: "Your websites and AI edits." }, { property: "og:title", content: "Dashboard — Shopsite AI" }, { property: "og:description", content: "Your websites and AI edits." }, { name: "robots", content: "noindex" }] }),
  component: Dashboard,
});

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data, error } = await supabase.from("profiles").select("*").eq("id", u.user!.id).single();
      if (error) throw error;
      const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: u.user!.id, _role: "admin" });
      return { ...data, isAdmin: !!isAdmin };
    },
  });
}

function Dashboard() {
  const profile = useProfile();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const sites = useQuery({
    queryKey: ["sites"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sites").select("id,name,published,updated_at").order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function createSite() {
    const limit = siteLimit(profile.data?.plan ?? "free");
    if ((sites.data?.length ?? 0) >= limit) { toast.error(`Your plan allows ${limit} site${limit > 1 ? "s" : ""}. Upgrade for more.`); return; }
    const { data: u } = await supabase.auth.getUser();
    const { data, error } = await supabase.from("sites").insert({ user_id: u.user!.id, name: "My website" }).select("id").single();
    if (error) { toast.error("Couldn't create site"); return; }
    qc.invalidateQueries({ queryKey: ["sites"] });
    navigate({ to: "/sites/$id", params: { id: data.id } });
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-5 pb-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-5xl">Your websites</h1>
            <p className="mt-2 text-muted-foreground">Plan: <b className="capitalize text-foreground">{profile.data?.plan ?? "…"}</b> · AI edits left: <b className="text-foreground">{profile.data?.credits ?? "…"}</b></p>
          </div>
          <div className="flex gap-3">
            {profile.data?.isAdmin && <Link to="/admin" className="rounded-full border-2 border-ink bg-card px-5 py-3">Admin</Link>}
            <Link to="/account" className="rounded-full border-2 border-ink bg-card px-5 py-3">Billing & account</Link>
            <button onClick={createSite} className="rounded-full border-2 border-ink bg-primary px-5 py-3 font-medium text-primary-foreground shadow-pop">+ New website</button>
          </div>
        </div>
        {profile.data && profile.data.credits <= 2 && (
          <div className="mt-6 rounded-2xl border-2 border-ink bg-secondary p-4">You're almost out of AI edits. <Link to="/account" className="text-primary underline">Get more</Link></div>
        )}
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {sites.isLoading && <p className="text-muted-foreground">Loading…</p>}
          {sites.data?.length === 0 && <div className="col-span-full rounded-3xl border-2 border-dashed border-ink p-10 text-center"><p className="font-display text-3xl">No websites yet</p><p className="mt-2 text-muted-foreground">Click "New website" and describe your business.</p></div>}
          {sites.data?.map((s) => (
            <Link key={s.id} to="/sites/$id" params={{ id: s.id }} className="rounded-3xl border-2 border-ink bg-card p-6 transition-transform hover:-translate-y-1">
              <h3 className="text-3xl">{s.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.published ? "● Live" : "Draft"} · edited {new Date(s.updated_at).toLocaleDateString()}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
