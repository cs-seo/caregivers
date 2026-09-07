import { BOOKING_STATUS } from "./constants";
import { sydneyDateKey, sydneyDayBounds } from "./format";

export const STATEMENT_STATUSES = new Set<string>([
  BOOKING_STATUS.ESCROW_HELD,
  BOOKING_STATUS.IN_PROGRESS,
  BOOKING_STATUS.PENDING_RELEASE,
  BOOKING_STATUS.RELEASED,
]);

export type StatementBooking = {
  id: string;
  startAt: Date;
  heldAt?: Date | null;
  hours: number;
  subtotalCents: number;
  platformFeeCents: number;
  gstCents: number;
  totalCents: number;
  status: string;
  recurringIndex: number;
  recurringTotal: number;
  specialty: { name: string };
  caregiver: { user: { name: string }; abn?: string | null };
  family: {
    name: string;
    familyProfile?: { ndisNumber?: string | null; agedCareRef?: string | null } | null;
  };
};

export type StatementRow = {
  id: string;
  dateKey: string;
  invoiceNumber: string;
  caregiverName: string;
  familyName: string;
  specialty: string;
  week: string;
  hours: number;
  careCents: number;
  gstCents: number;
  feeCents: number;
  familyCents: number;
  payoutCents: number;
  status: string;
  abn: string;
  ndisNumber: string;
  agedCareRef: string;
};

export function fyInvoiceCode(startYear: number) {
  return `${String(startYear).slice(-2)}${String(startYear + 1).slice(-2)}`;
}

export function sequentialInvoiceNumber(index: number, startYear: number) {
  return `CP-${fyInvoiceCode(startYear)}-${String(index).padStart(4, "0")}`;
}

export function invoiceNumber(bookingId: string, index = 1, startYear = australianFinancialYear().startYear) {
  if (index > 0) return sequentialInvoiceNumber(index, startYear);
  return `CP-${bookingId.slice(-8).toUpperCase()}`;
}

export function invoiceNumberMap(
  bookings: { id: string; startAt: Date; status: string; heldAt?: Date | null }[],
  now = new Date(),
) {
  const fy = australianFinancialYear(now);
  const funded = bookings
    .filter(
      (booking) =>
        STATEMENT_STATUSES.has(booking.status) &&
        booking.startAt >= fy.startAt &&
        booking.startAt < fy.endAt,
    )
    .sort((a, b) => {
      const left = (a.heldAt ?? a.startAt).getTime();
      const right = (b.heldAt ?? b.startAt).getTime();
      return left - right || a.id.localeCompare(b.id);
    });
  return new Map(
    funded.map((booking, index) => [booking.id, sequentialInvoiceNumber(index + 1, fy.startYear)]),
  );
}

export function australianFinancialYear(now = new Date()) {
  const key = sydneyDateKey(now);
  const year = Number(key.slice(0, 4));
  const month = Number(key.slice(5, 7));
  const startYear = month >= 7 ? year : year - 1;
  const start = sydneyDayBounds(`${startYear}-07-01`);
  const end = sydneyDayBounds(`${startYear + 1}-07-01`);
  if (!start || !end) throw new Error("Invalid financial year");
  return {
    startYear,
    label: `${startYear}–${String(startYear + 1).slice(2)}`,
    startAt: start.startAt,
    endAt: end.startAt,
  };
}

export function csvCell(value: string | number) {
  const text = String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function toStatementRows(
  bookings: StatementBooking[],
  now = new Date(),
  allFunded: { id: string; startAt: Date; status: string; heldAt?: Date | null }[] = bookings,
): StatementRow[] {
  const fy = australianFinancialYear(now);
  const numbers = invoiceNumberMap(allFunded, now);
  return bookings
    .filter((booking) => STATEMENT_STATUSES.has(booking.status))
    .filter((booking) => booking.startAt >= fy.startAt && booking.startAt < fy.endAt)
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())
    .map((booking) => ({
      id: booking.id,
      dateKey: sydneyDateKey(booking.startAt),
      invoiceNumber: numbers.get(booking.id) ?? sequentialInvoiceNumber(1, fy.startYear),
      caregiverName: booking.caregiver.user.name,
      familyName: booking.family.name,
      specialty: booking.specialty.name,
      week:
        booking.recurringTotal > 1 ? `${booking.recurringIndex}/${booking.recurringTotal}` : "",
      hours: booking.hours,
      careCents: booking.subtotalCents,
      gstCents: booking.gstCents,
      feeCents: booking.platformFeeCents,
      familyCents: booking.totalCents,
      payoutCents: booking.subtotalCents,
      status: booking.status,
      abn: booking.caregiver.abn ?? "",
      ndisNumber: booking.family.familyProfile?.ndisNumber ?? "",
      agedCareRef: booking.family.familyProfile?.agedCareRef ?? "",
    }));
}

export function statementTotals(rows: StatementRow[]) {
  return rows.reduce(
    (sum, row) => ({
      careCents: sum.careCents + row.careCents,
      gstCents: sum.gstCents + row.gstCents,
      feeCents: sum.feeCents + row.feeCents,
      familyCents: sum.familyCents + row.familyCents,
      payoutCents: sum.payoutCents + row.payoutCents,
    }),
    { careCents: 0, gstCents: 0, feeCents: 0, familyCents: 0, payoutCents: 0 },
  );
}

export function statementCsv(rows: StatementRow[], isFamily: boolean) {
  const header = [
    "Date",
    "Invoice",
    isFamily ? "Carer" : "Family",
    "Specialty",
    "Week",
    "Hours",
    "Care rate (inc GST)",
    "GST (1/11)",
    "CareProof fee",
    isFamily ? "Family total" : "Carer payout",
    "Status",
    "Carer ABN",
    "NDIS",
    "My Aged Care",
  ];
  const lines = [
    header.map(csvCell).join(","),
    ...rows.map((row) =>
      [
        row.dateKey,
        row.invoiceNumber,
        isFamily ? row.caregiverName : row.familyName,
        row.specialty,
        row.week,
        row.hours,
        (row.careCents / 100).toFixed(2),
        (row.gstCents / 100).toFixed(2),
        (row.feeCents / 100).toFixed(2),
        ((isFamily ? row.familyCents : row.payoutCents) / 100).toFixed(2),
        row.status,
        row.abn,
        row.ndisNumber,
        row.agedCareRef,
      ]
        .map(csvCell)
        .join(","),
    ),
  ];
  return `${lines.join("\r\n")}\r\n`;
}
