import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { AppHeader } from "@/components/AppHeader";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { mode?: "signup" | "signin" } => ({ mode: s.mode === "signup" ? "signup" : s.mode === "signin" ? "signin" : undefined }),
  head: () => ({ meta: [{ title: "Sign in — Shopsite AI" }, { name: "description", content: "Sign in or create your free Shopsite AI account." }, { property: "og:title", content: "Sign in — Shopsite AI" }, { property: "og:description", content: "Create your free account and build your website with AI." }, { name: "robots", content: "noindex" }] }),
  component: AuthPage,
});

const G = () => (<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.730-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.930-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>);

function AuthPage() {
  const { mode: initial } = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">(initial ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        if (!agree) { toast.error("Please accept the Terms and Privacy Policy."); return; }
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/dashboard", data: { terms_accepted: "true", marketing_opt_in: marketing } } });
        if (error) throw error;
        setSent("Check your inbox and click the link to confirm your account.");
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/reset-password" });
        if (error) throw error;
        setSent("If that email has an account, a reset link is on its way.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally { setBusy(false); }
  }

  async function google() {
    if (mode === "signup" && !agree) { toast.error("Please accept the Terms and Privacy Policy."); return; }
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) { toast.error("Google sign-in failed"); return; }
    if (r.redirected) return;
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-md px-5 py-10">
        <div className="rounded-3xl border-2 border-ink bg-card p-7 shadow-pop">
          <h1 className="text-4xl">{mode === "signup" ? "Create your account" : mode === "signin" ? "Welcome back" : "Reset password"}</h1>
          {sent ? <p className="mt-6 rounded-xl bg-accent p-4 text-accent-foreground">{sent}</p> : (
            <form onSubmit={submit} className="mt-6 space-y-4">
              <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.com" className="w-full rounded-xl border-2 border-input bg-background px-4 py-3" />
              {mode !== "forgot" && <input required minLength={8} type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (8+ characters)" className="w-full rounded-xl border-2 border-input bg-background px-4 py-3" />}
              {mode === "signup" && (
                <div className="space-y-2 text-sm">
                  <label className="flex gap-2"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> <span>I agree to the <Link to="/terms" className="underline">Terms of Service</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>.</span></label>
                  <label className="flex gap-2 text-muted-foreground"><input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} /> <span>Send me occasional product tips (optional, unsubscribe anytime).</span></label>
                </div>
              )}
              <button disabled={busy} className="w-full rounded-full border-2 border-ink bg-primary py-3 font-medium text-primary-foreground disabled:opacity-50">{busy ? "Please wait…" : mode === "signup" ? "Create free account" : mode === "signin" ? "Sign in" : "Send reset link"}</button>
            </form>
          )}
          {mode !== "forgot" && !sent && (
            <>
              <div className="my-5 text-center text-sm text-muted-foreground">or</div>
              <button onClick={google} style={{ background: "#FFFFFF", color: "#1F1F1F", border: "1px solid #747775" }} className="flex w-full items-center justify-center gap-[10px] rounded-full px-3 py-3 text-sm font-medium"><G />Continue with Google</button>
            </>
          )}
          <div className="mt-6 space-y-1 text-center text-sm">
            {mode === "signin" && <><button onClick={() => setMode("forgot")} className="underline">Forgot password?</button><p>New here? <button onClick={() => { setMode("signup"); setSent(null); }} className="text-primary underline">Create an account</button></p></>}
            {mode !== "signin" && <p>Have an account? <button onClick={() => { setMode("signin"); setSent(null); }} className="text-primary underline">Sign in</button></p>}
          </div>
        </div>
      </main>
    </div>
  );
}
