import { notFound } from "next/navigation";
import { DirectoryResults } from "@/components/directory-page";
import { FaqBlock, LinkGrid, RelatedSpecialties } from "@/components/seo-landing";
import { filterCurrent, parseFilters } from "@/lib/directory";
import { landingDescription, landingFaqs, landingH1, landingIntro, landingTitle } from "@/lib/seo-content";
import { directoryStats, getSpecialties, getSpecialty, getState } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ specialty: string; state: string }>;
}) {
  const { specialty, state } = await params;
  const [spec, st] = await Promise.all([getSpecialty(specialty), getState(state)]);
  if (!spec || !st) return {};
  const place = { specialty: spec, state: st };
  return pageMeta({
    title: landingTitle(place),
    description: landingDescription(place),
    path: `/caregivers/${spec.slug}/${st.slug}`,
  });
}

export default async function StateDirectoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ specialty: string; state: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ specialty, state }, query] = await Promise.all([params, searchParams]);
  const [spec, st, specialties] = await Promise.all([
    getSpecialty(specialty),
    getState(state),
    getSpecialties(),
  ]);
  if (!spec || !st) notFound();
  const filters = { ...parseFilters(query), specialty: spec.slug, state: st.slug };
  const stats = await directoryStats(filters);
  const place = { specialty: spec, state: st };

  return (
    <DirectoryResults
      title={landingH1(place)}
      intro={landingIntro(place, stats)}
      breadcrumbs={[
        { name: "Home", href: "/" },
        { name: "Carers", href: "/caregivers" },
        { name: spec.pluralName, href: `/caregivers/${spec.slug}` },
        { name: st.abbrev },
      ]}
      filters={filters}
      filterAction={`/caregivers/${spec.slug}/${st.slug}`}
      current={filterCurrent(filters)}
      path={`/caregivers/${spec.slug}/${st.slug}`}
      extras={
        <>
          <FaqBlock faqs={landingFaqs(place)} />
          <RelatedSpecialties place={place} specialties={specialties} />
          <LinkGrid
            title={`Cities in ${st.name}`}
            links={st.cities.map((city) => ({
              href: `/caregivers/${spec.slug}/${st.slug}/${city.slug}`,
              label: `${spec.pluralName} in ${city.name}`,
            }))}
          />
        </>
      }
    />
  );
}
