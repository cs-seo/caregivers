import Link from "next/link";
import { redirect } from "next/navigation";
import { PLATFORM_ABN, PLATFORM_ENTITY } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { formatAud } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { pageMeta } from "@/lib/seo";
import { fundingLines } from "@/lib/funding";
import { fundedInvoicePeers, persistMissingInvoiceNumbers } from "@/lib/invoice-peers";
import { australianFinancialYear, statementTotals, toStatementRows } from "@/lib/statement";

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
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-ink">FY {fy.label} statement</h1>
      <p className="mt-2 text-sm text-stone-600">
        {PLATFORM_ENTITY} · ABN {PLATFORM_ABN} (demo) · {isFamily ? "Family spend" : "Carer earnings"} for {user.name}.
        Funded and released sits only. Unpaid and cancelled weeks are omitted.
        {isFamily && fundingLines(user.familyProfile).length
          ? ` ${fundingLines(user.familyProfile).join(" · ")}.`
          : ""}
      </p>

      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-card p-4">
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
        <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-sage/60 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Invoice</th>
                <th className="px-3 py-2 font-medium">{isFamily ? "Carer" : "Family"}</th>
                <th className="px-3 py-2 font-medium">Care</th>
                <th className="px-3 py-2 font-medium">GST</th>
                <th className="px-3 py-2 font-medium">{isFamily ? "Paid" : "Payout"}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-line">
                  <td className="px-3 py-2">{formatDate(row.dateKey)}</td>
                  <td className="px-3 py-2">
                    <Link
                      href={
                        isFamily
                          ? `/dashboard/bookings/${row.id}/invoice`
                          : `/dashboard/bookings/${row.id}/remittance`
                      }
                      className="text-teal hover:underline"
                    >
                      {row.invoiceNumber}
                    </Link>
                    {row.week ? <span className="ml-1 text-stone-400">w{row.week}</span> : null}
                  </td>
                  <td className="px-3 py-2">
                    {isFamily ? row.caregiverName : row.familyName}
                    <span className="block text-xs text-stone-500">{row.specialty}</span>
                  </td>
                  <td className="px-3 py-2">{formatAud(row.careCents)}</td>
                  <td className="px-3 py-2">{formatAud(row.gstCents)}</td>
                  <td className="px-3 py-2 font-medium">
                    {formatAud(isFamily ? row.familyCents : row.payoutCents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
