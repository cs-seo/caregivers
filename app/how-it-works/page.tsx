import Link from "next/link";
import { auth } from "@/auth";
import { JsonLd } from "@/components/json-ld";
import { FamilyStartPanel } from "@/components/family-start";
import { forCarersHomeCta, forCarersHomeHref, forCarersHomeNotice } from "@/lib/for-carers";
import { leftoverFamily } from "@/lib/demo-mode";
import { howItWorksNextLinks, howItWorksNextNotice, howItWorksNextShows } from "@/lib/how-it-works-next";
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
    a: "Open a profile and book when that carer is taking Instant Book, or post a care request and hire a proposal. You can also invite a carer to apply so they send a written proposal first. Either path creates one escrow-backed booking. Instant Book needs the carer’s notice window and becomes a request to book if you need someone sooner.",
  },
  {
    q: "When is the carer paid?",
    a: "Never up front. After the carer accepts a request-to-book sit, the family pays into escrow. CareProof holds the funds and releases them after you confirm — or automatically 72 hours after the booking ends if there is no dispute. A dispute pauses that clock until the family releases the sit or refunds it. Instant Book collects on the book page.",
  },
  {
    q: "What makes a carer verified?",
    a: "Work history can be employer-confirmed, document-checked or completed on CareProof. Credentials such as WWCC, NDIS screening and AHPRA are stored with expiry dates. The WWCC filter only matches a current check, and Current checks only hides anyone with a lapsed document.",
  },
  {
    q: "Can I leave a review immediately?",
    a: "No. Reviews are only accepted after a booking is released. That keeps ratings tied to real, paid work. Released sits waiting for a rating appear on the family dashboard. The carer can publish one public reply. Replies cannot be edited.",
  },
  {
    q: "Can I book a standing weekly sit?",
    a: "Yes. On the book page choose 2 to 12 weeks. CareProof creates one escrow booking per week so you can cancel or dispute a single Friday without touching the rest of the series. The dashboard folds those weeks into one card.",
  },
  {
    q: "Can I search for a carer who is free on a specific night?",
    a: "Yes. Use Needed on in search or the directory filters. Add an optional start time to match usual weekly hours. Without a time, CareProof still hides carers who already have a sit that day, carers who marked the day as away, and carers whose usual weekly hours are closed that weekday.",
  },
  {
    q: "Can I get a GST tax invoice for a Home Care Package or NDIS plan?",
    a: "Yes. After funds are in escrow, open the booking and print the tax invoice. It shows the care rate inc GST, GST as 1/11, the CareProof fee, the carer ABN if they listed one, and the carer payout. Add an NDIS or My Aged Care number on Household and it prints on the invoice and the financial-year statement.",
  },
  {
    q: "How do I message a carer or family?",
    a: "Each booking has a private thread. Open care requests also have a private thread between the family and an invited or proposing carer — ask about hours or start time before you hire.",
  },
  {
    q: "Can I save a search for later?",
    a: "Yes. On any directory page, families can save the current filters — specialty, suburb, Needed on, Instant Book or checks. The dashboard shows how many carers match now, and how many are new since you last opened that search.",
  },
  {
    q: "Will I know when a carer proposes?",
    a: "Yes. The family dashboard lists pending proposals on open requests. Open the job to review, counter, pass on, or hire.",
  },
  {
    q: "Which care requests should a carer propose on?",
    a: "CareProof marks jobs that match your city, specialties and usual weekly hours, including the start time the family set. Days you marked away and weekdays your roster is closed are skipped. The board can show only jobs that fit so you are not reading every post in another state.",
  },
  {
    q: "What happens if a job’s start time has passed?",
    a: "CareProof marks it Expired. It drops off the open board. Families still see it on their dashboard. Carers cannot propose, and families cannot invite, counter or hire. Post a new request if you still need cover.",
  },
  {
    q: "How do I prepare for an upcoming sit?",
    a: "The dashboard Coming up list shows sits in progress or starting in the next 7 days. Open Handover to save keys, parking, allergies and an emergency contact on that sit. Household defaults copy onto new bookings.",
  },
];

export default async function HowItWorksPage() {
  const session = await auth();
  const showHowItWorksNext = howItWorksNextShows({ isFamily: leftoverFamily(session?.user?.role === "FAMILY") });
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
            in Brisbane” without a client-side app. Specialty, state and city pages also link to open care requests for
            that place and specialty.
          </p>
        </li>
        <li>
          <h2 className="text-xl font-semibold">2. Check experience, not just a bio</h2>
          <p className="mt-2 text-stone-600">
            Profiles show verified roles, screening checks, an illustrated portrait (or a photo the carer supplied over
            HTTPS) and reviews from released bookings. Carers can publish one public reply. Trust score is calculated
            from those facts. When families in that city have already posted for the same specialty, the profile links
            to those open requests.
          </p>
        </li>
        <li>
          <h2 className="text-xl font-semibold">3. Book in a few steps</h2>
          <p className="mt-2 text-stone-600">
            Instant Book pays into escrow immediately if the start is outside the carer’s notice window. A sit that
            starts too soon becomes a request to book instead — the family waits for the carer to accept before paying. Days off pause Instant Book for that calendar day in
            Australia/Sydney. Usual weekly hours close weekdays the carer does not work, so a start time has to fall
            inside a window. Job posts collect proposals you can hire with one click — add a welcome note so the carer
            sees gate, parking or the first-morning plan on the booking. Open a matching profile from a request, or
            book from the match list or your shortlist — that closes the request and attaches the sit to it. Invite a carer to apply if
            you want a written proposal before you book — the page confirms Invite sent. Message an invited or proposing
            carer on the request before you hire, suggest a different rate, or pass on a proposal and keep the request open.
            Once the start time passes, an open request expires — it leaves the board so carers are not applying for a sit
            that already began. Carers see which open jobs
            match their city, specialties and usual hours, plus any invites on their dashboard. For babysitting, pick a date
            night, last-minute sit, overnight or a standing weekly series — the hourly rate does not rise with a second
            child.
          </p>
        </li>
        <li>
          <h2 className="text-xl font-semibold">4. Release payment when care is done</h2>
          <p className="mt-2 text-stone-600">
            Confirm completion to pay the carer. Open a dispute to pause the 72-hour auto-release — funds stay held until
            you release them to the carer or refund the family. Uncontested bookings auto-release after 72 hours.
          </p>
        </li>
      </ol>
      {showHowItWorksNext ? (
        <div className="mt-8 rounded-xl bg-sage p-3 text-sm">
          <p>{howItWorksNextNotice()}</p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {howItWorksNextLinks().map((link) => (
              <Link key={link.href} href={link.href} className="font-medium text-teal hover:underline">
                {link.label}
              </Link>
            ))}
          </p>
        </div>
      ) : (
        <FamilyStartPanel />
      )}
      <p className="mt-8 rounded-2xl bg-sage px-4 py-3 text-sm text-stone-700">
        Carers: {forCarersHomeNotice()}{" "}
        <Link href={forCarersHomeHref()} className="font-medium text-teal hover:underline">
          {forCarersHomeCta()}
        </Link>
        .
      </p>
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
