export const INVITE_NOTE_LIMIT = 400;

export function sanitizeInviteNote(raw: string) {
  return raw.trim().slice(0, INVITE_NOTE_LIMIT);
}

export const INVITE_STATUS = {
  PENDING: "pending",
  APPLIED: "applied",
  DECLINED: "declined",
} as const;

export function canInviteToJob(job: { familyId: string; status: string } | null, familyId: string) {
  return Boolean(job && job.status === "open" && job.familyId === familyId);
}

export function canWithdrawInvite(
  invite: { status: string } | null,
  job: { familyId: string; status: string } | null,
  familyId: string,
) {
  return Boolean(invite && invite.status === INVITE_STATUS.PENDING && canInviteToJob(job, familyId));
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
    path.startsWith("/dashboard?") ||
    path.startsWith("/dashboard/shortlist")
  );
}

export type InviteJobOption = {
  slug: string;
  title: string;
  familyId: string;
  status: string;
  existing?: { status: string } | null;
  proposed?: boolean;
};

export function invitableOpenJobs<T extends InviteJobOption>(jobs: T[], familyId: string) {
  return jobs.filter((job) => canCreateInvite(job, familyId, job.existing, job.proposed));
}

export function defaultInviteJobSlug(jobs: InviteJobOption[], familyId: string, preferred?: string) {
  const open = invitableOpenJobs(jobs, familyId);
  if (preferred && open.some((job) => job.slug === preferred)) return preferred;
  return open[0]?.slug ?? "";
}
