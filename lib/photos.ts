import { initials } from "./format";

export const PHOTO_URL_LIMIT = 240;

const PALETTE = [
  ["#0f4c46", "#d7e6df"],
  ["#c45c26", "#f3d7c4"],
  ["#1d4e89", "#d4e3f2"],
  ["#5b3a29", "#efe4d6"],
  ["#3d5a3a", "#dde8d2"],
  ["#6b3d6e", "#eddff0"],
  ["#0b5a6b", "#cfe8ee"],
  ["#8a3d2f", "#f0d6cf"],
] as const;

const LOCAL_PHOTO = /^\/portraits\/[a-z0-9][a-z0-9.-]+\.(svg|webp|jpg|jpeg|png)$/i;

function hashName(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}

export function portraitPalette(name: string) {
  const hash = hashName(name);
  return { hash, colors: PALETTE[hash % PALETTE.length] };
}

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

export function portraitSvg(name: string) {
  const { hash, colors } = portraitPalette(name);
  const [bg, accent] = colors;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" role="img" aria-label="${escapeXml(name)}">
  <rect width="80" height="80" rx="40" fill="${bg}"/>
  <circle cx="${18 + (hash % 16)}" cy="20" r="24" fill="${accent}" opacity="0.35"/>
  <circle cx="64" cy="${48 + (hash % 12)}" r="20" fill="${accent}" opacity="0.35"/>
  <text x="40" y="47" text-anchor="middle" fill="#fff" font-size="22" font-family="Georgia, serif" font-weight="600">${escapeXml(initials(name))}</text>
</svg>
`;
}

export function sanitizePhotoUrl(raw: string) {
  const value = raw.trim().slice(0, PHOTO_URL_LIMIT);
  if (!value) return null;
  if (LOCAL_PHOTO.test(value) && !value.includes("..")) return value;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    if (url.username || url.password) return null;
    if (url.hostname === "localhost" || url.hostname.endsWith(".local")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function absolutePhotoUrl(photoUrl: string | null | undefined, origin: string) {
  const src = sanitizePhotoUrl(photoUrl ?? "");
  if (!src) return null;
  if (src.startsWith("/")) return `${origin}${src}`;
  return src;
}

export const DEMO_PORTRAITS = [
  { slug: "sarah-nguyen-aged-care-sydney", name: "Sarah Nguyen", file: "sarah-nguyen.svg" },
  { slug: "priya-nair-nanny-sydney", name: "Priya Nair", file: "priya-nair.svg" },
  { slug: "james-okafor-disability-support-sydney", name: "James Okafor", file: "james-okafor.svg" },
  { slug: "maya-chen-nanny-melbourne", name: "Maya Chen", file: "maya-chen.svg" },
  { slug: "chloe-bennett-aged-care-adelaide", name: "Chloe Bennett", file: "chloe-bennett.svg" },
] as const;
