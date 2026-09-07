import { INVITE_STATUS } from "./job-invite";
import { prisma } from "./prisma";

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

export function proposalStatusLabel(status: string) {
  if (status === PROPOSAL_STATUS.ACCEPTED) return "Hired";
  if (status === PROPOSAL_STATUS.DECLINED) return "Not hired";
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

export function notHiredBanner(
  items: { title: string; familyName: string }[],
) {
  if (!items.length) return null;
  if (items.length === 1) {
    return `${items[0].familyName} hired someone else for ${items[0].title}.`;
  }
  return `${items.length} families hired someone else.`;
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
