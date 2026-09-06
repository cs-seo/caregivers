import type { VerificationLevel } from '@/app/lib/caregivers';

const LEVEL_STYLES: Record<
  VerificationLevel,
  { className: string; icon: string }
> = {
  'Fully vetted': {
    className:
      'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    icon: '✓',
  },
  Verified: {
    className:
      'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    icon: '✓',
  },
  Basic: {
    className:
      'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
    icon: '•',
  },
  Unverified: {
    className:
      'bg-gray-100 text-gray-700 border-gray-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
    icon: '!',
  },
};

interface VerificationBadgeProps {
  level: VerificationLevel;
  score?: number;
}

export default function VerificationBadge({
  level,
  score,
}: VerificationBadgeProps) {
  const { className, icon } = LEVEL_STYLES[level];
  const label =
    score === undefined
      ? `Verification level: ${level}`
      : `Verification level: ${level}, ${score} of 4 checks passed`;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className}`}
      aria-label={label}
      title={label}
    >
      <span aria-hidden="true">{icon}</span>
      {level}
      {score !== undefined && (
        <span className="font-normal opacity-80" aria-hidden="true">
          {score}/4
        </span>
      )}
    </span>
  );
}
