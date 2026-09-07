import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/badges";
import {
  acceptBookingAction,
  acceptSeriesAction,
  cancelRemainingSeriesAction,
  cancelUnpaidBookingAction,
  confirmCompleteAction,
  declineSeriesAction,
  createReviewAction,
  declineBookingAction,
  disputeBookingAction,
  payBookingAction,
  paySeriesAction,
  resolveDisputeAction,
  sendMessageAction,
  startBookingAction,
} from "@/lib/actions";
import { BOOKING_STATUS, BOOKING_STATUS_LABELS, UNPAID_BOOKING_STATUSES } from "@/lib/constants";
import { autoReleaseIfDue } from "@/lib/escrow";
import { formatDateTime } from "@/lib/format";
import { isUnreadFor, markThreadRead } from "@/lib/messages";
import { formatAud } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Booking",
  description: "Booking and escrow detail.",
  path: "/dashboard",
  noIndex: true,
});

export default async function BookingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paid?: string; released?: string; cancelled?: string; error?: string }>;
}) {
  const user = await requireUser();
  if (!user) redirect("/login");
  const [{ id }, query] = await Promise.all([params, searchParams]);
  await autoReleaseIfDue(id);

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      caregiver: { include: { user: true } },
      family: { select: { id: true, name: true } },
      specialty: true,
      payment: true,
      review: true,
      messages: { include: { sender: { select: { id: true, name: true } } }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!booking) notFound();
  const isFamily = booking.familyId === user.id;
  const isCarer = booking.caregiver.userId === user.id;
  if (!isFamily && !isCarer) redirect("/dashboard");
  const newMessageIds = new Set(
    booking.messages.filter((message) => isUnreadFor(message, user.id)).map((message) => message.id),
  );
  if (newMessageIds.size) await markThreadRead(booking.id, user.id);
  const series = booking.recurringGroupId
    ? await prisma.booking.findMany({
        where: { recurringGroupId: booking.recurringGroupId },
        orderBy: { recurringIndex: "asc" },
        select: { id: true, startAt: true, status: true, recurringIndex: true, recurringTotal: true, totalCents: true },
      })
    : [];
  const liveWeeks = series.filter(
    (week) => week.status !== BOOKING_STATUS.CANCELLED && week.status !== BOOKING_STATUS.REFUNDED,
  );
  const cancelledWeeks = series.length - liveWeeks.length;
  const seriesTotalCents = liveWeeks.reduce((sum, week) => sum + week.totalCents, 0);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/dashboard" className="text-sm text-teal">
        Back to dashboard
      </Link>
      <h1 className="mt-3 text-3xl font-semibold text-ink">{booking.specialty.name} booking</h1>
      <p className="mt-2 text-stone-600">
        {isFamily ? booking.caregiver.user.name : booking.family.name} · {formatDateTime(booking.startAt)} –{" "}
        {formatDateTime(booking.endAt)} · {booking.hours} hours
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {booking.recurringTotal > 1 ? (
          <Badge tone="clay">
            Week {booking.recurringIndex} of {booking.recurringTotal}
          </Badge>
        ) : null}
        <Badge tone="teal">{BOOKING_STATUS_LABELS[booking.status] ?? booking.status}</Badge>
      </div>
      {query.paid ? (
        <p className="mt-4 rounded-xl bg-sage p-3 text-sm">Payment collected and held in escrow.</p>
      ) : null}
      {query.released ? (
        <p className="mt-4 rounded-xl bg-sage p-3 text-sm">Funds released to the carer.</p>
      ) : null}
      {query.cancelled ? (
        <p className="mt-4 rounded-xl bg-sage p-3 text-sm">
          Unpaid weeks were cancelled. Funded escrow holds are unchanged.
        </p>
      ) : null}

      <dl className="mt-6 space-y-2 rounded-2xl border border-line bg-card p-5 text-sm">
        <div className="flex justify-between">
          <dt>Care rate</dt>
          <dd>{formatAud(booking.subtotalCents)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>GST included</dt>
          <dd>{formatAud(booking.gstCents)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Platform fee</dt>
          <dd>{formatAud(booking.platformFeeCents)}</dd>
        </div>
        <div className="flex justify-between font-semibold">
          <dt>Family paid</dt>
          <dd>{formatAud(booking.totalCents)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Carer payout</dt>
          <dd>{formatAud(booking.subtotalCents)}</dd>
        </div>
        <div className="flex justify-between text-stone-500">
          <dt>Escrow</dt>
          <dd>{booking.payment ? `${booking.payment.provider} · ${booking.payment.status}` : "Not funded"}</dd>
        </div>
      </dl>
      {booking.notes ? <p className="mt-4 text-sm text-stone-600 whitespace-pre-line">Notes: {booking.notes}</p> : null}
      {series.length > 1 ? (
        <section className="mt-6 rounded-2xl border border-line bg-card p-5">
          <h2 className="font-semibold text-ink">Standing weekly series</h2>
          <p className="mt-1 text-sm text-stone-600">
            Each week is a separate escrow hold. Live series total {formatAud(seriesTotalCents)}
            {cancelledWeeks > 0 ? ` · ${cancelledWeeks} cancelled` : ""}.
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {series.map((week) => (
              <li key={week.id} className="flex flex-wrap items-center justify-between gap-2">
                <Link
                  href={`/dashboard/bookings/${week.id}`}
                  className={week.id === booking.id ? "font-semibold text-teal" : "text-teal hover:underline"}
                >
                  Week {week.recurringIndex} · {formatDateTime(week.startAt)}
                </Link>
                <span className="text-stone-500">{BOOKING_STATUS_LABELS[week.status] ?? week.status}</span>
              </li>
            ))}
          </ul>
          {isCarer && series.some((week) => week.status === BOOKING_STATUS.PENDING_ACCEPTANCE) ? (
            <div className="mt-4 flex flex-wrap gap-3">
              <form action={acceptSeriesAction}>
                <input type="hidden" name="bookingId" value={booking.id} />
                <button className="rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white" type="submit">
                  Accept every week
                </button>
              </form>
              <form action={declineSeriesAction}>
                <input type="hidden" name="bookingId" value={booking.id} />
                <button className="rounded-lg border border-line px-4 py-2 text-sm" type="submit">
                  Decline the series
                </button>
              </form>
            </div>
          ) : null}
          {isFamily && series.some((week) => week.status === BOOKING_STATUS.AWAITING_PAYMENT) ? (
            <form action={paySeriesAction} className="mt-4">
              <input type="hidden" name="bookingId" value={booking.id} />
              <button className="rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white" type="submit">
                Pay remaining weeks into escrow
              </button>
            </form>
          ) : null}
          {isFamily &&
          series.some((week) => (UNPAID_BOOKING_STATUSES as readonly string[]).includes(week.status)) ? (
            <form action={cancelRemainingSeriesAction} className="mt-4">
              <input type="hidden" name="bookingId" value={booking.id} />
              <button className="rounded-lg border border-line px-4 py-2 text-sm" type="submit">
                Cancel unpaid weeks
              </button>
            </form>
          ) : null}
          <p className="mt-4 text-sm">
            <a href={`/dashboard/bookings/${booking.id}/ics?series=1`} className="text-teal hover:underline">
              Add the whole series to your calendar
            </a>
          </p>
        </section>
      ) : null}
      <p className="mt-4 text-sm">
        <a href={`/dashboard/bookings/${booking.id}/ics`} className="text-teal hover:underline">
          Add this sit to your calendar
        </a>
        {booking.payment ? (
          <>
            {" · "}
            <Link href={`/dashboard/bookings/${booking.id}/invoice`} className="text-teal hover:underline">
              Tax invoice (GST)
            </Link>
          </>
        ) : null}
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        {isCarer && booking.status === BOOKING_STATUS.PENDING_ACCEPTANCE ? (
          <>
            <form action={acceptBookingAction}>
              <input type="hidden" name="bookingId" value={booking.id} />
              <button className="rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white" type="submit">
                Accept booking
              </button>
            </form>
            <form action={declineBookingAction}>
              <input type="hidden" name="bookingId" value={booking.id} />
              <button className="rounded-lg border border-line px-4 py-2 text-sm" type="submit">
                Decline
              </button>
            </form>
          </>
        ) : null}
        {isFamily && booking.status === BOOKING_STATUS.AWAITING_PAYMENT ? (
          <form action={payBookingAction}>
            <input type="hidden" name="bookingId" value={booking.id} />
            <button className="rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white" type="submit">
              Pay into escrow
            </button>
          </form>
        ) : null}
        {isFamily && (UNPAID_BOOKING_STATUSES as readonly string[]).includes(booking.status) ? (
          <form action={cancelUnpaidBookingAction}>
            <input type="hidden" name="bookingId" value={booking.id} />
            <button className="rounded-lg border border-line px-4 py-2 text-sm" type="submit">
              Cancel this week
            </button>
          </form>
        ) : null}
        {(isFamily || isCarer) && booking.status === BOOKING_STATUS.ESCROW_HELD ? (
          <form action={startBookingAction}>
            <input type="hidden" name="bookingId" value={booking.id} />
            <button className="rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white" type="submit">
              Mark care in progress
            </button>
          </form>
        ) : null}
        {isFamily &&
        (booking.status === BOOKING_STATUS.IN_PROGRESS || booking.status === BOOKING_STATUS.ESCROW_HELD) ? (
          <form action={confirmCompleteAction}>
            <input type="hidden" name="bookingId" value={booking.id} />
            <button className="rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white" type="submit">
              Confirm complete and release
            </button>
          </form>
        ) : null}
        {isFamily &&
        (booking.status === BOOKING_STATUS.ESCROW_HELD ||
          booking.status === BOOKING_STATUS.IN_PROGRESS ||
          booking.status === BOOKING_STATUS.PENDING_RELEASE) ? (
          <form action={disputeBookingAction}>
            <input type="hidden" name="bookingId" value={booking.id} />
            <button className="rounded-lg border border-clay px-4 py-2 text-sm text-clay" type="submit">
              Open dispute
            </button>
          </form>
        ) : null}
        {isFamily && booking.status === BOOKING_STATUS.DISPUTED ? (
          <>
            <form action={resolveDisputeAction}>
              <input type="hidden" name="bookingId" value={booking.id} />
              <input type="hidden" name="resolution" value="release" />
              <button className="rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white" type="submit">
                Release to carer
              </button>
            </form>
            <form action={resolveDisputeAction}>
              <input type="hidden" name="bookingId" value={booking.id} />
              <input type="hidden" name="resolution" value="refund" />
              <button className="rounded-lg border border-line px-4 py-2 text-sm" type="submit">
                Refund family
              </button>
            </form>
          </>
        ) : null}
      </div>

      <section className="mt-10">
        <h2 className="font-semibold text-ink">Messages</h2>
        <p className="mt-1 text-xs text-stone-500">Only you and the other party on this booking can see this thread.</p>
        {query.error === "message" ? <p className="mt-2 text-sm text-clay">Write a short message before sending.</p> : null}
        <ul className="mt-4 space-y-3">
          {booking.messages.length === 0 ? (
            <li className="text-sm text-stone-500">No messages yet. Confirm times, access or handover notes here.</li>
          ) : (
            booking.messages.map((message) => (
              <li key={message.id} className="rounded-2xl border border-line bg-card p-4">
                <p className="text-sm font-medium text-ink">
                  {message.sender.id === user.id ? "You" : message.sender.name}
                  {newMessageIds.has(message.id) ? (
                    <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-clay">
                      New
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 text-sm text-stone-700 whitespace-pre-line">{message.body}</p>
                <p className="mt-2 text-xs text-stone-500">{formatDateTime(message.createdAt)}</p>
              </li>
            ))
          )}
        </ul>
        <form action={sendMessageAction} className="mt-4 space-y-3">
          <input type="hidden" name="bookingId" value={booking.id} />
          <textarea
            name="body"
            required
            rows={3}
            placeholder="Ask about parking, keys, or the handover."
            className="w-full rounded-lg border border-line px-3 py-2"
          />
          <button className="rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white" type="submit">
            Send message
          </button>
        </form>
      </section>

      {isFamily && booking.status === BOOKING_STATUS.RELEASED && !booking.review ? (
        <form action={createReviewAction} className="mt-8 space-y-3 rounded-2xl border border-line bg-card p-5">
          <h2 className="font-semibold">Leave a review</h2>
          <p className="text-xs text-stone-500">Only available after funds are released.</p>
          {query.error === "review" ? <p className="text-sm text-clay">Add a rating and comment.</p> : null}
          <input type="hidden" name="bookingId" value={booking.id} />
          <label className="block text-sm">
            Rating
            <select name="rating" required className="mt-1 w-full rounded-lg border border-line px-3 py-2">
              <option value="5">5 — Excellent</option>
              <option value="4">4 — Good</option>
              <option value="3">3 — OK</option>
              <option value="2">2 — Poor</option>
              <option value="1">1 — Unacceptable</option>
            </select>
          </label>
          <textarea name="body" required rows={4} className="w-full rounded-lg border border-line px-3 py-2" />
          <button className="rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white" type="submit">
            Publish review
          </button>
        </form>
      ) : null}

      <p className="mt-8 text-sm">
        <Link href={`/caregiver/${booking.caregiver.slug}`} className="text-teal">
          View public profile
        </Link>
      </p>
    </div>
  );
}
