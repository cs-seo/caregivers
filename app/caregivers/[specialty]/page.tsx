import { notFound } from "next/navigation";
import { DirectoryResults } from "@/components/directory-page";
import { FaqBlock, LinkGrid, RelatedSpecialties } from "@/components/seo-landing";
import { filterCurrent, parseFilters } from "@/lib/directory";
import { isInviteFlash } from "@/lib/job-invite";
import { HIRE_GUIDES, landingDescription, landingFaqs, landingH1, landingIntro, landingTitle } from "@/lib/seo-content";
import { directoryStats, getSpecialties, getSpecialty, getStates } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ specialty: string }>;
}) {
  const { specialty } = await params;
  const record = await getSpecialty(specialty);
  if (!record) return {};
  const place = { specialty: record };
  return pageMeta({
    title: landingTitle(place),
    description: landingDescription(place),
    path: `/caregivers/${record.slug}`,
  });
}

export default async function SpecialtyPage({
  params,
  searchParams,
}: {
  params: Promise<{ specialty: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ specialty }, query] = await Promise.all([params, searchParams]);
  const [record, states, specialties] = await Promise.all([
    getSpecialty(specialty),
    getStates(),
    getSpecialties(),
  ]);
  if (!record) notFound();
  const filters = { ...parseFilters(query), specialty: record.slug };
  const stats = await directoryStats(filters);
  const place = { specialty: record };
  const guide = HIRE_GUIDES.find((item) => item.specialty === record.slug);

  return (
    <DirectoryResults
      title={landingH1(place)}
      intro={landingIntro(place, stats)}
      breadcrumbs={[
        { name: "Home", href: "/" },
        { name: "Carers", href: "/caregivers" },
        { name: record.pluralName },
      ]}
      filters={filters}
      filterAction={`/caregivers/${record.slug}`}
      current={filterCurrent(filters)}
      path={`/caregivers/${record.slug}`}
      invited={isInviteFlash(query.invited)}
      extras={
        <>
          <FaqBlock faqs={landingFaqs(place)} />
          <RelatedSpecialties place={place} specialties={specialties} />
          <LinkGrid
            title={`${record.pluralName} by state`}
            links={states.map((state) => ({
              href: `/caregivers/${record.slug}/${state.slug}`,
              label: `${record.pluralName} in ${state.name}`,
            }))}
          />
          <LinkGrid
            title={`Popular cities for ${record.pluralName.toLowerCase()}`}
            links={states.flatMap((state) =>
              state.cities
                .filter((city) =>
                  ["sydney", "melbourne", "brisbane", "perth", "adelaide", "canberra", "hobart", "darwin", "gold-coast", "newcastle", "geelong"].includes(
                    city.slug,
                  ),
                )
                .map((city) => ({
                  href: `/caregivers/${record.slug}/${state.slug}/${city.slug}`,
                  label: `${record.pluralName} in ${city.name}`,
                })),
            )}
          />
          {guide ? (
            <LinkGrid
              title="Hiring guide"
              links={[{ href: `/guides/${guide.slug}`, label: guide.title }]}
            />
          ) : null}
        </>
      }
    />
  );
}
