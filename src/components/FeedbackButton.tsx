import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  async function send() {
    if (!msg.trim()) return;
    setBusy(true);
    const { data } = await supabase.auth.getUser();
    const { error } = await supabase.from("feedback").insert({ message: msg.trim().slice(0, 2000), user_id: data.user?.id ?? null, email: data.user?.email ?? null });
    setBusy(false);
    if (error) return toast.error("Couldn't send feedback. Please try again.");
    toast.success("Thanks! We read every message.");
    setMsg(""); setOpen(false);
  }
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div className="mb-3 w-72 rounded-2xl border-2 border-ink bg-card p-4 shadow-pop">
          <p className="font-medium">Send feedback</p>
          <textarea value={msg} onChange={(e) => setMsg(e.target.value)} maxLength={2000} rows={4} placeholder="What should we improve?" className="mt-2 w-full rounded-lg border-2 border-input bg-background p-2 text-sm" />
          <button disabled={busy} onClick={send} className="mt-2 w-full rounded-full bg-primary py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">{busy ? "Sending…" : "Send"}</button>
        </div>
      )}
      <button onClick={() => setOpen(!open)} className="rounded-full border-2 border-ink bg-ink px-4 py-2 text-sm text-ink-foreground shadow-pop">{open ? "Close" : "Feedback"}</button>
    </div>
  );
}
