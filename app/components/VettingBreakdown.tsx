import type {
  BackgroundCheckStatus,
  CaregiverWithVerification,
} from '@/app/lib/caregivers';

const BACKGROUND_CHECK_LABELS: Record<BackgroundCheckStatus, string> = {
  passed: 'Passed',
  pending: 'In progress',
  failed: 'Did not clear',
  not_started: 'Not started',
};

function CheckRow({
  label,
  passed,
  detail,
}: {
  label: string;
  passed: boolean;
  detail?: string;
}) {
  return (
    <li className="flex items-start justify-between gap-4 py-3">
      <div>
        <p className="font-medium text-gray-900 dark:text-gray-100">{label}</p>
        {detail && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{detail}</p>
        )}
      </div>
      <span
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          passed
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            : 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400'
        }`}
      >
        <span aria-hidden="true">{passed ? '✓' : '—'}</span>
        {passed ? 'Verified' : 'Not verified'}
      </span>
    </li>
  );
}

interface VettingBreakdownProps {
  caregiver: CaregiverWithVerification;
}

export default function VettingBreakdown({ caregiver }: VettingBreakdownProps) {
  const { checks } = caregiver.verification;
  const bg = caregiver.backgroundCheck;

  return (
    <ul className="divide-y divide-gray-200 dark:divide-zinc-800">
      <CheckRow
        label="Identity verified"
        passed={checks.identityVerified}
        detail={
          checks.identityVerified
            ? 'Government-issued ID confirmed'
            : 'Identity not yet confirmed'
        }
      />
      <CheckRow
        label="Background check"
        passed={checks.backgroundCheckPassed}
        detail={`${BACKGROUND_CHECK_LABELS[bg.status]}${
          bg.date ? ` · ${bg.date}` : ''
        }`}
      />
      <CheckRow
        label="Credentials & certifications"
        passed={checks.hasCredentials}
        detail={
          caregiver.certifications.length > 0
            ? `${caregiver.certifications.length} on file`
            : 'None on file'
        }
      />
      <CheckRow
        label="References"
        passed={checks.hasReferences}
        detail={`${caregiver.referencesCount} reference${
          caregiver.referencesCount === 1 ? '' : 's'
        } provided`}
      />
    </ul>
  );
}
