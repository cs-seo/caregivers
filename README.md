# CareProof

Verified carers directory for Australia. Families search by specialty and city, check work history and screening, then book with **escrow** — payment is collected first and released to the carer after the booking.

## Features

- SEO URLs: `/caregivers/{specialty}/{state}/{city}` and `/caregiver/{slug}`
- Instant Book and request-to-book (Upwork-style)
- Care requests + proposals + hire
- Escrow ledger (demo by default; Stripe Connect when keys are set)
- WWCC, NDIS, AHPRA and employer-confirmed work history
- Reviews only after a released booking

## Setup

```bash
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Demo logins (password `CareProof123!`):

- Family: `family@careproof.com.au`
- Carer: `carer@careproof.com.au`

## Payments

Without `STRIPE_SECRET_KEY`, checkout writes to the in-app escrow ledger so hold/release still works. With Stripe keys, PaymentIntents and Connect transfers are created in AUD.
