import { PrismaClient } from "@prisma/client";

const LOCAL_DEV_DATABASE_URL =
  "postgresql://careproof:careproof@127.0.0.1:5432/careproof";

function resolveDatabaseUrl() {
  const existing = process.env.DATABASE_URL?.trim();
  if (existing) return existing;

  // In development we fall back to the known local Postgres instance so the
  // app runs out of the box after `npm run db:seed`. Production/Vercel builds
  // must always provide DATABASE_URL via environment variables.
  if (process.env.NODE_ENV !== "production") {
    return LOCAL_DEV_DATABASE_URL;
  }

  throw new Error(
    "DATABASE_URL is not set. Provide a PostgreSQL connection string (see .env.example).",
  );
}

process.env.DATABASE_URL = resolveDatabaseUrl();

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
