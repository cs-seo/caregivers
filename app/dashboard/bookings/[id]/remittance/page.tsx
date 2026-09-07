import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PrintLink } from "@/components/print-link";
import { PLATFORM_ABN, PLATFORM_ENTITY, SITE_NAME } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/format";
import { formatAud } from "@/lib/money";
import { persistMissingInvoiceNumbers } from "@/lib/invoice-peers";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Remittance advice",
  description: "Payout remittance for a CareProof booking.",
  path: "/dashboard",
  noIndex: true,
});

export default async function BookingRemittancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      caregiver: { include: { user: true } },
      family: { select: { id: true, name: true } },
      specialty: true,
      payment: true,
    },
  });
  if (!booking) notFound();
  const isFamily = booking.familyId === user.id;
  const isCarer = booking.caregiver.userId === user.id;
  if (!isFamily && !isCarer) redirect("/dashboard");
  if (!booking.payment) {
    redirect(`/dashboard/bookings/${booking.id}`);
  }

  const numbers = await persistMissingInvoiceNumbers();
  const invoiceNumber =
    numbers.get(booking.id) ?? booking.payment.invoiceNumber ?? `CP-${booking.id.slice(-8).toUpperCase()}`;
  const issued = booking.payment.releasedAt ?? booking.payment.heldAt ?? booking.createdAt;
  const released = booking.payment.status === "released";

  return (
    <div className="mx-auto max-w-2xl">
      <p className="print:hidden text-sm">
        <Link href={`/dashboard/bookings/${booking.id}`} className="text-teal">
          Back to booking
        </Link>
        {" · "}
        <Link href={`/dashboard/bookings/${booking.id}/invoice`} className="text-teal">
          Family tax invoice
        </Link>
      </p>
      <article className="mt-4 rounded-2xl border border-line bg-card p-6 print:mt-0 print:rounded-none print:border-0 print:p-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal">Remittance advice</p>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-ink">{SITE_NAME}</h1>
            <p className="mt-1 text-sm text-stone-600">
              {PLATFORM_ENTITY}
              <br />
              ABN {PLATFORM_ABN} (demo)
              <br />
              {released ? `Paid ${formatDate(issued)}` : `Held ${formatDate(issued)}`}
            </p>
          </div>
          <div className="text-sm text-stone-600">
            <p className="font-semibold text-ink">Remittance {invoiceNumber}</p>
            <p className="mt-1">
              Status: {booking.payment.status}
              {booking.recurringTotal > 1
                ? ` · week ${booking.recurringIndex} of ${booking.recurringTotal}`
                : ""}
            </p>
          </div>
        </div>

        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">Pay to</dt>
            <dd className="mt-1 text-stone-700">
              {booking.caregiver.user.name}
              <br />
              {booking.caregiver.abn ? `ABN ${booking.caregiver.abn}` : "ABN not supplied"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">For care supplied to</dt>
            <dd className="mt-1 text-stone-700">
              {booking.family.name}
              <br />
              {booking.specialty.name} · {formatDateTime(booking.startAt)}
              <br />
              {booking.hours} hours
            </dd>
          </div>
        </dl>

        <table className="mt-6 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-stone-500">
              <th className="py-2 font-medium">Description</th>
              <th className="py-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="text-stone-700">
            <tr className="border-b border-line">
              <td className="py-2">Advertised care rate inc GST</td>
              <td className="py-2 text-right">{formatAud(booking.subtotalCents)}</td>
            </tr>
            <tr className="border-b border-line">
              <td className="py-2 text-stone-500">GST included (1/11)</td>
              <td className="py-2 text-right text-stone-500">{formatAud(booking.gstCents)}</td>
            </tr>
            <tr>
              <td className="py-3 font-semibold text-ink">
                {released ? "Paid to you" : "Held for you"}
              </td>
              <td className="py-3 text-right font-semibold text-ink">{formatAud(booking.subtotalCents)}</td>
            </tr>
            <tr>
              <td className="py-1 text-stone-600">Family paid (rate + 10% platform fee)</td>
              <td className="py-1 text-right text-stone-600">{formatAud(booking.totalCents)}</td>
            </tr>
          </tbody>
        </table>

        <p className="mt-6 text-xs text-stone-500">
          You receive 100% of the advertised rate. CareProof charges the family a 10% platform fee on top and does not
          deduct it from this payout. This remittance uses the same number as the family tax invoice. Print from the
          browser for a PDF.
        </p>
      </article>
      <p className="print:hidden mt-4 text-sm">
        <PrintLink id="print-remittance" />
      </p>
    </div>
  );
}
