import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUp, Upload } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ImportDialog } from "@/components/ImportDialog";
import { SiteGrid } from "@/components/SiteGrid";
import { useCreateSite } from "@/hooks/use-sites";
import { useProfile } from "@/hooks/use-profile";

export { useProfile };

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Home — Shopsite AI" }, { name: "description", content: "Describe a website and AI builds it." }, { property: "og:title", content: "Home — Shopsite AI" }, { property: "og:description", content: "Describe a website and AI builds it." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: Dashboard,
});

const IDEAS = ["Bakery in Leeds with online menu", "Hair salon with booking info", "Plumber, 24/7 emergency calls", "Café with opening hours and map"];

function Dashboard() {
  const profile = useProfile();
  const create = useCreateSite();
  const [prompt, setPrompt] = useState("");
  const [importing, setImporting] = useState(false);
  const name = profile.data?.email?.split("@")[0];
  function go() { const t = prompt.trim(); if (t.length >= 2) create({ prompt: t }); }
  return (
    <AppShell>
      <main className="mx-auto max-w-5xl px-5 pb-24 pt-14">
        <h1 className="text-center text-5xl md:text-6xl">What should we build{name ? `, ${name}` : ""}?</h1>
        <p className="mt-3 text-center text-muted-foreground">Describe your business. The AI writes the whole website in about a minute.</p>
        <div className="mx-auto mt-8 max-w-3xl rounded-3xl border border-border bg-card p-3 shadow-pop">
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); go(); } }} rows={3} maxLength={2000} placeholder="A family pizza place in Manchester, wood-fired oven, open 5–11pm…" className="w-full resize-none bg-transparent p-3 outline-none" />
          <div className="flex items-center justify-between">
            <button onClick={() => setImporting(true)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-secondary"><Upload size={16} /> Import ZIP / GitHub</button>
            <button aria-label="Build website" onClick={go} disabled={prompt.trim().length < 2} className="rounded-full bg-primary p-2.5 text-primary-foreground disabled:opacity-40"><ArrowUp size={18} /></button>
          </div>
        </div>
        <div className="mx-auto mt-4 flex max-w-3xl flex-wrap justify-center gap-2">
          {IDEAS.map((i) => <button key={i} onClick={() => setPrompt(i)} className="rounded-full border border-border px-3 py-1.5 text-xs hover:bg-secondary">{i}</button>)}
        </div>
        {profile.data && profile.data.credits <= 2 && (
          <div className="mx-auto mt-8 flex max-w-3xl items-center justify-between gap-4 rounded-2xl bg-ink p-4 text-ink-foreground">
            <span>You're almost out of AI edits.</span><Link to="/account" className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">Get more</Link>
          </div>
        )}
        <div className="mt-16 flex items-center justify-between"><h2 className="text-3xl">Recent websites</h2><Link to="/projects" className="text-sm text-primary">View all →</Link></div>
        <div className="mt-5"><SiteGrid limit={6} /></div>
      </main>
      {importing && <ImportDialog onClose={() => setImporting(false)} />}
    </AppShell>
  );
}
