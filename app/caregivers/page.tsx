'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CaregiverWithVerification } from '@/app/lib/caregivers';
import CaregiverCard from '@/app/components/CaregiverCard';

const POLL_INTERVAL_MS = 4000;
const LOCAL_RADIUS_KM = 30;

// Preset localities let end users favor local caregivers without granting
// geolocation permission. Coordinates approximate each city center.
const LOCALITIES = [
  { id: 'sf', label: 'San Francisco', lat: 37.7749, lng: -122.4194 },
  { id: 'berkeley', label: 'Berkeley', lat: 37.8715, lng: -122.273 },
  { id: 'oakland', label: 'Oakland', lat: 37.8044, lng: -122.2712 },
  { id: 'palo-alto', label: 'Palo Alto', lat: 37.4419, lng: -122.143 },
  { id: 'san-jose', label: 'San Jose', lat: 37.3382, lng: -121.8863 },
] as const;

interface Origin {
  lat: number;
  lng: number;
  label: string;
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
        setOrigin({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          label: 'your location',
        });
      },
      () => {
        setGeoError(
          'Could not access your location. Pick a nearby area instead.',
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
        label: locality.label,
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
    const haystack =
      `${caregiver.name} ${caregiver.location.area} ${caregiver.location.city} ${caregiver.location.region}`.toLowerCase();
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
            Local caregivers for local people. Every profile shows its
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
                value={LOCALITIES.find((l) => l.label === origin?.label)?.id ?? ''}
                onChange={(event) => handleLocalityChange(event.target.value)}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              >
                <option value="">Anywhere</option>
                {LOCALITIES.map((locality) => (
                  <option key={locality.id} value={locality.id}>
                    {locality.label}
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
                Search by name or area
              </label>
              <input
                id={searchId}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="e.g. Oakland"
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
              Local only (within {LOCAL_RADIUS_KM} km)
            </label>
            {origin ? (
              <p
                className="text-sm text-gray-600 dark:text-gray-400"
                role="status"
              >
                Showing caregivers nearest to{' '}
                <span className="font-medium text-gray-900 dark:text-gray-200">
                  {origin.label}
                </span>{' '}
                first.
              </p>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Choose an area to sort by proximity.
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
