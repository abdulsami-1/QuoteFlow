<div align="center">
  <h1>QuoteFlow</h1>
  <p>Lead intake and quoting tool for service businesses</p>
  <p>Embed a chat-style intake form on any website. Gemini AI parses the conversation, matches a pricing rule, and sends you a lead summary — without manual review.</p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js" alt="Next.js">
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React">
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
    <img src="https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma&logoColor=white" alt="Prisma">
    <img src="https://img.shields.io/badge/Stripe-Billing-635BFF?style=flat-square&logo=stripe&logoColor=white" alt="Stripe">
    <img src="https://img.shields.io/badge/Gemini-2.0_Flash-4285F4?style=flat-square&logo=google&logoColor=white" alt="Gemini">
    <img src="https://img.shields.io/github/actions/workflow/status/abdulsami-1/QuoteFlow/ci.yml?style=flat-square&label=CI" alt="CI">
  </p>

  <br />

  ![QuoteFlow landing page](public/Screenshot%202026-05-18%20231153.png)
</div>

---

## What it does

A business owner configures one or more services — each with a set of intake questions and keyword-based pricing tiers. They paste a single `<script>` tag on their website. When a visitor fills in the intake form, the app:

1. Sends the conversation to Gemini AI, which extracts name, email, urgency, and a decision keyword
2. Matches that keyword to a pricing rule to produce a quote range
3. Stores the lead with an AI-generated plain-English summary
4. Sends an email notification to the business owner
5. Returns the quote estimate to the prospect

The dashboard lets the owner manage the lead pipeline (New → Contacted → Closed → Archived), view analytics, and manage billing.

---

## Features

- Embeddable intake widget — paste one script tag on any site
- Gemini 2.0 Flash for lead parsing and summary generation
- Keyword-based pricing rules — configure tiers per service
- Lead CRM with pipeline status, urgency flags, and CSV export
- Email notifications per lead via SMTP
- In-app notification bell
- Analytics: monthly volume, urgency split, revenue estimates
- Stripe billing with Checkout, portal, and webhook sync
- JWT auth with httpOnly cookies
- Dark/light mode
- Rate limiting at middleware and route level
- Returning prospect detection

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| UI | React 19, Radix UI, shadcn/ui |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Charts | Recharts |
| ORM | Prisma 5 |
| Database | PostgreSQL (Neon) |
| Auth | JWT via jose + httpOnly cookies |
| AI | Google Gemini 2.0 Flash |
| Payments | Stripe (Checkout, Portal, Webhooks) |
| Email | Nodemailer (SMTP) |
| Validation | Zod |
| State | Zustand, React Hook Form |
| Testing | Vitest (unit), Playwright (e2e) |
| CI | GitHub Actions |
| Deployment | Vercel / Railway |

---

## Architecture

```
External website
  └─ <script> tag
       └─ POST /api/intake/[embedToken]/submit  (CORS open)
            ├─ Rate limit check (10 req/min per IP)
            ├─ Plan lead-count check
            ├─ Zod validation + prompt-injection sanitization
            ├─ Gemini prompt 1 → extract name, email, urgency, decision key
            ├─ Pricing rule match → quote range
            ├─ Gemini prompt 2 → plain-English summary
            ├─ DB: create Lead
            ├─ Email: send owner notification
            └─ DB: create Notification

Next.js middleware (proxy.ts)
  ├─ Global rate limit: 60 req/min per IP
  ├─ JWT auth guard for /dashboard and protected APIs
  └─ Public passthrough: /intake, /api/auth, /api/health

Dashboard (server + client components)
  ├─ /dashboard/leads    — lead pipeline table
  ├─ /dashboard/services — service + pricing rule config
  ├─ /dashboard/stats    — charts and analytics
  ├─ /dashboard/settings — business profile
  └─ /dashboard/billing  — Stripe plan management

Database models: User, Subscription, BusinessConfig,
                 Service, PricingRule, Lead, Notification
```

---

## Demo Access

Live demo available via deployed application preview.

---

## Getting Started

### Prerequisites

