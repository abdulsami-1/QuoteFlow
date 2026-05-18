<div align="center">
  <h1>QuoteFlow</h1>
  <p><strong>AI-powered lead intake and instant quoting platform for service businesses</strong></p>
  <p>Embed a smart intake widget on any website. Let AI qualify leads, generate quotes, and notify you — automatically.</p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js" alt="Next.js">
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React">
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
    <img src="https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma&logoColor=white" alt="Prisma">
    <img src="https://img.shields.io/badge/Stripe-Billing-635BFF?style=flat-square&logo=stripe&logoColor=white" alt="Stripe">
    <img src="https://img.shields.io/badge/Gemini-2.0_Flash-4285F4?style=flat-square&logo=google&logoColor=white" alt="Google Gemini">
  </p>
</div>

---

## Overview

QuoteFlow lets service businesses capture and qualify leads through an embeddable widget that lives on their own website. When a prospect fills out the intake form, Gemini AI analyzes their responses, assigns a price range from your pricing rules, flags urgency, and sends a formatted summary to your inbox — all in under 10 seconds.

The dashboard gives business owners a complete CRM-style view: lead pipeline, AI-generated summaries, quote history, analytics, and billing management.

---

## Features

### For Business Owners
- **Embeddable Intake Widget** — drop one `<script>` tag on any website; fully branded
- **AI Lead Qualification** — Gemini 2.0 Flash reads conversation transcripts and extracts name, email, urgency, and intent
- **Automated Quoting** — pricing rules map keywords to price tiers; quotes are instant and consistent
- **Email Notifications** — formatted lead alerts with AI summary and quote range delivered to your inbox
- **Lead Dashboard** — manage leads through NEW → CONTACTED → CLOSED → ARCHIVED pipeline
- **Analytics** — monthly lead volume, urgency breakdown, revenue estimates, conversion trends
- **Real-time Notifications** — in-app bell with unread badge; clears on open
- **Dark / Light Mode** — full theme support across all pages

### Platform
- **Multi-service Support** — configure multiple services, each with its own questions and pricing rules
- **Plan-based Lead Limits** — enforced per billing tier (Free: 5, Starter: 50, Pro: 200, Agency: unlimited)
- **Returning Prospect Detection** — flags when an email has submitted before
- **Stripe Billing** — checkout, portal, and webhook-based subscription sync
- **Security-hardened API** — rate limiting on all public and auth routes, Zod validation, CORS scoped to intake only

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| UI | React 19 + Radix UI + shadcn/ui |
| Styling | Tailwind CSS v4 (`@theme inline` design tokens) |
| Animation | Framer Motion |
| Data Viz | Recharts |
| ORM | Prisma 5 |
| Database | PostgreSQL |
| Auth | JWT (jose) + httpOnly cookies |
| AI | Google Gemini 2.0 Flash |
| Payments | Stripe (Checkout, Portal, Webhooks) |
| Email | Nodemailer (SMTP) |
| Validation | Zod |
| State | Zustand + React Hook Form |
| Testing | Vitest (unit) + Playwright (e2e) |
| Deployment | Vercel / Railway |

---

## Screenshots

> Add screenshots here after deployment.

| Dashboard | Lead Detail | Intake Widget | Billing |
|-----------|------------|---------------|---------|
| *(dashboard.png)* | *(lead-detail.png)* | *(widget.png)* | *(billing.png)* |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    External Website                      │
│  <script src="quoteflow-widget.js" data-token="...">    │
└───────────────────────┬─────────────────────────────────┘
                        │  CORS-open intake API
                        ▼
