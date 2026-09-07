import Link from "next/link";
import { inviteToJobAction } from "@/lib/actions";
import { defaultInviteJobSlug, invitableOpenJobs, type InviteJobOption } from "@/lib/job-invite";

export function InviteJobPicker({
  caregiverId,
  caregiverName,
  jobs,
  familyId,
  next,
  signedIn,
  preferredSlug,
}: {
  caregiverId: string;
  caregiverName?: string;
  jobs: InviteJobOption[];
  familyId?: string | null;
  next: string;
  signedIn: boolean;
  preferredSlug?: string;
}) {
  if (!signedIn) {
    return (
      <Link
        href={`/login?callbackUrl=${encodeURIComponent(next)}`}
        className="mt-3 block w-full rounded-xl border border-teal py-2.5 text-center text-sm font-semibold text-teal no-underline hover:bg-sage"
      >
        Log in to invite
      </Link>
    );
  }
  if (!familyId || !jobs.length) return null;

  const open = invitableOpenJobs(jobs, familyId);
  const firstName = caregiverName?.split(" ")[0];
  if (!open.length) {
    return (
      <p className="mt-3 text-center text-sm text-teal-deep">
        Already invited or proposed on your open requests.
      </p>
    );
  }

  const defaultSlug = defaultInviteJobSlug(open, familyId, preferredSlug);

  return (
    <form action={inviteToJobAction} className="mt-3 space-y-2">
      <input type="hidden" name="caregiverId" value={caregiverId} />
      <input type="hidden" name="next" value={next} />
      <label className="block text-xs text-stone-500">
        {firstName ? `Invite ${firstName} to` : "Invite to"}
        <select
          name="job"
          defaultValue={defaultSlug}
          className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm text-ink"
        >
          {open.map((job) => (
            <option key={job.slug} value={job.slug}>
              {job.title}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="block w-full rounded-xl border border-teal py-2.5 text-center text-sm font-semibold text-teal hover:bg-sage"
      >
        Invite to this request
      </button>
    </form>
  );
}
