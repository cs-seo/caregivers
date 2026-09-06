'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  distanceKm,
  getLocalities,
  type AustralianRegion,
  type CaregiverWithVerification,
} from '@/app/lib/caregivers';
import CaregiverCard from '@/app/components/CaregiverCard';

const POLL_INTERVAL_MS = 4000;
// Sensible default for an Australian metro area (Greater Sydney and Greater
// Melbourne both span well beyond this, but 25 km keeps "local" meaningful).
const LOCAL_RADIUS_KM = 25;

// The pickable suburbs are derived from the caregiver roster so the two never
// drift apart. Users can favour local caregivers without granting geolocation.
const LOCALITIES = getLocalities();

interface Origin {
  lat: number;
  lng: number;
  label: string;
  /** Postcode of the chosen suburb, used for local-to-local matching. */
  postcode?: string;
  region?: AustralianRegion;
  /** Id of the matching preset locality, used to sync the dropdown. */
  localityId?: string;
}

export default function CaregiversPage() {
  const [caregivers, setCaregivers] = useState<CaregiverWithVerification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [origin, setOrigin] = useState<Origin | null>(null);
  const [localOnly, setLocalOnly] = useState(false);
  const [query, setQuery] = useState('');
  const [geoError, setGeoError] = useState<string | null>(null);

  // Keep the latest origin available to the polling loop without restarting it.
  const originRef = useRef<Origin | null>(null);
  originRef.current = origin;

  const fetchCaregivers = useCallback(async (signal?: AbortSignal) => {
    const current = originRef.current;
    const params = new URLSearchParams();
    if (current) {
      params.set('lat', String(current.lat));
      params.set('lng', String(current.lng));
      if (current.postcode) params.set('postcode', current.postcode);
      if (current.region) params.set('region', current.region);
    }
    const url = params.toString()
      ? `/api/caregivers?${params.toString()}`
      : '/api/caregivers';

    const response = await fetch(url, { signal });
    if (!response.ok) {
      throw new Error('Failed to load caregivers');
    }
    return (await response.json()) as CaregiverWithVerification[];
  }, []);

  // Poll for live status updates. Only the first load shows the loading state;
  // subsequent polls refresh in place so the list does not flicker.
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const run = async (isInitial: boolean) => {
      try {
        const data = await fetchCaregivers(controller.signal);
        if (cancelled) return;
        setCaregivers(data);
        setError(null);
      } catch (err) {
        if (cancelled || controller.signal.aborted) return;
        setError(
          err instanceof Error ? err.message : 'An unexpected error occurred',
        );
      } finally {
        if (!cancelled && isInitial) setIsLoading(false);
      }
    };

    run(true);
    const interval = setInterval(() => run(false), POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      controller.abort();
      clearInterval(interval);
    };
  }, [fetchCaregivers, origin]);

  const useMyLocation = () => {
    setGeoError(null);
    if (!('geolocation' in navigator)) {
      setGeoError('Location is not supported by this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Snap to the nearest known suburb so we can still apply the
        // local-to-local (suburb/state) precedence, while keeping the real
        // coordinates for accurate distance.
        const nearest = [...LOCALITIES].sort(
          (a, b) =>
            distanceKm({ lat: latitude, lng: longitude }, a) -
            distanceKm({ lat: latitude, lng: longitude }, b),
        )[0];
        setOrigin({
          lat: latitude,
          lng: longitude,
          label: nearest ? `your location (near ${nearest.area})` : 'your location',
          postcode: nearest?.postcode,
          region: nearest?.region,
          localityId: nearest?.id,
        });
      },
      () => {
        setGeoError(
          'Could not access your location. Pick a nearby suburb instead.',
        );
      },
    );
  };

  const handleLocalityChange = (id: string) => {
    setGeoError(null);
    if (id === '') {
      setOrigin(null);
      setLocalOnly(false);
      return;
    }
    const locality = LOCALITIES.find((l) => l.id === id);
    if (locality) {
      setOrigin({
        lat: locality.lat,
        lng: locality.lng,
        label: `${locality.area} ${locality.region} ${locality.postcode}`,
        postcode: locality.postcode,
        region: locality.region,
        localityId: locality.id,
      });
    }
  };

  const normalizedQuery = query.trim().toLowerCase();
  const visibleCaregivers = caregivers.filter((caregiver) => {
    if (
      localOnly &&
      origin &&
      (caregiver.distanceKm === undefined ||
        caregiver.distanceKm > LOCAL_RADIUS_KM)
    ) {
      return false;
    }
    if (normalizedQuery === '') return true;
    const { area, city, region, postcode } = caregiver.location;
    const haystack =
      `${caregiver.name} ${area} ${city} ${region} ${postcode}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });

  const selectId = 'locality-select';
  const searchId = 'caregiver-search';

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-12 dark:bg-black sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <Link
            href="/"
            className="text-sm font-medium text-blue-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-blue-400"
          >
            ← Home
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-black dark:text-white">
            Live Caregivers
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Australian locals caring for Australian locals. Choose your suburb
            and we&apos;ll surface caregivers local to you first — same suburb,
            then nearby, then across your state. Every profile shows its
            verification level so you can choose with confidence.
          </p>
        </header>

        <section
          aria-label="Find local caregivers"
          className="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1">
              <label
                htmlFor={selectId}
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Near
              </label>
              <select
                id={selectId}
                value={origin?.localityId ?? ''}
                onChange={(event) => handleLocalityChange(event.target.value)}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              >
                <option value="">Anywhere in Australia</option>
                {LOCALITIES.map((locality) => (
                  <option key={locality.id} value={locality.id}>
                    {locality.area}, {locality.city} {locality.region}{' '}
                    {locality.postcode}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={useMyLocation}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-zinc-700 dark:text-gray-300 dark:hover:bg-zinc-800"
            >
              Use my location
            </button>

            <div className="flex min-w-[12rem] flex-1 flex-col gap-1">
              <label
                htmlFor={searchId}
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Search by name, suburb or postcode
              </label>
              <input
                id={searchId}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="e.g. Bondi or 2026"
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={localOnly}
                disabled={!origin}
                onChange={(event) => setLocalOnly(event.target.checked)}
                className="h-4 w-4 rounded border-gray-300 disabled:opacity-50"
              />
              Local only (within {LOCAL_RADIUS_KM} kilometres)
            </label>
            {origin ? (
              <p
                className="text-sm text-gray-600 dark:text-gray-400"
                role="status"
              >
                Showing caregivers local to{' '}
                <span className="font-medium text-gray-900 dark:text-gray-200">
                  {origin.label}
                </span>{' '}
                first.
              </p>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Choose a suburb to see local caregivers first.
              </p>
            )}
          </div>
          {geoError && (
            <p role="alert" className="mt-2 text-sm text-red-700 dark:text-red-300">
              {geoError}
            </p>
          )}
        </section>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
          >
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {isLoading && caregivers.length === 0 ? (
          <div
            className="flex items-center justify-center py-12 text-gray-600 dark:text-gray-400"
            role="status"
            aria-live="polite"
          >
            Loading caregivers…
          </div>
        ) : visibleCaregivers.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 py-12 text-center dark:border-zinc-700">
            <p className="text-gray-600 dark:text-gray-400">
              No caregivers match your filters.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-3 text-sm text-gray-500 dark:text-gray-500" aria-live="polite">
              {visibleCaregivers.length} caregiver
              {visibleCaregivers.length === 1 ? '' : 's'}
            </p>
            <ul className="space-y-4">
              {visibleCaregivers.map((caregiver) => (
                <CaregiverCard key={caregiver.id} caregiver={caregiver} />
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
