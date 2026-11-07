import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function AppHeader() {
  const [signedIn, setSignedIn] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => data.subscription.unsubscribe();
  }, []);
  async function signOut() {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
      <Link to="/" className="font-display text-2xl">Shopsite<span className="text-primary">.</span>ai</Link>
      <nav className="flex items-center gap-4 text-sm">
        {signedIn ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/account" className="hidden sm:inline">Account</Link>
            <button onClick={signOut} className="rounded-full bg-ink px-4 py-2 text-ink-foreground">Sign out</button>
          </>
        ) : (
          <>
            <Link to="/auth" className="hidden sm:inline">Sign in</Link>
            <Link to="/auth" search={{ mode: "signup" }} className="rounded-full bg-ink px-4 py-2 text-ink-foreground">Start free</Link>
          </>
        )}
      </nav>
    </header>
  );
}
