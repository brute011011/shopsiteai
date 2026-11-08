import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — Shopsite AI" }, { name: "description", content: "How Shopsite AI collects and protects your data." }, { property: "og:title", content: "Privacy Policy — Shopsite AI" }, { property: "og:description", content: "How we handle your data." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => (
    <LegalPage title="Privacy Policy">
      <p>Shopsite AI is the data controller for personal data processed through this website. This policy explains what we collect, why, and your rights under UK GDPR, EU GDPR and similar laws (including CCPA in California).</p>
      <h2>What we collect</h2><ul><li><b>Account data:</b> email, name, password (stored encrypted), sign-in method.</li><li><b>Content:</b> the descriptions you write and the websites generated.</li><li><b>Usage data:</b> number of AI edits and their cost, to meter your plan.</li><li><b>Payment data:</b> handled by our payment provider; we never see full card numbers.</li><li><b>Feedback</b> you choose to send us.</li></ul>
      <h2>Why we use it (legal basis)</h2><ul><li>To provide the service you signed up for (contract).</li><li>To prevent abuse and keep the service secure (legitimate interest).</li><li>To send optional product tips, only if you opted in (consent). You can withdraw at any time.</li><li>To meet tax and accounting rules (legal obligation).</li></ul>
      <h2>AI processing</h2><p>Your prompts and current website are sent to our AI provider to generate your site. They are not used by us to train AI models.</p>
      <h2>Who we share it with</h2><p>Only service providers that help us run Shopsite AI: hosting and database, AI model providers, email delivery and payment processing. They may process data outside the UK/EU under appropriate safeguards (such as Standard Contractual Clauses). We never sell your personal data.</p>
      <h2>Cookies and storage</h2><p>We only use storage that is strictly necessary to keep you signed in. We do not use advertising or tracking cookies, so no cookie banner is required.</p>
      <h2>Emails and unsubscribing</h2><p>We send essential account emails (confirmation, password reset). Any non-essential email includes an unsubscribe link, and you can turn product tips off anytime in Account settings.</p>
      <h2>How long we keep it</h2><p>While your account is open. When you delete your account, your websites and personal data are deleted, except records we must keep by law (e.g. invoices, usually 6 years).</p>
      <h2>Your rights</h2><p>You can access, correct, download, or delete your data, object to or restrict processing, and withdraw consent. Use "Download my data" and "Delete my account" in Account settings, or email us. You may complain to your data protection authority (in the UK, the ICO).</p>
      <h2>Children</h2><p>Shopsite AI is not for people under 18.</p>
      <h2>Contact</h2><p>Email <a className="underline" href="mailto:hello@shopsite.ai">hello@shopsite.ai</a>.</p>
    </LegalPage>
  ),
});
