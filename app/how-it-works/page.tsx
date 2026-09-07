import { JsonLd } from "@/components/json-ld";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "How CareProof works",
  description:
    "Search verified Australian carers, book like Upwork, and pay into escrow. Funds release only after care is complete.",
  path: "/how-it-works",
});

const faqs = [
  {
    q: "How do I book a carer?",
    a: "Open a profile and use Instant Book, or post a care request and hire a proposal. Either path creates one escrow-backed booking.",
  },
  {
    q: "When is the carer paid?",
    a: "Never up front. CareProof collects your payment, holds it, and releases it after you confirm — or automatically 72 hours after the booking ends if there is no dispute.",
  },
  {
    q: "What makes a carer verified?",
    a: "Work history can be employer-confirmed, document-checked or completed on CareProof. Credentials such as WWCC, NDIS screening and AHPRA are stored with expiry dates. The WWCC filter only matches a current check, and Current checks only hides anyone with a lapsed document.",
  },
  {
    q: "Can I leave a review immediately?",
    a: "No. Reviews are only accepted after a booking is released. That keeps ratings tied to real, paid work.",
  },
  {
    q: "Can I book a standing weekly sit?",
    a: "Yes. On the book page choose 2 to 12 weeks. CareProof creates one escrow booking per week so you can cancel or dispute a single Friday without touching the rest of the series. The dashboard folds those weeks into one card. Download one calendar file for every week, the whole roster from the dashboard, or cancel unpaid remaining weeks while funded holds stay in escrow.",
  },
  {
    q: "Can I search for a carer who is free on a specific night?",
    a: "Yes. Use Needed on in search or the directory filters. CareProof hides carers who already have a sit in escrow that day, and carers who marked the day as away. Public profiles and the shortlist show the next fortnight as free, booked or away. If a carer is away today, Instant Book pauses and they drop out of the Instant Book filter until tomorrow.",
  },
  {
    q: "Can I get a GST tax invoice for a Home Care Package or NDIS plan?",
    a: "Yes. After funds are in escrow, open the booking and download the tax invoice. It shows the care rate inc GST, GST as 1/11, the 10% CareProof fee, the carer ABN if they listed one, and the carer payout. Add an NDIS or My Aged Care number on Household and it prints on the invoice and the financial-year statement CSV.",
  },
  {
    q: "How do I message a carer or family?",
    a: "Each booking has a private thread. New messages show a count on Dashboard until you open the booking. Opening the thread marks them read and keeps a New label on that first view.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.q,
            acceptedAnswer: { "@type": "Answer", text: faq.a },
          })),
        }}
      />
      <h1 className="text-3xl font-semibold text-ink">How CareProof works</h1>
      <ol className="mt-8 space-y-6">
        <li>
          <h2 className="text-xl font-semibold">1. Search a crawlable directory</h2>
          <p className="mt-2 text-stone-600">
            Every specialty, state and city has its own URL so you can find “nannies in Sydney” or “NDIS support workers
            in Brisbane” without a client-side app.
          </p>
        </li>
        <li>
          <h2 className="text-xl font-semibold">2. Check experience, not just a bio</h2>
          <p className="mt-2 text-stone-600">
            Profiles show verified roles, screening checks and reviews from released bookings. Trust score is calculated
            from those facts.
          </p>
        </li>
        <li>
          <h2 className="text-xl font-semibold">3. Book in a few steps</h2>
          <p className="mt-2 text-stone-600">
            Instant Book pays into escrow immediately. Request to book waits for the carer. Days off pause Instant Book
            for that calendar day in Australia/Sydney. Job posts collect proposals you can hire with one click. For
            babysitting, pick a date night, last-minute sit, overnight or a standing weekly series — the hourly rate
            does not rise with a second child.
          </p>
        </li>
        <li>
          <h2 className="text-xl font-semibold">4. Release payment when care is done</h2>
          <p className="mt-2 text-stone-600">
            Confirm completion to pay the carer. Open a dispute to pause release. Uncontested bookings auto-release after
            72 hours.
          </p>
        </li>
      </ol>
      <h2 className="mt-12 text-2xl font-semibold">Questions</h2>
      <dl className="mt-4 space-y-4">
        {faqs.map((faq) => (
          <div key={faq.q}>
            <dt className="font-medium text-ink">{faq.q}</dt>
            <dd className="mt-1 text-stone-600">{faq.a}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
