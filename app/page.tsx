import Link from "next/link";
import { CaregiverCardView } from "@/components/caregiver-card";
import { JsonLd } from "@/components/json-ld";
import { ReviewCard } from "@/components/review-card";
import { SearchForm } from "@/components/search-form";
import { SITE_NAME, siteUrl } from "@/lib/constants";
import {
  forCarersHomeCta,
  forCarersHomeHeading,
  forCarersHomeHref,
  forCarersHomeNotice,
  forCarersRegisterHref,
} from "@/lib/for-carers";
import { homeFamilyLinks, homeFamilyNotice } from "@/lib/home-family";
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
          <p className="mt-3 text-sm text-stone-500">
            Carers:{" "}
            <Link href={forCarersHomeHref()} className="font-medium text-teal hover:underline">
              {forCarersHomeCta()}
            </Link>
          </p>
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
          {viewer?.role === "FAMILY" ? (
            <div className="mt-6 rounded-xl bg-sage p-3 text-sm">
              <p>{homeFamilyNotice()}</p>
              <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {homeFamilyLinks().map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="font-medium text-teal hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
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
            ["/caregivers/babysitters/nsw/sydney/newtown", "Date-night babysitters in Newtown"],
            ["/caregivers/babysitters/vic/melbourne/fitzroy", "Babysitters in Fitzroy"],
            ["/caregivers/nannies/nsw/sydney/bondi", "Nannies in Bondi"],
            ["/caregivers/aged-care/nsw/sydney/marrickville", "Aged care in Marrickville"],
            ["/caregivers/disability-support/vic/melbourne/brunswick", "NDIS support in Brunswick"],
            ["/caregivers/babysitters/qld/brisbane/paddington", "Babysitters in Paddington"],
            ["/caregivers/nannies/wa/perth/claremont", "Nannies in Claremont"],
            ["/caregivers/babysitters/sa/adelaide/norwood", "Date-night babysitters in Norwood"],
            ["/caregivers/aged-care/sa/adelaide/norwood", "Aged care in Norwood"],
            ["/caregivers/babysitters/tas/hobart/battery-point", "Babysitters in Battery Point"],
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

      <section className="rounded-3xl border border-line bg-card px-6 py-8">
        <p className="text-sm font-medium uppercase tracking-wide text-clay">Date night · last-minute · overnight</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Babysitters you can book like a ride</h2>
        <p className="mt-2 max-w-3xl text-stone-600">
          Book a vetted sitter for Friday night without an agency membership. CareProof adds escrow, suburb pages, and
          WWCC plus child first aid (asthma and anaphylaxis) on every babysitting listing.
        </p>
        <ul className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
          <li className="rounded-2xl bg-sage/70 p-4">
            <p className="font-semibold text-ink">One-off or recurring</p>
            <p className="mt-1 text-stone-600">
              Date night tonight, or book 4–12 standing Fridays. Each week is its own escrow hold.
            </p>
          </li>
          <li className="rounded-2xl bg-sage/70 p-4">
            <p className="font-semibold text-ink">No extra per sibling</p>
            <p className="mt-1 text-stone-600">The advertised hourly rate is for the household, not per child.</p>
          </li>
          <li className="rounded-2xl bg-sage/70 p-4">
            <p className="font-semibold text-ink">Reviews after the sit</p>
            <p className="mt-1 text-stone-600">
              Only families with a released escrow booking can leave a rating. Carers can publish one public reply.
            </p>
          </li>
        </ul>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/caregivers/babysitters" className="rounded-full bg-teal px-5 py-2.5 text-sm font-medium text-white no-underline">
            Browse babysitters
          </Link>
          <Link href="/caregivers/nannies" className="rounded-full border border-teal px-5 py-2.5 text-sm font-medium text-teal no-underline">
            Find a regular nanny
          </Link>
          <Link href="/guides/hire-a-babysitter" className="text-sm font-medium text-teal">
            How to book a sitter
          </Link>
        </div>
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

      <section className="rounded-3xl border border-line bg-card px-6 py-8">
        <h2 className="text-2xl font-semibold text-ink">{forCarersHomeHeading()}</h2>
        <p className="mt-2 max-w-3xl text-stone-600">{forCarersHomeNotice()}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={forCarersHomeHref()}
            className="rounded-full bg-teal px-5 py-2.5 text-sm font-medium text-white no-underline"
          >
            {forCarersHomeCta()}
          </Link>
          <Link
            href={forCarersRegisterHref()}
            className="rounded-full border border-teal px-5 py-2.5 text-sm font-medium text-teal no-underline"
          >
            Create a carer profile
          </Link>
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
          <p className="mt-2 text-sm text-stone-600">
            Families can only review after escrow is released. Carers can publish one public reply.
          </p>
          <ul className="mt-5 grid gap-4 md:grid-cols-2">
            {reviews.map((review) => (
              <li key={review.id} className="rounded-2xl border border-line bg-card p-5">
                <ReviewCard
                  authorName={review.author.name}
                  rating={review.rating}
                  body={review.body}
                  createdAt={review.createdAt}
                  caregiverName={review.caregiver.user.name}
                  caregiverHref={`/caregiver/${review.caregiver.slug}`}
                  location={`${review.caregiver.suburb}, ${review.caregiver.city.name} ${review.caregiver.city.state.abbrev}`}
                  reply={review.reply}
                  repliedAt={review.repliedAt}
                />
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
