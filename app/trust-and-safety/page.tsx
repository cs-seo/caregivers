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
          <li>First aid including asthma and anaphylaxis (HLTAID011 / HLTAID012)</li>
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
      <section>
        <h2 className="text-xl font-semibold">Babysitting and nanny sits</h2>
        <p className="mt-2 text-stone-700">
          For child care we treat a current WWCC (or Blue Card / WWVP / Ochre Card) and child first aid that covers
          asthma and anaphylaxis as the floor, not a marketing badge. Date-night and last-minute sits use the same
          escrow as weekday nanny days. Reviews stay locked until the booking is released.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold">Australian checks, by name</h2>
        <p className="mt-2 text-stone-700">
          A generic “police checked” badge is not enough. CareProof stores the document families actually ask for in
          each state: WWCC in NSW, Victoria, SA, Tasmania and WA; Blue Card in Queensland; WWVP in the ACT; Ochre Card
          in the Northern Territory; plus NDIS Worker Screening, Aged Care Worker Screening and AHPRA for nurses.
          Expiry dates sit on the profile. Checks inside 60 days turn amber so a family does not book against a lapsed
          WWCC or first-aid certificate.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold">My Aged Care and NDIS invoices</h2>
        <p className="mt-2 text-stone-700">
          Independent carers list an ABN where they have one. After escrow is funded, the booking tax invoice shows the
          care rate, GST as 1/11, the 10% CareProof fee on top, and the carer payout. That is the split coordinators
          and plan managers need when they reconcile a Home Care Package or a self-managed NDIS plan. Download the
          financial-year statement or CSV from the dashboard for a running total.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold">Cancellations and disputes</h2>
        <p className="mt-2 text-stone-700">
          Cancel more than 24 hours before the start and the held amount returns in full. Inside 24 hours the family
          can still request a refund; CareProof reviews the booking before releasing or returning funds. After the
          visit, escrow stays held for 72 hours so either side can raise a dispute before auto-release. Standing weekly
          series use the same rules per week — cancelling Friday week three does not unwind week one. Families can
          cancel unpaid remaining weeks from the series panel; weeks already in escrow stay held until release, refund
          or dispute.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold">Why not pay the carer directly?</h2>
        <p className="mt-2 text-stone-700">
          Cash or a private transfer leaves both sides exposed: the family has no hold if the shift does not happen,
          and the carer has no proof they will be paid. Escrow is the default on CareProof. Reviews are only accepted
          after a released booking, so ratings stay tied to work that actually ran.
        </p>
      </section>
    </div>
  );
}
