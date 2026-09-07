import Link from "next/link";
import { redirect } from "next/navigation";
import { PrintLink } from "@/components/print-link";
import { PLATFORM_ABN, PLATFORM_ENTITY, SITE_NAME } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { formatAud } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { pageMeta } from "@/lib/seo";
import { fundingLines } from "@/lib/funding";
import { fundedInvoicePeers, persistMissingInvoiceNumbers } from "@/lib/invoice-peers";
import {
  australianFinancialYear,
  fyPeriodLabel,
  statementStatusLabel,
  statementTotals,
  toStatementRows,
} from "@/lib/statement";

export const metadata = pageMeta({
  title: "Financial year statement",
  description: "Funded CareProof bookings for the Australian financial year.",
  path: "/dashboard/statement",
  noIndex: true,
});

export default async function StatementPage() {
  const user = await requireUser();
  if (!user) redirect("/login?callbackUrl=/dashboard/statement");
  const isFamily = user.role === "FAMILY";
  const bookings = await prisma.booking.findMany({
    where: isFamily ? { familyId: user.id } : { caregiver: { userId: user.id } },
    include: {
      caregiver: { include: { user: true } },
      family: { select: { name: true, familyProfile: true } },
      specialty: true,
      payment: { select: { heldAt: true, invoiceNumber: true } },
    },
    orderBy: { startAt: "asc" },
  });
  const fy = australianFinancialYear();
  await persistMissingInvoiceNumbers();
  const peers = await fundedInvoicePeers();
  const rows = toStatementRows(
    bookings.map((booking) => ({
      ...booking,
      heldAt: booking.payment?.heldAt,
      invoiceNumber: booking.payment?.invoiceNumber,
    })),
    new Date(),
    peers,
  );
  const totals = statementTotals(rows);
  const funding = isFamily ? fundingLines(user.familyProfile) : [];
  const period = fyPeriodLabel();

  return (
    <div className="mx-auto max-w-4xl">
      <p className="print:hidden text-sm">
        <Link href="/dashboard" className="text-teal">
          Back to dashboard
        </Link>
        {" · "}
        <a href="/dashboard/statement/csv" className="text-teal">
          Download CSV
        </a>
        {" · "}
        <PrintLink />
      </p>
      <article className="mt-4 rounded-2xl border border-line bg-card p-6 print:mt-0 print:rounded-none print:border-0 print:p-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal">
          {isFamily ? "GST tax invoice summary" : "Remittance summary"}
        </p>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-ink">
              {SITE_NAME} · FY {fy.label}
            </h1>
            <p className="mt-1 text-sm text-stone-600">
              {PLATFORM_ENTITY}
              <br />
              ABN {PLATFORM_ABN} (demo)
              <br />
              {period}
            </p>
          </div>
          <div className="text-sm text-stone-600">
            <p className="font-semibold text-ink">{isFamily ? "Bill to" : "Paid to"}</p>
            <p className="mt-1">
              {user.name}
              {isFamily && funding.length ? (
                <>
                  <br />
                  {funding.join(" · ")}
                </>
              ) : null}
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm text-stone-600">
          Funded sits only, including those in dispute while funds stay held. Unpaid and cancelled weeks are omitted.
          Invoice numbers match the tax invoice and remittance for each sit. Each row shows the sit status, so a
          disputed sit is labelled In dispute.
        </p>

        <dl className="mt-6 grid gap-3 sm:grid-cols-3 print:grid-cols-3">
          <div className="rounded-2xl border border-line bg-card p-4 print:border-line">
            <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">Care rate</dt>
            <dd className="mt-1 text-xl font-semibold text-ink">{formatAud(totals.careCents)}</dd>
          </div>
          <div className="rounded-2xl border border-line bg-card p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">GST (1/11)</dt>
            <dd className="mt-1 text-xl font-semibold text-ink">{formatAud(totals.gstCents)}</dd>
          </div>
          <div className="rounded-2xl border border-line bg-card p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              {isFamily ? "Family total" : "Your payout"}
            </dt>
            <dd className="mt-1 text-xl font-semibold text-teal">
              {formatAud(isFamily ? totals.familyCents : totals.payoutCents)}
            </dd>
          </div>
        </dl>

        {rows.length === 0 ? (
          <p className="mt-6 text-sm text-stone-500">No funded bookings in this financial year yet.</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-line text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="py-2 pr-3 font-medium">Date</th>
                  <th className="py-2 pr-3 font-medium">Invoice</th>
                  <th className="py-2 pr-3 font-medium">{isFamily ? "Carer" : "Family"}</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 pr-3 font-medium">Hours</th>
                  <th className="py-2 pr-3 font-medium">Care</th>
                  <th className="py-2 pr-3 font-medium">GST</th>
                  {isFamily ? <th className="py-2 pr-3 font-medium">Fee</th> : null}
                  <th className="py-2 text-right font-medium">{isFamily ? "Paid" : "Payout"}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-line">
                    <td className="py-2 pr-3">{formatDate(row.dateKey)}</td>
                    <td className="py-2 pr-3">
                      <Link
                        href={
                          isFamily
                            ? `/dashboard/bookings/${row.id}/invoice`
                            : `/dashboard/bookings/${row.id}/remittance`
                        }
                        className="text-teal hover:underline print:text-ink print:no-underline"
                      >
                        {row.invoiceNumber}
                      </Link>
                      {row.week ? <span className="ml-1 text-stone-400">w{row.week}</span> : null}
                    </td>
                    <td className="py-2 pr-3">
                      {isFamily ? row.caregiverName : row.familyName}
                      <span className="block text-xs text-stone-500">{row.specialty}</span>
                    </td>
                    <td className="py-2 pr-3">{statementStatusLabel(row.status)}</td>
                    <td className="py-2 pr-3">{row.hours}</td>
                    <td className="py-2 pr-3">{formatAud(row.careCents)}</td>
                    <td className="py-2 pr-3">{formatAud(row.gstCents)}</td>
                    {isFamily ? <td className="py-2 pr-3">{formatAud(row.feeCents)}</td> : null}
                    <td className="py-2 text-right font-medium">
                      {formatAud(isFamily ? row.familyCents : row.payoutCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-ink">
                  <td className="py-3 font-semibold text-ink" colSpan={5}>
                    {rows.length} {rows.length === 1 ? "sit" : "sits"}
                  </td>
                  <td className="py-3 font-semibold text-ink">{formatAud(totals.careCents)}</td>
                  <td className="py-3 font-semibold text-ink">{formatAud(totals.gstCents)}</td>
                  {isFamily ? (
                    <td className="py-3 font-semibold text-ink">{formatAud(totals.feeCents)}</td>
                  ) : null}
                  <td className="py-3 text-right font-semibold text-ink">
                    {formatAud(isFamily ? totals.familyCents : totals.payoutCents)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        <p className="mt-6 text-xs text-stone-500">
          Care rates are advertised inc GST. CareProof adds 10% on top and holds the total until each booking is
          released. Open an invoice number for the full tax invoice or remittance. Print from the browser for a PDF
          coordinators and plan managers can file with a Home Care Package or self-managed NDIS plan.
        </p>
      </article>
    </div>
  );
}
