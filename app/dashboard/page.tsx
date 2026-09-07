import Link from "next/link";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Badge } from "@/components/badges";
import { BOOKING_STATUS, BOOKING_STATUS_LABELS } from "@/lib/constants";
import { formatDateTime, plural, snippet } from "@/lib/format";
import { formatAud } from "@/lib/money";
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

const ACTION_STATUSES = new Set<string>([
  BOOKING_STATUS.PENDING_ACCEPTANCE,
  BOOKING_STATUS.AWAITING_PAYMENT,
  BOOKING_STATUS.PENDING_RELEASE,
  BOOKING_STATUS.DISPUTED,
]);
const ACTIVE_STATUSES = new Set<string>([BOOKING_STATUS.ESCROW_HELD, BOOKING_STATUS.IN_PROGRESS]);

function BookingList({
  title,
  bookings,
  isFamily,
  empty,
}: {
  title: string;
  bookings: {
    id: string;
    status: string;
    startAt: Date;
    totalCents: number;
    subtotalCents: number;
    specialty: { name: string };
    caregiver: { user: { name: string } };
    family: { name: string };
    payment: { status: string } | null;
    messages: { body: string }[];
    _count: { messages: number };
    recurringIndex: number;
    recurringTotal: number;
  }[];
  isFamily: boolean;
  empty: ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold">{title}</h2>
      <ul className="mt-4 space-y-3">
        {bookings.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-line bg-card p-5 text-sm text-stone-600">{empty}</li>
        ) : (
          bookings.map((booking) => (
            <li key={booking.id} className="rounded-2xl border border-line bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Link href={`/dashboard/bookings/${booking.id}`} className="font-semibold hover:text-teal">
                    {booking.specialty.name} with {isFamily ? booking.caregiver.user.name : booking.family.name}
                  </Link>
                  <p className="text-sm text-stone-500">{formatDateTime(booking.startAt)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {booking.recurringTotal > 1 ? (
                    <Badge tone="clay">
                      Week {booking.recurringIndex} of {booking.recurringTotal}
                    </Badge>
                  ) : null}
                  <Badge>{BOOKING_STATUS_LABELS[booking.status] ?? booking.status}</Badge>
                </div>
              </div>
              <p className="mt-2 text-sm text-stone-600">
                {formatAud(booking.totalCents)} family total · carer payout {formatAud(booking.subtotalCents)}
                {booking.payment ? ` · payment ${booking.payment.status}` : ""}
              </p>
              {booking._count.messages > 0 ? (
                <p className="mt-2 text-sm text-stone-500">
                  {plural(booking._count.messages, "message")}
                  {booking.messages[0] ? ` · “${snippet(booking.messages[0].body)}”` : ""}
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

export default async function DashboardPage() {
  const user = await requireUser();
  if (!user) redirect("/login?callbackUrl=/dashboard");

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

  const familyJobs = isFamily
    ? await prisma.careRequest.findMany({
        where: { familyId: user.id },
        orderBy: { createdAt: "desc" },
      })
    : [];
  const carerProposals = !isFamily
    ? await prisma.proposal.findMany({
        where: { caregiverId: user.caregiverProfile?.id ?? "__none__" },
        include: { careRequest: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const carerProfile =
    !isFamily && user.caregiverProfile
      ? await prisma.caregiverProfile.findUnique({
          where: { id: user.caregiverProfile.id },
          include: { specialties: true, credentials: true, workHistory: true },
        })
      : null;
  const checklist = carerProfile ? profileChecklist(carerProfile) : null;
  const shortlistCount = isFamily
    ? await prisma.shortlist.count({ where: { familyId: user.id } })
    : 0;

  const needsAction = bookings.filter((booking) => ACTION_STATUSES.has(booking.status));
  const active = bookings.filter((booking) => ACTIVE_STATUSES.has(booking.status));
  const history = bookings.filter(
    (booking) => !ACTION_STATUSES.has(booking.status) && !ACTIVE_STATUSES.has(booking.status),
  );
  const escrowStatuses = new Set<string>([
    BOOKING_STATUS.ESCROW_HELD,
    BOOKING_STATUS.IN_PROGRESS,
    BOOKING_STATUS.PENDING_RELEASE,
  ]);
  const heldCents = bookings
    .filter((booking) => escrowStatuses.has(booking.status))
    .reduce((sum, booking) => sum + (isFamily ? booking.totalCents : booking.subtotalCents), 0);
  const settledCents = bookings
    .filter((booking) => booking.status === BOOKING_STATUS.RELEASED)
    .reduce((sum, booking) => sum + (isFamily ? booking.totalCents : booking.subtotalCents), 0);

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

      <section className="mt-6 grid gap-3 sm:grid-cols-2">
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
        bookings={needsAction}
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
        bookings={active}
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
        bookings={history}
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
              familyJobs.map((job) => (
                <li key={job.id}>
                  <Link href={`/care-requests/${job.slug}`} className="text-teal hover:underline">
                    {job.title}
                  </Link>
                  <span className="ml-2 text-sm text-stone-500">{job.status}</span>
                </li>
              ))
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
                <span className="ml-2 text-sm text-stone-500">{proposal.status}</span>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
