import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, CredentialDetails } from "@/components/badges";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CaregiverCardView } from "@/components/caregiver-card";
import { JsonLd } from "@/components/json-ld";
import { MobileBookBar } from "@/components/mobile-book-bar";
import { Portrait } from "@/components/portrait";
import { ShortlistButton } from "@/components/shortlist-button";
import { weeklyHourChips } from "@/lib/availability";
import { formatDate, lastActiveLabel, monthYear } from "@/lib/format";
import { formatAud } from "@/lib/money";
import { getCaregiverBySlug, getShortlistedIds, similarCaregivers } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { breadcrumbJsonLd, pageMeta } from "@/lib/seo";
import { siteUrl } from "@/lib/constants";
import { trustLabel } from "@/lib/trust";
import { WORK_VERIFICATION_LABELS } from "@/lib/constants";
import { slugifySuburb } from "@/prisma/data/suburbs";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const carer = await getCaregiverBySlug(slug);
  if (!carer) return {};
  return pageMeta({
    title: `${carer.user.name} — ${carer.headline}`,
    description: `${carer.user.name} is a verified carer in ${carer.city.name}, ${carer.city.state.abbrev}. ${carer.yearsExperience} years’ experience. Book with escrow on CareProof.`,
    path: `/caregiver/${carer.slug}`,
  });
}

