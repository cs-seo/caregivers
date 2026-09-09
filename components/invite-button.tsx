import Link from "next/link";
import { inviteToJobAction } from "@/lib/actions";
import { INVITE_NOTE_LIMIT, canCreateInvite, inviteButtonLabel } from "@/lib/job-invite";

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

  const fields = (
    <>
      <input type="hidden" name="caregiverId" value={caregiverId} />
      <input type="hidden" name="job" value={jobSlug} />
      <input type="hidden" name="next" value={next} />
      <label className={`block text-xs text-stone-500 ${compact ? "mt-2" : "mt-0"}`}>
        Optional note
        <textarea
          name="note"
          rows={compact ? 2 : 3}
          maxLength={INVITE_NOTE_LIMIT}
          placeholder="Why this carer, or what they should know."
          className="mt-1 w-full min-w-[14rem] rounded-lg border border-line px-3 py-2 text-sm text-ink"
        />
      </label>
    </>
  );

  if (compact) {
    return (
      <details className="relative inline-block text-left">
        <summary className={`${className} cursor-pointer list-none`}>{label}</summary>
        <form
          action={inviteToJobAction}
          className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-line bg-card p-3 shadow-lg"
        >
          {fields}
          <button
            type="submit"
            className="mt-2 w-full rounded-lg bg-teal px-3 py-1.5 text-xs font-medium text-white"
          >
            Send invite
          </button>
        </form>
      </details>
    );
  }

  return (
    <form action={inviteToJobAction} className="mt-3 space-y-2">
      {fields}
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}
