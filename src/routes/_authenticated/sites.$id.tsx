import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowUp, Check, Code2, Download, ExternalLink, Loader2, MessageSquare, Monitor, RotateCcw, Save, Smartphone, Sparkles, Square, Tablet } from "lucide-react";
import { toast } from "sonner";
import JSZip from "jszip";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { generationSucceeded, type EditingStatus } from "@/lib/editor-state";

export const Route = createFileRoute("/_authenticated/sites/$id")({
  head: () => ({ meta: [{ title: "Website studio — Shopsite AI" }, { name: "description", content: "Chat, edit code and preview your Shopsite AI website." }, { property: "og:title", content: "Website studio — Shopsite AI" }, { property: "og:description", content: "Your website editing workspace." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  validateSearch: (s: Record<string, unknown>): { prompt?: string } => (typeof s["prompt"] === "string" ? { prompt: s["prompt"].slice(0, 2000) } : {}),
  component: Editor,
});

const labels: Record<EditingStatus, string> = { idle: "Ready", connecting: "Connecting to AI", generating: "Editing your website", saving: "Saving changes", saved: "All changes saved", error: "Edit not completed" };

function Editor() {
  const { id } = Route.useParams();
  const { prompt: initial } = Route.useSearch();
  const navigate = Route.useNavigate();
  const qc = useQueryClient();
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<EditingStatus>("idle");
  const [written, setWritten] = useState(0);
  const [pendingPrompt, setPendingPrompt] = useState("");
  const [view, setView] = useState<"chat" | "preview">("chat");
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [revision, setRevision] = useState(0);
  const [draft, setDraft] = useState("");
  const [localSaving, setLocalSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const started = useRef(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const busy = status === "connecting" || status === "generating" || status === "saving";

  const site = useQuery({ queryKey: ["site", id], queryFn: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw new Error("Please sign in.");
    const { data, error } = await supabase.from("sites").select("*").eq("id", id).eq("user_id", u.user.id).single();
    if (error) throw error; return data;
  } });
  const msgs = useQuery({ queryKey: ["msgs", id], queryFn: async () => {
    const { data, error } = await supabase.from("site_messages").select("id,role,content").eq("site_id", id).order("created_at");
    if (error) throw error; return data ?? [];
  } });
  const profile = useQuery({ queryKey: ["profile"], queryFn: async () => {
    const { data: u } = await supabase.auth.getUser(); if (!u.user) throw new Error("Please sign in.");
    const { data, error } = await supabase.from("profiles").select("credits,plan").eq("id", u.user.id).single();
    if (error) throw error; return data;
  } });
  const html = site.data?.html ?? "";
  const dirty = draft !== html;

  useEffect(() => { setDraft(html); }, [html]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ block: "end" }); }, [msgs.data, pendingPrompt, status]);
  useEffect(() => () => abortRef.current?.abort(), []);
  useEffect(() => {
    if (initial && site.data && !started.current) {
      started.current = true; void navigate({ search: {}, replace: true }); void send(undefined, initial);
    }
  }, [initial, site.data]);

  async function refresh() {
    await Promise.all([qc.invalidateQueries({ queryKey: ["site", id] }), qc.invalidateQueries({ queryKey: ["msgs", id] }), qc.invalidateQueries({ queryKey: ["profile"] }), qc.invalidateQueries({ queryKey: ["sites"] })]);
  }

  async function send(e?: React.FormEvent, override?: string) {
    e?.preventDefault();
    const text = (override ?? prompt).trim();
    if (text.length < 2 || busy || localSaving) return;
    if (dirty) { toast.error("Save or discard your code changes first."); return; }
    setStatus("connecting"); setWritten(0); setPendingPrompt(text); setView("chat");
    const ctrl = new AbortController(); abortRef.current = ctrl;
    try {
      const { data: s } = await supabase.auth.getSession();
      if (!s.session) throw new Error("Please sign in again.");
      const res = await fetch("/api/generate", { method: "POST", signal: ctrl.signal, headers: { "content-type": "application/json", authorization: `Bearer ${s.session.access_token}` }, body: JSON.stringify({ siteId: id, prompt: text }) });
      if (!res.ok || !res.body) throw new Error(await res.text());
      setPrompt(""); setStatus("generating");
      const reader = res.body.getReader(); const dec = new TextDecoder(); let output = "";
      while (true) { const { done, value } = await reader.read(); if (done) break; output += dec.decode(value, { stream: true }); setWritten(output.length); }
      output += dec.decode();
      if (!generationSucceeded(output)) throw new Error("The AI didn't finish. Your saved website is unchanged; please try again.");
      setStatus("saving"); await refresh(); setStatus("saved"); setPendingPrompt(""); setTab("preview"); setView("preview"); setRevision((r) => r + 1);
    } catch (err) {
      setStatus("error");
      if (err instanceof Error && err.name === "AbortError") toast("Stopped. Your last saved preview is still available.");
      else toast.error(err instanceof Error ? err.message : "Connection problem. Please try again.");
      if (!override) setPrompt(text);
      await refresh(); setPendingPrompt("");
    } finally { abortRef.current = null; }
  }

  async function rename(name: string) {
    const { error } = await supabase.from("sites").update({ name }).eq("id", id);
    if (error) { toast.error("Could not rename your website."); return; } await refresh();
  }
  async function saveCode() {
    setLocalSaving(true);
    try {
      const { error } = await supabase.from("sites").update({ html: draft, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error; await refresh(); setStatus("saved"); setRevision((r) => r + 1); toast.success("Code saved");
    } catch { toast.error("Could not save your code. Your changes are still here."); } finally { setLocalSaving(false); }
  }
  async function togglePublish() {
    if (!html || dirty) { toast.error(dirty ? "Save your changes before publishing." : "Build your site first."); return; }
    setPublishing(true);
    const { error } = await supabase.from("sites").update({ published: !site.data?.published }).eq("id", id);
    if (error) toast.error("Could not update publishing. Please try again.");
    else { toast.success(site.data?.published ? "Site unpublished" : "Your site is live!"); await refresh(); }
    setPublishing(false);
  }
  async function exportSite() {
    setExporting(true);
    try {
      const zip = new JSZip(); zip.file("index.html", html);
      const blob = await zip.generateAsync({ type: "blob" }); const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `${(site.data?.name ?? "website").replace(/[^a-z0-9-]/gi, "-")}.zip`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch { toast.error("Could not export your website."); } finally { setExporting(false); }
  }

  if (site.isError) return <div className="p-10 text-center">This website couldn't load. <Link to="/dashboard" className="text-primary underline">Back to dashboard</Link></div>;
  return (
    <div className="editor-workspace flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <header className="flex shrink-0 flex-wrap items-center gap-2 border-b px-3 py-2.5">
        <Button asChild variant="ghost" size="icon" title="Back to Home"><Link to="/dashboard"><ArrowLeft /></Link></Button>
        <div className="min-w-0 flex-1">
          <input aria-label="Project name" defaultValue={site.data?.name ?? "Loading…"} key={site.data?.name} disabled={!site.data || busy} onBlur={(e) => { const name = e.target.value.trim().slice(0, 80); if (name && name !== site.data?.name) void rename(name); }} className="w-full bg-transparent text-sm font-semibold outline-none" />
          <p className="text-xs text-muted-foreground">{site.data?.published ? "Published" : "Private draft"} <span aria-hidden="true">·</span> {profile.data?.credits ?? "…"} edits left</p>
        </div>
        <Button variant="ghost" size="icon" title="Download website ZIP" aria-label="Download website ZIP" disabled={!html || exporting || busy} onClick={exportSite}>{exporting ? <Loader2 className="motion-safe:animate-spin" /> : <Download />}</Button>
        {site.data?.published && <Button asChild variant="outline" size="icon" title="Open published site"><a href={`/s/${id}`} target="_blank" rel="noreferrer"><ExternalLink /></a></Button>}
        <Button onClick={togglePublish} disabled={!html || busy || publishing || dirty} size="sm">{publishing && <Loader2 className="motion-safe:animate-spin" />}{site.data?.published ? "Unpublish" : "Publish"}</Button>
      </header>
      <nav className="flex shrink-0 border-b md:hidden" aria-label="Workspace view">
        <Button variant={view === "chat" ? "secondary" : "ghost"} className="flex-1 rounded-none" onClick={() => setView("chat")}><MessageSquare />Chat</Button>
        <Button variant={view === "preview" ? "secondary" : "ghost"} className="flex-1 rounded-none" onClick={() => setView("preview")}><Monitor />Website</Button>
      </nav>
      <div className="flex min-h-0 flex-1">
        <section className={`${view === "chat" ? "flex" : "hidden"} w-full shrink-0 flex-col md:flex md:w-[340px] md:border-r lg:w-[380px]`}>
          <div className="flex h-12 shrink-0 items-center gap-2 border-b px-4 text-sm font-semibold"><Sparkles className="size-4 text-primary" />Shopsite assistant</div>
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4" aria-label="Chat history">
            {!msgs.data?.length && !pendingPrompt && <div className="py-8"><Sparkles className="mb-4 size-7 text-primary" /><h1 className="text-2xl">Let’s build your website.</h1><p className="mt-2 text-sm text-muted-foreground">What’s your business, and what would you like on your site?</p></div>}
            {msgs.isError && <p className="text-sm text-destructive">Chat couldn't load. <Button variant="link" onClick={() => msgs.refetch()}>Retry</Button></p>}
            {msgs.data?.map((m) => <article key={m.id} className={m.role === "user" ? "ml-7 rounded-lg bg-secondary p-3" : "pr-4"}><div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">{m.role === "assistant" && <Sparkles className="size-3 text-primary" />}{m.role === "user" ? "You" : "Shopsite AI"}</div><p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{m.content}</p>{m.role === "assistant" && <div className="mt-3 flex items-center gap-1 text-xs text-accent-foreground"><Check className="size-3" />Website updated</div>}</article>)}
            {pendingPrompt && <article className="ml-7 rounded-lg bg-secondary p-3"><p className="mb-2 text-xs text-muted-foreground">You</p><p className="whitespace-pre-wrap break-words text-sm">{pendingPrompt}</p></article>}
            {busy && <div role="status" className="space-y-3 text-sm"><div className="flex items-center gap-2"><Loader2 className="size-4 text-primary motion-safe:animate-spin" />{labels[status]}</div><div className="border-l-2 border-primary/30 pl-4 text-xs text-muted-foreground">{written > 0 ? `${written.toLocaleString()} characters generated` : "Preparing your request…"}</div></div>}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={send} className="shrink-0 border-t p-3">
            <div className="rounded-lg border bg-card p-3 focus-within:ring-1 focus-within:ring-ring">
              <textarea aria-label="Message the AI" value={prompt} disabled={busy || localSaving} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(); } }} maxLength={2000} rows={3} placeholder={html ? "Ask for a change…" : "Describe your business…"} className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
              <div className="mt-2 flex items-center justify-between gap-2"><span className="text-xs text-muted-foreground">1 edit per message</span>{busy ? <Button type="button" variant="secondary" size="icon" title="Stop editing" aria-label="Stop editing" onClick={() => abortRef.current?.abort()}><Square /></Button> : <Button type="submit" size="icon" title="Send message" aria-label="Send message" disabled={prompt.trim().length < 2 || !site.data || dirty || localSaving}><ArrowUp /></Button>}</div>
            </div>
          </form>
        </section>
        <section className={`${view === "preview" ? "flex" : "hidden"} min-w-0 flex-1 flex-col md:flex`}>
          <div className="flex min-h-12 shrink-0 flex-wrap items-center justify-between gap-2 border-b px-3 py-1.5">
            <div className="flex gap-1"><Button size="sm" variant={tab === "preview" ? "secondary" : "ghost"} onClick={() => setTab("preview")}><Monitor />Preview</Button><Button size="sm" variant={tab === "code" ? "secondary" : "ghost"} onClick={() => setTab("code")}><Code2 />Code</Button></div>
            {tab === "preview" ? <div className="flex items-center gap-1">{([{ key: "desktop", icon: Monitor }, { key: "tablet", icon: Tablet }, { key: "mobile", icon: Smartphone }] as const).map(({ key, icon: Icon }) => <Button key={key} size="icon" variant={device === key ? "secondary" : "ghost"} title={`${key} preview`} aria-label={`${key} preview`} aria-pressed={device === key} onClick={() => setDevice(key)}><Icon /></Button>)}<Button variant="ghost" size="icon" aria-label="Refresh preview" title="Refresh preview" onClick={() => setRevision((r) => r + 1)}><RotateCcw /></Button></div> : <div className="flex gap-1"><Button variant="ghost" size="icon" title="Discard code changes" aria-label="Discard code changes" disabled={!dirty || localSaving} onClick={() => setDraft(html)}><RotateCcw /></Button><Button size="sm" disabled={!dirty || busy || localSaving} onClick={saveCode}>{localSaving ? <Loader2 className="motion-safe:animate-spin" /> : <Save />}Save</Button></div>}
          </div>
          <div className="relative min-h-0 flex-1 overflow-auto bg-muted p-3 md:p-5">
            {tab === "code" ? <textarea aria-label="Website HTML code" spellCheck={false} value={draft} onChange={(e) => setDraft(e.target.value)} disabled={busy || localSaving || !site.data} className="h-full min-h-64 w-full resize-none rounded-md border bg-card p-4 font-mono text-xs leading-6 outline-none focus:ring-1 focus:ring-ring" /> : html ? <div className={`mx-auto h-full min-h-80 overflow-hidden rounded-md border bg-card ${device === "mobile" ? "w-full max-w-[390px]" : device === "tablet" ? "w-full max-w-[768px]" : "w-full"}`}><iframe key={`${id}-${revision}`} title="Website preview" sandbox="allow-scripts" srcDoc={html} className="h-full w-full bg-card" /></div> : <div className="flex h-full flex-col items-center justify-center gap-4 text-center"><Monitor className="size-12 text-muted-foreground/50" /><h2 className="text-2xl">{site.isPending ? "Loading your website…" : busy ? "Your website is taking shape" : "A fresh canvas"}</h2><p className="max-w-xs text-sm text-muted-foreground">{busy ? "The preview will update when your changes are saved." : "Your website will appear here."}</p></div>}
          </div>
          <footer className="flex min-h-9 shrink-0 flex-wrap items-center justify-between gap-1 border-t px-3 py-2 text-xs text-muted-foreground"><span role="status" className="flex items-center gap-1.5">{busy || localSaving ? <Loader2 className="size-3 motion-safe:animate-spin" /> : status === "saved" ? <Check className="size-3 text-accent-foreground" /> : <span className="size-1.5 rounded-full bg-muted-foreground" />}{dirty ? "Unsaved code changes" : localSaving ? "Saving code" : labels[status]}</span><span>{tab === "code" ? "index.html" : busy && html ? "Last saved preview" : device === "mobile" ? "Mobile · 390px" : device === "tablet" ? "Tablet · 768px" : "Desktop"}</span></footer>
        </section>
      </div>
    </div>
  );
}
