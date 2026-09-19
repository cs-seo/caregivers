import Link from "next/link";
import { SUPPORT_EMAIL } from "@/lib/demo-mode";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-clay">404</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink">That page is not on caregiver.com.au</h1>
      <p className="mt-3 text-stone-600">
        The directory is organised by specialty and suburb. Try a search, or email {SUPPORT_EMAIL} if a listing should
        be here.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/caregivers" className="rounded-full bg-teal px-5 py-2.5 font-medium text-white no-underline">
          Browse carers
        </Link>
        <Link href="/locations" className="rounded-full border border-teal px-5 py-2.5 font-medium text-teal no-underline">
          Cities and suburbs
        </Link>
        <Link href="/" className="px-5 py-2.5 font-medium text-teal">
          Home
        </Link>
      </div>
    </div>
  );
}
