import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Trust and safety",
  description:
    "How CareProof verifies work history, stores WWCC and NDIS checks, and holds payment in escrow for Australian care bookings.",
  path: "/trust-and-safety",
});

export default function TrustPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-semibold text-ink">Trust and safety</h1>
      <p className="text-stone-600">
        Care is intimate work. CareProof is built so families can see evidence, and so carers are not asked to work
        unpaid.
      </p>
      <section>
        <h2 className="text-xl font-semibold">What we verify</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-stone-700">
          <li>Working with Children Checks (state-issued)</li>
          <li>NDIS Worker Screening</li>
          <li>National Police Checks</li>
          <li>AHPRA registration for nurses</li>
          <li>Aged Care Worker Screening</li>
          <li>First aid (HLTAID011)</li>
          <li>ABN for independent contractors</li>
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold">Experience, not testimonials</h2>
        <p className="mt-2 text-stone-700">
          Each role on a profile has a verification method: unverified, document, employer confirmed, or completed on
          CareProof. Platform jobs are written to the timeline only after escrow is released.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold">Escrow rules</h2>
        <p className="mt-2 text-stone-700">
          Payment is collected from the family first. It sits as held until the family confirms, a dispute is resolved,
          or 72 hours pass after the scheduled end. Refunds return the held amount; they never silently skip the ledger.
        </p>
      </section>
    </div>
  );
}
