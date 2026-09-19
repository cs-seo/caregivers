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

```bash
cp .env.example .env
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Demo logins (password `CareProof123!`):

- Family: `family@caregiver.com.au`
- Carer: `carer@caregiver.com.au`

## Five-minute demo

1. Open `/caregivers/nannies/nsw/sydney/bondi` — Priya Nair plus nearby clones from her profile.
2. Log in as the family. Dashboard shows a request waiting on James, escrow with Sarah, and after-school care in progress with Priya.
3. Open Sarah’s booking and use the message thread.
4. Log in as the carer (`carer@caregiver.com.au`) and edit `/dashboard/profile`.
5. Join as a new carer at `/register` — you land on the profile checklist.

## Vercel

Preview builds no longer require `DATABASE_URL` at compile time. If it is missing, CareProof uses `prisma/demo.db` (copied to `/tmp` on Vercel so bookings can write). Production domain is **caregiver.com.au**. `www.caregiver.com.au` 301s to the apex host.

On the Vercel production project set:

- `NEXT_PUBLIC_DEMO_MODE=false` — hides seeded `@caregiver.com.au` profiles from the directory, sitemap and homepage, 404s those profile URLs, gates leftover demo boxes, and noindexes care-request pages
- `AUTH_SECRET` — required; production refuses the insecure preview default
- `AUTH_URL=https://caregiver.com.au`
- `NEXT_PUBLIC_SITE_URL=https://caregiver.com.au`
- `DATABASE_URL` — Postgres when you are ready; SQLite demo.db is only a launch fallback
- `NEXT_PUBLIC_PLATFORM_ABN` — only after you have a real ABN; invoices omit the demo number until then

Support mail is `hello@caregiver.com.au`. Stripe and transactional email are still owner-side before Instant Book and password reset can go live.

## Payments

Without `STRIPE_SECRET_KEY`, checkout writes to the in-app escrow ledger so hold/release still works. With Stripe keys, PaymentIntents and Connect transfers are created in AUD.
