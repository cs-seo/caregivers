import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import {
  FOR_CARERS_FAQS,
  FOR_CARERS_INTRO,
  FOR_CARERS_KEEP_RATE,
  FOR_CARERS_STEPS,
  forCarersBoardHref,
  forCarersFaqJsonLd,
  forCarersRegisterHref,
} from "@/lib/for-carers";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "For carers",
  description:
    "Join CareProof to get booked by Australian families. Instant Book, proposals on open requests, and escrow payout at 100% of your advertised rate.",
  path: "/for-carers",
});

export default function ForCarersPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <JsonLd data={forCarersFaqJsonLd()} />
      <h1 className="text-3xl font-semibold text-ink">For carers</h1>
      <p className="mt-3 text-lg text-stone-600">{FOR_CARERS_INTRO}</p>
      <p className="mt-4 rounded-2xl bg-sage px-4 py-3 text-sm text-ink">{FOR_CARERS_KEEP_RATE}</p>
      <ol className="mt-10 space-y-6">
        {FOR_CARERS_STEPS.map((step, index) => (
          <li key={step.title}>
            <h2 className="text-xl font-semibold text-ink">
              {index + 1}. {step.title}
            </h2>
            <p className="mt-2 text-stone-600">{step.body}</p>
          </li>
        ))}
      </ol>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href={forCarersRegisterHref()}
          className="inline-block rounded-full bg-teal px-5 py-2.5 font-medium text-white no-underline"
        >
          Create a carer profile
        </Link>
        <Link
          href={forCarersBoardHref()}
          className="inline-block rounded-full border border-line bg-card px-5 py-2.5 font-medium text-teal no-underline"
        >
          Browse open care requests
        </Link>
      </div>
      <p className="mt-4 text-sm text-stone-500">
        Families hire on{" "}
        <Link href="/how-it-works" className="font-medium text-teal hover:underline">
          How CareProof works
        </Link>
        .
      </p>
      <h2 className="mt-12 text-2xl font-semibold text-ink">Questions</h2>
      <dl className="mt-4 space-y-4">
        {FOR_CARERS_FAQS.map((faq) => (
          <div key={faq.q}>
            <dt className="font-medium text-ink">{faq.q}</dt>
            <dd className="mt-1 text-stone-600">{faq.a}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
