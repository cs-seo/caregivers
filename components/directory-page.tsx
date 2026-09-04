import { Breadcrumbs } from "@/components/breadcrumbs";
import { CaregiverCardView } from "@/components/caregiver-card";
import { DirectoryFilters } from "@/components/directory-filters";
import { JsonLd } from "@/components/json-ld";
import { SearchForm } from "@/components/search-form";
import { formatAud } from "@/lib/money";
import type { DirectoryFilters as Filters } from "@/lib/queries";
import { directoryStats, searchCaregivers } from "@/lib/queries";
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
}: {
  title: string;
  intro: string;
  breadcrumbs: { name: string; href?: string }[];
  filters: Filters;
  filterAction: string;
  current: Record<string, string | undefined>;
  path: string;
}) {
  const [caregivers, stats] = await Promise.all([
    searchCaregivers(filters),
    directoryStats(filters),
  ]);

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
      <p className="mt-3 max-w-3xl text-stone-600">{intro}</p>
      <p className="mt-2 text-sm text-stone-500">
        {stats.count} carers
        {stats.avgRateCents ? ` · average ${formatAud(stats.avgRateCents)}/hr` : ""}
        {stats.avgRating ? ` · ${stats.avgRating.toFixed(1)} average rating` : ""}
      </p>
      <div className="mt-6">
        <SearchForm specialty={filters.specialty} state={filters.state} city={filters.city} />
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-[240px_1fr]">
        <DirectoryFilters action={filterAction} current={current} />
        <div className="space-y-4">
          {caregivers.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line p-8 text-stone-500">
              No carers match these filters yet. Try a nearby city or another specialty.
            </p>
          ) : (
            caregivers.map((carer) => <CaregiverCardView key={carer.id} caregiver={carer} />)
          )}
        </div>
      </div>
    </div>
  );
}
