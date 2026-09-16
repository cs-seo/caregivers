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

## Production launch runbook

Do this once to take CareProof live for real families:

1. **Provision Postgres.** Create a managed PostgreSQL 16 database (Vercel
   Postgres, Neon, Supabase, RDS). Copy the pooled connection string.
2. **Set environment variables** on the hosting project:
   - `DATABASE_URL` — the connection string from step 1
   - `AUTH_SECRET` — generate with `openssl rand -base64 32` (the app refuses to
     boot in production without it — no default secret ships)
   - `AUTH_TRUST_HOST=true`
   - `NEXT_PUBLIC_SITE_URL` and `AUTH_URL` — your public HTTPS URL
   - Optional Stripe keys (see below) to switch from demo escrow to live payments
3. **Run the first migration.** The Vercel build command runs
   `prisma migrate deploy` automatically. To run it manually against a fresh DB:
   `DATABASE_URL=... npx prisma migrate deploy`.
4. **(Optional) Seed** reference/demo data: `DATABASE_URL=... npm run db:seed`.
   Skip this for a clean production dataset.
5. **Add CI/CD secrets** (see below) and push to `main` to deploy.

## Security

Hardening applied for launch:

- **Response headers** (`next.config.ts`): a locked-down `Content-Security-Policy`
  (`default-src 'self'`, `object-src 'none'`, `base-uri 'self'`,
  `frame-ancestors 'none'`, `form-action 'self'`, `upgrade-insecure-requests`),
  `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`,
  `Strict-Transport-Security` (2y + preload), a restrictive `Permissions-Policy`,
  and `poweredByHeader` disabled. The CSP permits the inline script/style that the
  Next.js App Router, next/font and Tailwind inject; upgrading to a
  nonce/`strict-dynamic` CSP requires per-request middleware that forces dynamic
  rendering of the (otherwise static, SEO-critical) directory — a deliberate,
  documented trade-off, not an oversight.
- **Sessions/cookies** (`auth.ts`): JWT sessions with httpOnly, `sameSite=lax`,
  `secure` (in production, via `__Secure-`/`__Host-` prefixed cookies) cookies;
  `trustHost` on; `AUTH_SECRET` required in production.
- **Authorization**: every server action and every record-reading page/route
  authenticates and checks per-record ownership (a family only reads/writes its
  own bookings/requests/messages/invoices; a carer only its own). Calendar feeds
  use unguessable opaque tokens. See the authorization matrix in the PR.
- **Abuse protection** (`lib/rate-limit.ts`): in-memory sliding-window rate limits
  on login, registration, the public directory API, and write/mutation actions
  (booking, message, dispute, proposal, review, care request). **This is
  per-instance only** — a scaled deployment must back it with a shared store
  (Redis/Upstash) plus an edge/WAF limit.
- **XSS**: JSON-LD structured data is serialized with `safeJsonLd`, which escapes
  `<`, `>`, `&` and U+2028/U+2029 so user-controlled fields cannot break out of
  the `<script>` tag. No `dangerouslySetInnerHTML` is used with unsanitized data.
- **Input validation** (`lib/validate.ts`): record ids are format-checked and
  free-text is length-bounded; errors surface via friendly `app/error.tsx` /
  `app/not-found.tsx` boundaries that never leak stack traces.

### Dependency audit

`npm audit` transitive vulnerabilities are pinned to patched versions via
`overrides` in `package.json` (sharp, postcss, picomatch, brace-expansion,
minimatch, nanoid, browserslist, js-yaml, flatted, @babel/core, deepmerge-ts,
effect, and more). Two advisories are intentionally left un-forced:

- **`next`** — the only fix is `next@16.3.5`, which is outside the pinned
  `16.0.7` range. Upgrade Next deliberately (and re-run the suite) when ready.
- **`ajv`** (dev-only, eslint toolchain) — no fix exists in the 6.x line; moving
  to ajv 8 breaks eslint's consumer. No runtime/production impact.

## CI/CD

- **`.github/workflows/ci.yml`** runs on every push/PR: spins up a `postgres:16`
  service, runs `prisma migrate deploy`, then `npm run lint`, `npm test` and
  `npm run build`.
- **`.github/workflows/deploy.yml`** deploys to Vercel on push to `main` (or via
  manual **Run workflow**). It **skips cleanly (stays green)** until the Vercel
  secrets are present, so it never fails before you configure them.

**Add these repository secrets** (GitHub → Settings → Secrets and variables →
Actions → *New repository secret*) to enable production deploys:

- `VERCEL_TOKEN` — a Vercel access token (Vercel → Account Settings → Tokens)
- `VERCEL_ORG_ID` — from `.vercel/project.json` after `vercel link`, or the team
  settings page
- `VERCEL_PROJECT_ID` — from `.vercel/project.json` after `vercel link`

Set the runtime env vars (`DATABASE_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST`,
`NEXT_PUBLIC_SITE_URL`, `AUTH_URL`) in the **Vercel project** itself; `vercel
pull` brings them into the build.

## Payments

Without `STRIPE_SECRET_KEY`, checkout writes to the in-app escrow ledger so hold/release still works. With Stripe keys, PaymentIntents and Connect transfers are created in AUD.
