import Link from 'next/link';
import type { CaregiverWithVerification } from '@/app/lib/caregivers';
import LocalBadge from './LocalBadge';
import StatusDot from './StatusDot';
import VerificationBadge from './VerificationBadge';

interface CaregiverCardProps {
  caregiver: CaregiverWithVerification;
}

export default function CaregiverCard({ caregiver }: CaregiverCardProps) {
  const { location, verification } = caregiver;

  return (
    <li className="rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <Link
        href={`/caregivers/${caregiver.id}`}
        className="block rounded-lg p-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-black dark:text-white">
              {caregiver.name}
            </h3>
            <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
              {location.area}, {location.city} {location.region}{' '}
              {location.postcode}
            </p>
          </div>
          <VerificationBadge
            level={verification.level}
            score={verification.score}
          />
        </div>

        {caregiver.localityTier && caregiver.localityTier !== 'other' && (
          <div className="mt-3">
            <LocalBadge
              tier={caregiver.localityTier}
              region={location.region}
            />
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
          <StatusDot status={caregiver.status} />
          <span>
            <span className="font-medium text-gray-900 dark:text-gray-200">
              {caregiver.yearsExperience}
            </span>{' '}
            {caregiver.yearsExperience === 1 ? 'year' : 'years'} experience
          </span>
          {caregiver.reviewsCount > 0 ? (
            <span aria-label={`Rated ${caregiver.rating} out of 5 from ${caregiver.reviewsCount} reviews`}>
              <span aria-hidden="true">★</span>{' '}
              <span className="font-medium text-gray-900 dark:text-gray-200">
                {caregiver.rating.toFixed(1)}
              </span>{' '}
              ({caregiver.reviewsCount})
            </span>
          ) : (
            <span>No reviews yet</span>
          )}
          {caregiver.distanceKm !== undefined && (
            <span className="font-medium text-blue-700 dark:text-blue-400">
              {caregiver.distanceKm} km away
            </span>
          )}
        </div>
      </Link>
    </li>
  );
}