- Node.js 20+
- [Neon](https://neon.tech) PostgreSQL database (free tier works)
- Google Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- Stripe account for billing (optional — the app works without it)
- SMTP credentials for email notifications (optional)

### Database Setup (Neon)

1. Create a project at [neon.tech](https://neon.tech)
2. Go to **Connection Details** and copy the **pooled** connection string:
   ```
   postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   ```
3. Paste it as `DATABASE_URL` in your `.env`

### Installation

```bash
git clone https://github.com/abdulsami-1/QuoteFlow.git
cd QuoteFlow
npm install
cp .env.example .env
# fill in .env values
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and create an account to get started.

---

## Environment Variables

Copy `.env.example` to `.env`:

```env
# PostgreSQL (Neon pooler URL recommended)
DATABASE_URL="postgresql://user:password@ep-xxx-pooler.neon.tech/neondb?sslmode=require"

# JWT — generate with: openssl rand -base64 32
JWT_SECRET="at-least-32-random-characters"

# Google Gemini
GEMINI_API_KEY="your-key-from-aistudio.google.com"

# App base URL
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"

# SMTP (optional — leads are still saved without it)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="you@gmail.com"
SMTP_PASS="your-app-password"

# Stripe (optional — required for paid plans)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_STARTER_PRICE_ID="price_..."
STRIPE_PRO_PRICE_ID="price_..."
STRIPE_AGENCY_PRICE_ID="price_..."
```

---

## Stripe Setup

1. Create three products in the [Stripe Dashboard](https://dashboard.stripe.com/products): Starter ($29/mo), Pro ($79/mo), Agency ($199/mo)
2. Copy the price IDs into `.env`
3. For local webhook testing:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   Copy the printed signing secret into `STRIPE_WEBHOOK_SECRET`

---

## Available Scripts

```bash
npm run dev          # development server
npm run build        # production build
npm start            # production server

npm run db:push      # sync schema to database
npm run db:generate  # regenerate Prisma client
npm run db:seed      # seed demo data
npm run db:studio    # open Prisma Studio

npm test             # unit tests (Vitest)
npm run test:e2e     # e2e tests (Playwright)
```

### Database Migrations

The project uses `prisma db push` rather than migration files. After changing `prisma/schema.prisma`:

```bash
npm run db:push
```

This runs automatically on Vercel as part of the build command (`prisma generate && next build`).

---

## Deployment

### Vercel

1. Push to GitHub and import in Vercel
2. Set all environment variables in the Vercel dashboard
3. Use the Neon pooler URL for `DATABASE_URL`
4. Add a Stripe webhook endpoint: `https://your-domain.vercel.app/api/stripe/webhook`
5. `vercel.json` configures the build command automatically

### Railway

1. Connect your GitHub repo
2. Add environment variables (Neon for DATABASE_URL)
3. `railway.json` sets the start command

> **Note on rate limiting:** The in-memory rate limiter works per-instance. On Vercel's serverless/edge model, each function invocation may be a different instance, so effective limits will be higher than configured. For strict rate limiting in production, replace with [Upstash Redis](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview).

---

## Production Checklist

Before going live:

- [ ] `DATABASE_URL` set to Neon pooler URL
- [ ] `JWT_SECRET` is at least 32 random characters
- [ ] `NEXT_PUBLIC_APP_URL` matches your actual domain
- [ ] Stripe keys are live (`sk_live_`, `pk_live_`)
- [ ] Stripe webhook endpoint is registered and `STRIPE_WEBHOOK_SECRET` is set
- [ ] SMTP credentials tested — send a test lead through the widget
- [ ] `GEMINI_API_KEY` is valid and has quota
- [ ] `.env` is in `.gitignore` (it is by default in this repo)
- [ ] Review Gemini API rate limits for your expected lead volume

---

## Project Structure

```
quoteflow/
├── app/
│   ├── (auth)/              # login + signup
│   ├── (dashboard)/         # protected dashboard pages
│   ├── api/                 # API route handlers
│   │   ├── auth/            # login, signup, logout
│   │   ├── business/        # business config
│   │   ├── intake/          # public widget API (CORS-open)
│   │   ├── leads/           # lead CRUD
│   │   ├── notifications/   # in-app notifications
│   │   ├── pricing/         # pricing rule CRUD
│   │   ├── services/        # service CRUD
│   │   ├── stats/           # analytics
│   │   └── stripe/          # billing
│   └── intake/              # public intake widget page
├── components/
│   ├── billing/             # billing UI
│   ├── dashboard/           # nav, sidebar, top bar
│   ├── leads/               # leads table, detail panel
│   ├── services/            # service builder, pricing editor
│   ├── stats/               # charts
│   ├── ui/                  # shadcn/ui base components
│   └── shared/              # empty states, loading
├── lib/
│   ├── auth-helpers.ts      # JWT session helpers
│   ├── db.ts                # Prisma client
│   ├── email.ts             # lead notifications
│   ├── gemini.ts            # Gemini AI client
│   ├── pricing.ts           # pricing rule matching
│   ├── prompts.ts           # Gemini prompt templates
│   ├── rate-limiter.ts      # in-memory rate limiter
│   ├── stripe.ts            # Stripe client
│   └── validations.ts       # Zod schemas
├── prisma/
│   ├── schema.prisma        # database schema
│   └── seed.ts              # demo data seeder
├── tests/
│   ├── unit/                # Vitest tests
│   └── e2e/                 # Playwright tests
├── proxy.ts                 # Next.js middleware
├── .github/workflows/ci.yml # GitHub Actions CI
├── vercel.json
└── railway.json
```

---

## API Reference

### Health Check

```
GET /api/health
```

Returns `{ status: "ok" }` if the server is running. Does not check the database.

### Intake Submit (Public)

```
POST /api/intake/[embedToken]/submit
Content-Type: application/json

{
  "serviceId": "string",
  "conversationLog": [
    { "question": "What is your name?", "answer": "Jane Smith" },
    { "question": "What do you need?", "answer": "A full website redesign" }
  ]
}
```

Rate limited to 10 requests/minute per IP. Returns quote range and lead ID on success.

### Authentication

```
POST /api/auth/login
{ "email": "...", "password": "..." }

POST /api/auth/signup
{ "email": "...", "password": "...", "name": "..." }

POST /api/auth/logout
```

All other routes require a valid `qf_session` cookie (set on login).

---

## Known Limitations

- **Rate limiting is in-memory.** On serverless deployments (Vercel), each function instance has its own counter. The actual effective rate limit per IP is `configured_limit × number_of_instances`. For production use with strict limits, replace with Upstash Redis.
- **Gemini fallback is basic.** If Gemini fails to return valid JSON, the intake conductor falls back to a simple text extraction. The fallback name comes from the first answer and email defaults to `unknown@unknown.com`. These leads need manual review.
- **No file attachments.** The intake widget only handles text responses. Attachments (photos, documents) are not supported.
- **Single business per account.** Each user account maps to exactly one business config. Multi-business support would require schema changes.
- **Webhook deduplication is in-memory.** The Stripe webhook handler deduplicates events using a `Set` that resets on each cold start. On a long-running server this is fine; on serverless it offers limited protection.
- **No i18n.** The UI and widget are English-only.
- **SMTP only.** Email uses Nodemailer with SMTP credentials. No native support for transactional email providers (Resend, Postmark) out of the box, though they can be used with their SMTP interface.

---

## Future Improvements

These are realistic next steps, not a wishlist:

- **Upstash Redis rate limiting** — consistent limits across serverless instances
- **Webhook dedup table** — persist processed Stripe event IDs in Postgres instead of memory
- **Multi-business support** — allow one account to manage multiple business configs
- **File attachments in widget** — accept image uploads for services that need photo estimates
- **Transactional email provider** — first-class support for Resend or Postmark
- **Lead export improvements** — more formats (JSON, PDF summary) and date range filters
- **Webhook retry visibility** — surface Stripe webhook delivery status in the dashboard
- **Widget theming options** — custom CSS variables per business without code changes
- **Lead assignment** — assign leads to team members if the account has multiple users

---

## Contributing

### Local Setup

Follow the [Installation](#installation) steps above. The project uses:
- `npm test` for unit tests
- `npm run test:e2e` for end-to-end tests (requires a running server and database)
- `npx tsc --noEmit` for type checking

### Commit Style

Use short, descriptive messages in present tense:
```
add service drag-and-drop reordering
fix pagination on leads table
update Gemini prompt for better urgency detection
```

---

## License

MIT. See [LICENSE](LICENSE) for details.

---

<div align="center">
  <sub>Built by Abdul Sami</sub>
</div>
