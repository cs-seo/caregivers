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

- Family: `family@careproof.com.au`
- Carer: `carer@careproof.com.au`

## Five-minute demo

1. Open `/caregivers/nannies/nsw/sydney/bondi` — Priya Nair plus nearby clones from her profile.
2. Log in as the family. Dashboard shows a request waiting on James, escrow with Sarah, and after-school care in progress with Priya.
3. Open Sarah’s booking and use the message thread.
4. Log in as the carer (`carer@careproof.com.au`) and edit `/dashboard/profile`.
5. Join as a new carer at `/register` — you land on the profile checklist.

## Vercel

Preview builds no longer require `DATABASE_URL` at compile time. If it is missing, CareProof uses `prisma/demo.db` (copied to `/tmp` on Vercel so bookings can write). Set `AUTH_SECRET` and `NEXT_PUBLIC_SITE_URL` on the project for production.

## Payments

Without `STRIPE_SECRET_KEY`, checkout writes to the in-app escrow ledger so hold/release still works. With Stripe keys, PaymentIntents and Connect transfers are created in AUD.
