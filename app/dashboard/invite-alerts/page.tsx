import Link from "next/link";
import { redirect } from "next/navigation";
import { markInviteAlertSentAction, toggleInviteAlertsAction } from "@/lib/actions";
import { ROLES } from "@/lib/constants";
import { formatJobStart } from "@/lib/job-match";
import { acceptingJobWhere } from "@/lib/job-status";
import { prisma } from "@/lib/prisma";
import { composeInviteAlert, inviteAlertLabel, searchAlertDelta, searchAlertMailto } from "@/lib/saved-search";
import { requireUser } from "@/lib/session";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Invite alerts",
  description: "Preview the digest CareProof would email when a family invites you to apply.",
  path: "/dashboard/invite-alerts",
  noIndex: true,
});

export default async function InviteAlertsPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const user = await requireUser();
  if (!user) redirect("/login?callbackUrl=/dashboard/invite-alerts");
  if (user.role !== ROLES.CAREGIVER || !user.caregiverProfile) redirect("/dashboard");
  const query = await searchParams;
  const [invites, profile] = await Promise.all([
    prisma.careRequestInvite.findMany({
      where: {
        caregiverId: user.caregiverProfile.id,
        status: "pending",
        request: acceptingJobWhere(),
      },
      include: {
        request: {
          select: {
            title: true,
            slug: true,
            startDate: true,
            family: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.caregiverProfile.findUnique({ where: { id: user.caregiverProfile.id } }),
  ]);
  if (!profile) redirect("/dashboard");
  const delta = searchAlertDelta(invites.length, profile.lastInviteAlertedCount, profile.inviteAlertedAt);
  const digest = composeInviteAlert(
    invites.map((invite) => ({
      title: invite.request.title,
      href: `/care-requests/${invite.request.slug}`,
      family: invite.request.family.name,
      when: `starts ${formatJobStart(invite.request.startDate)}`,
      note: invite.note,
    })),
    invites.length,
    delta.newCount,
  );
  const email = user.email ?? "james.okafor@careproof.com.au";

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/dashboard" className="text-sm text-teal">
        Back to dashboard
      </Link>
      <h1 className="mt-3 text-3xl font-semibold text-ink">Invite alerts</h1>
      <p className="mt-2 text-stone-600">
        This demo has no mail server. The digest below is what CareProof would email when a family invites you to apply
        on an open request.
      </p>
      {query.sent ? (
        <p className="mt-4 rounded-xl bg-sage p-3 text-sm">Digest marked sent. New-invite counts start from this visit.</p>
      ) : null}

      {profile.inviteAlertsOn ? (
        <article className="mt-6 rounded-2xl border border-line bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal">Email preview</p>
          <h2 className="mt-2 text-xl font-semibold text-ink">{digest.subject}</h2>
          <p className="mt-3 whitespace-pre-line text-sm text-stone-700">{digest.body}</p>
          <p className="mt-4">
            <a href={searchAlertMailto(email, digest)} className="text-sm font-medium text-teal hover:underline">
              Email this digest to {email}
            </a>
          </p>
        </article>
      ) : (
        <p className="mt-6 text-sm text-stone-600">Invite alerts are off. Turn them on to preview a digest.</p>
      )}

      <section className="mt-6 rounded-2xl border border-line bg-card p-4">
        <p className="text-sm text-stone-500">{inviteAlertLabel(delta, profile.inviteAlertsOn)}</p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <form action={toggleInviteAlertsAction}>
            <input type="hidden" name="next" value="/dashboard/invite-alerts" />
            <input type="hidden" name="alertsOn" value={profile.inviteAlertsOn ? "0" : "1"} />
            <button className="text-stone-500 hover:text-ink" type="submit">
              {profile.inviteAlertsOn ? "Turn alerts off" : "Turn alerts on"}
            </button>
          </form>
          {profile.inviteAlertsOn && delta.newCount > 0 ? (
            <form action={markInviteAlertSentAction}>
              <input type="hidden" name="next" value="/dashboard/invite-alerts" />
              <button className="text-teal hover:underline" type="submit">
                Mark digest sent
              </button>
            </form>
          ) : null}
        </div>
      </section>
    </div>
  );
}
