import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { SiteFooter } from "@/components/SiteFooter";
import hero from "@/assets/hero-baker.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shopsite AI — Your business website in 60 seconds" },
      { name: "description", content: "Describe your shop, café or salon and AI builds a beautiful website you can edit by chatting. From $19/month." },
      { property: "og:title", content: "Shopsite AI — Your business website in 60 seconds" },
      { property: "og:description", content: "AI builds and updates your local business website. Just chat." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const plans = [
  { name: "Free", price: "$0", note: "Try it", features: ["1 draft site", "10 AI edits", "Shopsite subdomain"], cta: "Start free" },
  { name: "Starter", price: "$19", note: "per month", features: ["1 live site", "200 AI edits / month", "Custom domain", "Contact form"], cta: "Get Starter", pop: true },
  { name: "Pro", price: "$49", note: "per month", features: ["3 live sites", "1,000 AI edits / month", "Booking & menus", "Priority support"], cta: "Go Pro" },
];

const faqs = [
  ["Do I need any tech skills?", "No. You type what you want, like \"add our Sunday opening hours\", and the AI changes it."],
  ["What is an AI edit?", "One request to the AI. Running out? Buy a credit pack of 100 edits for $5, no plan change needed."],
  ["Can I use my own domain?", "Yes, on Starter and Pro. We walk you through it in two steps."],
  ["Can I cancel anytime?", "Yes. Cancel in one click from your dashboard. Your site stays until the end of the billing month."],
];

const Btn = ({ children, ghost, href }: { children: React.ReactNode; ghost?: boolean; href?: string }) => href ? (
  <a href={href} className="inline-flex items-center justify-center rounded-full border-2 border-ink bg-card px-6 py-3 font-medium text-foreground">{children}</a>
) : (
  <Link to="/auth" search={{ mode: "signup" }} className={`inline-flex items-center justify-center rounded-full border-2 border-ink px-6 py-3 font-medium transition-transform hover:-translate-y-0.5 ${ghost ? "bg-card text-foreground" : "bg-primary text-primary-foreground shadow-pop"}`}>{children}</Link>
);

function Index() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <AppHeader />

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-20 pt-8 md:grid-cols-2">
        <div>
          <p className="mb-4 inline-block rounded-full bg-accent px-3 py-1 text-sm text-accent-foreground">For cafés, salons, shops & trades</p>
          <h1 className="text-5xl leading-[1.05] md:text-7xl">Your business website, <em className="text-primary">written by AI</em> in 60 seconds.</h1>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">Describe your business. Get a beautiful site. Change anything by just chatting. No designer, no Wix headaches.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Btn>Build my site free</Btn><Btn href="#pricing">See pricing</Btn></div>
          <p className="mt-4 text-sm text-muted-foreground">No card needed · 10 free AI edits</p>
        </div>
        <img src={hero} alt="Bakery owner looking at her new website" width={1280} height={960} className="w-full rounded-3xl border-2 border-ink object-cover shadow-pop" />
      </section>

      <section className="border-y-2 border-ink bg-ink py-16 text-ink-foreground">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 md:grid-cols-3">
          {[["1. Describe", "\"A cosy bakery in Leeds, sourdough and coffee.\""], ["2. Get your site", "Pages, photos, menu and contact form, ready to go live."], ["3. Chat to change it", "\"Add a Christmas pre-order section.\" Done."]].map(([t, d]) => (
            <div key={t}><h3 className="text-3xl">{t}</h3><p className="mt-2 opacity-80">{d}</p></div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-center text-5xl">Simple pricing</h2>
        <p className="mt-3 text-center text-muted-foreground">Cheaper than one hour with a web designer.</p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <div key={p.name} className={`rounded-3xl border-2 border-ink p-7 ${p.pop ? "bg-secondary shadow-pop" : "bg-card"}`}>
              <div className="flex items-center justify-between"><h3 className="text-3xl">{p.name}</h3>{p.pop && <span className="rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">Most popular</span>}</div>
              <p className="mt-4"><span className="font-display text-5xl">{p.price}</span> <span className="text-muted-foreground">{p.note}</span></p>
              <ul className="mt-6 space-y-2">{p.features.map((f) => <li key={f}>✓ {f}</li>)}</ul>
              <div className="mt-8"><Btn ghost={!p.pop}>{p.cta}</Btn></div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">Need more edits? Credit packs: 100 edits for $5.</p>
      </section>

      <section id="faq" className="mx-auto max-w-3xl px-5 pb-20">
        <h2 className="text-5xl">Questions</h2>
        <div className="mt-8 divide-y-2 divide-ink border-y-2 border-ink">
          {faqs.map(([q, a]) => (
            <details key={q} className="group py-5"><summary className="cursor-pointer list-none text-lg font-medium">{q}<span className="float-right text-primary group-open:rotate-45 transition-transform">+</span></summary><p className="mt-3 text-muted-foreground">{a}</p></details>
          ))}
        </div>
      </section>

      <section className="mx-auto mb-20 max-w-6xl px-5">
        <div className="rounded-3xl border-2 border-ink bg-primary p-10 text-center text-primary-foreground shadow-pop md:p-16">
          <h2 className="text-5xl md:text-6xl">Stop paying for a website you can't change.</h2>
          <div className="mt-8"><Link to="/auth" search={{ mode: "signup" }} className="inline-flex rounded-full border-2 border-ink bg-card px-6 py-3 font-medium text-foreground">Build my site free</Link></div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
