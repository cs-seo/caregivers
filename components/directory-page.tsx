import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CaregiverCardView } from "@/components/caregiver-card";
import { DirectoryFilters } from "@/components/directory-filters";
import { JsonLd } from "@/components/json-ld";
import { SearchForm } from "@/components/search-form";
import { emptyStateLinks, filterHref } from "@/lib/directory";
import { formatAud } from "@/lib/money";
import type { DirectoryFilters as Filters } from "@/lib/queries";
import { directoryStats, getShortlistedIds, searchCaregiversPage } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { breadcrumbJsonLd } from "@/lib/seo";
import { siteUrl } from "@/lib/constants";

export async function DirectoryResults({
  title,
  intro,
  breadcrumbs,
  filters,
  filterAction,
  current,
  path,
  nearbyNote,
  extras,
}: {
  title: string;
  intro: string;
  breadcrumbs: { name: string; href?: string }[];
  filters: Filters;
  filterAction: string;
  current: Record<string, string | undefined>;
  path: string;
  nearbyNote?: string;
  extras?: React.ReactNode;
}) {
  const listFilters = nearbyNote ? { ...filters, suburb: undefined } : filters;
  const viewer = await requireUser();
  const [page, stats, savedIds] = await Promise.all([
    searchCaregiversPage(listFilters),
    directoryStats(listFilters),
    getShortlistedIds(viewer?.role === "FAMILY" ? viewer.id : null),
  ]);
  const caregivers = page.caregivers;
  const canShortlist = viewer?.role === "FAMILY";

  return (
    <div>
      <JsonLd
        data={[
          breadcrumbJsonLd(
            breadcrumbs
              .filter((item) => item.href)
              .map((item) => ({ name: item.name, path: item.href! })),
          ),
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: title,
            description: intro,
            areaServed: "AU",
            provider: { "@type": "Organization", name: "CareProof" },
            url: `${siteUrl()}${path}`,
          },
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: title,
            url: `${siteUrl()}${path}`,
            numberOfItems: caregivers.length,
            itemListElement: caregivers.map((carer, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: `${siteUrl()}/caregiver/${carer.slug}`,
              name: carer.user.name,
            })),
          },
        ]}
      />
      <Breadcrumbs items={breadcrumbs} />
      <h1 className="text-3xl font-semibold text-ink">{title}</h1>
      <p className="mt-3 max-w-3xl text-pretty text-stone-600">{intro}</p>
      {nearbyNote ? <p className="mt-3 text-sm text-teal-deep">{nearbyNote}</p> : null}
      <p className="mt-2 text-sm text-stone-500">
        {stats.count} carers
        {stats.avgRateCents ? ` · average ${formatAud(stats.avgRateCents)}/hr` : ""}
        {stats.avgRating ? ` · ${stats.avgRating.toFixed(1)} average rating` : ""}
        {page.pages > 1
          ? ` · showing ${(page.page - 1) * page.pageSize + 1}–${Math.min(page.page * page.pageSize, page.total)}`
          : ""}
        {filters.availableOn ? ` · not already booked on ${filters.availableOn}` : ""}
      </p>
      <div className="mt-6">
        <SearchForm
          specialty={filters.specialty}
          state={filters.state}
          city={filters.city}
          q={filters.q}
          availableOn={filters.availableOn}
        />
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-[240px_1fr]">
        <DirectoryFilters action={filterAction} current={current} />
        <div className="space-y-4">
          {caregivers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line p-8">
              <p className="text-stone-600">No carers match these filters yet. Widen the search or post a request.</p>
              <ul className="mt-4 space-y-2 text-sm">
                {emptyStateLinks(filters).map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-teal hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            caregivers.map((carer) => (
              <CaregiverCardView
                key={carer.id}
                caregiver={carer}
                neededOn={filters.availableOn}
                shortlist={{
                  saved: savedIds.has(carer.id),
                  signedIn: Boolean(canShortlist),
                  next: path,
                }}
              />
            ))
          )}
          {page.pages > 1 ? (
            <nav className="flex items-center justify-between pt-2 text-sm">
              {page.page > 1 ? (
                <a className="text-teal" href={filterHref(path, current, { page: String(page.page - 1) })}>
                  Previous
                </a>
              ) : (
                <span className="text-stone-400">Previous</span>
              )}
              <span className="text-stone-500">
                Page {page.page} of {page.pages}
              </span>
              {page.page < page.pages ? (
                <a className="text-teal" href={filterHref(path, current, { page: String(page.page + 1) })}>
                  Next
                </a>
              ) : (
                <span className="text-stone-400">Next</span>
              )}
            </nav>
          ) : null}
        </div>
      </div>
      {extras}
    </div>
  );
}
