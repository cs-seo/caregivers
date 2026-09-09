import Link from "next/link";
import { redirect } from "next/navigation";
import { markProposalAlertSentAction, toggleProposalAlertsAction } from "@/lib/actions";
import { ROLES } from "@/lib/constants";
import { acceptingJobWhere } from "@/lib/job-status";
import { prisma } from "@/lib/prisma";
import {
  composeProposalAlert,
  proposalAlertLabel,
  proposalAlertRate,
  searchAlertDelta,
  searchAlertMailto,
} from "@/lib/saved-search";
import { proposalAlertsNextLinks, proposalAlertsNextNotice } from "@/lib/proposal-alerts";
import { requireUser } from "@/lib/session";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Proposal alerts",
  description: "Preview the digest CareProof would email when carers propose on your open requests.",
  path: "/dashboard/proposal-alerts",
  noIndex: true,
});

export default async function ProposalAlertsPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const user = await requireUser();
  if (!user) redirect("/login?callbackUrl=/dashboard/proposal-alerts");
  if (user.role !== ROLES.FAMILY || !user.familyProfile) redirect("/dashboard");
  const query = await searchParams;
  const [pending, profile] = await Promise.all([
    prisma.proposal.findMany({
      where: {
        status: "pending",
        careRequest: { familyId: user.id, ...acceptingJobWhere() },
      },
      include: {
        caregiver: { include: { user: { select: { name: true } } } },
        careRequest: { select: { title: true, slug: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.familyProfile.findUnique({ where: { id: user.familyProfile.id } }),
  ]);
  if (!profile) redirect("/dashboard");
  const delta = searchAlertDelta(pending.length, profile.lastProposalAlertedCount, profile.proposalAlertedAt);
  const digest = composeProposalAlert(
    pending.map((proposal) => ({
      title: proposal.careRequest.title,
      href: `/care-requests/${proposal.careRequest.slug}`,
      carer: proposal.caregiver.user.name,
      rate: proposalAlertRate(proposal.rateCents, proposal.counterRateCents),
    })),
    pending.length,
    delta.newCount,
  );
  const email = user.email ?? "family@careproof.com.au";

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/dashboard" className="text-sm text-teal">
        Back to dashboard
      </Link>
      <h1 className="mt-3 text-3xl font-semibold text-ink">Proposal alerts</h1>
      <p className="mt-2 text-stone-600">
        This demo has no mail server. The digest below is what CareProof would email when a carer proposes on an open
        request — including a family counter that is still waiting.
      </p>
      {query.sent ? (
        <p className="mt-4 rounded-xl bg-sage p-3 text-sm">Digest marked sent. New-proposal counts start from this visit.</p>
      ) : null}

      {profile.proposalAlertsOn ? (
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
        <p className="mt-6 text-sm text-stone-600">Proposal alerts are off. Turn them on to preview a digest.</p>
      )}

      <section className="mt-6 rounded-2xl border border-line bg-card p-4">
        <p className="text-sm text-stone-500">{proposalAlertLabel(delta, profile.proposalAlertsOn)}</p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <form action={toggleProposalAlertsAction}>
            <input type="hidden" name="next" value="/dashboard/proposal-alerts" />
            <input type="hidden" name="alertsOn" value={profile.proposalAlertsOn ? "0" : "1"} />
            <button className="text-stone-500 hover:text-ink" type="submit">
              {profile.proposalAlertsOn ? "Turn alerts off" : "Turn alerts on"}
            </button>
          </form>
          {profile.proposalAlertsOn && delta.newCount > 0 ? (
            <form action={markProposalAlertSentAction}>
              <input type="hidden" name="next" value="/dashboard/proposal-alerts" />
              <button className="text-teal hover:underline" type="submit">
                Mark digest sent
              </button>
            </form>
          ) : null}
        </div>
      </section>
      {pending.length ? (
        <div className="mt-6 rounded-xl bg-sage p-3 text-sm">
          <p>{proposalAlertsNextNotice()}</p>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {proposalAlertsNextLinks().map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="font-medium text-teal hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
