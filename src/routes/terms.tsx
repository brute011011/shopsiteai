import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms of Service — Shopsite AI" }, { name: "description", content: "The rules for using Shopsite AI." }, { property: "og:title", content: "Terms of Service — Shopsite AI" }, { property: "og:description", content: "The rules for using Shopsite AI." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => (
    <LegalPage title="Terms of Service">
      <p>These terms are an agreement between you and Shopsite AI ("we", "us"). By creating an account you accept them. If you don't agree, please don't use the service.</p>
      <h2>1. The service</h2><p>Shopsite AI lets you create and host websites using artificial intelligence. AI output can contain mistakes. You must review your website before publishing and you are responsible for its content.</p>
      <h2>2. Your account</h2><ul><li>You must be at least 18, or the age of majority where you live.</li><li>Keep your password safe. You're responsible for activity on your account.</li><li>Give accurate information.</li></ul>
      <h2>3. Acceptable use</h2><p>You may not use Shopsite AI to create content that is illegal, fraudulent, deceptive, hateful, sexually explicit, infringes others' rights (including copyright and trademarks), impersonates others, collects data without consent, distributes malware, or sends spam. We may remove content or suspend accounts that break these rules.</p>
      <h2>4. Your content</h2><p>You own the content you put in and the websites you create. You give us permission to store, process and display it only to run the service. You confirm you have the right to use any text, names, logos or images you provide.</p>
      <h2>5. Plans, credits and payment</h2><ul><li>Free accounts get a small number of AI edits to try the service.</li><li>Paid plans renew automatically each month until cancelled. You can cancel anytime; access continues until the end of the paid period.</li><li>Credit packs are one-time purchases and don't expire while your account is open. Credits have no cash value.</li><li>Failed AI edits are automatically refunded as credits.</li><li>Prices may change with at least 30 days' notice. Taxes may be added where required.</li></ul>
      <h2>6. Refunds and cancellation rights</h2><p>If you are a consumer in the UK or EU you have a 14-day right to cancel a new subscription. By starting to use paid credits during that period you agree that the service begins immediately, and any refund will be reduced by the credits used. Otherwise, contact us within 14 days of a charge if something went wrong and we'll make it right.</p>
      <h2>7. Availability</h2><p>We work hard to keep Shopsite AI running, but we don't guarantee it will always be available or error-free. We may change or discontinue features with reasonable notice.</p>
      <h2>8. Liability</h2><p>To the extent the law allows, the service is provided "as is" and our total liability is limited to the amount you paid us in the 12 months before the claim. Nothing in these terms limits liability that cannot legally be limited, or your statutory rights as a consumer.</p>
      <h2>9. Ending your account</h2><p>You can delete your account at any time from Account settings. We may suspend or close accounts that seriously or repeatedly break these terms.</p>
      <h2>10. Law</h2><p>These terms are governed by the laws of England and Wales. Consumers may also bring claims in the courts where they live.</p>
      <h2>11. Contact</h2><p>Questions? Email <a className="underline" href="mailto:hello@shopsite.ai">hello@shopsite.ai</a>.</p>
    </LegalPage>
  ),
});
