import { INVITE_NOTE_LIMIT, INVITE_STATUS } from "./job-invite";
import { prisma } from "./prisma";

export const BOOKING_NOTE_LIMIT = INVITE_NOTE_LIMIT;

export function sanitizeBookingNote(raw: string) {
  return raw.trim().slice(0, BOOKING_NOTE_LIMIT);
}

export function composeBookingNotes(parts: { welcomeNote?: string | null; coverLetter?: string | null }) {
  const welcome = sanitizeBookingNote(parts.welcomeNote ?? "");
  const cover = (parts.coverLetter ?? "").trim();
  if (welcome && cover) {
    return `Welcome from the family:\n${welcome}\n\nProposal:\n${cover}`;
  }
  return welcome || cover || null;
}

export const PROPOSAL_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  DECLINED: "declined",
} as const;

export function hiredProposalStatus(status: string, caregiverId: string, hiredCaregiverId: string) {
  if (status !== PROPOSAL_STATUS.PENDING) return status;
  return caregiverId === hiredCaregiverId ? PROPOSAL_STATUS.ACCEPTED : PROPOSAL_STATUS.DECLINED;
}

export function requestStatusLabel(status: string) {
  if (status === "hired") return "Hired";
  if (status === "open") return "Open";
  return status;
}

export function proposalStatusLabel(status: string, jobStatus?: string) {
  if (status === PROPOSAL_STATUS.ACCEPTED) return "Hired";
  if (status === PROPOSAL_STATUS.DECLINED) return jobStatus === "open" ? "Passed on" : "Not hired";
  if (status === PROPOSAL_STATUS.PENDING) return "Pending";
  return status;
}

export function proposalStatusTone(status: string): "teal" | "stone" | "clay" {
  if (status === PROPOSAL_STATUS.ACCEPTED) return "teal";
  if (status === PROPOSAL_STATUS.DECLINED) return "stone";
  return "clay";
}

export function canWithdrawProposal(
  proposal: { caregiverId: string; status: string } | null,
  caregiverId: string,
  jobStatus: string,
) {
  return Boolean(
    proposal &&
      proposal.caregiverId === caregiverId &&
      proposal.status === PROPOSAL_STATUS.PENDING &&
      jobStatus === "open",
  );
}

export function canPassOnProposal(
  proposal: { status: string } | null,
  job: { familyId: string; status: string } | null,
  familyId: string,
) {
  return Boolean(
    proposal &&
      proposal.status === PROPOSAL_STATUS.PENDING &&
      job &&
      job.status === "open" &&
      job.familyId === familyId,
  );
}

export function hasPendingCounter(proposal: { status: string; counterRateCents?: number | null } | null) {
  return Boolean(
    proposal && proposal.status === PROPOSAL_STATUS.PENDING && proposal.counterRateCents != null,
  );
}

export function canCounterProposal(
  proposal: { status: string } | null,
  job: { familyId: string; status: string } | null,
  familyId: string,
) {
  return canPassOnProposal(proposal, job, familyId);
}

export function canRespondToCounter(
  proposal: { caregiverId: string; status: string; counterRateCents?: number | null } | null,
  caregiverId: string,
  jobStatus: string,
) {
  return Boolean(hasPendingCounter(proposal) && proposal?.caregiverId === caregiverId && jobStatus === "open");
}

export function counterBanner(items: { title: string; familyName: string; rateLabel: string }[]) {
  if (!items.length) return null;
  if (items.length === 1) {
    return `${items[0].familyName} suggested ${items[0].rateLabel}/hr on ${items[0].title}.`;
  }
  return `${items.length} families suggested a different rate.`;
}

export function notHiredBanner(
  items: { title: string; familyName: string }[],
) {
  if (!items.length) return null;
  if (items.length === 1) {
    return `${items[0].familyName} hired someone else for ${items[0].title}.`;
  }
  return `${items.length} families hired someone else.`;
}

export function passedOnBanner(
  items: { title: string; familyName: string }[],
) {
  if (!items.length) return null;
  if (items.length === 1) {
    return `${items[0].familyName} passed on your proposal for ${items[0].title}.`;
  }
  return `${items.length} families passed on a proposal.`;
}

export async function markRequestHired(careRequestId: string, hiredCaregiverId: string) {
  await prisma.careRequest.update({
    where: { id: careRequestId },
    data: { status: "hired" },
  });
  await prisma.proposal.updateMany({
    where: { careRequestId, caregiverId: hiredCaregiverId, status: PROPOSAL_STATUS.PENDING },
    data: { status: PROPOSAL_STATUS.ACCEPTED },
  });
  await prisma.proposal.updateMany({
    where: {
      careRequestId,
      caregiverId: { not: hiredCaregiverId },
      status: PROPOSAL_STATUS.PENDING,
    },
    data: { status: PROPOSAL_STATUS.DECLINED },
  });
  await prisma.careRequestInvite.updateMany({
    where: { requestId: careRequestId, caregiverId: hiredCaregiverId, status: INVITE_STATUS.PENDING },
    data: { status: INVITE_STATUS.APPLIED },
  });
  await prisma.careRequestInvite.updateMany({
    where: {
      requestId: careRequestId,
      caregiverId: { not: hiredCaregiverId },
      status: INVITE_STATUS.PENDING,
    },
    data: { status: INVITE_STATUS.DECLINED },
  });
}
