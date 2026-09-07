export const INVITE_STATUS = {
  PENDING: "pending",
  APPLIED: "applied",
  DECLINED: "declined",
} as const;

export function canInviteToJob(job: { familyId: string; status: string } | null, familyId: string) {
  return Boolean(job && job.status === "open" && job.familyId === familyId);
}

export function canCreateInvite(
  job: { familyId: string; status: string } | null,
  familyId: string,
  existing?: { status: string } | null,
  proposed?: boolean,
) {
  if (!canInviteToJob(job, familyId)) return false;
  if (proposed) return false;
  if (existing && existing.status !== INVITE_STATUS.DECLINED) return false;
  return true;
}

export function hiredInviteStatus(status: string, caregiverId: string, hiredCaregiverId: string) {
  if (status !== INVITE_STATUS.PENDING) return status;
  return caregiverId === hiredCaregiverId ? INVITE_STATUS.APPLIED : INVITE_STATUS.DECLINED;
}

export function inviteStatusLabel(status: string) {
  if (status === INVITE_STATUS.APPLIED) return "Applied";
  if (status === INVITE_STATUS.DECLINED) return "Declined";
  if (status === INVITE_STATUS.PENDING) return "Invited";
  return status;
}

export function inviteStatusTone(status: string): "teal" | "stone" | "clay" {
  if (status === INVITE_STATUS.APPLIED) return "teal";
  if (status === INVITE_STATUS.DECLINED) return "stone";
  return "clay";
}

export function inviteButtonLabel(existing?: { status: string } | null, proposed?: boolean) {
  if (proposed) return "Already proposed";
  if (!existing) return "Invite to this request";
  if (existing.status === INVITE_STATUS.PENDING) return "Invited";
  if (existing.status === INVITE_STATUS.APPLIED) return "Applied";
  if (existing.status === INVITE_STATUS.DECLINED) return "Invite again";
  return inviteStatusLabel(existing.status);
}

export function isSafeInviteReturnPath(path: string) {
  if (!path.startsWith("/")) return false;
  if (path.includes("://") || path.includes("//") || path.includes("\\")) return false;
  if (path.length > 240) return false;
  return (
    path.startsWith("/caregiver/") ||
    path.startsWith("/caregivers") ||
    path.startsWith("/care-requests/") ||
    path === "/dashboard" ||
    path.startsWith("/dashboard?")
  );
}
