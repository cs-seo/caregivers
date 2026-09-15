import type { CaregiverStatus } from '@/app/lib/caregivers';

const STATUS_STYLES: Record<CaregiverStatus, { dot: string; label: string }> = {
  online: { dot: 'bg-green-500', label: 'Online' },
  busy: { dot: 'bg-amber-500', label: 'Busy' },
  offline: { dot: 'bg-gray-400 dark:bg-zinc-600', label: 'Offline' },
};

interface StatusDotProps {
  status: CaregiverStatus;
}

/**
 * Presence indicator. The colored dot is decorative; the status is also
 * conveyed as text so it is not communicated by color alone (WCAG 1.4.1).
 */
export default function StatusDot({ status }: StatusDotProps) {
  const { dot, label } = STATUS_STYLES[status];
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`h-2.5 w-2.5 shrink-0 rounded-full ${dot}`}
        aria-hidden="true"
      />
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </span>
    </span>
  );
}
