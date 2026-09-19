import { BOOKING_STATUS } from "./constants";

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

export function firstDisputeReply(weeks: { disputeReply?: string | null }[]) {
  return weeks.find((week) => week.disputeReply?.trim())?.disputeReply?.trim() ?? null;
}

export function hasDisputeReply(reply?: string | null) {
  return Boolean(reply?.trim());
}

export function canWriteDisputeReply(args: {
  status: string;
  reply?: string | null;
  isCarer: boolean;
}) {
  return args.isCarer && args.status === BOOKING_STATUS.DISPUTED && !hasDisputeReply(args.reply);
}

export function disputeReplyNotice(args: {
  reply: string | null | undefined;
  carerName: string;
  isFamily: boolean;
}) {
  const reply = (args.reply ?? "").trim();
  if (!reply) return null;
  return args.isFamily ? `${args.carerName} replied: “${reply}”` : `You replied: “${reply}”`;
}

export function disputeReplyHint(args: { reply: string | null | undefined; isFamily: boolean }) {
  const reply = (args.reply ?? "").trim();
  if (!reply) return null;
  const short = reply.length > 140 ? `${reply.slice(0, 137).trim()}…` : reply;
  return args.isFamily ? `The carer replied: “${short}”` : `You replied: “${short}”`;
}
