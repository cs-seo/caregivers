export const DISPUTE_NOTE_LIMIT = 400;

export function sanitizeDisputeNote(raw: string) {
  return raw.trim().slice(0, DISPUTE_NOTE_LIMIT);
}

export function firstDisputeNote(weeks: { status: string; disputeNote?: string | null }[]) {
  return weeks.find((week) => week.disputeNote?.trim())?.disputeNote?.trim() ?? null;
}

export function disputeReasonNotice(args: {
  note: string | null | undefined;
  familyName: string;
  isFamily: boolean;
}) {
  const note = (args.note ?? "").trim();
  if (!note) return null;
  return args.isFamily ? `You told the carer: “${note}”` : `${args.familyName} wrote: “${note}”`;
}

export function disputeReasonHint(args: { note: string | null | undefined; isFamily: boolean }) {
  const note = (args.note ?? "").trim();
  if (!note) return null;
  const short = note.length > 140 ? `${note.slice(0, 137).trim()}…` : note;
  return args.isFamily ? `You wrote: “${short}”` : `The family wrote: “${short}”`;
}
