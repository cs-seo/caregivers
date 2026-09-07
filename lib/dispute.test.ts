import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DISPUTE_NOTE_LIMIT,
  disputeReasonHint,
  disputeReasonNotice,
  firstDisputeNote,
  sanitizeDisputeNote,
} from "./dispute";

test("sanitizeDisputeNote trims and caps length", () => {
  assert.equal(sanitizeDisputeNote("  Finished early  "), "Finished early");
  assert.equal(sanitizeDisputeNote("x".repeat(DISPUTE_NOTE_LIMIT + 20)).length, DISPUTE_NOTE_LIMIT);
  assert.equal(sanitizeDisputeNote("   "), "");
});

test("disputeReasonNotice quotes the family reason for each side", () => {
  assert.equal(disputeReasonNotice({ note: null, familyName: "Alex Martin", isFamily: false }), null);
  assert.equal(disputeReasonNotice({ note: "  ", familyName: "Alex Martin", isFamily: true }), null);
  assert.equal(
    disputeReasonNotice({
      note: "The sit finished early.",
      familyName: "Alex Martin",
      isFamily: true,
    }),
    "You told the carer: “The sit finished early.”",
  );
  assert.equal(
    disputeReasonNotice({
      note: "The sit finished early.",
      familyName: "Alex Martin",
      isFamily: false,
    }),
    "Alex Martin wrote: “The sit finished early.”",
  );
});

test("disputeReasonHint shortens a long family reason on the dashboard card", () => {
  assert.equal(disputeReasonHint({ note: null, isFamily: false }), null);
  assert.equal(
    disputeReasonHint({ note: "The sit finished early.", isFamily: true }),
    "You wrote: “The sit finished early.”",
  );
  assert.equal(
    disputeReasonHint({ note: "The sit finished early.", isFamily: false }),
    "The family wrote: “The sit finished early.”",
  );
  const long = `${"The sit finished early. ".repeat(8)}Holding funds.`;
  const hint = disputeReasonHint({ note: long, isFamily: false });
  assert.ok(hint?.startsWith("The family wrote: “"));
  assert.ok((hint?.length ?? 0) < 180);
});

test("firstDisputeNote picks the first week that has a reason", () => {
  assert.equal(firstDisputeNote([{ status: "disputed" }]), null);
  assert.equal(
    firstDisputeNote([
      { status: "disputed", disputeNote: "  " },
      { status: "disputed", disputeNote: "Finished early." },
    ]),
    "Finished early.",
  );
});
