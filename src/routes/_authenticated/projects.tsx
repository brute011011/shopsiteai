import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Upload } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ImportDialog } from "@/components/ImportDialog";
import { SiteGrid } from "@/components/SiteGrid";
import { useCreateSite } from "@/hooks/use-sites";

export const Route = createFileRoute("/_authenticated/projects")({
  head: () => ({ meta: [{ title: "Projects — Shopsite AI" }, { name: "description", content: "All your websites." }, { property: "og:title", content: "Projects — Shopsite AI" }, { property: "og:description", content: "All your websites." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: Projects,
});

function Projects() {
  const create = useCreateSite();
  const [importing, setImporting] = useState(false);
  return (
    <AppShell>
      <main className="mx-auto max-w-6xl px-5 pb-24 pt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-5xl">Projects</h1>
          <div className="flex gap-2">
            <button onClick={() => setImporting(true)} className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm"><Upload size={16} /> Import</button>
            <button onClick={() => create()} className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground"><Plus size={16} /> New website</button>
          </div>
        </div>
        <div className="mt-8"><SiteGrid /></div>
      </main>
      {importing && <ImportDialog onClose={() => setImporting(false)} />}
    </AppShell>
  );
}
