import Link from "next/link";
import { auth } from "@/auth";
import { Badge } from "@/components/badges";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { formatJobStart, jobFitsCarer, jobMissLabel, jobMissReason } from "@/lib/job-match";
import { formatAud } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { jobsFitDeltaLabel, savedSearchDelta } from "@/lib/saved-search";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Open care requests",
  description:
    "Browse open care requests from Australian families. Carers send proposals; families hire into escrow.",
  path: "/care-requests",
});

export default async function CareRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ fit?: string }>;
}) {
  const [query, session] = await Promise.all([searchParams, auth()]);
  const requests = await prisma.careRequest.findMany({
    where: { status: "open" },
    include: {
      specialty: true,
      city: { include: { state: true } },
      _count: { select: { proposals: true } },
      invites: { select: { caregiverId: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const carer =
    session?.user?.role === "CAREGIVER"
      ? await prisma.caregiverProfile.findFirst({
          where: { userId: session.user.id },
          include: {
            specialties: { select: { specialtyId: true } },
            weeklyWindows: { select: { weekday: true, startMin: true, endMin: true } },
            blockedDates: { select: { dateKey: true } },
          },
        })
      : null;
  const matchCarer = carer
    ? {
        cityId: carer.cityId,
        specialtyIds: carer.specialties.map((item) => item.specialtyId),
        windows: carer.weeklyWindows,
        blockedKeys: carer.blockedDates.map((row) => row.dateKey),
      }
    : null;

  const decorated = requests.map((job) => {
    const reason = matchCarer ? jobMissReason(job, matchCarer) : null;
    const fit = matchCarer ? jobFitsCarer(job, matchCarer) : false;
    const invited = Boolean(
      carer && job.invites.some((invite) => invite.caregiverId === carer.id && invite.status === "pending"),
    );
    return { job, reason, fit, invited };
  });
  const fitOnly = query.fit === "1" && Boolean(matchCarer);
  const visible = fitOnly ? decorated.filter((row) => row.fit) : decorated;
  const sorted = matchCarer
    ? [...visible].sort((a, b) => Number(b.invited) - Number(a.invited) || Number(b.fit) - Number(a.fit))
    : visible;
  const fitCount = decorated.filter((row) => row.fit).length;
  const fitDelta = carer
    ? savedSearchDelta(fitCount, carer.jobsLastSeenCount, carer.jobsSeenAt)
    : null;
  if (fitOnly && carer) {
    await prisma.caregiverProfile.update({
      where: { id: carer.id },
      data: { jobsLastSeenCount: fitCount, jobsSeenAt: new Date() },
    });
  }

  return (
    <div>
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Care requests" }]} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-ink">Open care requests</h1>
          <p className="mt-2 max-w-2xl text-stone-600">
            Families post what they need. Carers send a proposal. Hiring funds escrow the same way a profile booking does.
            {matchCarer
              ? ` ${fitCount} ${fitCount === 1 ? "job fits" : "jobs fit"} your city, specialties and usual hours.${
                  fitDelta && (fitDelta.unseen || fitDelta.newCount > 0) ? ` ${jobsFitDeltaLabel(fitDelta)}.` : ""
                }`
              : ""}
          </p>
          {matchCarer ? (
            <p className="mt-2 text-sm">
              {fitOnly ? (
                <Link href="/care-requests" className="font-medium text-teal">
                  Show every open job
                </Link>
              ) : (
                <Link href="/care-requests?fit=1" className="font-medium text-teal">
                  Show jobs that fit your roster
                </Link>
              )}
            </p>
          ) : null}
        </div>
        <Link href="/post-a-job" className="rounded-full bg-teal px-4 py-2 text-sm font-medium text-white no-underline">
          Post a request
        </Link>
      </div>
      <ul className="mt-8 space-y-4">
        {sorted.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-line bg-card p-5 text-sm text-stone-600">
            {fitOnly ? "No open jobs match your city, specialties and usual weekly hours." : "No open care requests right now."}
          </li>
        ) : (
          sorted.map(({ job, fit, reason, invited }) => (
            <li key={job.id} className="rounded-2xl border border-line bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="text-lg font-semibold">
                  <Link href={`/care-requests/${job.slug}`} className="hover:text-teal">
                    {job.title}
                  </Link>
                </h2>
                <span className="flex flex-wrap gap-2">
                  {invited ? <Badge tone="clay">Invited</Badge> : null}
                  {matchCarer ? (
                    <Badge tone={fit ? "teal" : "stone"}>{jobMissLabel(reason)}</Badge>
                  ) : null}
                </span>
              </div>
              <p className="mt-1 text-sm text-stone-600">
                {job.specialty.name} · {job.city.name}, {job.city.state.abbrev} · from {formatJobStart(job.startDate)}
              </p>
              <p className="mt-2 line-clamp-2 text-sm text-stone-700">{job.description}</p>
              <p className="mt-3 text-sm text-stone-500">
                Budget {formatAud(job.budgetCents)}/hr · {job._count.proposals} proposals
              </p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
