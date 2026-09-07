import { notFound } from "next/navigation";
import { BookingForm } from "@/components/booking-form";
import { DaysOffCalendar } from "@/components/days-off-calendar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { auth } from "@/auth";
import {
  fortnightLabel,
  instantBookForStart,
  isInstantBookLive,
  noticeLabel,
  summariseFortnight,
  weeklyHourChips,
} from "@/lib/availability";
import { credentialWatchlist, watchLabel } from "@/lib/credentials";
import { lastActiveLabel, parseSydneyDateTimeLocal, sydneyDateTimeLocal } from "@/lib/format";
import { bookHref, canAttachJob, isJobSlug } from "@/lib/job-match";
import { formatAud } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { getCaregiverBySlug, getUpcomingAvailability } from "@/lib/queries";
import { suggestedStartLocal } from "@/lib/weekly-windows";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const carer = await getCaregiverBySlug(slug);
  if (!carer) return {};
  return pageMeta({
    title: `Book ${carer.user.name}`,
    description: `Book ${carer.user.name} in ${carer.city.name}. Payment is collected by CareProof and released after the booking.`,
    path: `/caregiver/${carer.slug}/book`,
    noIndex: true,
  });
}

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string; start?: string; at?: string; job?: string }>;
}) {
  const [{ slug }, query, session] = await Promise.all([params, searchParams, auth()]);
  const carer = await getCaregiverBySlug(slug);
  if (!carer) notFound();
  const upcoming = await getUpcomingAvailability(carer.id, 70);
  const fortnight = summariseFortnight(upcoming.slice(0, 14));
  const blockedKeys = upcoming.filter((day) => day.blocked).map((day) => day.key);
  const awayToday = upcoming[0]?.blocked === true;
  const hourChips = weeklyHourChips(carer.weeklyHours);
  const checkAlerts = credentialWatchlist(carer.credentials);
  const startDate = query.start && /^\d{4}-\d{2}-\d{2}$/.test(query.start) ? query.start : "";
  const startClock = /^([01]\d|2[0-3]):([0-5]\d)$/.test(query.at ?? "") ? query.at : "";
  const jobSlug = query.job && isJobSlug(query.job) ? query.job : "";
  const startIsBlocked = startDate ? blockedKeys.includes(startDate) : false;
  const startIsClosed = startDate ? upcoming.some((day) => day.key === startDate && day.closed) : false;
  const defaultStart =
    startDate && startClock && !startIsBlocked && !startIsClosed
      ? `${startDate}T${startClock}`
      : startDate && !startIsBlocked && !startIsClosed
        ? suggestedStartLocal(startDate, carer.weeklyWindows)
        : sydneyDateTimeLocal(1, 9);
  const defaultStartAt = parseSydneyDateTimeLocal(defaultStart);
  const liveAway = isInstantBookLive(carer.instantBook, blockedKeys);
  const liveInstant = instantBookForStart(carer.instantBook, blockedKeys, defaultStartAt, carer.noticeHours);
  const noticePaused = liveAway && !liveInstant && carer.instantBook;
  const bookPath = bookHref(carer.slug, { start: startDate, at: startClock, job: jobSlug });
  const attachJob =
    session?.user.role === "FAMILY" && jobSlug
      ? await prisma.careRequest.findUnique({
          where: { slug: jobSlug },
          select: { slug: true, title: true, specialtyId: true, familyId: true, status: true, startDate: true },
        })
      : null;
  const job =
    attachJob && session?.user.id && canAttachJob(attachJob, session.user.id)
      ? { slug: attachJob.slug, title: attachJob.title, specialtyId: attachJob.specialtyId }
      : null;

  return (
    <div className="mx-auto max-w-xl">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: carer.user.name, href: `/caregiver/${carer.slug}` },
          { name: "Book" },
        ]}
      />
      <h1 className="text-3xl font-semibold text-ink">Book {carer.user.name}</h1>
      <p className="mt-2 text-stone-600">
        {carer.suburb}, {carer.city.name} · {formatAud(carer.hourlyRateCents)}/hr inc GST.{" "}
        {liveInstant
          ? "Instant Book confirms immediately."
          : noticePaused
            ? "This start is inside the notice window, so the sit waits for the carer to accept."
            : carer.instantBook && awayToday
              ? "Away today — Instant Book is paused, so this sit waits for the carer to accept."
              : "The carer will accept before you pay."}{" "}
        Next 14 days: {fortnightLabel(fortnight)}.
        {carer.instantBook ? ` ${noticeLabel(carer.noticeHours)}.` : ""}
      </p>
      {hourChips.length ? (
        <div className="mt-3 rounded-xl bg-sage p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Usual weekly hours</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {hourChips.map((chip) => (
              <span key={chip} className="rounded-full bg-card px-3 py-1 text-xs font-medium text-teal-deep">
                {chip}
              </span>
            ))}
          </div>
        </div>
      ) : null}
      {carer.availabilityNote ? <p className="mt-3 rounded-xl bg-sage p-3 text-sm text-stone-700">{carer.availabilityNote}</p> : null}
      <div className="mt-4 rounded-2xl border border-line bg-card p-4">
        <p className="text-sm font-medium text-ink">Pick a free day</p>
        <p className="mt-1 text-xs text-stone-500">This month and next. Away, closed and booked days cannot be selected.</p>
        <div className="mt-3">
          <DaysOffCalendar
            days={upcoming}
            bookSlug={carer.slug}
            bookJob={job?.slug}
            bookAt={startClock || undefined}
          />
        </div>
      </div>
      {checkAlerts.length ? (
        <div className="mt-3 rounded-xl bg-orange-50 p-3 text-sm text-clay">
          <p className="font-medium">Checks to review before you book</p>
          <ul className="mt-1 list-disc pl-5">
            {checkAlerts.map((item) => (
              <li key={item.type}>{watchLabel(item)}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <p className="mt-2 text-xs text-stone-500">{lastActiveLabel(carer.lastActiveAt)}</p>
      {query.error === "overlap" ? (
        <p className="mt-4 rounded-xl bg-orange-50 p-3 text-sm text-clay">
          That time overlaps a booking already held for this carer. Pick another start, or a different week.
        </p>
      ) : query.error === "hours" || startIsClosed ? (
        <p className="mt-4 rounded-xl bg-orange-50 p-3 text-sm text-clay">
          That start is outside this carer’s usual weekly hours. Pick a free day, or a time that begins during their
          windows.
        </p>
      ) : query.error === "blocked" || startIsBlocked ? (
        <p className="mt-4 rounded-xl bg-orange-50 p-3 text-sm text-clay">
          This carer has marked that day as away. Pick another date, or search someone free that night.
        </p>
      ) : query.error ? (
        <p className="mt-4 rounded-xl bg-orange-50 p-3 text-sm text-clay">Please check the date, hours and care type.</p>
      ) : null}
      {!session?.user ? (
        <p className="mt-4 rounded-xl bg-sage p-3 text-sm">
          Families sign in to book.{" "}
          <Link href={`/login?callbackUrl=${encodeURIComponent(bookPath)}`} className="font-medium text-teal">
            Log in
          </Link>{" "}
          or{" "}
          <Link href="/register" className="font-medium text-teal">
            create an account
          </Link>
          .
        </p>
      ) : session.user.role !== "FAMILY" ? (
        <p className="mt-4 text-sm text-clay">Switch to a family account to book carers.</p>
      ) : (
        <div className="mt-6 rounded-2xl border border-line bg-card p-5">
          <BookingForm
            slug={carer.slug}
            hourlyRateCents={carer.hourlyRateCents}
            instantBook={liveInstant}
            specialties={carer.specialties.map((s) => ({ id: s.specialty.id, name: s.specialty.name }))}
            defaultStart={defaultStart}
            job={job}
          />
        </div>
      )}
      <section className="mt-8 rounded-2xl border border-line bg-card p-5">
        <h2 className="text-lg font-semibold text-ink">Cancellation</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-stone-600">
          <li>More than 24 hours before start: full refund of the held amount.</li>
          <li>Inside 24 hours: request a refund and CareProof reviews it before release or return.</li>
          <li>After the visit, funds stay held for 72 hours so you can raise a dispute before auto-release.</li>
        </ul>
        <p className="mt-3 text-sm">
          <Link href="/trust-and-safety" className="font-medium text-teal hover:underline">
            Read the full trust and payments policy
          </Link>
        </p>
      </section>
    </div>
  );
}
