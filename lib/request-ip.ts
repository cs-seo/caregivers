import { headers } from "next/headers";

/**
 * Best-effort client identifier for rate limiting. Reads the standard proxy
 * headers set by Vercel / reverse proxies. Falls back to a shared bucket when
 * no IP can be determined so the limiter still applies (fails safe).
 */
export async function clientIp(): Promise<string> {
  try {
    const h = await headers();
    const forwarded = h.get("x-forwarded-for");
    if (forwarded) {
      const first = forwarded.split(",")[0]?.trim();
      if (first) return first;
    }
    const real = h.get("x-real-ip");
    if (real) return real.trim();
  } catch {
    // headers() may be unavailable in some contexts; fall through.
  }
  return "unknown";
}

/** Reads the client IP from a Request/route handler context. */
export function clientIpFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}
