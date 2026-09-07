import { notFound } from "next/navigation";
import { BookingForm } from "@/components/booking-form";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { auth } from "@/auth";
import { weeklyHourChips } from "@/lib/availability";
import { lastActiveLabel, sydneyDateTimeLocal } from "@/lib/format";
import { formatAud } from "@/lib/money";
import { getCaregiverBySlug } from "@/lib/queries";
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
  searchParams: Promise<{ error?: string; start?: string }>;
}) {
  const [{ slug }, query, session] = await Promise.all([params, searchParams, auth()]);
  const carer = await getCaregiverBySlug(slug);
  if (!carer) notFound();
  const hourChips = weeklyHourChips(carer.weeklyHours);
  const startDate = query.start && /^\d{4}-\d{2}-\d{2}$/.test(query.start) ? query.start : "";
  const defaultStart = startDate ? `${startDate}T17:00` : sydneyDateTimeLocal(1, 9);
  const bookPath = startDate ? `/caregiver/${carer.slug}/book?start=${startDate}` : `/caregiver/${carer.slug}/book`;

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
        {carer.instantBook ? "Instant Book confirms immediately." : "The carer will accept before you pay."}
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
      <p className="mt-2 text-xs text-stone-500">{lastActiveLabel(carer.lastActiveAt)}</p>
      {query.error === "overlap" ? (
        <p className="mt-4 rounded-xl bg-orange-50 p-3 text-sm text-clay">
          That time overlaps a booking already held for this carer. Pick another start, or a different week.
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
            instantBook={carer.instantBook}
            specialties={carer.specialties.map((s) => ({ id: s.specialty.id, name: s.specialty.name }))}
            defaultStart={defaultStart}
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
