import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  computeVerification,
  getCaregiverById,
  type CaregiverWithVerification,
} from '@/app/lib/caregivers';
import { withLiveStatus } from '@/app/lib/presence';
import StatusDot from '@/app/components/StatusDot';
import VerificationBadge from '@/app/components/VerificationBadge';
import VettingBreakdown from '@/app/components/VettingBreakdown';
import ReportConcernButton from '@/app/components/ReportConcernButton';

export const dynamic = 'force-dynamic';

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

function loadCaregiver(id: string): CaregiverWithVerification | null {
  const caregiver = getCaregiverById(id);
  if (!caregiver) return null;
  const [live] = withLiveStatus([caregiver]);
  return { ...live, verification: computeVerification(caregiver) };
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  const caregiver = getCaregiverById(id);
  if (!caregiver) {
    return { title: 'Caregiver not found' };
  }
  return {
    title: `${caregiver.name} · Caregiver profile`,
    description: `Verification and vetting details for ${caregiver.name}.`,
  };
}

export default async function CaregiverProfilePage({
  params,
}: ProfilePageProps) {
  const { id } = await params;
  const caregiver = loadCaregiver(id);
  if (!caregiver) {
    notFound();
  }

  const { location, verification } = caregiver;

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-12 dark:bg-black sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/caregivers"
          className="text-sm font-medium text-blue-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-blue-400"
        >
          ← All caregivers
        </Link>

        <header className="mt-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-black dark:text-white">
                {caregiver.name}
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                {location.area}, {location.city}, {location.region}
              </p>
              <div className="mt-3">
                <StatusDot status={caregiver.status} />
              </div>
            </div>
            <VerificationBadge
              level={verification.level}
              score={verification.score}
            />
          </div>

          <p className="mt-4 text-gray-700 dark:text-gray-300">
            {caregiver.bio}
          </p>

          <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-500">
                Experience
              </dt>
              <dd className="mt-0.5 font-semibold text-gray-900 dark:text-gray-100">
                {caregiver.yearsExperience}{' '}
                {caregiver.yearsExperience === 1 ? 'year' : 'years'}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-500">
                Rating
              </dt>
              <dd className="mt-0.5 font-semibold text-gray-900 dark:text-gray-100">
                {caregiver.reviewsCount > 0
                  ? `${caregiver.rating.toFixed(1)} ★ (${caregiver.reviewsCount})`
                  : 'No reviews yet'}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-500">
                References
              </dt>
              <dd className="mt-0.5 font-semibold text-gray-900 dark:text-gray-100">
                {caregiver.referencesCount}
              </dd>
            </div>
          </dl>
        </header>

        <section
          aria-labelledby="vetting-heading"
          className="mt-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h2
            id="vetting-heading"
            className="text-lg font-semibold text-black dark:text-white"
          >
            Vetting &amp; verification
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {verification.score} of 4 safety checks passed.
          </p>
          <div className="mt-4">
            <VettingBreakdown caregiver={caregiver} />
          </div>
        </section>

        {caregiver.certifications.length > 0 && (
          <section
            aria-labelledby="credentials-heading"
            className="mt-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <h2
              id="credentials-heading"
              className="text-lg font-semibold text-black dark:text-white"
            >
              Credentials
            </h2>
            <ul className="mt-4 space-y-3">
              {caregiver.certifications.map((cert) => (
                <li
                  key={`${cert.name}-${cert.issuedYear}`}
                  className="flex flex-wrap items-baseline justify-between gap-2"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {cert.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Issued by {cert.issuer} · {cert.issuedYear}
                    </p>
                  </div>
                  {cert.expiresYear && (
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      Expires {cert.expiresYear}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section
          aria-labelledby="safety-heading"
          className="mt-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h2
            id="safety-heading"
            className="text-lg font-semibold text-black dark:text-white"
          >
            Your safety
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Verification checks are a signal, not a guarantee. If something
            seems wrong, let our trust &amp; safety team know.
          </p>
          <div className="mt-4">
            <ReportConcernButton
              caregiverId={caregiver.id}
              caregiverName={caregiver.name}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