export default async function CaregiverProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [carer, viewer] = await Promise.all([getCaregiverBySlug(slug), requireUser()]);
  if (!carer) notFound();
  const isOwner = viewer?.caregiverProfile?.id === carer.id;
  const [similar, savedIds] = await Promise.all([
    similarCaregivers(
      carer.id,
      carer.cityId,
      carer.specialties.map((s) => s.specialtyId),
    ),
    getShortlistedIds(viewer?.role === "FAMILY" ? viewer.id : null),
  ]);
  const primary = carer.specialties[0]?.specialty;
  const canShortlist = viewer?.role === "FAMILY";

  return (
    <div className="pb-20 md:pb-0">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Carers", path: "/caregivers" },
            ...(primary
              ? [
                  {
                    name: primary.pluralName,
                    path: `/caregivers/${primary.slug}/${carer.city.state.slug}/${carer.city.slug}`,
                  },
                ]
              : []),
            { name: carer.user.name, path: `/caregiver/${carer.slug}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Person",
            name: carer.user.name,
            jobTitle: carer.headline,
            description: carer.bio,
            url: `${siteUrl()}/caregiver/${carer.slug}`,
            address: {
              "@type": "PostalAddress",
              addressLocality: carer.city.name,
              addressRegion: carer.city.state.abbrev,
              addressCountry: "AU",
            },
            ...(carer.reviewCount
              ? {
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: carer.ratingAvg,
                    reviewCount: carer.reviewCount,
                  },
                }
              : {}),
            makesOffer: {
              "@type": "Offer",
              price: (carer.hourlyRateCents / 100).toFixed(2),
              priceCurrency: "AUD",
              availability: carer.availableNow ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
            },
          },
        ]}
      />
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Carers", href: "/caregivers" },
          ...(primary
            ? [
                {
                  name: `${primary.pluralName} in ${carer.city.name}`,
                  href: `/caregivers/${primary.slug}/${carer.city.state.slug}/${carer.city.slug}`,
                },
              ]
            : []),
          { name: carer.user.name },
        ]}
      />

      <div className="grid gap-8 md:grid-cols-[1fr_320px]">
        <div>
          <div className="flex gap-4">
            <Portrait name={carer.user.name} size={72} />
            <div>
              <h1 className="text-3xl font-semibold text-ink">{carer.user.name}</h1>
              {isOwner ? (
                <p className="mt-1 text-sm">
                  <Link href="/dashboard/profile" className="text-teal">
                    Edit your profile
                  </Link>
                </p>
              ) : null}
              <p className="mt-1 text-stone-600">{carer.headline}</p>
              <p className="mt-1 text-sm text-stone-500">
                {primary ? (
                  <Link
                    href={`/caregivers/${primary.slug}/${carer.city.state.slug}/${carer.city.slug}/${slugifySuburb(carer.suburb)}`}
                    className="hover:text-teal"
                  >
                    {carer.suburb}, {carer.city.name} {carer.city.state.abbrev}
                  </Link>
                ) : (
                  <>
                    {carer.suburb}, {carer.city.name} {carer.city.state.abbrev}
                  </>
                )}{" "}
                · {carer.yearsExperience} years
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone="teal">{trustLabel(carer.trustScore)} · {carer.trustScore}/100</Badge>
                {carer.instantBook ? <Badge tone="clay">Instant Book</Badge> : null}
                {carer.availableNow ? <Badge>Available now</Badge> : null}
                <span className="text-sm text-stone-500">{lastActiveLabel(carer.lastActiveAt)}</span>
                {carer.reviewCount > 0 ? (
                  <span className="text-sm text-stone-600">
                    {carer.ratingAvg.toFixed(1)} ★ ({carer.reviewCount})
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-ink">Verified checks</h2>
            <p className="mt-2 text-sm text-stone-600">
              CareProof records credentials as first-class documents with expiry dates. Reviews can only be left after
              a released escrow booking.
            </p>
            <CredentialDetails credentials={carer.credentials} abn={carer.abn} />
          </section>

          {carer.availabilityNote || carer.weeklyHours ? (
            <section className="mt-8">
              <h2 className="text-xl font-semibold text-ink">Availability</h2>
              {weeklyHourChips(carer.weeklyHours).length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {weeklyHourChips(carer.weeklyHours).map((chip) => (
                    <span key={chip} className="rounded-full bg-sage px-3 py-1 text-sm text-teal-deep">
                      {chip}
                    </span>
                  ))}
                </div>
              ) : null}
              {carer.availabilityNote ? <p className="mt-2 text-stone-700">{carer.availabilityNote}</p> : null}
            </section>
          ) : null}

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-ink">About</h2>
            <p className="mt-2 whitespace-pre-line text-stone-700">{carer.bio}</p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-ink">Verified work history</h2>
            <ol className="mt-4 space-y-4">
              {carer.workHistory.map((role) => (
                <li key={role.id} className="rounded-2xl border border-line bg-card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-ink">{role.title}</p>
                      <p className="text-sm text-stone-600">{role.employer}</p>
                    </div>
                    <Badge tone={role.verification === "unverified" ? "stone" : "sage"}>
                      {WORK_VERIFICATION_LABELS[role.verification] ?? role.verification}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-stone-500">
                    {monthYear(role.startDate)} – {role.endDate ? monthYear(role.endDate) : "Present"} · {role.hours.toLocaleString("en-AU")} hours
                  </p>
                  <p className="mt-2 text-sm text-stone-700">{role.duties}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-ink">Reviews from completed bookings</h2>
            {carer.reviews.length === 0 ? (
              <p className="mt-2 text-sm text-stone-500">No released bookings have been reviewed yet.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {carer.reviews.map((review) => (
                  <li key={review.id} className="rounded-2xl border border-line bg-card p-4">
                    <p className="text-sm font-medium text-ink">
                      {review.author.name} · {"★".repeat(review.rating)}
                    </p>
                    <p className="mt-1 text-sm text-stone-700">{review.body}</p>
                    <p className="mt-2 text-xs text-stone-500">{formatDate(review.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-line bg-card p-5 md:sticky md:top-6">
          <p className="text-3xl font-semibold text-teal">{formatAud(carer.hourlyRateCents)}</p>
          <p className="text-sm text-stone-500">per hour, inc GST</p>
          <p className="mt-3 text-sm text-stone-600">
            {carer.instantBook
              ? "Instant Book — pay into escrow now and the carer is confirmed."
              : "Request to book — the carer accepts, then you fund escrow."}
          </p>
          {carer.weeklyHours ? <p className="mt-3 text-sm font-medium text-teal-deep">{carer.weeklyHours}</p> : null}
          {carer.availabilityNote ? <p className="mt-3 text-sm text-stone-700">{carer.availabilityNote}</p> : null}
          <p className="mt-2 text-xs text-stone-500">{lastActiveLabel(carer.lastActiveAt)}</p>
          <Link
            href={`/caregiver/${carer.slug}/book`}
            className="mt-4 block rounded-xl bg-teal py-3 text-center font-semibold text-white no-underline hover:bg-teal-deep"
          >
            {carer.instantBook ? "Book now" : "Request to book"}
          </Link>
          <div className="mt-3">
            <ShortlistButton
              caregiverId={carer.id}
              saved={savedIds.has(carer.id)}
              signedIn={Boolean(canShortlist)}
              next={`/caregiver/${carer.slug}`}
            />
          </div>
          <p className="mt-3 text-xs text-stone-500">
            Specialties: {carer.specialties.map((s) => s.specialty.name).join(", ")}
          </p>
        </aside>
      </div>

      {similar.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-ink">Similar carers</h2>
          <div className="mt-4 space-y-4">
            {similar.map((item) => (
              <CaregiverCardView
                key={item.id}
                caregiver={item}
                shortlist={{
                  saved: savedIds.has(item.id),
                  signedIn: Boolean(canShortlist),
                  next: `/caregiver/${carer.slug}`,
                }}
              />
            ))}
          </div>
        </section>
      ) : null}
      <MobileBookBar slug={carer.slug} hourlyRateCents={carer.hourlyRateCents} instantBook={carer.instantBook} />
    </div>
  );
}
