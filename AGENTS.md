<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Architecture rules
- AI calls run only in `src/routes/api/generate.ts` (server route, bearer-verified); credits are spent atomically via the `spend_credit` DB function and refunded on failure — never call AI from the browser.
- Plan prices, credits and cost estimates live only in `src/lib/pricing.ts` (covered by `pricing.test.ts`) so UI, metering and tests share one source.
- User-generated site HTML is only rendered inside sandboxed iframes (no `allow-same-origin`) to keep it off the app origin.
- Credits/plan columns on `profiles` are not user-updatable (column grants); only server code with the admin client changes them.
- Signed-in pages wrap content in `AppShell` (sidebar + credits meter); site imports (ZIP/HTML/public GitHub) are inlined client-side into one HTML string in `src/lib/import-site.ts` so the editor and public page keep a single `sites.html` field.
- The site editor uses a dedicated full-height chat/preview workspace; show only committed HTML in its sandboxed preview to avoid flashing incomplete streamed markup.
- Centralize public-entry session redirects in the root auth listener and keep password recovery outside automatic workspace navigation.
