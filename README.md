This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deployment

The app builds to a self-contained server bundle (`output: "standalone"` in `next.config.ts`), so it can be deployed either on a managed Next.js host or as a container.

### Option A — Vercel (recommended, fastest)

Connect the repository to [Vercel](https://vercel.com/new). No configuration is required: Vercel detects Next.js, builds it, and serves the App Router pages, API routes, and the security headers defined in `next.config.ts`. Pushing to the default branch triggers a deploy.

### Option B — Container (any host: Fly.io, Render, AWS, etc.)

A multi-stage `Dockerfile` is included that produces a minimal runtime image from the standalone output and runs as an unprivileged user on port `3000`:

```bash
docker build -t caregivers .
docker run -p 3000:3000 caregivers
```

### Option C — Node server (standalone)

```bash
npm run build
# copy static assets next to the standalone server, then run it
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
node .next/standalone/server.js   # honours PORT / HOSTNAME env vars
```

See the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

> This build runs on in-memory mock data with no authentication — suitable for an MVP/pilot demo. A production launch additionally requires real auth, a database, and integrations with ID-verification and background-check providers (see the vetting notes in the code).
