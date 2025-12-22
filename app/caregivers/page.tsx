'use client';

import { useEffect, useState } from 'react';

interface Caregiver {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'busy';
  location?: string;
  lastSeen?: string;
}

export default function CaregiversPage() {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCaregivers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/caregivers');
        if (!response.ok) {
          throw new Error('Failed to fetch caregivers');
        }
        const data = await response.json();
        setCaregivers(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setCaregivers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCaregivers();

    // Set up polling for live updates
    const interval = setInterval(fetchCaregivers, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
            Live Caregivers
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time view of all caregivers and their status
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {isLoading && caregivers.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-600 dark:text-gray-400">Loading caregivers...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {caregivers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">No caregivers available</p>
              </div>
            ) : (
              caregivers.map((caregiver) => (
                <div
                  key={caregiver.id}
                  className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6 border border-gray-200 dark:border-zinc-800"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-4 h-4 rounded-full ${getStatusColor(caregiver.status)}`} />
                      <div>
                        <h3 className="text-lg font-semibold text-black dark:text-white">
                          {caregiver.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Status: <span className="capitalize font-medium">{caregiver.status}</span>
                        </p>
                        {caregiver.location && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Location: {caregiver.location}
                          </p>
                        )}
                        {caregiver.lastSeen && (
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            Last seen: {caregiver.lastSeen}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      ID: {caregiver.id}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
