import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Home, FolderOpen, Settings, Shield, LogOut, Sparkles, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/use-profile";
import { PLANS, type PlanId } from "@/lib/pricing";

export function AppShell({ children }: { children: ReactNode }) {
  const profile = useProfile();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const p = profile.data;
  const max = PLANS[(p?.plan as PlanId) ?? "free"]?.monthlyCredits ?? 10;
  const pct = p ? Math.min(100, Math.round((p.credits / max) * 100)) : 0;
  async function signOut() { await qc.cancelQueries(); qc.clear(); await supabase.auth.signOut(); navigate({ to: "/auth", replace: true }); }
  const item = "flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink-foreground/75 hover:bg-ink-foreground/10 hover:text-ink-foreground";
  const active = { className: "bg-ink-foreground/15 !text-ink-foreground" };
  const nav = (
    <div className="flex h-full flex-col gap-1 p-4">
      <Link to="/" className="mb-6 px-3 font-display text-2xl text-ink-foreground">Shopsite<span className="text-primary">.</span>ai</Link>
      <Link to="/dashboard" className={item} activeProps={active} onClick={() => setOpen(false)}><Home size={16} /> Home</Link>
      <Link to="/projects" className={item} activeProps={active} onClick={() => setOpen(false)}><FolderOpen size={16} /> Projects</Link>
      <Link to="/account" className={item} activeProps={active} onClick={() => setOpen(false)}><Settings size={16} /> Settings</Link>
      {p?.isAdmin && <Link to="/admin" className={item} activeProps={active}><Shield size={16} /> Admin</Link>}
      <div className="mt-auto space-y-3">
        <div className="rounded-2xl bg-ink-foreground/10 p-4 text-ink-foreground">
          <div className="flex justify-between text-xs"><span className="capitalize">{p?.plan ?? "…"} plan</span><span>{p?.credits ?? "…"} edits left</span></div>
          <div className="mt-2 h-1.5 rounded-full bg-ink-foreground/15"><div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} /></div>
          {p?.plan === "free" && <Link to="/account" className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-primary py-2 text-sm font-medium text-primary-foreground"><Sparkles size={14} /> Upgrade to Pro</Link>}
        </div>
        <button onClick={signOut} className={item + " w-full"}><LogOut size={16} /> Sign out</button>
      </div>
    </div>
  );
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 bg-ink md:block">{nav}</aside>
      {open && <div className="fixed inset-0 z-40 md:hidden"><div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} /><aside className="relative h-full w-64 bg-ink">{nav}</aside></div>}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3 md:hidden">
          <button aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
          <span className="font-display text-xl">Shopsite<span className="text-primary">.</span>ai</span>
        </div>
        {children}
      </div>
    </div>
  );
}
