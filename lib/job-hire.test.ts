import assert from "node:assert/strict";
import { test } from "node:test";
import {
  hiredProposalStatus,
  proposalStatusLabel,
  requestStatusLabel,
  canWithdrawProposal,
  canPassOnProposal,
  canCounterProposal,
  canRespondToCounter,
  counterBanner,
  hasPendingCounter,
  notHiredBanner,
  passedOnBanner,
  composeBookingNotes,
  sanitizeBookingNote,
  BOOKING_NOTE_LIMIT,
  PROPOSAL_STATUS,
} from "./job-hire";

test("hiring accepts the chosen carer and declines other pending proposals", () => {
  assert.equal(hiredProposalStatus("pending", "sarah", "sarah"), PROPOSAL_STATUS.ACCEPTED);
  assert.equal(hiredProposalStatus("pending", "elena", "sarah"), PROPOSAL_STATUS.DECLINED);
  assert.equal(hiredProposalStatus("accepted", "sarah", "other"), PROPOSAL_STATUS.ACCEPTED);
});

test("proposalStatusLabel is family-facing", () => {
  assert.equal(proposalStatusLabel("accepted"), "Hired");
  assert.equal(proposalStatusLabel("declined"), "Not hired");
  assert.equal(proposalStatusLabel("declined", "open"), "Passed on");
  assert.equal(proposalStatusLabel("declined", "hired"), "Not hired");
  assert.equal(proposalStatusLabel("pending"), "Pending");
  assert.equal(requestStatusLabel("hired"), "Hired");
  assert.equal(requestStatusLabel("open"), "Open");
});

test("canWithdrawProposal is only for the carer on an open pending proposal", () => {
  const pending = { caregiverId: "elena", status: "pending" };
  assert.equal(canWithdrawProposal(pending, "elena", "open"), true);
  assert.equal(canWithdrawProposal(pending, "sarah", "open"), false);
  assert.equal(canWithdrawProposal({ caregiverId: "elena", status: "declined" }, "elena", "open"), false);
  assert.equal(canWithdrawProposal(pending, "elena", "hired"), false);
});

test("canPassOnProposal is only the family on an open pending proposal", () => {
  const job = { familyId: "alex", status: "open" };
  assert.equal(canPassOnProposal({ status: "pending" }, job, "alex"), true);
  assert.equal(canPassOnProposal({ status: "pending" }, job, "other"), false);
  assert.equal(canPassOnProposal({ status: "declined" }, job, "alex"), false);
  assert.equal(canPassOnProposal({ status: "pending" }, { familyId: "alex", status: "hired" }, "alex"), false);
});

test("hasPendingCounter is only a live suggested rate on a pending proposal", () => {
  assert.equal(hasPendingCounter({ status: "pending", counterRateCents: 3800 }), true);
  assert.equal(hasPendingCounter({ status: "pending", counterRateCents: null }), false);
  assert.equal(hasPendingCounter({ status: "declined", counterRateCents: 3800 }), false);
});

test("canRespondToCounter is only the proposing carer on an open request", () => {
  const countered = { caregiverId: "lara", status: "pending", counterRateCents: 3800 };
  assert.equal(canRespondToCounter(countered, "lara", "open"), true);
  assert.equal(canRespondToCounter(countered, "chloe", "open"), false);
  assert.equal(canRespondToCounter(countered, "lara", "hired"), false);
  assert.equal(canRespondToCounter({ caregiverId: "lara", status: "pending" }, "lara", "open"), false);
});

test("canCounterProposal matches pass-on: family, open, pending", () => {
  const job = { familyId: "alex", status: "open" };
  assert.equal(canCounterProposal({ status: "pending" }, job, "alex"), true);
  assert.equal(canCounterProposal({ status: "declined" }, job, "alex"), false);
});

test("counterBanner names the family, rate and request", () => {
  assert.equal(counterBanner([]), null);
  assert.equal(
    counterBanner([
      { title: "Overnight respite in Norwood this month", familyName: "Alex Martin", rateLabel: "$38.00" },
    ]),
    "Alex Martin suggested $38.00/hr on Overnight respite in Norwood this month.",
  );
  assert.equal(
    counterBanner([
      { title: "Overnight respite in Norwood this month", familyName: "Alex Martin", rateLabel: "$38.00" },
      { title: "Weekday aged care", familyName: "Alex Martin", rateLabel: "$60.00" },
    ]),
    "2 families suggested a different rate.",
  );
});

test("notHiredBanner names the family and the request", () => {
  assert.equal(notHiredBanner([]), null);
  assert.equal(
    notHiredBanner([{ title: "Midweek respite in Leichhardt", familyName: "Alex Martin" }]),
    "Alex Martin hired someone else for Midweek respite in Leichhardt.",
  );
  assert.equal(
    notHiredBanner([
      { title: "Midweek respite in Leichhardt", familyName: "Alex Martin" },
      { title: "Overnight respite", familyName: "Alex Martin" },
    ]),
    "2 families hired someone else.",
  );
});

test("composeBookingNotes joins a welcome note and the cover letter", () => {
  assert.equal(composeBookingNotes({ welcomeNote: "  ", coverLetter: "  " }), null);
  assert.equal(composeBookingNotes({ coverLetter: "I can do Wednesday mornings." }), "I can do Wednesday mornings.");
  assert.equal(composeBookingNotes({ welcomeNote: "Side gate is unlocked." }), "Side gate is unlocked.");
  assert.equal(
    composeBookingNotes({
      welcomeNote: "  Side gate is unlocked.  ",
      coverLetter: "I can do Wednesday mornings.",
    }),
    "Welcome from the family:\nSide gate is unlocked.\n\nProposal:\nI can do Wednesday mornings.",
  );
  assert.equal(sanitizeBookingNote("x".repeat(BOOKING_NOTE_LIMIT + 20)).length, BOOKING_NOTE_LIMIT);
});

test("passedOnBanner names the family and the request", () => {
  assert.equal(passedOnBanner([]), null);
  assert.equal(
    passedOnBanner([{ title: "Overnight respite in Norwood this month", familyName: "Alex Martin" }]),
    "Alex Martin passed on your proposal for Overnight respite in Norwood this month.",
  );
  assert.equal(
    passedOnBanner([
      { title: "Overnight respite in Norwood this month", familyName: "Alex Martin" },
      { title: "Saturday night babysitter in Bondi", familyName: "Priya Shah" },
    ]),
    "2 families passed on a proposal.",
  );
});
