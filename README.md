# CareProof

Verified carers directory for Australia. Families search by specialty and city, check work history and screening, then book with **escrow** — payment is collected first and released to the carer after the booking.

## Features

- SEO URLs: `/caregivers/{specialty}/{state}/{city}/{suburb}` and `/caregiver/{slug}`
- Instant Book and request-to-book
- Care requests + proposals + hire
- Escrow ledger (demo by default; Stripe Connect when keys are set)
- WWCC, NDIS, AHPRA and employer-confirmed work history
- Reviews only after a released booking
- Carers edit their own public profile from `/dashboard/profile`
- Booking message thread between family and carer

## Setup

CareProof runs on **PostgreSQL**. Provide a connection string via `DATABASE_URL`
(see `.env.example`). For local development you can use a local Postgres:

```bash
createdb careproof   # or use an existing Postgres instance
cp .env.example .env  # DATABASE_URL defaults to the local dev Postgres
npm install
npx prisma migrate dev   # applies migrations to DATABASE_URL
npm run db:seed          # loads the full demo dataset
npm run dev
```

`DATABASE_URL` must be a PostgreSQL URL. In development, if it is unset the app
falls back to `postgresql://careproof:careproof@127.0.0.1:5432/careproof`; in
production it is required.

Demo logins (password `CareProof123!`):

- Family: `family@careproof.com.au`
- Carer: `carer@careproof.com.au`

## Five-minute demo

1. Open `/caregivers/nannies/nsw/sydney/bondi` — Priya Nair plus nearby clones from her profile.
2. Log in as the family. Dashboard shows a request waiting on James, escrow with Sarah, and after-school care in progress with Priya.
3. Open Sarah’s booking and use the message thread.
4. Log in as the carer (`carer@careproof.com.au`) and edit `/dashboard/profile`.
5. Join as a new carer at `/register` — you land on the profile checklist.

## Vercel

CareProof deploys to Vercel against a managed PostgreSQL database (Vercel
Postgres, Neon, Supabase, etc.). The build no longer bundles a SQLite snapshot —
every environment reads from `DATABASE_URL`.

**Required environment variables**

- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — 32+ character secret for NextAuth
- `NEXT_PUBLIC_SITE_URL` — public site URL (e.g. `https://careproof.vercel.app`)
- `AUTH_URL` — canonical auth URL (set to the same value as the deployed site URL)

**Optional environment variables**

- `PLATFORM_FEE_BPS` — platform fee in basis points (defaults to 1000 = 10%)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
  `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — enable real Stripe payments; without
  them CareProof uses the in-app demo escrow ledger

**Deploy steps**

1. Provision a PostgreSQL database and copy its connection string.
2. Set the environment variables above on the Vercel project.
3. Deploy. The build command
   (`prisma generate && prisma migrate deploy && next build`, see `vercel.json`
   and the `vercel-build` script) runs migrations before building, so the schema
   is created/updated automatically on every deploy.
4. (Optional) Seed the demo dataset once with
   `DATABASE_URL=... npm run db:seed`.

## Payments

Without `STRIPE_SECRET_KEY`, checkout writes to the in-app escrow ledger so hold/release still works. With Stripe keys, PaymentIntents and Connect transfers are created in AUD.
