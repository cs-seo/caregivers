import Link from "next/link";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Badge } from "@/components/badges";
import { BOOKING_STATUS } from "@/lib/constants";
import { credentialWatchlist, watchLabel } from "@/lib/credentials";
import {
  BOOKING_STATUS_SHORT,
  groupDashboardBookings,
  isClosedStatus,
  type DashboardBookingGroup,
} from "@/lib/dashboard-groups";
import { formatDateTime, plural, snippet } from "@/lib/format";
import { canWithdrawProposal, notHiredBanner, proposalStatusLabel, requestStatusLabel } from "@/lib/job-hire";
import { inviteStatusLabel } from "@/lib/job-invite";
import { unreadJobCountsByRequest } from "@/lib/job-messages";
import { formatJobStart, jobDirectoryFilters, jobDirectoryHref, matchingJobs } from "@/lib/job-match";
import { buildRoster } from "@/lib/roster";
import { formatAud } from "@/lib/money";
import {
  declineInviteAction,
  deleteSavedSearchAction,
  applyHouseholdHandoverAction,
  withdrawProposalAction,
} from "@/lib/actions";
import { directoryStats } from "@/lib/queries";
import { filtersFromSearchHref, jobsFitDeltaLabel, savedSearchDelta, savedSearchDeltaLabel } from "@/lib/saved-search";
import { comingUpBookings, comingUpKind } from "@/lib/coming-up";
import { canFillFromHousehold, hasHandover } from "@/lib/handover";
import { unreadCountsByBooking } from "@/lib/messages";
import { australianFinancialYear, statementTotals, toStatementRows } from "@/lib/statement";
import { profileChecklist } from "@/lib/profile";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Dashboard",
  description: "Manage CareProof bookings and escrow.",
  path: "/dashboard",
  noIndex: true,
});

