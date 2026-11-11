import { useState } from "react";
import { toast } from "sonner";
import { Github, FileArchive, X } from "lucide-react";
import { importGithub, importZip, siteName } from "@/lib/import-site";
import { useCreateSite } from "@/hooks/use-sites";

export function ImportDialog({ onClose }: { onClose: () => void }) {
  const create = useCreateSite();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  async function run(fn: () => Promise<string>, fallback: string) {
    setBusy(true);
    try {
      const html = await fn();
      if (html.length > 2_000_000) throw new Error("This site is too big (over 2 MB).");
      if (await create({ html, name: siteName(html, fallback).slice(0, 80) })) toast.success("Imported! Chat with the AI to change it.");
    } catch (e) { toast.error((e as Error).message || "Import failed"); }
    finally { setBusy(false); }
  }
  async function onFile(f?: File) {
    if (!f) return;
    if (/\.zip$/i.test(f.name)) run(() => importZip(f), f.name.replace(/\.zip$/i, ""));
    else if (/\.html?$/i.test(f.name)) run(() => f.text(), f.name.replace(/\.html?$/i, ""));
    else toast.error("Upload a .zip or .html file");
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4" onClick={onClose}>
      <div role="dialog" aria-label="Import a website" className="w-full max-w-lg rounded-3xl bg-card p-6 shadow-pop" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between"><h2 className="text-3xl">Import a website</h2><button aria-label="Close" onClick={onClose}><X /></button></div>
        <p className="mt-1 text-sm text-muted-foreground">Bring an existing HTML website, then keep editing it with AI.</p>
        <label className="mt-6 flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border p-8 text-center hover:border-primary"
          onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}>
          <FileArchive className="text-primary" />
          <span className="font-medium">Drop a ZIP or HTML file</span>
          <span className="text-xs text-muted-foreground">or click to choose · needs an index.html</span>
          <input type="file" accept=".zip,.html,.htm" className="hidden" disabled={busy} onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
        <form className="mt-4" onSubmit={(e) => { e.preventDefault(); run(() => importGithub(url), url.split("/").pop() || "GitHub site"); }}>
          <label className="text-sm font-medium" htmlFor="gh">From a public GitHub repo</label>
          <div className="mt-2 flex gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-input bg-background px-3"><Github size={16} /><input id="gh" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://github.com/user/repo" className="w-full bg-transparent py-2 text-sm outline-none" /></div>
            <button disabled={busy || !url} className="rounded-xl bg-ink px-4 text-sm text-ink-foreground disabled:opacity-40">{busy ? "Importing…" : "Import"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
