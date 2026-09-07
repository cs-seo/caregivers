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
}
