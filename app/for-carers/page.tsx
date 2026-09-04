import Link from "next/link";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "For carers",
  description:
    "Join CareProof to get booked by Australian families. Funds are held in escrow and released after the work is done.",
  path: "/for-carers",
});

export default function ForCarersPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold text-ink">For carers</h1>
      <p className="mt-3 text-lg text-stone-600">
        Set your rate, show verified experience, and get paid through escrow — not handshake transfers.
      </p>
      <ul className="mt-8 space-y-4 text-stone-700">
        <li>
          <strong>Keep 100% of your advertised rate.</strong> Families pay a 10% platform fee on top.
        </li>
        <li>
          <strong>Instant Book</strong> for carers who want jobs without back-and-forth. Turn it off to accept requests first.
        </li>
        <li>
          <strong>Proposals</strong> on open care requests, the same way freelancers apply on Upwork.
        </li>
        <li>
          <strong>Completed bookings become verified work history</strong> on your public profile.
        </li>
      </ul>
      <Link href="/register" className="mt-8 inline-block rounded-full bg-teal px-5 py-2.5 font-medium text-white no-underline">
        Create a carer profile
      </Link>
    </div>
  );
}
