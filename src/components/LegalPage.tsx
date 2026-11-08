import type { ReactNode } from "react";
import { AppHeader } from "./AppHeader";
import { SiteFooter } from "./SiteFooter";
export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-5 pb-20 [&_h2]:mt-8 [&_h2]:text-3xl [&_p]:mt-3 [&_li]:mt-1 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6">
        <h1 className="text-5xl">{title}</h1>
        <p className="text-sm text-muted-foreground">Last updated: 7 November 2026</p>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
