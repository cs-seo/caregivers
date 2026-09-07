import { initials } from "@/lib/format";

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

function hashName(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}

export function Portrait({ name, size = 56 }: { name: string; size?: number }) {
  const hash = hashName(name);
  const [bg, accent] = PALETTE[hash % PALETTE.length];
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full shadow-sm"
      style={{ width: size, height: size, background: bg }}
      aria-hidden
    >
      <svg className="absolute inset-0 h-full w-full opacity-35" viewBox="0 0 80 80">
        <circle cx={18 + (hash % 16)} cy="20" r="24" fill={accent} />
        <circle cx="64" cy={48 + (hash % 12)} r="20" fill={accent} />
      </svg>
      <span
        className="relative flex h-full w-full items-center justify-center font-semibold text-white"
        style={{ fontSize: Math.max(12, size * 0.32) }}
      >
        {initials(name)}
      </span>
    </div>
  );
}
