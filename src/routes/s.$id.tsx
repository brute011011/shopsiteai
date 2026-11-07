import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const getPublicSite = createServerFn({ method: "GET" })
  .inputValidator((id: string) => { if (!/^[0-9a-f-]{36}$/.test(id)) throw new Error("bad id"); return id; })
  .handler(async ({ data: id }) => {
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const sb = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => { const h = new Headers(init?.headers); if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization"); h.set("apikey", key); return fetch(input, { ...init, headers: h }); } },
    });
    const { data } = await sb.from("sites").select("name,html").eq("id", id).eq("published", true).maybeSingle();
    return data;
  });

export const Route = createFileRoute("/s/$id")({
  loader: async ({ params }) => { const site = await getPublicSite({ data: params.id }); if (!site) throw notFound(); return site; },
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.name ?? "Website" }, { name: "description", content: `${loaderData?.name ?? "A website"} — made with Shopsite AI` }, { property: "og:title", content: loaderData?.name ?? "Website" }, { property: "og:description", content: "Made with Shopsite AI" }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: PublicSite,
});

function PublicSite() {
  const site = Route.useLoaderData();
  return (
    <div className="fixed inset-0">
      <iframe title={site.name} sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox" srcDoc={site.html} className="h-full w-full border-0" />
      <a href="/" className="fixed bottom-3 left-3 rounded-full bg-ink px-3 py-1 text-xs text-ink-foreground">Made with Shopsite AI</a>
    </div>
  );
}
