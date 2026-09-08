import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { Badge } from "@/components/badges";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { InviteButton } from "@/components/invite-button";
import { InviteSentNotice } from "@/components/invite-sent-notice";
import { JobMessageThread } from "@/components/job-message-thread";
import {
  counterProposalAction,
  createProposalAction,
  declineInviteAction,
  hireProposalAction,
  passOnProposalAction,
  respondToCounterAction,
  updateInviteNoteAction,
  withdrawInviteAction,
  withdrawProposalAction,
} from "@/lib/actions";
import { BOOKING_STATUS_LABELS } from "@/lib/constants";
import {
  canCounterProposal,
  canPassOnProposal,
  canRespondToCounter,
  canWithdrawProposal,
  counterSinceLabel,
  hasPendingCounter,
  proposalStatusLabel,
  proposalStatusTone,
  requestStatusLabel,
} from "@/lib/job-hire";
import { expiredJobOwnerNotice, expiredJobRecoveryLinks } from "@/lib/job-expired";
import { isPostedFlash, postedJobNotice } from "@/lib/job-post";
import { isJobAccepting, isJobExpired, requestListingStatus } from "@/lib/job-status";
import {
  INVITE_NOTE_LIMIT,
  INVITE_STATUS,
  canUpdateInviteNote,
  canWithdrawInvite,
  inviteNoteSavedNotice,
  inviteStatusLabel,
  inviteStatusTone,
  inviteWithdrawnNotice,
} from "@/lib/job-invite";
import {
  canSendJobMessage,
  canViewJobThread,
  groupJobMessages,
  isCarerInvolvedInJob,
  markJobThreadRead,
} from "@/lib/job-messages";
import {
  formatJobStart,
  jobBookHref,
  jobDirectoryFilters,
  jobDirectoryHref,
  jobFitsCarer,
  jobMissLabel,
  jobMissReason,
  shortlistHref,
} from "@/lib/job-match";
import { formatAud } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { directoryStats, searchCaregivers } from "@/lib/queries";
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
  searchParams: Promise<{
    proposed?: string;
    updated?: string;
    sent?: string;
    passed?: string;
    countered?: string;
    accepted?: string;
    kept?: string;
    invited?: string;
    note?: string;
    withdrawn?: string;
    posted?: string;
    error?: string;
  }>;
}) {
  const [{ slug }, query, session] = await Promise.all([params, searchParams, auth()]);
  const job = await prisma.careRequest.findUnique({
    where: { slug },
    include: {
      specialty: true,
      city: { include: { state: true } },
      family: { select: { id: true, name: true } },
      bookings: {
        select: {
          id: true,
          startAt: true,
          status: true,
          caregiverId: true,
          caregiver: { select: { user: { select: { name: true } } } },
        },
        orderBy: { startAt: "asc" },
      },
      jobMessages: {
        include: { sender: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
      proposals: {
        include: {
          caregiver: {
            include: {
              user: true,
              city: true,
              specialties: { select: { specialtyId: true } },
              weeklyWindows: { select: { weekday: true, startMin: true, endMin: true } },
              blockedDates: { select: { dateKey: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      invites: {
        include: {
          caregiver: { include: { user: true } },
        },
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
  const ownProposal = carer ? job.proposals.find((proposal) => proposal.caregiverId === carer.id) : null;
  const alreadyProposed = Boolean(ownProposal);
  const ownInvite = carer ? job.invites.find((invite) => invite.caregiverId === carer.id) : null;
  const directoryFilters = jobDirectoryFilters(job);
  const accepting = isJobAccepting(job);
  const expired = isJobExpired(job);
  const listingStatus = requestListingStatus(job);
  const matchHref = accepting ? jobDirectoryHref(job) : null;
  const [matchStats, matchCarers, shortlistCount] =
    isOwner && matchHref
      ? await Promise.all([
          directoryStats(directoryFilters),
          searchCaregivers(directoryFilters, 3),
          prisma.shortlist.count({ where: { familyId: job.family.id } }),
        ])
      : [null, [], 0];
  const attachedBookings = job.bookings.filter((booking) => isOwner || booking.caregiverId === carer?.id);
  const hiredCaregiverId = job.status === "hired" ? attachedBookings[0]?.caregiverId ?? null : null;
  const messagesByCarer = groupJobMessages(job.jobMessages);
  const viewerId = session?.user?.id ?? "";
  const newMessageIds = new Set(
    job.jobMessages
      .filter((message) => message.sender.id !== viewerId && !message.readAt)
      .map((message) => message.id),
  );
  if (viewerId && newMessageIds.size) {
    if (isOwner) {
      await Promise.all(
        [...messagesByCarer.keys()].map((caregiverId) => markJobThreadRead(job.id, caregiverId, viewerId)),
      );
    } else if (carer) {
      await markJobThreadRead(job.id, carer.id, viewerId);
    }
  }
  const carerInvolved = Boolean(
    carer &&
      isCarerInvolvedInJob({
        caregiverId: carer.id,
        invited: Boolean(ownInvite),
        proposed: alreadyProposed,
        hiredCaregiverId,
      }),
  );
  const carerCanViewThread = canViewJobThread({
    job,
    viewerId,
    viewerCaregiverId: carer?.id,
    threadCaregiverId: carer?.id ?? "",
    involved: carerInvolved,
  });

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
          <Badge tone={expired ? "stone" : job.status === "hired" ? "teal" : "clay"}>
            {requestStatusLabel(listingStatus)}
          </Badge>
          {matchCarer ? <Badge tone={fit ? "teal" : "stone"}>{jobMissLabel(miss)}</Badge> : null}
        </div>
        <p className="mt-2 text-stone-600">
          {job.specialty.name} · {job.city.name}, {job.city.state.abbrev} · starts {formatJobStart(job.startDate)}
        </p>
        {expired ? (
          <p className="mt-3 text-sm text-stone-600">
            This sit has already started, so CareProof closed proposals and invites.
          </p>
        ) : matchCarer ? (
          <p className={`mt-3 text-sm ${fit ? "text-teal-deep" : "text-stone-600"}`}>
            {fit
              ? "This start time is in your city, one of your specialties, and inside your usual weekly hours."
              : `${jobMissLabel(miss)}. You can still send a proposal if the family is flexible.`}
          </p>
        ) : null}
        {isOwner && isPostedFlash(query.posted) ? (
          <p className="mt-4 text-sm text-teal">{postedJobNotice()}</p>
        ) : null}
        {isOwner && expired ? (
          <section className="mt-6 rounded-2xl border border-line bg-card p-5">
            <h2 className="text-lg font-semibold">Still need cover?</h2>
            <p className="mt-2 text-sm text-stone-600">{expiredJobOwnerNotice()}</p>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {expiredJobRecoveryLinks(job).map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="font-medium text-teal hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <p className="mt-4 whitespace-pre-line text-stone-700">{job.description}</p>
        <p className="mt-4 text-sm text-stone-500">
          Posted by {job.family.name} · budget {formatAud(job.budgetCents)}/hr
          {job.hoursEstimate ? ` · about ${job.hoursEstimate} hours` : ""}
        </p>

        {isOwner && matchStats && matchHref ? (
          <section className="mt-10 rounded-2xl border border-line bg-card p-5">
            <h2 className="text-xl font-semibold">Carers free at this time</h2>
            <p className="mt-2 text-sm text-stone-600">
              {matchStats.count
                ? `${matchStats.count} verified ${matchStats.count === 1 ? "carer is" : "carers are"} free in ${job.city.name} at ${formatJobStart(job.startDate)}. Book one to close this request, or invite them to send a proposal.`
                : `No listed carers are free in ${job.city.name} at ${formatJobStart(job.startDate)}. Proposals below may still come in.`}
            </p>
            {matchCarers.length ? (
              <ul className="mt-3 space-y-2 text-sm">
                {matchCarers.map((match) => {
                  const invited = job.invites.find((invite) => invite.caregiverId === match.id);
                  const proposed = job.proposals.some((proposal) => proposal.caregiverId === match.id);
                  return (
                  <li key={match.id} className="flex flex-wrap items-center justify-between gap-2">
                    <Link href={`/caregiver/${match.slug}?job=${job.slug}`} className="font-medium text-teal hover:underline">
                      {match.user.name}
                    </Link>
                    <span className="flex flex-wrap items-center gap-3 text-stone-500">
                      {formatAud(match.hourlyRateCents)}/hr
                      <Link href={jobBookHref(match.slug, job.startDate, job.slug)} className="font-medium text-teal hover:underline">
                        Book
                      </Link>
                      <InviteButton
                        caregiverId={match.id}
                        jobSlug={job.slug}
                        job={job}
                        familyId={session?.user?.id}
                        existing={invited ?? null}
                        proposed={proposed}
                        next={`/care-requests/${job.slug}`}
                        signedIn
                        compact
                      />
                    </span>
                  </li>
                  );
                })}
              </ul>
            ) : null}
            <Link
              href={
                matchStats.count
                  ? matchHref
                  : `/caregivers/${directoryFilters.specialty}/${directoryFilters.state}/${directoryFilters.city}?availableOn=${directoryFilters.availableOn}`
              }
              className="mt-3 inline-block text-sm font-medium text-teal"
            >
              {matchStats.count ? "See every match — booking still closes this request" : "Search any time that day"}
            </Link>
            {shortlistCount > 0 ? (
              <p className="mt-3 text-sm text-stone-600">
                <Link href={shortlistHref(job.slug)} className="font-medium text-teal hover:underline">
                  {shortlistCount === 1 ? "1 carer on your shortlist" : `${shortlistCount} carers on your shortlist`}
                </Link>
                {" — compare rates and invite without leaving this request."}
              </p>
            ) : null}
          </section>
        ) : null}

        {attachedBookings.length ? (
          <section className="mt-10 rounded-2xl border border-line bg-card p-5">
            <h2 className="text-xl font-semibold">Escrow booking</h2>
            <p className="mt-2 text-sm text-stone-600">
              This request is attached to {attachedBookings.length === 1 ? "a sit" : "sits"} in escrow.
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {attachedBookings.map((booking) => (
                <li key={booking.id} className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                    {booking.caregiver.user.name} · {formatJobStart(booking.startAt)} ·{" "}
                    {BOOKING_STATUS_LABELS[booking.status] ?? booking.status}
                  </span>
                  <Link href={`/dashboard/bookings/${booking.id}`} className="font-medium text-teal hover:underline">
                    Open booking
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {isOwner && job.invites.length ? (
          <section className="mt-10">
            <h2 className="text-xl font-semibold">Invited carers</h2>
            <ul className="mt-4 space-y-3">
              {job.invites.map((invite) => (
                <li key={invite.id} className="rounded-2xl border border-line bg-card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <Link href={`/caregiver/${invite.caregiver.slug}?job=${job.slug}`} className="font-semibold text-ink hover:text-teal">
                        {invite.caregiver.user.name}
                      </Link>
                      <p className="mt-1 text-sm text-stone-500">Asked to send a proposal on this request.</p>
                      {invite.note ? <p className="mt-2 text-sm text-stone-700">{invite.note}</p> : null}
                      {invite.status === INVITE_STATUS.DECLINED && invite.reply ? (
                        <p className="mt-2 text-sm text-stone-600">They declined: “{invite.reply}”</p>
                      ) : null}
                    </div>
                    <span className="flex flex-wrap items-center gap-2">
                      <Badge tone={inviteStatusTone(invite.status)}>{inviteStatusLabel(invite.status)}</Badge>
                      {canWithdrawInvite(invite, job, session?.user?.id ?? "") ? (
                        <form action={withdrawInviteAction}>
                          <input type="hidden" name="inviteId" value={invite.id} />
                          <input type="hidden" name="next" value={`/care-requests/${job.slug}`} />
                          <button className="text-sm text-stone-500 hover:text-ink" type="submit">
                            Withdraw invite
                          </button>
                        </form>
                      ) : null}
                    </span>
                  </div>
                  {canUpdateInviteNote(invite, job, session?.user?.id ?? "") ? (
                    <form action={updateInviteNoteAction} className="mt-3 space-y-2">
                      <input type="hidden" name="inviteId" value={invite.id} />
                      <input type="hidden" name="next" value={`/care-requests/${job.slug}`} />
                      <label className="block text-xs text-stone-500">
                        Invite note
                        <textarea
                          name="note"
                          rows={2}
                          maxLength={INVITE_NOTE_LIMIT}
                          defaultValue={invite.note ?? ""}
                          placeholder="Why this carer, or what they should know."
                          className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm text-ink"
                        />
                      </label>
                      <button className="text-sm font-medium text-teal hover:underline" type="submit">
                        Save note
                      </button>
                    </form>
                  ) : null}
                  <JobMessageThread
                    slug={job.slug}
                    caregiverId={invite.caregiverId}
                    counterpartName={invite.caregiver.user.name}
                    messages={messagesByCarer.get(invite.caregiverId) ?? []}
                    currentUserId={viewerId}
                    canSend={canSendJobMessage({
                      job,
                      viewerId,
                      threadCaregiverId: invite.caregiverId,
                      involved: true,
                    })}
                    newIds={newMessageIds}
                    compact
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {isOwner ? (
          <section className="mt-10">
            <h2 className="text-xl font-semibold">Proposals</h2>
            <ul className="mt-4 space-y-4">
              {job.proposals.map((proposal) => {
                const proposalMiss = jobMissReason(job, {
                  cityId: proposal.caregiver.cityId,
                  specialtyIds: proposal.caregiver.specialties.map((item) => item.specialtyId),
                  windows: proposal.caregiver.weeklyWindows,
                  blockedKeys: proposal.caregiver.blockedDates.map((row) => row.dateKey),
                });
                return (
                <li key={proposal.id} className="rounded-2xl border border-line bg-card p-4">
                  <p className="font-semibold">
                    <Link href={`/caregiver/${proposal.caregiver.slug}`}>{proposal.caregiver.user.name}</Link>
                    <span className="ml-2 text-sm font-normal text-stone-500">
                      {formatAud(proposal.rateCents)}/hr
                    </span>
                    <span className="ml-2 align-middle">
                      <Badge tone={proposalMiss ? "stone" : "teal"}>{jobMissLabel(proposalMiss, "family")}</Badge>
                    </span>
                  </p>
                  <p className="mt-2 text-sm text-stone-700">{proposal.coverLetter}</p>
                  {!job.invites.some((invite) => invite.caregiverId === proposal.caregiverId) ? (
                    <JobMessageThread
                      slug={job.slug}
                      caregiverId={proposal.caregiverId}
                      counterpartName={proposal.caregiver.user.name}
                      messages={messagesByCarer.get(proposal.caregiverId) ?? []}
                      currentUserId={viewerId}
                      canSend={canSendJobMessage({
                        job,
                        viewerId,
                        threadCaregiverId: proposal.caregiverId,
                        involved: true,
                      })}
                      newIds={newMessageIds}
                      compact
                    />
                  ) : null}
                  {proposal.familyNote ? (
                    <p className="mt-2 text-sm text-stone-600">You wrote: “{proposal.familyNote}”</p>
                  ) : null}
                  {hasPendingCounter(proposal) ? (
                    <p className="mt-2 text-sm text-teal-deep">
                      Suggested {formatAud(proposal.counterRateCents ?? 0)}/hr
                      {proposal.counterNote ? ` — “${proposal.counterNote}”` : ""}. Waiting for their reply.
                      {counterSinceLabel(proposal.counteredAt)
                        ? ` ${counterSinceLabel(proposal.counteredAt)}`
                        : ""}
                    </p>
                  ) : null}
                  {canPassOnProposal(proposal, job, session?.user?.id ?? "") ? (
                    <div className="mt-3 space-y-3">
                      <div className="flex flex-wrap items-end gap-4">
                        <form action={hireProposalAction} className="min-w-[16rem] space-y-2">
                          <input type="hidden" name="proposalId" value={proposal.id} />
                          <label className="block text-xs text-stone-500">
                            Welcome note for the carer
                            <textarea
                              name="welcomeNote"
                              rows={2}
                              maxLength={INVITE_NOTE_LIMIT}
                              placeholder="Gate, parking, or what the first morning should look like."
                              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm text-ink"
                            />
                          </label>
                          <button className="rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white" type="submit">
                            Hire and pay into escrow
                          </button>
                        </form>
                        <form action={passOnProposalAction} className="min-w-[16rem] flex-1 space-y-2">
                          <input type="hidden" name="proposalId" value={proposal.id} />
                          <label className="block text-xs text-stone-500">
                            Optional note if you pass
                            <textarea
                              name="familyNote"
                              rows={2}
                              maxLength={INVITE_NOTE_LIMIT}
                              placeholder="Rate, hours, or why this is not the right fit."
                              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm text-ink"
                            />
                          </label>
                          <button className="text-sm text-stone-500 hover:text-ink" type="submit">
                            Pass on this proposal
                          </button>
                        </form>
                      </div>
                      {canCounterProposal(proposal, job, session?.user?.id ?? "") ? (
                        <form action={counterProposalAction} className="rounded-xl border border-line p-3 space-y-2">
                          <input type="hidden" name="proposalId" value={proposal.id} />
                          <p className="text-sm font-medium text-ink">
                            {hasPendingCounter(proposal) ? "Update suggested rate" : "Suggest a different rate"}
                          </p>
                          <label className="block text-xs text-stone-500">
                            Hourly rate (AUD)
                            <input
                              name="counterRate"
                              type="number"
                              min={20}
                              step={1}
                              required
                              defaultValue={
                                proposal.counterRateCents
                                  ? Math.round(proposal.counterRateCents / 100)
                                  : Math.round(proposal.rateCents / 100)
                              }
                              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm text-ink"
                            />
                          </label>
                          <label className="block text-xs text-stone-500">
                            Optional note
                            <textarea
                              name="counterNote"
                              rows={2}
                              maxLength={INVITE_NOTE_LIMIT}
                              defaultValue={proposal.counterNote ?? ""}
                              placeholder="Why this rate, or what the sit still needs."
                              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm text-ink"
                            />
                          </label>
                          <button className="text-sm font-medium text-teal hover:underline" type="submit">
                            Send suggested rate
                          </button>
                        </form>
                      ) : null}
                    </div>
                  ) : (
                    <p className="mt-2">
                      <Badge tone={proposalStatusTone(proposal.status)}>
                        {proposalStatusLabel(proposal.status, job.status)}
                      </Badge>
                    </p>
                  )}
                </li>
                );
              })}
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
        {isOwner && isPostedFlash(query.posted) ? (
          <p className="mb-3 text-sm text-teal">{postedJobNotice()}</p>
        ) : null}
        {query.invited ? <InviteSentNotice /> : null}
        {query.note ? <p className="mb-3 text-sm text-teal">{inviteNoteSavedNotice()}</p> : null}
        {query.withdrawn ? <p className="mb-3 text-sm text-teal">{inviteWithdrawnNotice()}</p> : null}
        {query.proposed ? <p className="mb-3 text-sm text-teal">Proposal sent.</p> : null}
        {query.updated ? <p className="mb-3 text-sm text-teal">Proposal updated.</p> : null}
        {query.sent ? <p className="mb-3 text-sm text-teal">Message sent.</p> : null}
        {query.passed ? <p className="mb-3 text-sm text-teal">Proposal passed on. The request stays open.</p> : null}
        {query.countered ? <p className="mb-3 text-sm text-teal">Suggested rate sent.</p> : null}
        {query.accepted ? <p className="mb-3 text-sm text-teal">You accepted the suggested rate.</p> : null}
        {query.kept ? <p className="mb-3 text-sm text-teal">You kept your original rate.</p> : null}
        {query.error === "message" ? <p className="mb-3 text-sm text-clay">Write a short message before sending.</p> : null}
        {query.error === "counter" ? <p className="mb-3 text-sm text-clay">Enter an hourly rate of at least $20.</p> : null}
        {isCarer && ownInvite?.status === INVITE_STATUS.PENDING && accepting ? (
          <p className="mb-3 rounded-xl bg-sage px-3 py-2 text-sm text-teal-deep">
            {job.family.name} invited you to apply
            {ownInvite.note ? `: “${ownInvite.note}”` : ""}. Send a proposal below or decline.
          </p>
        ) : null}
        {isCarer && accepting && (!alreadyProposed || canWithdrawProposal(ownProposal ?? null, carer!.id, job)) ? (
          <form action={createProposalAction} className="space-y-3">
            <input type="hidden" name="slug" value={job.slug} />
            <h2 className="font-semibold">{alreadyProposed ? "Update your proposal" : "Send a proposal"}</h2>
            <label className="block text-sm">
              Your hourly rate (AUD)
              <input
                name="rate"
                type="number"
                min={20}
                step={1}
                defaultValue={Math.round((ownProposal?.rateCents ?? job.budgetCents) / 100)}
                required
                className="mt-1 w-full rounded-lg border border-line px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              Cover letter
              <textarea
                name="coverLetter"
                required
                rows={5}
                defaultValue={ownProposal?.coverLetter ?? ""}
                className="mt-1 w-full rounded-lg border border-line px-3 py-2"
              />
            </label>
            <button className="w-full rounded-lg bg-teal py-2 font-medium text-white" type="submit">
              {alreadyProposed
                ? "Save proposal"
                : ownInvite?.status === INVITE_STATUS.PENDING
                  ? "Apply to this invite"
                  : "Submit proposal"}
            </button>
          </form>
        ) : isCarer && accepting && alreadyProposed ? (
          <p className="text-sm text-teal">You already sent a proposal on this request.</p>
        ) : null}
        {isCarer && ownProposal && canWithdrawProposal(ownProposal, carer!.id, job) ? (
          <form action={withdrawProposalAction} className="mt-3">
            <input type="hidden" name="proposalId" value={ownProposal.id} />
            <button className="text-sm text-stone-500 hover:text-ink" type="submit">
              Withdraw proposal
            </button>
          </form>
        ) : null}
        {isCarer && ownInvite?.status === INVITE_STATUS.PENDING && accepting && !alreadyProposed ? (
          <form action={declineInviteAction} className="mt-3 space-y-2">
            <input type="hidden" name="inviteId" value={ownInvite.id} />
            <label className="block text-xs text-stone-500">
              Optional reason
              <textarea
                name="reply"
                rows={2}
                maxLength={INVITE_NOTE_LIMIT}
                placeholder="Hours, suburb, or why this sit is not a fit."
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm text-ink"
              />
            </label>
            <button className="w-full text-sm text-stone-500 hover:text-ink" type="submit">
              Decline this invite
            </button>
          </form>
        ) : null}
        {isCarer && ownInvite?.status === INVITE_STATUS.DECLINED ? (
          <p className="mt-3 text-sm text-stone-600">
            You declined this invite
            {ownInvite.reply ? `: “${ownInvite.reply}”` : "."}
          </p>
        ) : null}
        {isCarer && ownProposal && canRespondToCounter(ownProposal, carer!.id, job) ? (
          <div className="mt-3 rounded-xl bg-sage px-3 py-3 text-sm text-teal-deep">
            <p>
              {job.family.name} suggested {formatAud(ownProposal.counterRateCents ?? 0)}/hr
              {ownProposal.counterNote ? `: “${ownProposal.counterNote}”` : "."}
              {counterSinceLabel(ownProposal.counteredAt) ? ` ${counterSinceLabel(ownProposal.counteredAt)}` : ""}
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              <form action={respondToCounterAction}>
                <input type="hidden" name="proposalId" value={ownProposal.id} />
                <input type="hidden" name="accept" value="1" />
                <button className="font-medium text-teal hover:underline" type="submit">
                  Accept {formatAud(ownProposal.counterRateCents ?? 0)}/hr
                </button>
              </form>
              <form action={respondToCounterAction}>
                <input type="hidden" name="proposalId" value={ownProposal.id} />
                <input type="hidden" name="accept" value="0" />
                <button className="text-stone-500 hover:text-ink" type="submit">
                  Keep {formatAud(ownProposal.rateCents)}/hr
                </button>
              </form>
            </div>
          </div>
        ) : null}
        {isCarer && ownProposal?.status === "declined" && accepting ? (
          <p className="mt-3 text-sm text-stone-600">
            This family passed on your proposal
            {ownProposal.familyNote ? `: “${ownProposal.familyNote}”` : "."}
          </p>
        ) : null}
        {carerCanViewThread && carer ? (
          <div className="mt-5 border-t border-line pt-4">
            <h2 className="font-semibold">Message {job.family.name}</h2>
            <JobMessageThread
              slug={job.slug}
              caregiverId={carer.id}
              counterpartName={job.family.name}
              messages={messagesByCarer.get(carer.id) ?? []}
              currentUserId={viewerId}
              canSend={canSendJobMessage({
                job,
                viewerId,
                viewerCaregiverId: carer.id,
                threadCaregiverId: carer.id,
                involved: carerInvolved,
              })}
              newIds={newMessageIds}
            />
          </div>
        ) : null}
        {isCarer && accepting ? null : !session && !expired ? (
          <p className="text-sm">
            <Link href={`/login?callbackUrl=/care-requests/${job.slug}`} className="text-teal">
              Log in as a carer
            </Link>{" "}
            to send a proposal.
          </p>
        ) : expired && isOwner ? (
          <div className="text-sm text-stone-600">
            <p>This request is expired.</p>
            <ul className="mt-2 space-y-1">
              {expiredJobRecoveryLinks(job).map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="font-medium text-teal hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : expired && !isOwner ? (
          <p className="text-sm text-stone-600">This request expired when the sit started.</p>
        ) : (
          <p className="text-sm text-stone-600">
            {ownProposal?.status === "declined"
              ? accepting
                ? `This family passed on your proposal${ownProposal.familyNote ? `: “${ownProposal.familyNote}”` : "."}`
                : "This family hired someone else."
              : `This request is ${requestStatusLabel(listingStatus).toLowerCase()}.`}
            {attachedBookings[0] ? (
              <>
                {" "}
                <Link href={`/dashboard/bookings/${attachedBookings[0].id}`} className="font-medium text-teal hover:underline">
                  Open the escrow booking
                </Link>
              </>
            ) : null}
          </p>
        )}
      </aside>
    </div>
  );
}
