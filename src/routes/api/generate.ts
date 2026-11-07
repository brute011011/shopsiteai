import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { streamChatCompletion, GatewayError } from "@lovable.dev/ai-gateway";
import { CREDITS_PER_EDIT, estimateCostUsd } from "@/lib/pricing";

const Body = z.object({ siteId: z.string().uuid(), prompt: z.string().trim().min(2).max(2000) });

const SYSTEM = `You are an expert web designer building websites for small local businesses.
Return ONLY one complete, self-contained HTML document (<!doctype html> ... </html>). No markdown fences, no explanations.
Use <script src="https://cdn.tailwindcss.com"></script> for styling and Google Fonts if helpful.
Make it beautiful, mobile-first, with clear sections (hero, about, services/menu, opening hours, location, contact).
Use https://images.unsplash.com photos only via source-like URLs that are likely valid, or tasteful CSS gradients.
Never include forms that submit to external servers; use mailto: / tel: links for contact.
If an existing page is provided, apply the requested change and keep everything else.`;

export const Route = createFileRoute("/api/generate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
        if (!token) return new Response("Please sign in.", { status: 401 });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: userData, error: authErr } = await supabaseAdmin.auth.getUser(token);
        if (authErr || !userData.user) return new Response("Please sign in.", { status: 401 });
        const userId = userData.user.id;

        const parsed = Body.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return new Response("Please describe what you want (2–2000 characters).", { status: 400 });
        const { siteId, prompt } = parsed.data;

        const { data: site } = await supabaseAdmin.from("sites").select("id,html,user_id").eq("id", siteId).maybeSingle();
        if (!site || site.user_id !== userId) return new Response("Site not found.", { status: 404 });

        const { data: ok } = await supabaseAdmin.rpc("spend_credit", { _user_id: userId, _amount: CREDITS_PER_EDIT });
        if (!ok) return new Response("You're out of AI edits. Upgrade or buy a credit pack to keep building.", { status: 402 });

        const userMsg = site.html
          ? `Current page:\n${site.html}\n\nRequested change: ${prompt}`
          : `Build a website for this business: ${prompt}`;

        let stream;
        try {
          stream = await streamChatCompletion({
            model: "openai/gpt-6-astra",
            messages: [{ role: "system", content: SYSTEM }, { role: "user", content: userMsg }],
            stream: true,
            stream_options: { include_usage: true },
          });
        } catch (e) {
          await supabaseAdmin.rpc("refund_credit", { _user_id: userId, _amount: CREDITS_PER_EDIT });
          console.error("ai start failed", e instanceof GatewayError ? e.code : e);
          const busy = e instanceof GatewayError && e.httpStatus === 429;
          return new Response(busy ? "The AI is busy right now. Your edit was refunded — try again in a minute." : "The AI couldn't start. Your edit was refunded.", { status: 503 });
        }

        const enc = new TextEncoder();
        const body = new ReadableStream({
          async start(controller) {
            let full = "";
            let inTok = 0, outTok = 0;
            try {
              for await (const ev of stream as AsyncIterable<any>) {
                const delta = ev?.choices?.[0]?.delta?.content;
                if (typeof delta === "string" && delta) { full += delta; controller.enqueue(enc.encode(delta)); }
                if (ev?.usage) { inTok = ev.usage.prompt_tokens ?? 0; outTok = ev.usage.completion_tokens ?? 0; }
              }
              const html = full.replace(/^```(?:html)?\s*/i, "").replace(/```\s*$/, "").trim();
              if (!/<html[\s>]/i.test(html)) throw new Error("incomplete");
              await supabaseAdmin.from("sites").update({ html, updated_at: new Date().toISOString() }).eq("id", siteId);
              await supabaseAdmin.from("site_messages").insert([
                { site_id: siteId, user_id: userId, role: "user", content: prompt },
                { site_id: siteId, user_id: userId, role: "assistant", content: "Done — your site is updated." },
              ]);
              await supabaseAdmin.from("usage_events").insert({ user_id: userId, credits: CREDITS_PER_EDIT, input_tokens: inTok, output_tokens: outTok, cost_usd: estimateCostUsd(inTok, outTok) });
            } catch (e) {
              console.error("ai stream failed", e);
              await supabaseAdmin.rpc("refund_credit", { _user_id: userId, _amount: CREDITS_PER_EDIT });
              controller.enqueue(enc.encode("\n<!--SHOPSITE_ERROR-->"));
            } finally {
              controller.close();
            }
          },
        });
        return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });
      },
    },
  },
});
