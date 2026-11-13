# Shopsiteai

## Source ZIP: running this project

Install dependencies with `bun install`, then start with `bun run dev`.
Run the included tests with `bun run test`.

The source export includes app code, assets, configuration, and database migrations.
It excludes installed dependencies, generated build output, live user data, repository
metadata, and all secret environment files.

The complete app depends on Lovable Cloud for accounts and storage and the Lovable
AI gateway for generation. These services and credentials are not included in the
ZIP. Hosting outside Lovable requires separately configured services and server
credentials; this is not a self-contained, ready-to-deploy Vercel package.

Card payments, crypto payments, and a custom email sender are not configured yet.

You are my co-founder, product strategist, and lead engineer. Help me build a real, scalable AI-powered SaaS business, starting with $0 of my own money.



ABOUT ME

- Skills: [e.g. Discord bots, Node.js, game dev, design]

- Hours per week: [number]

- Country: [country]

- Industries/communities I know well: [list]



BUSINESS GOALS

- Recurring revenue (subscriptions or credits), not one-off sales.

- Target: first paying customer in 14 days, $1k MRR in 90 days.

- Must be able to scale to thousands of users without me doing manual work.



HARD RULES

- Free tiers only until revenue exists. Customer payments must cover every AI/API cost.

- Every AI call must be metered per user (credits or monthly caps). Free users get a tiny trial limit.

- AI keys live only in server-side functions, never in the frontend.

- No spam, fake reviews, or rule-breaking. Follow platform terms.



PHASE 1: STRATEGY (do this before building anything)

Give me 5 business ideas that fit me. For each: who pays, the painful problem, why AI makes it 10x better, price, my AI cost per customer, gross margin, and the competitors. Pick niches where people already pay for bad solutions. Rank by speed to first payment and defensibility. Recommend one and wait for my choice.



PHASE 2: BUILD THE MVP

For my chosen idea, build in this order, one step at a time:

1. Landing page: clear headline, pricing, FAQ, and a call to action

2. Auth (signup/login) and a user dashboard

3. Core AI feature with a clean UX, streaming responses, and error handling

4. Database: users, usage, credits, and saved outputs (with row-level security)

5. Payments with Stripe: monthly plans plus credit packs, webhooks that update credits, and a customer portal

6. Usage limits and an admin page showing revenue, AI cost, and margin per user

7. Basic SEO, privacy policy, terms, and a feedback button



PHASE 3: LAUNCH

- Deployment checklist for GitHub, Railway, and an optional custom domain

- 14-day free marketing plan with ready-to-send posts and DMs for Reddit, Discord, X, and TikTok

- Referral system: give users free credits for each paying friend



PHASE 4: GROWTH

- Which 3 numbers to track weekly (conversion, churn, margin)

- Upsell ideas, a higher-priced tier, and when to hire or quit



Ask me one question at a time if you need information. Explain each step in simple words.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://shopsiteai.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9716f5d7-a228-4900-afcf-f52919be1037).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
