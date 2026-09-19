import { formatAud } from "./money";

export function proposalBudgetDeltaCents(rateCents: number, budgetCents: number) {
  return rateCents - budgetCents;
}

export function proposalBudgetLabel(rateCents: number, budgetCents: number) {
  const delta = proposalBudgetDeltaCents(rateCents, budgetCents);
  if (delta === 0) return "At your budget";
  const amount = formatAud(Math.abs(delta));
  return delta < 0 ? `${amount}/hr below budget` : `${amount}/hr above budget`;
}

export function proposalBudgetTone(rateCents: number, budgetCents: number): "teal" | "stone" {
  return rateCents <= budgetCents ? "teal" : "stone";
}

export function dashboardProposalBudgetHint(proposals: { rateCents: number }[], budgetCents: number) {
  if (!proposals.length) return "";
  const lowest = proposals.reduce((best, row) => (row.rateCents < best.rateCents ? row : best));
  const vs = proposalBudgetLabel(lowest.rateCents, budgetCents);
  if (proposals.length === 1) return vs;
  return `from ${formatAud(lowest.rateCents)}/hr · ${vs}`;
}
