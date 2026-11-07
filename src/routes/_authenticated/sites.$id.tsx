import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/sites/$id")({
  head: () => ({ meta: [{ title: "Editor — Shopsite AI" }, { name: "description", content: "Edit your website by chatting with AI." }, { property: "og:title", content: "Editor — Shopsite AI" }, { property: "og:description", content: "Edit your website by chatting with AI." }, { name: "robots", content: "noindex" }] }),
  component: Editor,
});

function Editor() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const [prompt, setPrompt] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [live, setLive] = useState("");
  const [view, setView] = useState<"chat" | "preview">("chat");
  const abortRef = useRef<AbortController | null>(null);

  const site = useQuery({ queryKey: ["site", id], queryFn: async () => { const { data, error } = await supabase.from("sites").select("*").eq("id", id).single(); if (error) throw error; return data; } });
  const msgs = useQuery({ queryKey: ["msgs", id], queryFn: async () => { const { data } = await supabase.from("site_messages").select("id,role,content").eq("site_id", id).order("created_at"); return data ?? []; } });
  const profile = useQuery({ queryKey: ["profile"], queryFn: async () => { const { data: u } = await supabase.auth.getUser(); const { data } = await supabase.from("profiles").select("credits,plan").eq("id", u.user!.id).single(); return data; } });

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    const text = prompt.trim();
    if (text.length < 2 || streaming) return;
    setStreaming(true); setLive(""); setView("chat");
    const ctrl = new AbortController(); abortRef.current = ctrl;
    try {
      const { data: s } = await supabase.auth.getSession();
      const res = await fetch("/api/generate", { method: "POST", signal: ctrl.signal, headers: { "content-type": "application/json", authorization: `Bearer ${s.session?.access_token ?? ""}` }, body: JSON.stringify({ siteId: id, prompt: text }) });
      if (!res.ok || !res.body) { toast.error(await res.text()); return; }
      setPrompt("");
      const reader = res.body.getReader(); const dec = new TextDecoder(); let acc = "";
      while (true) { const { done, value } = await reader.read(); if (done) break; acc += dec.decode(value, { stream: true }); setLive(acc); }
      if (acc.includes("<!--SHOPSITE_ERROR-->")) toast.error("The AI didn't finish. Your edit was refunded — please try again.");
      else { toast.success("Site updated"); setView("preview"); }
    } catch (err) {
      if ((err as Error).name === "AbortError") toast("Stopped. If it didn't finish, your edit is refunded.");
      else toast.error("Connection problem. Please try again.");
    } finally {
      setStreaming(false); setLive("");
      qc.invalidateQueries({ queryKey: ["site", id] }); qc.invalidateQueries({ queryKey: ["msgs", id] }); qc.invalidateQueries({ queryKey: ["profile"] });
    }
  }

  async function rename(name: string) { await supabase.from("sites").update({ name }).eq("id", id); qc.invalidateQueries({ queryKey: ["site", id] }); }
  async function togglePublish() {
    if (!site.data?.html) return toast.error("Build your site first.");
    await supabase.from("sites").update({ published: !site.data.published }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["site", id] });
    toast.success(site.data.published ? "Site unpublished" : "Your site is live!");
  }

  const html = site.data?.html ?? "";
  const empty = !html && !streaming;
  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex flex-wrap items-center gap-3 border-b-2 border-ink px-4 py-3">
        <Link to="/dashboard" className="text-sm">← Back</Link>
        <input defaultValue={site.data?.name} key={site.data?.name} onBlur={(e) => e.target.value.trim() && rename(e.target.value.trim().slice(0, 80))} className="min-w-0 flex-1 bg-transparent font-display text-2xl outline-none" />
        <span className="text-sm text-muted-foreground">{profile.data?.credits ?? "…"} edits left</span>
        {site.data?.published && <a href={`/s/${id}`} target="_blank" rel="noreferrer" className="text-sm text-primary underline">View live</a>}
        <button onClick={togglePublish} className="rounded-full border-2 border-ink bg-primary px-4 py-1.5 text-sm text-primary-foreground">{site.data?.published ? "Unpublish" : "Publish"}</button>
      </header>
      <div className="flex border-b-2 border-ink md:hidden">
        {(["chat", "preview"] as const).map((v) => <button key={v} onClick={() => setView(v)} className={`flex-1 py-2 text-sm capitalize ${view === v ? "bg-ink text-ink-foreground" : ""}`}>{v}</button>)}
      </div>
      <div className="flex min-h-0 flex-1">
        <section className={`${view === "chat" ? "flex" : "hidden"} w-full flex-col border-ink md:flex md:w-[380px] md:border-r-2`}>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {empty && <div className="rounded-2xl bg-secondary p-4 text-sm"><p className="font-medium">Describe your business to start.</p><p className="mt-1 text-muted-foreground">e.g. "A family pizza place in Manchester, open 5–11pm, wood-fired oven, phone 0161 000 0000."</p></div>}
            {msgs.data?.map((m) => <div key={m.id} className={`rounded-2xl p-3 text-sm ${m.role === "user" ? "ml-8 bg-ink text-ink-foreground" : "mr-8 bg-secondary"}`}>{m.content}</div>)}
            {streaming && <div className="mr-8 rounded-2xl bg-accent p-3 text-sm text-accent-foreground">Building… {Math.round(live.length / 100) / 10}k characters written</div>}
          </div>
          <form onSubmit={send} className="border-t-2 border-ink p-3">
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} maxLength={2000} rows={3} placeholder={html ? "What should change?" : "Describe your business…"} className="w-full resize-none rounded-xl border-2 border-input bg-card p-3 text-sm" />
            <div className="mt-2 flex justify-between">
              <span className="self-center text-xs text-muted-foreground">1 edit per message</span>
              {streaming ? <button type="button" onClick={() => abortRef.current?.abort()} className="rounded-full border-2 border-ink px-4 py-2 text-sm">Stop</button>
                : <button disabled={prompt.trim().length < 2} className="rounded-full border-2 border-ink bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-40">{html ? "Update" : "Build my site"}</button>}
            </div>
          </form>
        </section>
        <section className={`${view === "preview" ? "block" : "hidden"} min-w-0 flex-1 bg-muted md:block`}>
          {streaming ? <iframe title="Live preview" sandbox="" srcDoc={live} className="h-full w-full bg-card" />
            : html ? <iframe title="Preview" sandbox="allow-scripts" srcDoc={html} className="h-full w-full bg-card" />
            : <div className="flex h-full items-center justify-center p-8 text-center text-muted-foreground">Your website preview will appear here.</div>}
        </section>
      </div>
    </div>
  );
}
