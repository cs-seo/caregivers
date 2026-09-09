import { notFound } from "next/navigation";
import { DirectoryResults } from "@/components/directory-page";
import { FaqBlock, LinkGrid, RelatedSpecialties } from "@/components/seo-landing";
import { filterCurrent, parseFilters } from "@/lib/directory";
import { isInviteFlash } from "@/lib/job-invite";
import { jobBoardHref, openRequestsNotice } from "@/lib/job-board";
import { acceptingJobWhere } from "@/lib/job-status";
import { landingDescription, landingFaqs, landingH1, landingIntro, landingTitle } from "@/lib/seo-content";
import { directoryStats, getCity, getSpecialties, getSpecialty, getState } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ specialty: string; state: string; city: string }>;
}) {
  const { specialty, state, city } = await params;
  const [spec, place] = await Promise.all([getSpecialty(specialty), getCity(state, city)]);
  if (!spec || !place) return {};
  const seo = { specialty: spec, state: place.state, city: place };
  return pageMeta({
    title: landingTitle(seo),
    description: landingDescription(seo),
    path: `/caregivers/${spec.slug}/${place.state.slug}/${place.slug}`,
  });
}

export default async function CityDirectoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ specialty: string; state: string; city: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ specialty, state, city }, query] = await Promise.all([params, searchParams]);
  const [spec, place, st, specialties] = await Promise.all([
    getSpecialty(specialty),
    getCity(state, city),
    getState(state),
    getSpecialties(),
  ]);
  if (!spec || !place) notFound();
  const filters = {
    ...parseFilters(query),
    specialty: spec.slug,
    state: place.state.slug,
    city: place.slug,
  };
  const [stats, openCount] = await Promise.all([
    directoryStats(filters),
    prisma.careRequest.count({
      where: { ...acceptingJobWhere(), cityId: place.id, specialtyId: spec.id },
    }),
  ]);
  const seo = { specialty: spec, state: place.state, city: place };
  const nearby = (st?.cities ?? []).filter((item) => item.slug !== place.slug).slice(0, 10);
  const suburbs = place.suburbs ?? [];

  return (
    <DirectoryResults
      title={landingH1(seo)}
      intro={landingIntro(seo, stats)}
      breadcrumbs={[
        { name: "Home", href: "/" },
        { name: "Carers", href: "/caregivers" },
        { name: spec.pluralName, href: `/caregivers/${spec.slug}` },
        { name: place.state.abbrev, href: `/caregivers/${spec.slug}/${place.state.slug}` },
        { name: place.name },
      ]}
      filters={filters}
      filterAction={`/caregivers/${spec.slug}/${place.state.slug}/${place.slug}`}
      current={filterCurrent(filters)}
      invited={isInviteFlash(query.invited)}
      path={`/caregivers/${spec.slug}/${place.state.slug}/${place.slug}`}
      openRequests={
        openCount
          ? {
              href: jobBoardHref({ city: place.slug, specialty: spec.slug }),
              label: openRequestsNotice(openCount, place.name, spec.name),
            }
          : null
      }
      extras={
        <>
          <FaqBlock faqs={landingFaqs(seo)} />
          <RelatedSpecialties place={seo} specialties={specialties} />
          <LinkGrid
            title={`${spec.pluralName} by suburb in ${place.name}`}
            links={suburbs.map((suburb) => ({
              href: `/caregivers/${spec.slug}/${place.state.slug}/${place.slug}/${suburb.slug}`,
              label: `${spec.pluralName} in ${suburb.name}`,
            }))}
          />
          <LinkGrid
            title="Nearby cities"
            links={nearby.map((item) => ({
              href: `/caregivers/${spec.slug}/${place.state.slug}/${item.slug}`,
              label: `${spec.pluralName} in ${item.name}`,
            }))}
          />
        </>
      }
    />
  );
}
