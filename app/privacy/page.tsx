import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Privacy",
  description: "How CareProof handles personal information for families and carers in Australia.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-semibold text-ink">Privacy</h1>
      <p className="text-stone-600">
        CareProof is an Australian marketplace. We collect the account, booking and screening details needed to
        introduce families and carers, hold escrow, and show verified work history.
      </p>
      <section>
        <h2 className="text-xl font-semibold text-ink">What we store</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-stone-700">
          <li>Name, email, phone and suburb</li>
          <li>Carer bios, rates, specialties, credentials and work history</li>
          <li>Booking times, notes and payment status</li>
          <li>Messages sent on a booking thread</li>
          <li>Reviews left after funds are released</li>
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-ink">Who sees it</h2>
        <p className="mt-2 text-stone-700">
          Public directory pages show the carer profile a carer chose to publish. Booking messages stay between the
          family and carer on that booking. We do not sell personal information.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-ink">Checks</h2>
        <p className="mt-2 text-stone-700">
          WWCC, NDIS, AHPRA and police-check numbers are shown only as the carer entered them, so families can verify
          the document. Do not upload another person’s check without their consent.
        </p>
      </section>
    </div>
  );
}
