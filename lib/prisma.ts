import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";

function resolveDatabaseUrl() {
  const existing = process.env.DATABASE_URL?.trim();
  if (existing) return existing;

  const demoPath = join(process.cwd(), "prisma", "demo.db");
  if (process.env.VERCEL) {
    const tmpPath = "/tmp/careproof.db";
    if (existsSync(demoPath) && !existsSync(tmpPath)) {
      copyFileSync(demoPath, tmpPath);
    }
    return existsSync(tmpPath) ? `file:${tmpPath}` : `file:${demoPath}`;
  }
  if (existsSync(demoPath)) return `file:${demoPath}`;
  return "file:./dev.db";
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
