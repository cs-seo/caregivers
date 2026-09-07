import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { Badge } from "@/components/badges";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { createProposalAction, hireProposalAction } from "@/lib/actions";
import { formatDate } from "@/lib/format";
import { jobFitsCarer, jobMissLabel, jobMissReason } from "@/lib/job-match";
import { formatAud } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await prisma.careRequest.findUnique({
    where: { slug },
    include: { city: { include: { state: true } }, specialty: true },
  });
  if (!job) return {};
  return pageMeta({
    title: job.title,
    description: `${job.specialty.name} request in ${job.city.name}, ${job.city.state.abbrev}. ${job.description.slice(0, 140)}`,
    path: `/care-requests/${job.slug}`,
  });
}

export default async function CareRequestPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ proposed?: string; error?: string }>;
}) {
  const [{ slug }, query, session] = await Promise.all([params, searchParams, auth()]);
  const job = await prisma.careRequest.findUnique({
    where: { slug },
    include: {
      specialty: true,
      city: { include: { state: true } },
      family: { select: { id: true, name: true } },
      proposals: {
        include: { caregiver: { include: { user: true, city: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!job) notFound();
  const isOwner = session?.user?.id === job.family.id;
  const isCarer = session?.user?.role === "CAREGIVER";
  const carer = isCarer
    ? await prisma.caregiverProfile.findFirst({
        where: { userId: session?.user?.id },
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
  const miss = matchCarer ? jobMissReason(job, matchCarer) : null;
  const fit = matchCarer ? jobFitsCarer(job, matchCarer) : false;
  const alreadyProposed = Boolean(carer && job.proposals.some((proposal) => proposal.caregiverId === carer.id));

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_340px]">
      <div>
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Care requests", href: "/care-requests" },
            { name: job.title },
          ]}
        />
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-semibold text-ink">{job.title}</h1>
          {matchCarer ? <Badge tone={fit ? "teal" : "stone"}>{jobMissLabel(miss)}</Badge> : null}
        </div>
        <p className="mt-2 text-stone-600">
          {job.specialty.name} · {job.city.name}, {job.city.state.abbrev} · starts {formatDate(job.startDate)}
        </p>
        {matchCarer ? (
          <p className={`mt-3 text-sm ${fit ? "text-teal-deep" : "text-stone-600"}`}>
            {fit
              ? "This start day is in your city, one of your specialties, and inside your usual weekly hours."
              : `${jobMissLabel(miss)}. You can still send a proposal if the family is flexible.`}
          </p>
        ) : null}
        <p className="mt-4 whitespace-pre-line text-stone-700">{job.description}</p>
        <p className="mt-4 text-sm text-stone-500">
          Posted by {job.family.name} · budget {formatAud(job.budgetCents)}/hr
          {job.hoursEstimate ? ` · about ${job.hoursEstimate} hours` : ""}
        </p>

        {isOwner ? (
          <section className="mt-10">
            <h2 className="text-xl font-semibold">Proposals</h2>
            <ul className="mt-4 space-y-4">
              {job.proposals.map((proposal) => (
                <li key={proposal.id} className="rounded-2xl border border-line bg-card p-4">
                  <p className="font-semibold">
                    <Link href={`/caregiver/${proposal.caregiver.slug}`}>{proposal.caregiver.user.name}</Link>
                    <span className="ml-2 text-sm font-normal text-stone-500">
                      {formatAud(proposal.rateCents)}/hr
                    </span>
                  </p>
                  <p className="mt-2 text-sm text-stone-700">{proposal.coverLetter}</p>
                  {job.status === "open" && proposal.status === "pending" ? (
                    <form action={hireProposalAction} className="mt-3">
                      <input type="hidden" name="proposalId" value={proposal.id} />
                      <button className="rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white" type="submit">
                        Hire and pay into escrow
                      </button>
                    </form>
                  ) : (
                    <p className="mt-2 text-xs uppercase text-stone-500">{proposal.status}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <section className="mt-10">
            <h2 className="text-xl font-semibold">{job.proposals.length} proposals</h2>
            <p className="mt-2 text-sm text-stone-500">Proposal details are visible to the family who posted this request.</p>
          </section>
        )}
      </div>

      <aside className="h-fit rounded-2xl border border-line bg-card p-5">
        {query.proposed ? <p className="mb-3 text-sm text-teal">Proposal sent.</p> : null}
        {isCarer && job.status === "open" ? (
          alreadyProposed ? (
            <p className="text-sm text-teal">You already sent a proposal on this request.</p>
          ) : (
          <form action={createProposalAction} className="space-y-3">
            <input type="hidden" name="slug" value={job.slug} />
            <h2 className="font-semibold">Send a proposal</h2>
            <label className="block text-sm">
              Your hourly rate (AUD)
              <input
                name="rate"
                type="number"
                min={20}
                step={1}
                defaultValue={Math.round(job.budgetCents / 100)}
                required
                className="mt-1 w-full rounded-lg border border-line px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              Cover letter
              <textarea name="coverLetter" required rows={5} className="mt-1 w-full rounded-lg border border-line px-3 py-2" />
            </label>
            <button className="w-full rounded-lg bg-teal py-2 font-medium text-white" type="submit">
              Submit proposal
            </button>
          </form>
          )
        ) : !session ? (
          <p className="text-sm">
            <Link href={`/login?callbackUrl=/care-requests/${job.slug}`} className="text-teal">
              Log in as a carer
            </Link>{" "}
            to send a proposal.
          </p>
        ) : (
          <p className="text-sm text-stone-600">This request is {job.status}.</p>
        )}
      </aside>
    </div>
  );
}
