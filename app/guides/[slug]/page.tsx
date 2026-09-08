import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { HIRE_GUIDES, childCheckLabel } from "@/lib/seo-content";
import { guideBoardLink, guideBoardNotice } from "@/lib/job-board";
import { getSpecialty, getStates } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = HIRE_GUIDES.find((item) => item.slug === slug);
  if (!guide) return {};
  return pageMeta({
    title: guide.title,
    description: guide.description,
    path: `/guides/${guide.slug}`,
  });
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = HIRE_GUIDES.find((item) => item.slug === slug);
  if (!guide) notFound();
  const [specialty, states] = await Promise.all([getSpecialty(guide.specialty), getStates()]);
  if (!specialty) notFound();
  const board = guideBoardLink(specialty);

  const capitals = states.flatMap((state) =>
    state.cities
      .filter((city) =>
        ["sydney", "melbourne", "brisbane", "perth", "adelaide", "canberra", "hobart", "darwin"].includes(city.slug),
      )
      .map((city) => ({
        href: `/caregivers/${specialty.slug}/${state.slug}/${city.slug}`,
        label: `${specialty.pluralName} in ${city.name}`,
      })),
  );

  return (
    <article className="mx-auto max-w-3xl">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: guide.h1,
          description: guide.description,
          keywords: guide.keywords.join(", "),
          author: { "@type": "Organization", name: "CareProof" },
        }}
      />
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Guides", href: "/guides" },
          { name: guide.title },
        ]}
      />
      <p className="text-sm font-medium uppercase tracking-wide text-clay">Hiring guide</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink">{guide.h1}</h1>
      <p className="mt-4 text-lg text-stone-600">{guide.description}</p>

      <h2 className="mt-10 text-xl font-semibold">What to look for</h2>
      <p className="mt-3 text-stone-700">
        {specialty.description} On CareProof, every {specialty.name.toLowerCase()} profile shows verified work history —
        employer confirmed, document checked, or completed on the platform — plus screening expiry dates.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Checks by state</h2>
      <p className="mt-3 text-stone-700">
        Child-related care uses a different clearance in each state. NSW and Victoria use a Working with Children Check.
        Queensland uses a Blue Card. The NT uses an Ochre Card. Tasmania and the ACT use WWVP registration.
      </p>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-stone-700">
        {states.map((state) => (
          <li key={state.id}>
            <Link className="text-teal hover:underline" href={`/caregivers/${specialty.slug}/${state.slug}`}>
              {state.name}
            </Link>
            : {childCheckLabel(state.slug)}
          </li>
        ))}
      </ul>

      {"extra" in guide && guide.extra ? (
        <>
          <h2 className="mt-8 text-xl font-semibold">On CareProof</h2>
          {guide.extra.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className="mt-3 text-stone-700">
              {paragraph}
            </p>
          ))}
        </>
      ) : null}

      {guide.slug === "hire-a-babysitter" ? (
        <>
          <h2 className="mt-8 text-xl font-semibold">Date night, last-minute and overnight</h2>
          <p className="mt-3 text-stone-700">
            Australian parents already book sitters this way: a Friday date night, a same-day cancellation, or a hotel
            stay while visiting. On CareProof those sits use Instant Book and escrow. The hourly rate is for the
            household — no extra per sibling — and first aid on babysitting listings covers asthma and anaphylaxis.
          </p>
        </>
      ) : null}

      <h2 className="mt-8 text-xl font-semibold">How booking works</h2>
      <p className="mt-3 text-stone-700">
        Instant Book pays into escrow immediately. Request-to-book waits for the carer to accept. Job posts collect
        proposals you can hire with one click. The carer is paid only after you confirm — or automatically after 72 hours.
      </p>
      <p className="mt-6 text-sm text-stone-600">
        {guideBoardNotice(specialty.name)}{" "}
        <Link href={board.href} className="font-medium text-teal hover:underline">
          {board.label}
        </Link>
        .
      </p>

      <p className="mt-8">
        <Link
          href={`/caregivers/${specialty.slug}`}
          className="inline-block rounded-full bg-teal px-5 py-2.5 font-medium text-white no-underline"
        >
          Browse {specialty.pluralName.toLowerCase()}
        </Link>
      </p>

      <h2 className="mt-12 text-xl font-semibold">Find {specialty.pluralName.toLowerCase()} by city</h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {capitals.map((link) => (
          <li key={link.href}>
            <Link className="text-teal hover:underline" href={link.href}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
