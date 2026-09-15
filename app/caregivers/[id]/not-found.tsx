import Link from 'next/link';

export default function CaregiverNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 px-4 text-center dark:bg-black">
      <h1 className="text-2xl font-bold text-black dark:text-white">
        Caregiver not found
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        We couldn&apos;t find the caregiver you were looking for.
      </p>
      <Link
        href="/caregivers"
        className="rounded-lg bg-black px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-white dark:text-black dark:hover:bg-gray-100"
      >
        Back to caregivers
      </Link>
    </div>
  );
}
