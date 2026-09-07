import assert from "node:assert/strict";
import { test } from "node:test";
import { BOOKING_STATUS } from "./constants";
import {
  australianFinancialYear,
  csvCell,
  fyPeriodLabel,
  invoiceNumberMap,
  statementCsv,
  statementTotals,
  toStatementRows,
  type StatementBooking,
} from "./statement";

function booking(partial: Partial<StatementBooking> & Pick<StatementBooking, "id" | "startAt" | "status">): StatementBooking {
  return {
    hours: 4,
    subtotalCents: 27200,
    platformFeeCents: 2720,
    gstCents: 2473,
    totalCents: 29920,
    recurringIndex: 1,
    recurringTotal: 1,
    specialty: { name: "Aged care" },
    caregiver: { user: { name: "Sarah Nguyen" }, abn: "84 123 456 781" },
    family: { name: "Alex Martin" },
    ...partial,
  };
}

test("australianFinancialYear uses 1 July in Sydney", () => {
  const fy = australianFinancialYear(new Date("2026-09-07T00:00:00.000Z"));
  assert.equal(fy.label, "2026–27");
  assert.equal(fy.startAt.toISOString(), "2026-06-30T14:00:00.000Z");
  const before = australianFinancialYear(new Date("2026-06-30T00:00:00.000Z"));
  assert.equal(before.label, "2025–26");
});

test("fyPeriodLabel is 1 July to 30 June", () => {
  assert.equal(fyPeriodLabel(new Date("2026-09-07T00:00:00.000Z")), "1 July 2026 – 30 June 2027");
  assert.equal(fyPeriodLabel(new Date("2026-06-30T00:00:00.000Z")), "1 July 2025 – 30 June 2026");
});

test("toStatementRows keeps funded FY sits and drops cancelled or prior-year ones", () => {
  const rows = toStatementRows(
    [
      booking({
        id: "held-now",
        startAt: new Date("2026-09-12T00:00:00.000Z"),
        status: BOOKING_STATUS.ESCROW_HELD,
      }),
      booking({
        id: "disputed-now",
        startAt: new Date("2026-08-28T00:00:00.000Z"),
        status: BOOKING_STATUS.DISPUTED,
        subtotalCents: 13200,
        totalCents: 14520,
        gstCents: 1200,
        platformFeeCents: 1320,
      }),
      booking({
        id: "cancelled",
        startAt: new Date("2026-09-13T00:00:00.000Z"),
        status: BOOKING_STATUS.CANCELLED,
      }),
      booking({
        id: "old-year",
        startAt: new Date("2026-06-01T00:00:00.000Z"),
        status: BOOKING_STATUS.RELEASED,
      }),
    ],
    new Date("2026-09-07T00:00:00.000Z"),
  );
  assert.equal(rows.length, 2);
  assert.equal(rows[0]?.id, "disputed-now");
  assert.equal(rows[0]?.invoiceNumber, "CP-2627-0001");
  assert.equal(rows[1]?.id, "held-now");
  assert.equal(statementTotals(rows).familyCents, 44440);
  assert.equal(statementTotals(rows).payoutCents, 40400);
});

test("invoiceNumberMap numbers funded FY sits by hold time", () => {
  const numbers = invoiceNumberMap(
    [
      {
        id: "second",
        startAt: new Date("2026-09-12T00:00:00.000Z"),
        status: BOOKING_STATUS.ESCROW_HELD,
        heldAt: new Date("2026-09-10T00:00:00.000Z"),
      },
      {
        id: "first",
        startAt: new Date("2026-09-20T00:00:00.000Z"),
        status: BOOKING_STATUS.RELEASED,
        heldAt: new Date("2026-09-01T00:00:00.000Z"),
      },
    ],
    new Date("2026-09-07T00:00:00.000Z"),
  );
  assert.equal(numbers.get("first"), "CP-2627-0001");
  assert.equal(numbers.get("second"), "CP-2627-0002");
});

test("invoiceNumberMap keeps stored numbers when a later sit is held earlier", () => {
  const now = new Date("2026-09-07T00:00:00.000Z");
  const stored = invoiceNumberMap(
    [
      {
        id: "kept",
        startAt: new Date("2026-09-12T00:00:00.000Z"),
        status: BOOKING_STATUS.ESCROW_HELD,
        heldAt: new Date("2026-09-06T00:00:00.000Z"),
        invoiceNumber: "CP-2627-0001",
      },
    ],
    now,
  );
  assert.equal(stored.get("kept"), "CP-2627-0001");

  const after = invoiceNumberMap(
    [
      {
        id: "kept",
        startAt: new Date("2026-09-12T00:00:00.000Z"),
        status: BOOKING_STATUS.ESCROW_HELD,
        heldAt: new Date("2026-09-06T00:00:00.000Z"),
        invoiceNumber: "CP-2627-0001",
      },
      {
        id: "new-earlier",
        startAt: new Date("2026-09-08T00:00:00.000Z"),
        status: BOOKING_STATUS.ESCROW_HELD,
        heldAt: new Date("2026-09-05T00:00:00.000Z"),
      },
    ],
    now,
  );
  assert.equal(after.get("kept"), "CP-2627-0001");
  assert.equal(after.get("new-earlier"), "CP-2627-0002");
});

test("statementCsv quotes commas and lists family totals", () => {
  assert.equal(csvCell('Kids, "keys"'), '"Kids, ""keys"""');
  const csv = statementCsv(
    toStatementRows(
      [
        booking({
          id: "abcdefgh",
          startAt: new Date("2026-09-12T00:00:00.000Z"),
          status: BOOKING_STATUS.RELEASED,
          family: {
            name: "Alex Martin",
            familyProfile: { ndisNumber: "430 112 223", agedCareRef: "HCP-NSW-88421" },
          },
        }),
      ],
      new Date("2026-09-07T00:00:00.000Z"),
    ),
    true,
  );
  assert.match(csv, /Date,Invoice,Carer,/);
  assert.match(csv, /NDIS,My Aged Care/);
  assert.match(csv, /2026-09-12,CP-2627-0001,Sarah Nguyen/);
  assert.match(csv, /299.20/);
  assert.match(csv, /430 112 223,HCP-NSW-88421/);
});
