import { Link } from "@tanstack/react-router";
import { useSites } from "@/hooks/use-sites";

export function SiteGrid({ limit }: { limit?: number }) {
  const sites = useSites();
  const list = limit ? sites.data?.slice(0, limit) : sites.data;
  if (sites.isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!list?.length) return <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">No websites yet — describe one above or import one.</p>;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((s) => (
        <Link key={s.id} to="/sites/$id" params={{ id: s.id }} className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-0.5 hover:shadow-pop">
          <div className="flex aspect-video items-center justify-center bg-secondary font-display text-4xl text-primary">{s.name.slice(0, 1).toUpperCase()}</div>
          <div className="p-4">
            <p className="truncate font-medium">{s.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.published ? <span className="text-primary">● Live</span> : "Draft"} · edited {new Date(s.updated_at).toLocaleDateString()}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
