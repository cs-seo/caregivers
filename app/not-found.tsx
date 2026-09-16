import Link from "next/link";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Page not found",
  description: "The page you were looking for could not be found.",
  path: "/",
  noIndex: true,
});

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal">404</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink">We couldn’t find that page</h1>
      <p className="mt-3 text-stone-600">
        The link may be broken, or the page may have moved. Nothing to worry about — let’s get you
        back on track.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white">
          Back to home
        </Link>
        <Link href="/caregivers" className="rounded-lg border border-line px-4 py-2 text-sm text-ink">
          Browse carers
        </Link>
      </div>
    </div>
  );
}
