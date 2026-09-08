import Link from "next/link";
import { redirect } from "next/navigation";
import { AttachJobBanner } from "@/components/attach-job-banner";
import { Badge, CredentialBadges } from "@/components/badges";
import { CaregiverCardView } from "@/components/caregiver-card";
import { InviteJobPicker } from "@/components/invite-job-picker";
import { InviteSentNotice } from "@/components/invite-sent-notice";
import { fortnightLabel, isInstantBookLive, summariseFortnight } from "@/lib/availability";
import { formatAud } from "@/lib/money";
import { caregiverCardInclude, getUpcomingAvailability, withTrust } from "@/lib/queries";
import { isInviteFlash } from "@/lib/job-invite";
import { bookHref, canAttachJob, caregiverHref, isJobSlug, shortlistHref } from "@/lib/job-match";
import { acceptingJobWhere } from "@/lib/job-status";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { pageMeta } from "@/lib/seo";
import { trustLabel } from "@/lib/trust";

export const metadata = pageMeta({
  title: "Your shortlist",
  description: "Compare saved carers before you book.",
  path: "/dashboard/shortlist",
  noIndex: true,
});

export default async function ShortlistPage({
  searchParams,
}: {
  searchParams: Promise<{ invited?: string; job?: string }>;
}) {
  const [user, query] = await Promise.all([requireRole("FAMILY"), searchParams]);
  if (!user) redirect("/login?callbackUrl=/dashboard/shortlist");
  const jobSlug = query.job && isJobSlug(query.job) ? query.job : "";

  const saved = await prisma.shortlist.findMany({
    where: { familyId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      caregiver: { include: caregiverCardInclude },
    },
  });
  const carers = saved.map((row) => withTrust(row.caregiver));
  const fortnights = await Promise.all(
    carers.map(async (carer) => [carer.id, summariseFortnight(await getUpcomingAvailability(carer.id))] as const),
  );
  const availability = new Map(fortnights);
  const openJobs = await prisma.careRequest.findMany({
    where: { familyId: user.id, ...acceptingJobWhere() },
    select: {
      slug: true,
      title: true,
      familyId: true,
      status: true,
      startDate: true,
      proposals: { select: { caregiverId: true } },
      invites: { select: { caregiverId: true, status: true } },
    },
    orderBy: { startDate: "asc" },
  });
  const attachJob = jobSlug ? openJobs.find((job) => job.slug === jobSlug) : undefined;
  const jobTitle = attachJob && canAttachJob(attachJob, user.id) ? attachJob.title : null;
  const returnTo = shortlistHref(jobTitle ? jobSlug : undefined);

  return (
    <div>
      <p className="text-sm">
        <Link href="/dashboard" className="text-teal">
          Back to dashboard
        </Link>
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-ink">Your shortlist</h1>
      {isInviteFlash(query.invited) ? <InviteSentNotice className="mt-3 text-sm text-teal" /> : null}
      {jobTitle ? <AttachJobBanner title={jobTitle} surface="shortlist" /> : null}
      <p className="mt-2 max-w-2xl text-stone-600">
        {jobTitle
          ? `Comparing saved carers for ${jobTitle}. Book or invite from here — booking closes the request and attaches the sit.`
          : "Save carers from the directory, compare rates, checks and who is free in the next fortnight, then Instant Book or invite them to one of your open requests. This is the family-side equivalent of an agency roster — yours to keep."}
      </p>

      {carers.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-line p-8 text-sm text-stone-600">
          No saved carers yet.{" "}
          <Link href="/caregivers" className="text-teal">
            Browse the directory
          </Link>{" "}
          and tap Save to shortlist.
        </p>
      ) : (
        <>
          {carers.length > 1 ? (
            <section className="mt-8 overflow-x-auto rounded-2xl border border-line bg-card">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-line text-xs uppercase tracking-wide text-stone-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Carer</th>
                    <th className="px-4 py-3 font-medium">Rate</th>
                    <th className="px-4 py-3 font-medium">Experience</th>
                    <th className="px-4 py-3 font-medium">Usual hours</th>
                    <th className="px-4 py-3 font-medium">Next 14 days</th>
                    <th className="px-4 py-3 font-medium">Checks</th>
                    <th className="px-4 py-3 font-medium">Book</th>
                    <th className="px-4 py-3 font-medium">Invite</th>
                  </tr>
                </thead>
                <tbody>
                  {carers.map((carer) => {
                    const fortnight = availability.get(carer.id)!;
                    return (
                    <tr key={carer.id} className="border-t border-line">
                      <td className="px-4 py-3">
                        <Link
                          href={caregiverHref(carer.slug, { job: jobTitle ? jobSlug : undefined })}
                          className="font-medium text-ink hover:text-teal"
                        >
                          {carer.user.name}
                        </Link>
                        <p className="text-xs text-stone-500">
                          {carer.suburb}, {carer.city.name}
                        </p>
                        <Badge tone="teal">{trustLabel(carer.trustScore)}</Badge>
                      </td>
                      <td className="px-4 py-3 font-medium text-teal">{formatAud(carer.hourlyRateCents)}/hr</td>
                      <td className="px-4 py-3 text-stone-600">{carer.yearsExperience} yrs</td>
                      <td className="px-4 py-3 text-stone-600">{carer.weeklyHours ?? "Ask when you book"}</td>
                      <td className="px-4 py-3 text-stone-600">
                        {fortnightLabel(fortnight)}
                        {fortnight.nextFree ? (
                          <Link
                            href={bookHref(carer.slug, {
                              start: fortnight.nextFree,
                              job: jobTitle ? jobSlug : undefined,
                            })}
                            className="mt-1 block text-xs text-teal hover:underline"
                          >
                            Next free day
                          </Link>
                        ) : (
                          <span className="mt-1 block text-xs text-stone-400">No free day this fortnight</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <CredentialBadges credentials={carer.credentials} abn={carer.abn} />
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={bookHref(carer.slug, { job: jobTitle ? jobSlug : undefined })}
                          className="text-teal hover:underline"
                        >
                          {isInstantBookLive(
                            carer.instantBook,
                            carer.blockedDates.map((row) => row.dateKey),
                          )
                            ? "Book now"
                            : "Request"}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <InviteJobPicker
                          caregiverId={carer.id}
                          jobs={openJobs.map((job) => ({
                            slug: job.slug,
                            title: job.title,
                            familyId: job.familyId,
                            status: job.status,
                            existing: job.invites.find((invite) => invite.caregiverId === carer.id) ?? null,
                            proposed: job.proposals.some((proposal) => proposal.caregiverId === carer.id),
                          }))}
                          familyId={user.id}
                          preferredSlug={jobTitle ? jobSlug : undefined}
                          next={returnTo}
                          signedIn
                        />
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          ) : null}

          <div className="mt-8 space-y-4">
            {carers.map((carer) => (
              <div key={carer.id} className="space-y-2">
                <CaregiverCardView
                  caregiver={carer}
                  job={jobTitle ? jobSlug : undefined}
                  shortlist={{ saved: true, signedIn: true, next: returnTo }}
                />
                <p className="text-sm text-stone-600">
                  Next 14 days: {fortnightLabel(availability.get(carer.id)!)}
                  {availability.get(carer.id)?.nextFree ? (
                    <>
                      {" · "}
                      <Link
                        href={bookHref(carer.slug, {
                          start: availability.get(carer.id)!.nextFree,
                          job: jobTitle ? jobSlug : undefined,
                        })}
                        className="text-teal"
                      >
                        Book the next free day
                      </Link>
                    </>
                  ) : null}
                </p>
                <Link
                  href={bookHref(carer.slug, { job: jobTitle ? jobSlug : undefined })}
                  className="inline-block text-sm text-teal"
                >
                  Book {carer.user.name}
                </Link>
                <InviteJobPicker
                  caregiverId={carer.id}
                  caregiverName={carer.user.name}
                  jobs={openJobs.map((job) => ({
                    slug: job.slug,
                    title: job.title,
                    familyId: job.familyId,
                    status: job.status,
                    startDate: job.startDate,
                    existing: job.invites.find((invite) => invite.caregiverId === carer.id) ?? null,
                    proposed: job.proposals.some((proposal) => proposal.caregiverId === carer.id),
                  }))}
                  familyId={user.id}
                  preferredSlug={jobTitle ? jobSlug : undefined}
                  next={returnTo}
                  signedIn
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
