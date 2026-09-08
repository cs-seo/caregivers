import { notFound } from "next/navigation";
import { DirectoryResults } from "@/components/directory-page";
import { FaqBlock, LinkGrid, RelatedSpecialties } from "@/components/seo-landing";
import { filterCurrent, parseFilters } from "@/lib/directory";
import { isInviteFlash } from "@/lib/job-invite";
import { jobBoardHref, openRequestsNotice } from "@/lib/job-board";
import { acceptingJobWhere } from "@/lib/job-status";
import { landingDescription, landingFaqs, landingH1, landingIntro, landingTitle } from "@/lib/seo-content";
import { directoryStats, getSpecialties, getSpecialty, getSuburb } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ specialty: string; state: string; city: string; suburb: string }>;
}) {
  const { specialty, state, city, suburb } = await params;
  const [spec, place] = await Promise.all([getSpecialty(specialty), getSuburb(state, city, suburb)]);
  if (!spec || !place) return {};
  const seo = { specialty: spec, state: place.city.state, city: place.city, suburb: place };
  return pageMeta({
    title: landingTitle(seo),
    description: landingDescription(seo),
    path: `/caregivers/${spec.slug}/${place.city.state.slug}/${place.city.slug}/${place.slug}`,
  });
}

export default async function SuburbDirectoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ specialty: string; state: string; city: string; suburb: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ specialty, state, city, suburb }, query] = await Promise.all([params, searchParams]);
  const [spec, place, specialties] = await Promise.all([
    getSpecialty(specialty),
    getSuburb(state, city, suburb),
    getSpecialties(),
  ]);
  if (!spec || !place) notFound();

  const filters = {
    ...parseFilters(query),
    specialty: spec.slug,
    state: place.city.state.slug,
    city: place.city.slug,
    suburb: place.name,
  };
  const locationFilters = {
    specialty: spec.slug,
    state: place.city.state.slug,
    city: place.city.slug,
    suburb: place.name,
  };
  const [exactStats, openCount] = await Promise.all([
    directoryStats(locationFilters),
    prisma.careRequest.count({
      where: { ...acceptingJobWhere(), cityId: place.city.id, specialtyId: spec.id },
    }),
  ]);
  const nearby = exactStats.count === 0;
  const stats = nearby
    ? await directoryStats({ specialty: spec.slug, state: place.city.state.slug, city: place.city.slug })
    : exactStats;
  const seo = { specialty: spec, state: place.city.state, city: place.city, suburb: place };
  const siblingSuburbs = place.city.suburbs.filter((item) => item.slug !== place.slug).slice(0, 18);

  return (
    <DirectoryResults
      title={landingH1(seo)}
      intro={landingIntro(seo, stats)}
      nearbyNote={
        nearby
          ? `No ${spec.pluralName.toLowerCase()} are listed in ${place.name} yet. Showing verified carers who cover greater ${place.city.name}, including ${place.name}.`
          : undefined
      }
      breadcrumbs={[
        { name: "Home", href: "/" },
        { name: "Carers", href: "/caregivers" },
        { name: spec.pluralName, href: `/caregivers/${spec.slug}` },
        { name: place.city.state.abbrev, href: `/caregivers/${spec.slug}/${place.city.state.slug}` },
        { name: place.city.name, href: `/caregivers/${spec.slug}/${place.city.state.slug}/${place.city.slug}` },
        { name: place.name },
      ]}
      filters={filters}
      filterAction={`/caregivers/${spec.slug}/${place.city.state.slug}/${place.city.slug}/${place.slug}`}
      current={filterCurrent(filters)}
      path={`/caregivers/${spec.slug}/${place.city.state.slug}/${place.city.slug}/${place.slug}`}
      invited={isInviteFlash(query.invited)}
      openRequests={
        openCount
          ? {
              href: jobBoardHref({ city: place.city.slug, specialty: spec.slug }),
              label: openRequestsNotice(openCount, place.city.name, spec.name),
            }
          : null
      }
      extras={
        <>
          <FaqBlock faqs={landingFaqs(seo)} />
          <RelatedSpecialties place={seo} specialties={specialties} />
          <LinkGrid
            title={`Other ${place.city.name} suburbs`}
            links={siblingSuburbs.map((item) => ({
              href: `/caregivers/${spec.slug}/${place.city.state.slug}/${place.city.slug}/${item.slug}`,
              label: `${spec.pluralName} in ${item.name}`,
            }))}
          />
          <LinkGrid
            title={`All ${spec.pluralName.toLowerCase()} in ${place.city.name}`}
            links={[
              {
                href: `/caregivers/${spec.slug}/${place.city.state.slug}/${place.city.slug}`,
                label: `${spec.pluralName} across ${place.city.name}`,
              },
            ]}
          />
        </>
      }
    />
  );
}
