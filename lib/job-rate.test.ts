import assert from "node:assert/strict";
import { test } from "node:test";
import { proposalBudgetDeltaCents, proposalBudgetLabel, proposalBudgetTone } from "./job-rate";

test("proposalBudgetLabel compares a rate to the family budget", () => {
  assert.equal(proposalBudgetLabel(6800, 6500), "$3.00/hr above budget");
  assert.equal(proposalBudgetLabel(4200, 4800), "$6.00/hr below budget");
  assert.equal(proposalBudgetLabel(5000, 4800), "$2.00/hr above budget");
  assert.equal(proposalBudgetLabel(6500, 6500), "At your budget");
  assert.equal(proposalBudgetDeltaCents(6800, 6500), 300);
  assert.equal(proposalBudgetTone(4200, 4800), "teal");
  assert.equal(proposalBudgetTone(6500, 6500), "teal");
  assert.equal(proposalBudgetTone(6800, 6500), "stone");
});