┌─────────────────────────────────────────────────────────┐
│                   Next.js App (App Router)               │
│                                                          │
│  Middleware (proxy.ts)                                   │
│  ├─ Global rate limit: 60 req/min per IP                │
│  ├─ JWT auth guard for /dashboard + protected APIs      │
│  └─ Public passthrough for /intake, /api/auth, /health  │
│                                                          │
│  API Routes                                              │
│  ├─ /api/intake/[token]/submit  ← AI intake + quoting   │
│  ├─ /api/leads/*                ← Lead CRUD             │
│  ├─ /api/services/*             ← Service management    │
│  ├─ /api/stripe/*               ← Billing               │
│  ├─ /api/auth/*                 ← Login / signup        │
│  └─ /api/stats                  ← Analytics             │
│                                                          │
│  Dashboard (Server + Client Components)                  │
│  ├─ /dashboard          ← Overview + metrics            │
│  ├─ /dashboard/leads    ← Pipeline table                │
│  ├─ /dashboard/services ← Widget + service config       │
│  ├─ /dashboard/stats    ← Charts + analytics            │
│  ├─ /dashboard/settings ← Business config               │
│  └─ /dashboard/billing  ← Plans + Stripe portal        │
└──────────┬───────────────────────┬──────────────────────┘
           │                       │
           ▼                       ▼
    PostgreSQL (Prisma)    Google Gemini AI
                                   │
                           Prompt 1: Intake conductor
                           (extract name, email, intent,
                            urgency, decision key)
                                   │
                           Prompt 2: Lead summarizer
                           (plain-English summary for
                            business owner email)
```

### Lead Submission Flow
1. Prospect completes intake widget on client website
2. Widget POSTs conversation transcript to `/api/intake/[embedToken]/submit`
3. Middleware applies global rate limit; route applies per-IP rate limit (10/min)
4. Zod validates payload; answers sanitized against prompt injection
5. Plan limit checked against monthly lead count
6. Gemini extracts structured data (name, email, urgency, decision key)
7. Pricing rule matched by decision key → quote range calculated
8. Second Gemini call generates human-readable summary
9. Lead saved to DB; email notification sent; in-app notification created
10. Quote returned to widget for display to prospect

---

## Getting Started

### Prerequisites

- Node.js 20+
- [Neon](https://neon.tech) PostgreSQL database (free tier available)
- Google Gemini API key — [get one free](https://aistudio.google.com/app/apikey)
- Stripe account (for billing features)
- SMTP credentials (Gmail, Resend, Postmark, etc.)

### Database Setup (Neon)

1. Sign up at [neon.tech](https://neon.tech) and create a new project
2. Go to your project dashboard → **Connection Details**
3. Copy the **connection string** (use the pooler URL for best performance):
   ```
   postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   ```
4. Paste it as `DATABASE_URL` in your `.env` file

### Installation

```bash
# Clone the repository
git clone https://github.com/abdulsami-1/QuoteFlow.git
cd QuoteFlow

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env — paste your Neon DATABASE_URL and other values

# Push schema to Neon (creates all tables)
npm run db:push

# Seed demo data
npm run db:seed

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in:
- **Email:** `admin@quoteflow.demo`
- **Password:** `demo1234`

---

## Environment Variables

Copy `.env.example` to `.env` and fill in each value:

```env
# Database (PostgreSQL — Railway, Supabase, or Neon)
DATABASE_URL="postgresql://user:password@host:5432/quoteflow"

# JWT secret — must be 32+ random characters
# Generate with: openssl rand -base64 32
JWT_SECRET="change-me-to-a-long-random-string-at-least-32-chars"

# Google Gemini AI — https://aistudio.google.com/app/apikey
GEMINI_API_KEY="your-gemini-api-key-here"

# SMTP for lead notification emails
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="you@example.com"
SMTP_PASS="your-smtp-password-or-app-password"

# Public base URL
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"

# Stripe — https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_stripe_webhook_secret"

# Stripe Price IDs (create in Stripe Dashboard under Products)
STRIPE_STARTER_PRICE_ID="price_your_starter_price_id"
STRIPE_PRO_PRICE_ID="price_your_pro_price_id"
STRIPE_AGENCY_PRICE_ID="price_your_agency_price_id"
```

---

## Stripe Setup

1. Create three products in your [Stripe Dashboard](https://dashboard.stripe.com/products): **Starter** ($29/mo), **Pro** ($79/mo), **Agency** ($199/mo)
2. Copy each price ID into your `.env`
3. For local webhook testing, install the [Stripe CLI](https://stripe.com/docs/stripe-cli):
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   Copy the printed webhook secret into `STRIPE_WEBHOOK_SECRET`

---

## Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push this repo to GitHub and import it in Vercel
2. Add all environment variables in the Vercel dashboard (copy from `.env.example`)
3. Set `DATABASE_URL` to your **Neon connection string** (pooler URL)
4. `vercel.json` configures the build command (`prisma generate && next build`) automatically — schema is synced on every deploy
5. Set up your Stripe webhook endpoint: `https://your-domain.vercel.app/api/stripe/webhook`

### Railway

1. Create a new Railway project and connect your GitHub repo
2. Add environment variables manually in Railway Variables (use Neon for the database)
3. Set `DATABASE_URL` to your Neon connection string
4. `railway.json` configures the start command automatically

> **Neon tip:** Copy the **pooler** connection string from your Neon dashboard for Vercel/Railway. It handles connection limits better under serverless scaling.

---

## Available Scripts

```bash
npm run dev          # Start development server (Turbopack)
npm run build        # Production build
npm start            # Start production server

npm run db:push      # Sync Prisma schema to Neon (creates/updates tables)
npm run db:generate  # Regenerate Prisma client after schema changes
npm run db:seed      # Seed demo data into database
npm run db:studio    # Open Prisma Studio (visual DB browser)

npm test             # Run unit tests (Vitest)
npm run test:e2e     # Run end-to-end tests (Playwright)
npm run test:all     # Run all tests
```

### Database Migrations

QuoteFlow uses `prisma db push` for schema sync (no migration files required for most changes):

```bash
# After changing prisma/schema.prisma:
npm run db:push

# Inspect your Neon database visually:
npm run db:studio
```

For production schema changes, run `npm run db:push` in your deployment pipeline before starting the server. Both Vercel and Railway support this via the `buildCommand` in their config files.

---

## Project Structure

```
quoteflow/
├── app/
│   ├── (auth)/              # Login + signup pages
│   ├── (dashboard)/         # Protected dashboard pages
│   ├── api/                 # API route handlers
│   │   ├── auth/            # Login, signup, logout
│   │   ├── business/        # Business config CRUD
│   │   ├── intake/          # Public intake widget API (CORS-open)
│   │   ├── leads/           # Lead management
│   │   ├── notifications/   # In-app notifications
│   │   ├── pricing/         # Pricing rule CRUD
│   │   ├── services/        # Service CRUD
│   │   ├── stats/           # Analytics aggregation
│   │   └── stripe/          # Checkout, portal, webhook, sync
│   └── intake/              # Public intake widget page
├── components/
│   ├── ui/                  # shadcn/ui base components
│   ├── billing/             # Billing cards + plan management
│   ├── dashboard/           # Dashboard layout + nav
│   ├── leads/               # Lead table + detail
│   ├── services/            # Service builder + widget preview
│   └── stats/               # Analytics charts + metrics
├── lib/
│   ├── auth-helpers.ts      # JWT session helpers
│   ├── db.ts                # Prisma client singleton
│   ├── email.ts             # Lead notification emails
│   ├── gemini.ts            # Google Gemini AI client
│   ├── logger.ts            # Structured JSON logger
│   ├── pricing.ts           # Pricing rule matching logic
│   ├── prompts.ts           # Gemini prompt templates
│   ├── rate-limiter.ts      # In-memory rate limiter
│   ├── stripe.ts            # Stripe client + plan config
│   └── validations.ts       # Zod schemas
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Demo data seeder
├── tests/
│   ├── unit/                # Vitest unit tests
│   └── e2e/                 # Playwright e2e tests
├── proxy.ts                 # Next.js middleware (auth + rate limit)
├── vercel.json              # Vercel deployment config
└── railway.json             # Railway deployment config
```

---

## Security

- All passwords hashed with bcrypt (10 rounds)
- JWT sessions in httpOnly cookies; no tokens exposed to JavaScript
- Global rate limiting at middleware level (60 req/min per IP)
- Per-route rate limiting on auth, intake, and mutation endpoints
- Zod schema validation on every API input
- Prompt injection prevention — user answers sanitized before Gemini calls
- CORS wildcard scoped only to public intake routes
- Stripe webhook signature verification on every event
- Ownership checks on every resource query — no IDOR vulnerabilities

---

## Roadmap

- [ ] Multi-tenant agency mode — manage multiple client businesses from one account
- [ ] Widget customization UI — live preview with brand color, logo, and copy editing
- [ ] Zapier / Make integration — push leads to CRMs (HubSpot, Pipedrive, Notion)
- [ ] SMS notifications — Twilio-based alerts for high-urgency leads
- [ ] Distributed rate limiting — Upstash Redis for multi-instance deployments
- [ ] White-label mode — remove QuoteFlow branding for agency resellers
- [ ] Conversation replay — replay intake transcript as visual chat timeline
- [ ] Lead scoring — ML-based ranking beyond urgency flag
- [ ] A/B testing for intake questions — measure conversion across variants

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">
  <p>Built for service businesses that want smarter lead capture.</p>
</div>
