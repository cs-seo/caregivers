import { PLATFORM_ABN, SITE_HOST } from "./constants";

export const SUPPORT_EMAIL = `hello@${SITE_HOST}`;

export function isDemoMode() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return true;
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "false") return false;
  return process.env.VERCEL_ENV !== "production";
}

export function leftoverFamily(isFamily: boolean) {
  return isDemoMode() && isFamily;
}

export function isSeededAccountEmail(email?: string | null) {
  return Boolean(email?.toLowerCase().endsWith(`@${SITE_HOST}`));
}

export function publicCarerWhere() {
  if (isDemoMode()) return {};
  return { user: { email: { not: { endsWith: `@${SITE_HOST}` } } } };
}

export function publicJobWhere() {
  if (isDemoMode()) return {};
  return { family: { email: { not: { endsWith: `@${SITE_HOST}` } } } };
}

export function showPlatformAbn() {
  return isDemoMode() || Boolean(process.env.NEXT_PUBLIC_PLATFORM_ABN?.trim());
}

export function platformAbnLine() {
  const live = process.env.NEXT_PUBLIC_PLATFORM_ABN?.trim();
  if (live) return `ABN ${live}`;
  if (isDemoMode()) return `ABN ${PLATFORM_ABN} (demo)`;
  return "";
}
