import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Terms",
  description: "Terms for booking verified carers on CareProof, including escrow and reviews.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-semibold text-ink">Terms</h1>
      <p className="text-stone-600">
        By creating an account you agree to use CareProof to book in-home care in Australia, pay into escrow, and
        treat the other party fairly.
      </p>
      <section>
        <h2 className="text-xl font-semibold text-ink">Families</h2>
        <p className="mt-2 text-stone-700">
          You confirm the booking details, fund escrow before care starts, and release or dispute after the visit.
          Reviews can only be left after a released booking.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-ink">Carers</h2>
        <p className="mt-2 text-stone-700">
          You confirm your checks and work history are accurate. CareProof holds the family payment and pays your
          advertised rate after release. The platform fee is charged on top of that rate. You may publish one public
          reply to each review.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-ink">Escrow</h2>
        <p className="mt-2 text-stone-700">
          Funds stay held until the family confirms completion, 72 hours pass after the booking end, or a dispute is
          resolved as a release or refund.
        </p>
      </section>
    </div>
  );
}
