import { notFound } from "next/navigation";
import { DirectoryResults } from "@/components/directory-page";
import { parseFilters } from "@/lib/directory";
import { getSpecialty, getState } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ specialty: string; state: string }>;
}) {
  const { specialty, state } = await params;
  const [spec, st] = await Promise.all([getSpecialty(specialty), getState(state)]);
  if (!spec || !st) return {};
  return pageMeta({
    title: `${spec.pluralName} in ${st.name}`,
    description: `Find verified ${spec.pluralName.toLowerCase()} in ${st.name}. Compare experience, checks and Instant Book rates on CareProof.`,
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
  const [spec, st] = await Promise.all([getSpecialty(specialty), getState(state)]);
  if (!spec || !st) notFound();
  const filters = { ...parseFilters(query), specialty: spec.slug, state: st.slug };

  return (
    <div>
      <DirectoryResults
        title={`${spec.pluralName} in ${st.name}`}
        intro={`Verified ${spec.pluralName.toLowerCase()} available across ${st.name}. Open a city page for local carers, average rates and Instant Book.`}
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Carers", href: "/caregivers" },
          { name: spec.pluralName, href: `/caregivers/${spec.slug}` },
          { name: st.abbrev },
        ]}
        filters={filters}
        filterAction={`/caregivers/${spec.slug}/${st.slug}`}
        current={{
          q: filters.q,
          instantBook: filters.instantBook ? "1" : undefined,
          wwcc: filters.wwcc ? "1" : undefined,
          ndis: filters.ndis ? "1" : undefined,
        }}
        path={`/caregivers/${spec.slug}/${st.slug}`}
      />
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-ink">Cities in {st.name}</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {st.cities.map((city) => (
            <li key={city.id}>
              <a
                className="text-teal hover:underline"
                href={`/caregivers/${spec.slug}/${st.slug}/${city.slug}`}
              >
                {spec.pluralName} in {city.name}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
