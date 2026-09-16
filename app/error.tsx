"use client";

import Link from "next/link";
import { useEffect } from "react";

// Route-segment error boundary. In production Next.js already strips error
// messages/stack traces from the serialized error sent to the client, so we
// never render `error.message` here — only a generic, friendly message. The
// digest is a non-sensitive id that maps to the server log entry.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to the server/console for observability; not shown to the user.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-clay">Something went wrong</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink">We hit an unexpected error</h1>
      <p className="mt-3 text-stone-600">
        Sorry about that. The issue has been logged. You can try again, or head back to your
        dashboard.
      </p>
      {error.digest ? (
        <p className="mt-2 text-xs text-stone-400">Reference: {error.digest}</p>
      ) : null}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white"
          type="button"
        >
          Try again
        </button>
        <Link href="/" className="rounded-lg border border-line px-4 py-2 text-sm text-ink">
          Back to home
        </Link>
      </div>
    </div>
  );
}
