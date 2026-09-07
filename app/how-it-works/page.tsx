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
    a: "Open a profile and use Instant Book, or post a care request and hire a proposal. Booking a matching carer from your request attaches that sit to the job and closes it — same as hiring a proposal. Either path creates one escrow-backed booking and declines the other pending proposals. Instant Book needs the carer’s notice window — 2 hours for many babysitters, 12 for aged care — and falls back to a request if you need someone sooner.",
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
    a: "No. Reviews are only accepted after a booking is released. That keeps ratings tied to real, paid work. The carer can then publish one public reply from the booking, the dashboard Reply needed list, or their profile. Replies cannot be edited.",
  },
  {
    q: "Can I book a standing weekly sit?",
    a: "Yes. On the book page choose 2 to 12 weeks. CareProof creates one escrow booking per week so you can cancel or dispute a single Friday without touching the rest of the series. The dashboard folds those weeks into one card. Download one calendar file for every week, subscribe to a live roster feed, or cancel unpaid remaining weeks while funded holds stay in escrow.",
  },
  {
    q: "Can I search for a carer who is free on a specific night?",
    a: "Yes. Use Needed on in search or the directory filters. Add an optional start time to match usual weekly hours that cover that clock time — a 4pm search hides a carer who only works mornings. Without a time, CareProof still hides carers who already have a sit in escrow that day, carers who marked the day as away, and carers whose usual weekly hours are closed that weekday. Overnight windows that run past midnight still count as open the next morning. Available now only lists carers who marked the flag, are not away today, and whose hours include this moment in Australia/Sydney. The same two months appear on the public profile so a family can tap a free day to book. The shortlist still summarises the next fortnight. If a carer is away today, Instant Book pauses and they drop out of the Instant Book filter until tomorrow.",
  },
  {
    q: "Can I get a GST tax invoice for a Home Care Package or NDIS plan?",
    a: "Yes. After funds are in escrow, open the booking and print the tax invoice. CareProof stamps a financial-year number such as CP-2627-0001 when the hold is created, so later sits do not reshuffle earlier invoices. It shows the care rate inc GST, GST as 1/11, the 10% CareProof fee, the carer ABN if they listed one, and the carer payout. Carers open Remittance for the same number showing the amount held or paid to them (100% of the advertised rate). The dashboard FY statement is a printable GST summary of every funded sit in 1 July–30 June, using those same numbers. Add an NDIS or My Aged Care number on Household and it prints on the invoice, the statement and the CSV.",
  },
  {
    q: "How do I message a carer or family?",
    a: "Each booking has a private thread. New messages show a count on Dashboard until you open the booking. Opening the thread marks them read and keeps a New label on that first view.",
  },
  {
    q: "Can I save a search for later?",
    a: "Yes. On any directory page, families can save the current filters — specialty, suburb, Needed on, Instant Book or checks. The dashboard shows how many carers match now, and how many are new since you last opened that search. Opening the list marks it seen.",
  },
  {
    q: "Which care requests should a carer propose on?",
    a: "CareProof marks jobs that match your city, specialties and usual weekly hours, including the start clock time the family set. A Saturday 6pm sit does not fit a carer who only works Saturday mornings. Days you marked away and weekdays your roster is closed are skipped. The board can show only jobs that fit, and the carer dashboard lists those matches so you are not reading every post in another state. The dashboard also shows how many fitting jobs are new since you last opened that filtered board. Families who posted a request see how many carers are free at that start, can Book one with the same clock time, or browse every match in the directory — Book from that list still closes the request and marks other pending proposals not hired. You can still propose on a mismatch if the family is flexible.",
  },
  {
    q: "How do I prepare for an upcoming sit?",
    a: "The dashboard Coming up list shows sits in progress or starting in the next 7 days. Open Handover to save keys, parking, allergies and an emergency contact on that sit. Household defaults copy onto new bookings. On an existing sit with empty fields, choose Use household defaults — notes already typed stay. From Household you can copy onto every empty upcoming sit. These notes stay off the public calendar subscribe feed.",
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
            Profiles show verified roles, screening checks, an illustrated portrait (or a photo the carer supplied over
            HTTPS) and reviews from released bookings. Carers can publish one public reply. Trust score is calculated
            from those facts.
          </p>
        </li>
        <li>
          <h2 className="text-xl font-semibold">3. Book in a few steps</h2>
          <p className="mt-2 text-stone-600">
            Instant Book pays into escrow immediately if the start is outside the carer’s notice window. A sit that
            starts too soon becomes a request to book instead. Days off pause Instant Book for that calendar day in
            Australia/Sydney. Usual weekly hours close weekdays the carer does not work, so a start time has to fall
            inside a window. Job posts collect proposals you can hire with one click. Carers see which open jobs
            match their city, specialties and usual hours. For babysitting, pick a date
            night, last-minute sit, overnight or a standing weekly series — the hourly rate does not rise with a second
            child.
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
