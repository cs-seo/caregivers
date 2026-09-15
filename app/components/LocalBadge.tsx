import type { AustralianRegion, LocalityTier } from '@/app/lib/caregivers';

const TIER_STYLES: Record<
  Exclude<LocalityTier, 'other'>,
  { label: string; className: string }
> = {
  'same-suburb': {
    label: 'Same suburb · Local to you',
    className:
      'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
  },
  'same-area': {
    label: 'Same area · Local to you',
    className:
      'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
  },
  'same-state': {
    label: 'Same state',
    className:
      'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800',
  },
};

interface LocalBadgeProps {
  tier?: LocalityTier;
  /** Shown alongside "Same state", e.g. "NSW". */
  region?: AustralianRegion;
}

/** Surfaces how local a caregiver is to the chosen origin. */
export default function LocalBadge({ tier, region }: LocalBadgeProps) {
  if (!tier || tier === 'other') {
    return null;
  }
  const { label, className } = TIER_STYLES[tier];
  const text = tier === 'same-state' && region ? `${label} · ${region}` : label;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className}`}
    >
      <span aria-hidden="true">📍</span>
      {text}
    </span>
  );
}
