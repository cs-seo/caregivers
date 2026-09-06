import Link from "next/link";
import { CaregiverCardView } from "@/components/caregiver-card";
import { JsonLd } from "@/components/json-ld";
import { SearchForm } from "@/components/search-form";
import { SITE_NAME, siteUrl } from "@/lib/constants";
import { formatAud } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { caregiverCardInclude, getCityHubs, getRecentReviews, getShortlistedIds, getSpecialties, withTrust } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: `${SITE_NAME} — Verified carers across Australia`,
  description:
    "Hire verified aged care workers, nannies, NDIS support workers and housekeepers. Instant Book with escrow so carers are paid only after the job is complete.",
  path: "/",
});

export default async function HomePage() {
  const viewer = await requireUser();
  const [specialties, featured, stats, hubs, reviews, savedIds] = await Promise.all([
    getSpecialties(),
    prisma.caregiverProfile.findMany({
      where: { reviewCount: { gt: 0 } },
      include: caregiverCardInclude,
      orderBy: { ratingAvg: "desc" },
      take: 4,
    }),
    prisma.caregiverProfile.aggregate({
      _count: true,
      _avg: { hourlyRateCents: true },
    }),
    getCityHubs(),
    getRecentReviews(4),
    getShortlistedIds(viewer?.role === "FAMILY" ? viewer.id : null),
  ]);
  const canShortlist = viewer?.role === "FAMILY";

  return (
    <div className="space-y-16">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: SITE_NAME,
            url: siteUrl(),
            description: "Australian marketplace for verified carers with escrow payments.",
            areaServed: "AU",
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE_NAME,
            url: siteUrl(),
            potentialAction: {
              "@type": "SearchAction",
              target: `${siteUrl()}/caregivers?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          },
        ]}
      />

      <section className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-clay">Australia-wide directory</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-ink md:text-5xl">
            Book verified carers the way you hire on Upwork.
          </h1>
          <p className="mt-4 text-lg text-stone-600">
            Search by specialty and city, check work history, then Instant Book. Your payment is held in escrow
            and released to the carer only when the booking is complete.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/caregivers"
              className="rounded-full bg-teal px-5 py-2.5 font-medium text-white no-underline hover:bg-teal-deep"
            >
              Find a carer
            </Link>
            <Link
              href="/post-a-job"
              className="rounded-full border border-teal px-5 py-2.5 font-medium text-teal no-underline hover:bg-sage"
            >
              Post a care request
            </Link>
          </div>
          <p className="mt-4 text-sm text-stone-500">
            {stats._count} verified profiles · typical rate{" "}
            {formatAud(Math.round(stats._avg.hourlyRateCents ?? 0))}/hr
          </p>
          <ul className="mt-5 flex flex-wrap gap-2 text-xs text-stone-600">
            {["WWCC / Blue Card / Ochre Card", "NDIS Worker Screening", "AHPRA for nurses", "Escrow until care is done"].map(
              (item) => (
                <li key={item} className="rounded-full border border-line bg-card px-3 py-1">
                  {item}
                </li>
              ),
            )}
          </ul>
        </div>
        <SearchForm />
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-ink">Popular local searches</h2>
        <p className="mt-2 text-sm text-stone-600">
          Long-tail pages for the way people actually search — suburb plus care type.
        </p>
        <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2 md:grid-cols-3">
          {[
            ["/caregivers/nannies/nsw/sydney/bondi", "Nannies in Bondi"],
            ["/caregivers/aged-care/nsw/sydney/marrickville", "Aged care in Marrickville"],
            ["/caregivers/disability-support/vic/melbourne/brunswick", "NDIS support in Brunswick"],
            ["/caregivers/babysitters/qld/brisbane/paddington", "Babysitters in Paddington"],
            ["/caregivers/nannies/wa/perth/claremont", "Nannies in Claremont"],
            ["/caregivers/aged-care/sa/adelaide/norwood", "Aged care in Norwood"],
            ["/caregivers/after-school-care/act/canberra/griffith", "After-school care in Griffith"],
            ["/caregivers/nursing/tas/hobart/sandy-bay", "Nurses in Sandy Bay"],
            ["/caregivers/disability-support/nt/darwin/nightcliff", "Support workers in Nightcliff"],
          ].map(([href, label]) => (
            <li key={href}>
              <Link className="text-teal hover:underline" href={href}>
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm">
          <Link href="/locations" className="text-teal">
            Browse every city and suburb
          </Link>
          {" · "}
          <Link href="/guides" className="text-teal">
            Hiring guides
          </Link>
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-ink">Built for Australian care</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-line bg-card p-5">
            <h3 className="font-semibold text-ink">My Aged Care packages</h3>
            <p className="mt-2 text-sm text-stone-600">
              Book in-home personal care, respite and nursing against a Home Care Package. Rates are inc GST so the
              invoice matches what coordinators expect.
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-card p-5">
            <h3 className="font-semibold text-ink">NDIS plan-managed or self-managed</h3>
            <p className="mt-2 text-sm text-stone-600">
              Support workers list NDIS Worker Screening and shift notes. Escrow holds the session fee until the
              booking is released — useful when a plan manager needs evidence.
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-card p-5">
            <h3 className="font-semibold text-ink">State checks, not a generic badge</h3>
            <p className="mt-2 text-sm text-stone-600">
              NSW WWCC, Queensland Blue Card, NT Ochre Card, ACT WWVP and Aged Care Worker Screening sit on the
              profile with expiry dates.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-ink">Capital-city hubs</h2>
        <p className="mt-2 text-sm text-stone-600">Live listings, not a brochure. Open a city then filter by suburb.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-5">
          {hubs.map((city) => (
            <Link
              key={city.id}
              href={`/locations/${city.state.slug}/${city.slug}`}
              className="rounded-2xl border border-line bg-card p-4 no-underline hover:border-teal"
            >
              <p className="font-semibold text-ink">{city.name}</p>
              <p className="mt-1 text-sm text-stone-500">
                {city._count.caregivers} carers · {city.state.abbrev}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-ink">Browse by care type</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {specialties.map((specialty) => (
            <Link
              key={specialty.id}
              href={`/caregivers/${specialty.slug}`}
              className="rounded-2xl border border-line bg-card p-4 no-underline hover:border-teal"
            >
              <p className="font-semibold text-teal">{specialty.pluralName}</p>
              <p className="mt-1 text-sm text-stone-600">{specialty.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold text-ink">Highly reviewed carers</h2>
          <Link href="/caregivers" className="text-sm text-teal">
            View directory
          </Link>
        </div>
        <div className="mt-5 grid gap-4">
          {featured.map((carer) => (
            <CaregiverCardView
              key={carer.id}
              caregiver={withTrust(carer)}
              shortlist={{
                saved: savedIds.has(carer.id),
                signedIn: Boolean(canShortlist),
                next: "/",
              }}
            />
          ))}
        </div>
      </section>

      {reviews.length > 0 ? (
        <section>
          <h2 className="text-2xl font-semibold text-ink">Reviews from released bookings</h2>
          <p className="mt-2 text-sm text-stone-600">Families can only review after escrow is released.</p>
          <ul className="mt-5 grid gap-4 md:grid-cols-2">
            {reviews.map((review) => (
              <li key={review.id} className="rounded-2xl border border-line bg-card p-5">
                <p className="text-sm font-medium text-ink">
                  {review.author.name} · {"★".repeat(review.rating)}
                </p>
                <p className="mt-2 text-sm text-stone-700">{review.body}</p>
                <p className="mt-3 text-xs text-stone-500">
                  <Link href={`/caregiver/${review.caregiver.slug}`} className="text-teal">
                    {review.caregiver.user.name}
                  </Link>
                  {" · "}
                  {review.caregiver.suburb}, {review.caregiver.city.name} {review.caregiver.city.state.abbrev}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="grid gap-6 rounded-3xl bg-teal px-6 py-10 text-white md:grid-cols-3">
        <div>
          <p className="text-sm uppercase tracking-wide text-sage">1. Choose</p>
          <h3 className="mt-2 text-xl font-semibold">Verified experience</h3>
          <p className="mt-2 text-sage">
            Every profile shows WWCC, NDIS screening, AHPRA and employer-confirmed work history — not just a bio.
          </p>
        </div>
        <div>
          <p className="text-sm uppercase tracking-wide text-sage">2. Book</p>
          <h3 className="mt-2 text-xl font-semibold">Hire in a few clicks</h3>
          <p className="mt-2 text-sage">
            Instant Book from a profile, or post a request and compare proposals the way you would on Upwork.
          </p>
        </div>
        <div>
          <p className="text-sm uppercase tracking-wide text-sage">3. Pay safely</p>
          <h3 className="mt-2 text-xl font-semibold">Escrow, then release</h3>
          <p className="mt-2 text-sage">
            CareProof collects payment first. The carer is paid only when you confirm — or automatically after 72 hours.
          </p>
        </div>
      </section>
    </div>
  );
}
