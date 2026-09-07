import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PLATFORM_ABN, PLATFORM_ENTITY, SITE_NAME } from "@/lib/constants";
import { fundingLines } from "@/lib/funding";
import { formatDate, formatDateTime } from "@/lib/format";
import { formatAud } from "@/lib/money";
import { fundedInvoicePeers } from "@/lib/invoice-peers";
import { prisma } from "@/lib/prisma";
import { invoiceNumberMap } from "@/lib/statement";
import { requireUser } from "@/lib/session";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Tax invoice",
  description: "GST tax invoice for a CareProof booking.",
  path: "/dashboard",
  noIndex: true,
});

export default async function BookingInvoicePage({
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
      family: { select: { id: true, name: true, email: true, familyProfile: true } },
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

  const invoiceNumber =
    invoiceNumberMap(await fundedInvoicePeers(), booking.startAt).get(booking.id) ??
    `CP-${booking.id.slice(-8).toUpperCase()}`;
  const issued = booking.payment.heldAt ?? booking.createdAt;
  const feeGst = Math.round(booking.platformFeeCents / 11);
  const household = [
    booking.family.familyProfile?.suburb,
    booking.family.email,
    ...fundingLines(booking.family.familyProfile),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="mx-auto max-w-2xl">
      <p className="print:hidden text-sm">
        <Link href={`/dashboard/bookings/${booking.id}`} className="text-teal">
          Back to booking
        </Link>
      </p>
      <article className="mt-4 rounded-2xl border border-line bg-card p-6 print:mt-0 print:rounded-none print:border-0 print:p-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal">Australian tax invoice</p>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-ink">{SITE_NAME}</h1>
            <p className="mt-1 text-sm text-stone-600">
              {PLATFORM_ENTITY}
              <br />
              ABN {PLATFORM_ABN} (demo)
              <br />
              Issued {formatDate(issued)}
            </p>
          </div>
          <div className="text-sm text-stone-600">
            <p className="font-semibold text-ink">Invoice {invoiceNumber}</p>
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
            <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">Bill to</dt>
            <dd className="mt-1 text-stone-700">
              {booking.family.name}
              {household ? (
                <>
                  <br />
                  {household}
                </>
              ) : null}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">Care supplied by</dt>
            <dd className="mt-1 text-stone-700">
              {booking.caregiver.user.name}
              <br />
              {booking.caregiver.abn ? `ABN ${booking.caregiver.abn}` : "ABN not supplied"}
              <br />
              {booking.specialty.name} · {formatDateTime(booking.startAt)}
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
              <td className="py-2">
                {booking.specialty.name}, {booking.hours} hours inc GST
              </td>
              <td className="py-2 text-right">{formatAud(booking.subtotalCents)}</td>
            </tr>
            <tr className="border-b border-line">
              <td className="py-2 text-stone-500">GST on care (1/11)</td>
              <td className="py-2 text-right text-stone-500">{formatAud(booking.gstCents)}</td>
            </tr>
            <tr className="border-b border-line">
              <td className="py-2">CareProof platform fee inc GST</td>
              <td className="py-2 text-right">{formatAud(booking.platformFeeCents)}</td>
            </tr>
            <tr className="border-b border-line">
              <td className="py-2 text-stone-500">GST on platform fee (1/11)</td>
              <td className="py-2 text-right text-stone-500">{formatAud(feeGst)}</td>
            </tr>
            <tr>
              <td className="py-3 font-semibold text-ink">Total collected into escrow</td>
              <td className="py-3 text-right font-semibold text-ink">{formatAud(booking.totalCents)}</td>
            </tr>
            <tr>
              <td className="py-1 text-stone-600">Carer payout (100% of advertised rate)</td>
              <td className="py-1 text-right text-stone-600">{formatAud(booking.subtotalCents)}</td>
            </tr>
          </tbody>
        </table>

        <p className="mt-6 text-xs text-stone-500">
          Care rates are advertised inc GST. CareProof adds 10% on top and holds the total until the booking is
          released. This demo invoice is for coordinators and plan managers reconciling a Home Care Package or
          self-managed NDIS plan. Print from the browser for a PDF.
        </p>
      </article>
      <p className="print:hidden mt-4 text-sm">
        <a href="#" className="text-teal" id="print-invoice">
          Print or save as PDF
        </a>
      </p>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.getElementById("print-invoice")?.addEventListener("click",function(e){e.preventDefault();window.print();});`,
        }}
      />
    </div>
  );
}
