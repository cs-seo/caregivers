import { notFound } from "next/navigation";
import { DirectoryResults } from "@/components/directory-page";
import { parseFilters } from "@/lib/directory";
import { getCity, getSpecialty, getState } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ specialty: string; state: string; city: string }>;
}) {
  const { specialty, state, city } = await params;
  const [spec, place] = await Promise.all([getSpecialty(specialty), getCity(state, city)]);
  if (!spec || !place) return {};
  return pageMeta({
    title: `${spec.pluralName} in ${place.name}, ${place.state.abbrev}`,
    description: `Hire verified ${spec.pluralName.toLowerCase()} in ${place.name}, ${place.state.name}. Check work history, WWCC and NDIS screening, then book with escrow.`,
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
  const [spec, place, st] = await Promise.all([
    getSpecialty(specialty),
    getCity(state, city),
    getState(state),
  ]);
  if (!spec || !place) notFound();
  const filters = {
    ...parseFilters(query),
    specialty: spec.slug,
    state: place.state.slug,
    city: place.slug,
  };

  const nearby = (st?.cities ?? []).filter((item) => item.slug !== place.slug).slice(0, 8);

  return (
    <div>
      <DirectoryResults
        title={`${spec.pluralName} in ${place.name}, ${place.state.abbrev}`}
        intro={`Families in ${place.name} use CareProof to hire ${spec.pluralName.toLowerCase()} with verified experience. Compare hourly rates, Instant Book availability and screening checks, then pay into escrow.`}
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Carers", href: "/caregivers" },
          { name: spec.pluralName, href: `/caregivers/${spec.slug}` },
          { name: place.state.abbrev, href: `/caregivers/${spec.slug}/${place.state.slug}` },
          { name: place.name },
        ]}
        filters={filters}
        filterAction={`/caregivers/${spec.slug}/${place.state.slug}/${place.slug}`}
        current={{
          q: filters.q,
          instantBook: filters.instantBook ? "1" : undefined,
          wwcc: filters.wwcc ? "1" : undefined,
          ndis: filters.ndis ? "1" : undefined,
        }}
        path={`/caregivers/${spec.slug}/${place.state.slug}/${place.slug}`}
      />
      {nearby.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-ink">Nearby cities</h2>
          <ul className="mt-4 flex flex-wrap gap-3 text-sm">
            {nearby.map((item) => (
              <li key={item.id}>
                <a className="text-teal hover:underline" href={`/caregivers/${spec.slug}/${place.state.slug}/${item.slug}`}>
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