function BookingList({
  title,
  groups,
  isFamily,
  empty,
}: {
  title: string;
  groups: DashboardBookingGroup[];
  isFamily: boolean;
  empty: ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold">{title}</h2>
      <ul className="mt-4 space-y-3">
        {groups.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-line bg-card p-5 text-sm text-stone-600">{empty}</li>
        ) : (
          groups.map((group) => (
            <li key={group.key} className="rounded-2xl border border-line bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Link href={group.href} className="font-semibold hover:text-teal">
                    {group.specialtyName} with {isFamily ? group.caregiverName : group.familyName}
                  </Link>
                  <p className="text-sm text-stone-500">
                    {group.seriesLabel ? `Next sit ${formatDateTime(group.nextAt)}` : formatDateTime(group.nextAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.seriesLabel ? <Badge tone="clay">{group.seriesLabel}</Badge> : null}
                  {group.unreadCount > 0 ? (
                    <Badge tone="clay">{plural(group.unreadCount, "new message")}</Badge>
                  ) : null}
                  <Badge>{group.statusLabel}</Badge>
                </div>
              </div>
              <p className="mt-2 text-sm text-stone-600">
                {formatAud(isFamily ? group.liveCents.total : group.liveCents.payout)}
                {isFamily ? " family total" : " carer payout"}
                {group.weeks.length === 1 && group.weeks[0].payment
                  ? ` · payment ${group.weeks[0].payment.status}`
                  : group.weeks.length > 1
                    ? ` · ${plural(group.weeks.filter((week) => !isClosedStatus(week.status)).length, "live week")}`
                    : ""}
              </p>
              {group.weeks.length > 1 ? (
                <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-stone-500">
                  {group.weeks.map((week) => (
                    <Link key={week.id} href={`/dashboard/bookings/${week.id}`} className="hover:text-teal">
                      W{week.recurringIndex} {BOOKING_STATUS_SHORT[week.status] ?? week.status}
                    </Link>
                  ))}
                  <a href={`${group.href}/ics?series=1`} className="text-teal hover:underline">
                    Calendar
                  </a>
                </p>
              ) : null}
              {group.messageCount > 0 ? (
                <p className={`mt-2 text-sm ${group.unreadCount ? "font-medium text-teal" : "text-stone-500"}`}>
                  {group.unreadCount
                    ? `${plural(group.unreadCount, "new message")}`
                    : plural(group.messageCount, "message")}
                  {group.latestMessage ? ` · “${snippet(group.latestMessage)}”` : ""}
                </p>
              ) : (
                <p className="mt-2 text-sm text-stone-400">No messages yet</p>
              )}
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ cancelled?: string }>;
}) {
  const user = await requireUser();
  if (!user) redirect("/login?callbackUrl=/dashboard");
  const query = await searchParams;

  const isFamily = user.role === "FAMILY";
  const bookings = await prisma.booking.findMany({
    where: isFamily ? { familyId: user.id } : { caregiver: { userId: user.id } },
    include: {
      caregiver: { include: { user: true } },
      family: { select: { name: true } },
      specialty: true,
      payment: true,
      messages: { orderBy: { createdAt: "desc" }, take: 1, select: { body: true } },
      _count: { select: { messages: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  const unreadByBooking = await unreadCountsByBooking(user.id);
  const unreadJobByRequest = await unreadJobCountsByRequest(user.id);
  const unreadBookingTotal = [...unreadByBooking.values()].reduce((sum, count) => sum + count, 0);
  const unreadJobTotal = [...unreadJobByRequest.values()].reduce((sum, count) => sum + count, 0);
  const unrepliedReviews =
    !isFamily && user.caregiverProfile
      ? await prisma.review.findMany({
          where: { caregiverId: user.caregiverProfile.id, reply: null },
          include: {
            author: { select: { name: true } },
            booking: { select: { id: true, startAt: true, specialty: { select: { name: true } } } },
          },
          orderBy: { createdAt: "desc" },
        })
      : [];
  const groupedSource = bookings.map((booking) => ({
    ...booking,
    unreadCount: unreadByBooking.get(booking.id) ?? 0,
  }));

  const familyJobs = isFamily
    ? await prisma.careRequest.findMany({
        where: { familyId: user.id },
        include: {
          specialty: true,
          city: { include: { state: true } },
          bookings: { select: { id: true }, orderBy: { startAt: "asc" }, take: 1 },
          _count: { select: { invites: { where: { status: "pending" } } } },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];
  const familyJobMatchById = new Map(
    (
      await Promise.all(
        familyJobs
          .filter((job) => job.status === "open")
          .map(async (job) => {
            const stats = await directoryStats(jobDirectoryFilters(job));
            return [job.id, { count: stats.count, href: jobDirectoryHref(job) }] as const;
          }),
      )
    ),
  );
  const carerProposals = !isFamily
    ? await prisma.proposal.findMany({
        where: { caregiverId: user.caregiverProfile?.id ?? "__none__" },
        include: {
          careRequest: {
            include: {
              family: { select: { name: true } },
              bookings: {
                where: { caregiverId: user.caregiverProfile?.id ?? "__none__" },
                select: { id: true },
                take: 1,
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const carerProfile =
    !isFamily && user.caregiverProfile
      ? await prisma.caregiverProfile.findUnique({
          where: { id: user.caregiverProfile.id },
          include: { specialties: true, credentials: true, workHistory: true, weeklyWindows: true },
        })
      : null;
  const checklist = carerProfile ? profileChecklist(carerProfile) : null;
  const expiring = carerProfile ? credentialWatchlist(carerProfile.credentials) : [];
  const shortlistCount = isFamily
    ? await prisma.shortlist.count({ where: { familyId: user.id } })
    : 0;
  const savedSearches = isFamily
    ? await prisma.savedSearch.findMany({
        where: { familyId: user.id },
        orderBy: { createdAt: "desc" },
      })
    : [];
  const savedSearchMatches = await Promise.all(
    savedSearches.map(async (search) => {
      const filters = filtersFromSearchHref(search.href);
      const current = filters ? (await directoryStats(filters)).count : 0;
      return { id: search.id, ...savedSearchDelta(current, search.lastSeenCount, search.seenAt) };
    }),
  );
  const savedSearchMatchById = new Map(savedSearchMatches.map((row) => [row.id, row]));
  const newSearchHits = savedSearchMatches.filter((row) => row.newCount > 0).length;

  const { action: needsAction, active, history } = groupDashboardBookings(groupedSource);
  const comingUp = comingUpBookings(bookings).slice(0, 4);
  const comingUpLabel = { now: "Happening now", soon: "Starts soon", week: "This week" } as const;
  const escrowStatuses = new Set<string>([
    BOOKING_STATUS.ESCROW_HELD,
    BOOKING_STATUS.IN_PROGRESS,
    BOOKING_STATUS.PENDING_RELEASE,
  ]);
  const blockedKeys =
    !isFamily && user.caregiverProfile
      ? (
          await prisma.caregiverBlockedDate.findMany({
            where: { caregiverId: user.caregiverProfile.id },
            select: { dateKey: true },
          })
        ).map((row) => row.dateKey)
      : [];
  const roster = buildRoster(bookings, 14, new Date(), blockedKeys, carerProfile?.weeklyWindows ?? []);
  const openJobs =
    !isFamily && user.caregiverProfile
      ? await prisma.careRequest.findMany({
          where: { status: "open" },
          include: { specialty: true, city: { include: { state: true } } },
          orderBy: { startDate: "asc" },
        })
      : [];
  const matchCarer = carerProfile
    ? {
        cityId: carerProfile.cityId,
        specialtyIds: carerProfile.specialties.map((item) => item.specialtyId),
        windows: carerProfile.weeklyWindows,
        blockedKeys,
      }
    : null;
  const fittingJobs = matchCarer ? matchingJobs(openJobs, matchCarer) : [];
  const fittingDelta = carerProfile
    ? savedSearchDelta(fittingJobs.length, carerProfile.jobsLastSeenCount, carerProfile.jobsSeenAt)
    : null;
  const carerInvites =
    !isFamily && user.caregiverProfile
      ? await prisma.careRequestInvite.findMany({
          where: {
            caregiverId: user.caregiverProfile.id,
            status: "pending",
            request: { status: "open" },
          },
          include: {
            request: {
              select: {
                id: true,
                slug: true,
                title: true,
                startDate: true,
                family: { select: { name: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        })
      : [];
  const proposedJobIds = new Set(carerProposals.map((proposal) => proposal.careRequestId));
  const notHiredJobs = carerProposals
    .filter((proposal) => proposal.status === "declined")
    .map((proposal) => ({
      title: proposal.careRequest.title,
      familyName: proposal.careRequest.family.name,
      slug: proposal.careRequest.slug,
    }));
  const notHiredCopy = notHiredBanner(notHiredJobs);
  const heldCents = bookings
    .filter((booking) => escrowStatuses.has(booking.status))
    .reduce((sum, booking) => sum + (isFamily ? booking.totalCents : booking.subtotalCents), 0);
  const settledCents = bookings
    .filter((booking) => booking.status === BOOKING_STATUS.RELEASED)
    .reduce((sum, booking) => sum + (isFamily ? booking.totalCents : booking.subtotalCents), 0);
  const fy = australianFinancialYear();
  const fyTotals = statementTotals(toStatementRows(bookings));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-ink">{isFamily ? "Family dashboard" : "Carer dashboard"}</h1>
          <p className="mt-2 text-stone-600">Signed in as {user.name}.</p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          {isFamily ? (
            <>
              <Link href="/dashboard/shortlist" className="rounded-full border border-teal px-4 py-2 font-medium text-teal no-underline">
                Shortlist
              </Link>
              <Link href="/dashboard/household" className="rounded-full border border-teal px-4 py-2 font-medium text-teal no-underline">
                Household
              </Link>
              <Link href="/post-a-job" className="rounded-full bg-teal px-4 py-2 font-medium text-white no-underline">
                Post a care request
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard/profile" className="rounded-full bg-teal px-4 py-2 font-medium text-white no-underline">
                Edit profile
              </Link>
              {user.caregiverProfile ? (
                <Link href={`/caregiver/${user.caregiverProfile.slug}`} className="rounded-full border border-teal px-4 py-2 font-medium text-teal no-underline">
                  View public profile
                </Link>
              ) : null}
            </>
          )}
        </div>
      </div>
      {query.cancelled ? (
        <p className="mt-4 rounded-xl bg-sage p-3 text-sm">Unpaid weeks were cancelled. Funded escrow holds are unchanged.</p>
      ) : null}
      {unreadBookingTotal > 0 ? (
        <p className="mt-4 rounded-xl bg-orange-50 p-3 text-sm text-clay">
          {plural(unreadBookingTotal, "new message")} on your bookings. Open the highlighted sit to read and mark it seen.
        </p>
      ) : null}
      {unreadJobTotal > 0 ? (
        <p className="mt-4 rounded-xl bg-orange-50 p-3 text-sm text-clay">
          {plural(unreadJobTotal, "new message")} on a care request. Open the job to read and mark it seen.
        </p>
      ) : null}
      {unrepliedReviews.length > 0 ? (
        <p className="mt-4 rounded-xl bg-orange-50 p-3 text-sm text-clay">
          {plural(unrepliedReviews.length, "review")} waiting for a public reply.
        </p>
      ) : null}
      {fittingDelta && (fittingDelta.unseen || fittingDelta.newCount > 0) && fittingDelta.current > 0 ? (
        <p className="mt-4 rounded-xl bg-sage p-3 text-sm text-teal-deep">
          {jobsFitDeltaLabel(fittingDelta)}.{" "}
          <Link href="/care-requests?fit=1" className="font-medium text-teal">
            Open jobs that fit you
          </Link>{" "}
          to mark them seen.
        </p>
      ) : null}
      {carerInvites.length ? (
        <p className="mt-4 rounded-xl bg-sage p-3 text-sm text-teal-deep">
          {carerInvites.length === 1
            ? `${carerInvites[0].request.family.name} invited you to ${carerInvites[0].request.title}.`
            : `${carerInvites.length} families invited you to apply.`}{" "}
          <Link href={`/care-requests/${carerInvites[0].request.slug}`} className="font-medium text-teal">
            {carerInvites.length === 1 ? "Open the request" : "Open the first invite"}
          </Link>
        </p>
      ) : null}
      {notHiredCopy && notHiredJobs[0] ? (
        <p className="mt-4 rounded-xl bg-orange-50 p-3 text-sm text-clay">
          {notHiredCopy}{" "}
          <Link href={`/care-requests/${notHiredJobs[0].slug}`} className="font-medium text-teal">
            {notHiredJobs.length === 1 ? "Open the request" : "Open the first request"}
          </Link>
        </p>
      ) : null}

      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            {isFamily ? "In escrow" : "Held for you"}
          </p>
          <p className="mt-1 text-2xl font-semibold text-teal">{formatAud(heldCents)}</p>
          <p className="mt-1 text-sm text-stone-500">
            {isFamily ? "Family total still held until care is released." : "Payout waiting on release after care."}
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            {isFamily ? "Paid and released" : "Paid out"}
          </p>
          <p className="mt-1 text-2xl font-semibold text-ink">{formatAud(settledCents)}</p>
          <p className="mt-1 text-sm text-stone-500">
            {isFamily ? "Released bookings, ready for a GST tax invoice." : "Released to you after completed care."}
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">FY {fy.label}</p>
          <p className="mt-1 text-2xl font-semibold text-ink">
            {formatAud(isFamily ? fyTotals.familyCents : fyTotals.payoutCents)}
          </p>
          <p className="mt-1 text-sm text-stone-500">
            {isFamily ? "Funded family spend this financial year." : "Funded payout this financial year."}
          </p>
          <p className="mt-2 text-sm">
            <Link href="/dashboard/statement" className="text-teal">
              Statement
            </Link>
            {" · "}
            <a href="/dashboard/statement/csv" className="text-teal">
              CSV
            </a>
          </p>
        </div>
      </section>

      {unrepliedReviews.length ? (
        <section className="mt-6 rounded-2xl border border-line bg-card p-5">
          <h2 className="font-semibold text-ink">Reply needed</h2>
          <p className="mt-1 text-sm text-stone-600">
            Families see your reply on the public profile. You can publish one reply per review.
          </p>
          <ul className="mt-4 space-y-3">
            {unrepliedReviews.map((review) => (
              <li key={review.id} className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-ink">
                    {review.author.name} · {"★".repeat(review.rating)}
                  </p>
                  <p className="mt-1 text-sm text-stone-600">{review.body}</p>
                  <p className="mt-1 text-xs text-stone-500">
                    {review.booking.specialty.name} · {formatDateTime(review.booking.startAt)}
                  </p>
                </div>
                <Link href={`/dashboard/bookings/${review.bookingId}#review`} className="text-sm text-teal">
                  Reply
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {comingUp.length ? (
        <section className="mt-6 rounded-2xl border border-line bg-card p-5">
          <h2 className="font-semibold text-ink">Coming up</h2>
          <p className="mt-1 text-sm text-stone-600">
            {isFamily
              ? "Sits in progress or starting in the next 7 days. Open Handover for keys, parking and care notes, or copy household defaults onto an empty sit."
              : "Your next sits. Confirm the handover before you travel."}
          </p>
          <ul className="mt-4 space-y-3">
            {comingUp.map((booking) => (
              <li key={booking.id} className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Link href={`/dashboard/bookings/${booking.id}`} className="font-medium text-ink hover:text-teal">
                    {booking.specialty.name} with {isFamily ? booking.caregiver.user.name : booking.family.name}
                  </Link>
                  <p className="text-sm text-stone-500">{formatDateTime(booking.startAt)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone={comingUpKind(booking) === "now" ? "clay" : "sage"}>
                    {comingUpLabel[comingUpKind(booking)]}
                  </Badge>
                  {hasHandover(booking) && !(isFamily && canFillFromHousehold(booking, user.familyProfile)) ? (
                    <Badge tone="sage">Handover ready</Badge>
                  ) : null}
                  {isFamily && canFillFromHousehold(booking, user.familyProfile) ? (
                    <form action={applyHouseholdHandoverAction}>
                      <input type="hidden" name="bookingId" value={booking.id} />
                      <button className="text-sm text-teal" type="submit">
                        Use household
                      </button>
                    </form>
                  ) : null}
                  <Link href={`/dashboard/bookings/${booking.id}#handover`} className="text-sm text-teal">
                    {isFamily && !hasHandover(booking) ? "Add handover" : "Handover"}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6 rounded-2xl border border-line bg-card p-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-semibold text-ink">Next 14 days</h2>
          <p className="text-sm">
            <Link href="/dashboard/calendar" className="font-medium text-teal hover:underline">
              Subscribe
            </Link>
            {" · "}
            <a href="/dashboard/calendar/ics" className="font-medium text-teal hover:underline">
              Download
            </a>
          </p>
        </div>
        <p className="mt-1 text-sm text-stone-600">
          {isFamily
            ? "Sits already in escrow, plus empty days you can still book. Subscribe so Google or Apple Calendar stay in sync, or download a snapshot."
            : "Your held roster. Open days have no sit on the books. Away days pause Instant Book and hide you from Needed on. Closed weekdays follow your usual hours. Subscribe to booked sits, days off and usual hours, or download a snapshot."}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7">
          {roster.map((day) =>
            day.booking ? (
              <Link
                key={day.key}
                href={`/dashboard/bookings/${day.booking.id}`}
                className="rounded-xl bg-orange-50 px-2 py-2 text-center text-xs text-clay no-underline"
              >
                <p className="font-medium">{day.label}</p>
                <p className="mt-0.5 line-clamp-2">
                  {isFamily ? day.booking.caregiver.user.name : day.booking.family.name}
                </p>
              </Link>
            )             : isFamily ? (
              <Link
                key={day.key}
                href={`/caregivers?availableOn=${day.key}`}
                className="rounded-xl bg-sage px-2 py-2 text-center text-xs text-teal-deep no-underline hover:bg-sage/80"
              >
                <p className="font-medium">{day.label}</p>
                <p className="mt-0.5">Find a carer</p>
              </Link>
            ) : day.blocked ? (
              <Link
                key={day.key}
                href="/dashboard/profile"
                className="rounded-xl bg-stone-100 px-2 py-2 text-center text-xs text-stone-600 no-underline"
              >
                <p className="font-medium">{day.label}</p>
                <p className="mt-0.5">Away</p>
              </Link>
            ) : day.closed ? (
              <Link
                key={day.key}
                href="/dashboard/profile"
                className="rounded-xl bg-stone-50 px-2 py-2 text-center text-xs text-stone-500 no-underline"
              >
                <p className="font-medium">{day.label}</p>
                <p className="mt-0.5">Closed</p>
              </Link>
            ) : (
              <div key={day.key} className="rounded-xl bg-sage px-2 py-2 text-center text-xs text-teal-deep">
                <p className="font-medium">{day.label}</p>
                <p className="mt-0.5">Open</p>
              </div>
            ),
          )}
        </div>
      </section>

      {isFamily ? (
        <section className="mt-6 rounded-2xl border border-line bg-card p-5">
          <h2 className="font-semibold text-ink">Shortlist</h2>
          <p className="mt-1 text-sm text-stone-600">
            {shortlistCount === 0
              ? "Save carers from the directory, then compare rates and checks before you book."
              : `${shortlistCount} saved ${shortlistCount === 1 ? "carer" : "carers"} ready to compare.`}
          </p>
          <Link href={shortlistCount ? "/dashboard/shortlist" : "/caregivers"} className="mt-3 inline-block text-sm font-medium text-teal">
            {shortlistCount ? "Open shortlist" : "Browse carers to save"}
          </Link>
        </section>
      ) : null}

      {isFamily ? (
        <section className="mt-6 rounded-2xl border border-line bg-card p-5">
          <h2 className="font-semibold text-ink">Saved searches</h2>
          <p className="mt-1 text-sm text-stone-600">
            Keep a specialty, suburb or Needed on filter and open it again without rebuilding the form. Opening a
            search clears the new-carer count.
            {newSearchHits
              ? ` ${newSearchHits} ${newSearchHits === 1 ? "search has" : "searches have"} new matches.`
              : ""}
          </p>
          {savedSearches.length === 0 ? (
            <Link href="/caregivers" className="mt-3 inline-block text-sm font-medium text-teal">
              Browse carers to save a search
            </Link>
          ) : (
            <ul className="mt-3 space-y-2">
              {savedSearches.map((search) => {
                const delta = savedSearchMatchById.get(search.id);
                return (
                <li key={search.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span>
                    <Link href={search.href} className="font-medium text-teal hover:underline">
                      {search.name}
                    </Link>
                    {delta ? (
                      <span className={delta.newCount > 0 ? "mt-0.5 block text-clay" : "mt-0.5 block text-stone-500"}>
                        {savedSearchDeltaLabel(delta)}
                      </span>
                    ) : null}
                  </span>
                  <form action={deleteSavedSearchAction}>
                    <input type="hidden" name="id" value={search.id} />
                    <input type="hidden" name="next" value="/dashboard" />
                    <button className="text-stone-500 hover:text-clay" type="submit">
                      Remove
                    </button>
                  </form>
                </li>
                );
              })}
            </ul>
          )}
        </section>
      ) : null}

      {expiring.length ? (
        <section className="mt-6 rounded-2xl border border-clay/30 bg-orange-50 p-5">
          <h2 className="font-semibold text-ink">Checks due soon</h2>
          <p className="mt-1 text-sm text-stone-600">
            Families see expiry dates on your public profile. Renew these before they lapse.
          </p>
          <ul className="mt-3 list-disc pl-5 text-sm text-clay">
            {expiring.map((item) => (
              <li key={item.type}>{watchLabel(item)}</li>
            ))}
          </ul>
          <Link href="/dashboard/profile" className="mt-3 inline-block text-sm font-medium text-teal">
            Update a check
          </Link>
        </section>
      ) : null}

      {!isFamily && matchCarer ? (
        <section className="mt-6 rounded-2xl border border-line bg-card p-5">
          <h2 className="font-semibold text-ink">Jobs that fit you</h2>
          <p className="mt-1 text-sm text-stone-600">
            Open requests in your city that match your specialties and usual weekly hours.
            {fittingDelta ? ` ${jobsFitDeltaLabel(fittingDelta)}.` : ""}
          </p>
          {fittingJobs.length === 0 ? (
            <Link href="/care-requests" className="mt-3 inline-block text-sm font-medium text-teal">
              Browse every open job
            </Link>
          ) : (
            <ul className="mt-3 space-y-2">
              {fittingJobs.slice(0, 5).map((job) => (
                <li key={job.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span>
                    <Link href={`/care-requests/${job.slug}`} className="font-medium text-teal hover:underline">
                      {job.title}
                    </Link>
                    <span className="mt-0.5 block text-stone-500">
                      {job.specialty.name} · {job.city.name} · from {formatJobStart(job.startDate)}
                      {proposedJobIds.has(job.id) ? " · proposed" : ""}
                    </span>
                  </span>
                  <Link href={`/care-requests/${job.slug}`} className="text-teal hover:underline">
                    {proposedJobIds.has(job.id) ? "View" : "Propose"}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {fittingJobs.length > 0 ? (
            <Link href="/care-requests?fit=1" className="mt-3 inline-block text-sm font-medium text-teal">
              See all matches
            </Link>
          ) : null}
        </section>
      ) : null}

      {checklist && !checklist.ready ? (
        <section className="mt-6 rounded-2xl border border-clay/30 bg-orange-50 p-5">
          <h2 className="font-semibold text-ink">Complete your profile</h2>
          <p className="mt-1 text-sm text-stone-600">
            {checklist.complete}/{checklist.total} done. Families cannot find a stub listing on specialty pages until you add specialties and checks.
          </p>
          <ul className="mt-3 list-disc pl-5 text-sm">
            {checklist.items
              .filter((item) => !item.done)
              .map((item) => (
                <li key={item.key}>{item.label}</li>
              ))}
          </ul>
          <Link href="/dashboard/profile" className="mt-3 inline-block text-sm font-medium text-teal">
            Finish your profile
          </Link>
        </section>
      ) : null}

      <BookingList
        title="Needs action"
        groups={needsAction}
        isFamily={isFamily}
        empty={
          isFamily ? (
            <>
              Nothing waiting on you.{" "}
              <Link href="/caregivers" className="text-teal">
                Browse verified carers
              </Link>{" "}
              or{" "}
              <Link href="/post-a-job" className="text-teal">
                post a care request
              </Link>
              .
            </>
          ) : (
            <>
              No booking requests to accept.{" "}
              <Link href="/care-requests" className="text-teal">
                Browse open jobs
              </Link>{" "}
              or{" "}
              <Link href="/dashboard/profile" className="text-teal">
                keep your profile current
              </Link>
              .
            </>
          )
        }
      />
      <BookingList
        title="Active care"
        groups={active}
        isFamily={isFamily}
        empty={
          isFamily ? (
            <>
              No bookings in escrow or in progress.{" "}
              <Link href="/caregivers" className="text-teal">
                Find a carer
              </Link>{" "}
              when you are ready to book.
            </>
          ) : (
            <>
              No bookings in escrow or in progress. Open jobs are on{" "}
              <Link href="/care-requests" className="text-teal">
                the care request board
              </Link>
              .
            </>
          )
        }
      />
      <BookingList
        title="History"
        groups={history}
        isFamily={isFamily}
        empty={
          isFamily ? (
            <>
              No completed bookings yet. Released bookings and reviews will land here after care.
            </>
          ) : (
            <>
              No completed bookings yet. Keep checks and work history up to date on{" "}
              <Link href="/dashboard/profile" className="text-teal">
                your profile
              </Link>
              .
            </>
          )
        }
      />

      {!isFamily && carerInvites.length ? (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Invites to apply</h2>
          <ul className="mt-4 space-y-3">
            {carerInvites.map((invite) => (
              <li key={invite.id} className="rounded-2xl border border-line bg-card p-4">
                <Link href={`/care-requests/${invite.request.slug}`} className="font-medium text-teal hover:underline">
                  {invite.request.title}
                </Link>
                <p className="mt-1 text-sm text-stone-500">
                  {invite.request.family.name} invited you · starts {formatJobStart(invite.request.startDate)}
                </p>
                {invite.note ? <p className="mt-2 text-sm text-stone-700">{invite.note}</p> : null}
                {unreadJobByRequest.get(invite.request.id) ? (
                  <p className="mt-2 text-sm font-medium text-clay">
                    {plural(unreadJobByRequest.get(invite.request.id) ?? 0, "new message")}
                  </p>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-3 text-sm">
                  <Link href={`/care-requests/${invite.request.slug}`} className="font-medium text-teal hover:underline">
                    Send a proposal
                  </Link>
                  <form action={declineInviteAction}>
                    <input type="hidden" name="inviteId" value={invite.id} />
                    <button className="text-stone-500 hover:text-ink" type="submit">
                      Decline
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="text-xl font-semibold">{isFamily ? "Your care requests" : "Your proposals"}</h2>
        <ul className="mt-4 space-y-3">
          {isFamily ? (
            familyJobs.length === 0 ? (
              <li className="text-sm text-stone-500">
                No jobs posted.{" "}
                <Link href="/post-a-job" className="text-teal">
                  Post a care request
                </Link>
              </li>
            ) : (
              familyJobs.map((job) => {
                const match = familyJobMatchById.get(job.id);
                return (
                <li key={job.id}>
                  <Link href={`/care-requests/${job.slug}`} className="text-teal hover:underline">
                    {job.title}
                  </Link>
                  <span className="ml-2 text-sm text-stone-500">{requestStatusLabel(job.status)}</span>
                  {job.bookings[0] ? (
                    <span className="mt-0.5 block text-sm">
                      <Link href={`/dashboard/bookings/${job.bookings[0].id}`} className="text-teal hover:underline">
                        Open sit
                      </Link>
                    </span>
                  ) : null}
                  {match ? (
                    <span className="mt-0.5 block text-sm text-stone-500">
                      {match.count
                        ? `${match.count} ${match.count === 1 ? "carer" : "carers"} free at ${formatJobStart(job.startDate)} · `
                        : "No carers free at this start · "}
                      <Link href={match.href} className="text-teal hover:underline">
                        Browse
                      </Link>
                      {job._count.invites ? ` · ${job._count.invites} invited` : ""}
                    </span>
                  ) : job._count.invites ? (
                    <span className="mt-0.5 block text-sm text-stone-500">
                      {job._count.invites} {inviteStatusLabel("pending").toLowerCase()}
                    </span>
                  ) : null}
                  {unreadJobByRequest.get(job.id) ? (
                    <span className="mt-0.5 block text-sm font-medium text-clay">
                      {plural(unreadJobByRequest.get(job.id) ?? 0, "new message")}
                    </span>
                  ) : null}
                </li>
                );
              })
            )
          ) : carerProposals.length === 0 ? (
            <li className="text-sm text-stone-500">
              No proposals yet.{" "}
              <Link href="/care-requests" className="text-teal">
                Browse open jobs
              </Link>
            </li>
          ) : (
            carerProposals.map((proposal) => (
              <li key={proposal.id}>
                <Link href={`/care-requests/${proposal.careRequest.slug}`} className="text-teal hover:underline">
                  {proposal.careRequest.title}
                </Link>
                <span className="ml-2 text-sm text-stone-500">{proposalStatusLabel(proposal.status)}</span>
                {unreadJobByRequest.get(proposal.careRequestId) ? (
                  <span className="ml-2 text-sm font-medium text-clay">
                    {plural(unreadJobByRequest.get(proposal.careRequestId) ?? 0, "new message")}
                  </span>
                ) : null}
                {proposal.careRequest.bookings[0] ? (
                  <span className="mt-0.5 block text-sm">
                    <Link
                      href={`/dashboard/bookings/${proposal.careRequest.bookings[0].id}`}
                      className="text-teal hover:underline"
                    >
                      Open sit
                    </Link>
                  </span>
                ) : null}
                {user.caregiverProfile &&
                canWithdrawProposal(proposal, user.caregiverProfile.id, proposal.careRequest.status) ? (
                  <form action={withdrawProposalAction} className="mt-0.5">
                    <input type="hidden" name="proposalId" value={proposal.id} />
                    <button className="text-sm text-stone-500 hover:text-ink" type="submit">
                      Withdraw proposal
                    </button>
                  </form>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
