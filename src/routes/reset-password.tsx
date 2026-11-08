import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Set a new password — Shopsite AI" }, { name: "description", content: "Choose a new password for your Shopsite AI account." }, { property: "og:title", content: "Set a new password — Shopsite AI" }, { property: "og:description", content: "Reset your password." }, { name: "robots", content: "noindex" }] }),
  component: Reset,
});

function Reset() {
  const [pw, setPw] = useState("");
  const navigate = useNavigate();
  async function save(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated");
    navigate({ to: "/dashboard" });
  }
  return (
    <main className="mx-auto max-w-md px-5 py-20">
      <form onSubmit={save} className="rounded-3xl border-2 border-ink bg-card p-7 shadow-pop">
        <h1 className="text-4xl">New password</h1>
        <input required minLength={8} type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="8+ characters" className="mt-6 w-full rounded-xl border-2 border-input bg-background px-4 py-3" />
        <button className="mt-4 w-full rounded-full border-2 border-ink bg-primary py-3 font-medium text-primary-foreground">Save password</button>
      </form>
    </main>
  );
}
