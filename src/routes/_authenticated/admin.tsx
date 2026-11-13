import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppHeader } from "@/components/AppHeader";
import { getAdminStats } from "@/lib/account.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Shopsite AI" }, { name: "description", content: "Revenue, AI cost and margin." }, { property: "og:title", content: "Admin — Shopsite AI" }, { property: "og:description", content: "Admin" }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: Admin,
});

const usd = (n: number) => `$${n.toFixed(2)}`;
function Admin() {
  const fn = useServerFn(getAdminStats);
  const q = useQuery({ queryKey: ["admin"], queryFn: () => fn(), retry: false });
  if (q.isError) return <div className="min-h-screen bg-background"><AppHeader /><p className="p-10 text-center">Admins only.</p></div>;
  const rows = q.data?.rows ?? [];
  const tot = rows.reduce((a, r) => ({ rev: a.rev + r.revenue, cost: a.cost + r.cost }), { rev: 0, cost: 0 });
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-5 pb-20">
        <h1 className="text-5xl">Admin</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          {[["Users", String(rows.length)], ["Revenue", usd(tot.rev)], ["AI cost", usd(tot.cost)], ["Margin", usd(tot.rev - tot.cost)]].map(([k, v]) => <div key={k} className="rounded-2xl border-2 border-ink bg-card p-4"><p className="text-sm text-muted-foreground">{k}</p><p className="font-display text-4xl">{v}</p></div>)}
        </div>
        <div className="mt-8 overflow-x-auto rounded-2xl border-2 border-ink bg-card">
          <table className="w-full text-sm"><thead className="bg-secondary text-left"><tr>{["Email", "Plan", "Credits", "Edits", "Revenue", "AI cost", "Margin"].map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead>
            <tbody>{rows.map((r) => <tr key={r.id} className="border-t border-border"><td className="p-3">{r.email}</td><td className="p-3">{r.plan}</td><td className="p-3">{r.credits}</td><td className="p-3">{r.edits}</td><td className="p-3">{usd(r.revenue)}</td><td className="p-3">{usd(r.cost)}</td><td className="p-3">{usd(r.margin)}</td></tr>)}</tbody></table>
        </div>
        <h2 className="mt-10 text-3xl">Feedback</h2>
        <div className="mt-4 space-y-2">{q.data?.feedback.map((f) => <div key={f.id} className="rounded-xl border-2 border-ink bg-card p-3 text-sm"><p>{f.message}</p><p className="mt-1 text-xs text-muted-foreground">{f.email ?? "anonymous"} · {new Date(f.created_at).toLocaleString()}</p></div>)}</div>
      </main>
    </div>
  );
}
