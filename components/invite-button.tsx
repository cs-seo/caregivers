import Link from "next/link";
import { inviteToJobAction } from "@/lib/actions";
import { canCreateInvite, inviteButtonLabel } from "@/lib/job-invite";

export function InviteButton({
  caregiverId,
  jobSlug,
  job,
  familyId,
  existing,
  proposed,
  next,
  signedIn,
  compact = false,
}: {
  caregiverId: string;
  jobSlug: string;
  job: { familyId: string; status: string };
  familyId?: string | null;
  existing?: { status: string } | null;
  proposed?: boolean;
  next: string;
  signedIn: boolean;
  compact?: boolean;
}) {
  const className = compact
    ? "rounded-full border border-line px-3 py-1 text-xs font-medium no-underline hover:border-teal hover:text-teal"
    : "mt-3 block w-full rounded-xl border border-teal py-2.5 text-center text-sm font-semibold text-teal no-underline hover:bg-sage";
  const label = inviteButtonLabel(existing, proposed);
  const canSend = Boolean(familyId && canCreateInvite(job, familyId, existing, proposed));

  if (!signedIn) {
    return (
      <Link href={`/login?callbackUrl=${encodeURIComponent(next)}`} className={className}>
        Log in to invite
      </Link>
    );
  }

  if (!canSend) {
    return <p className={compact ? "text-xs text-stone-500" : "mt-3 text-center text-sm text-teal-deep"}>{label}</p>;
  }

  return (
    <form action={inviteToJobAction} className={compact ? "inline" : "mt-3"}>
      <input type="hidden" name="caregiverId" value={caregiverId} />
      <input type="hidden" name="job" value={jobSlug} />
      <input type="hidden" name="next" value={next} />
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}
