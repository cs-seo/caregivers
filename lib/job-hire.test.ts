import assert from "node:assert/strict";
import { test } from "node:test";
import { hiredProposalStatus, proposalStatusLabel, requestStatusLabel, PROPOSAL_STATUS } from "./job-hire";

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
