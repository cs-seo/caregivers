import { initials } from "@/lib/format";
import { portraitPalette, sanitizePhotoUrl } from "@/lib/photos";

export function Portrait({
  name,
  photoUrl,
  size = 56,
}: {
  name: string;
  photoUrl?: string | null;
  size?: number;
}) {
  const src = sanitizePhotoUrl(photoUrl ?? "");
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        className="relative shrink-0 rounded-full object-cover shadow-sm"
        style={{ width: size, height: size }}
      />
    );
  }

  const { hash, colors } = portraitPalette(name);
  const [bg, accent] = colors;
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
