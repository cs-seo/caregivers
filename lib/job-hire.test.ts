import assert from "node:assert/strict";
import { test } from "node:test";
import {
  hiredProposalStatus,
  proposalStatusLabel,
  requestStatusLabel,
  canWithdrawProposal,
  notHiredBanner,
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
