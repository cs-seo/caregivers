import type { NextConfig } from "next";

// Content-Security-Policy.
//
// This app is a heavily static, SEO-critical directory. Next.js' App Router
// injects inline bootstrap/streaming scripts, and next/font + Tailwind v4 inject
// inline <style> tags and style attributes at render time. Enforcing a strict
// nonce/`strict-dynamic` CSP would require per-request middleware that generates
// a nonce, which forces every page to be dynamically rendered and defeats static
// generation for the directory. We therefore ship a locked-down CSP that still
// blocks the highest-impact attacks (external script loading, framing/clickjacking,
// object/embeds, <base> hijacking, cross-origin form posting, mixed content) while
// permitting the inline script/style that Next requires.
//
// HARDENING ROADMAP: move to a nonce + 'strict-dynamic' script-src via middleware
// once the SEO/static-rendering trade-off is acceptable (or once pages that need
// inline scripts are isolated). See README "Security" section.
const cspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  // Carer profile photos may be arbitrary https URLs (see sanitizePhotoUrl);
  // data: covers inline portrait SVGs and blur placeholders.
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "object-src 'none'",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
  "upgrade-insecure-requests",
];

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: cspDirectives.join("; "),
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=(), interest-cohort=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  // Do not leak the framework/version to clients.
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
