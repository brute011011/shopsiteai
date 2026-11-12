// Turns an uploaded ZIP, a single HTML file or a public GitHub repo into one self-contained HTML page.
import JSZip from "jszip";

type Reader = (path: string) => Promise<string | null>;

function join(base: string, rel: string) {
  const parts = (base ? base.split("/") : []).concat(rel.split("/"));
  const out: string[] = [];
  for (const p of parts) { if (!p || p === ".") continue; if (p === "..") out.pop(); else out.push(p); }
  return out.join("/");
}

async function inline(html: string, dir: string, read: Reader) {
  const isLocal = (u: string) => !/^(https?:)?\/\//i.test(u) && !u.startsWith("data:");
  for (const m of [...html.matchAll(/<link[^>]+rel=["']?stylesheet["']?[^>]*>/gi)]) {
    const href = m[0].match(/href=["']([^"']+)["']/i)?.[1];
    if (href && isLocal(href)) { const css = await read(join(dir, href.split("?")[0] ?? href)); if (css != null) html = html.replace(m[0], `<style>${css}</style>`); }
  }
  for (const m of [...html.matchAll(/<script([^>]*)src=["']([^"']+)["']([^>]*)><\/script>/gi)]) {
    const src = m[2] ?? "";
    if (isLocal(src)) { const js = await read(join(dir, src.split("?")[0] ?? src)); if (js != null) html = html.replace(m[0], `<script${m[1] ?? ""}${m[3] ?? ""}>${js.replace(/<\/script/gi, "<\\/script")}</script>`); }
  }
  return html;
}

export async function importZip(file: File) {
  const zip = await JSZip.loadAsync(file);
  const names = Object.keys(zip.files).filter((n) => !n.startsWith("__MACOSX"));
  const index = names.filter((n) => /(^|\/)index\.html?$/i.test(n)).sort((a, b) => a.length - b.length)[0]
    ?? names.find((n) => /\.html?$/i.test(n));
  if (!index) throw new Error("No index.html found in this ZIP.");
  const dir = index.includes("/") ? index.slice(0, index.lastIndexOf("/")) : "";
  const html = await zip.file(index)!.async("string");
  return inline(html, dir, async (p) => (zip.file(p) ? zip.file(p)!.async("string") : null));
}

export async function importGithub(url: string) {
  const m = url.trim().match(/github\.com\/([\w.-]+)\/([\w.-]+?)(?:\.git)?(?:\/tree\/([^/]+)(?:\/(.*))?)?\/?$/i);
  if (!m) throw new Error("Paste a GitHub link like https://github.com/user/repo");
  const owner = m[1]!, repo = m[2]!, branchIn = m[3], sub = m[4] ?? "";
  const branches = branchIn ? [branchIn] : ["main", "master", "gh-pages"];
  const dirs = sub ? [sub] : ["", "public", "docs", "dist", "build"];
  for (const b of branches) for (const d of dirs) {
    const base = `https://raw.githubusercontent.com/${owner}/${repo}/${b}/`;
    const r = await fetch(base + join(d, "index.html"));
    if (!r.ok) continue;
    const html = await r.text();
    return inline(html, d, async (p) => { const x = await fetch(base + p); return x.ok ? x.text() : null; });
  }
  throw new Error("Couldn't find index.html. The repo must be public and contain a plain HTML site.");
}

export function siteName(fromHtml: string, fallback: string) {
  const t = fromHtml.match(/<title>([^<]{1,80})<\/title>/i)?.[1]?.trim();
  return t || fallback;
}
