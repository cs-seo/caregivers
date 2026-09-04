import { notFound } from "next/navigation";
import { DirectoryResults } from "@/components/directory-page";
import { parseFilters } from "@/lib/directory";
import { getSpecialty, getStates } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ specialty: string }>;
}) {
  const { specialty } = await params;
  const record = await getSpecialty(specialty);
  if (!record) return {};
  return pageMeta({
    title: record.seoTitle,
    description: record.seoDescription,
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
  const record = await getSpecialty(specialty);
  if (!record) notFound();
  const states = await getStates();
  const filters = { ...parseFilters(query), specialty: record.slug };

  return (
    <div>
      <DirectoryResults
        title={record.seoTitle}
        intro={`${record.description} Browse verified ${record.pluralName.toLowerCase()} nationwide, or jump to a state below.`}
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Carers", href: "/caregivers" },
          { name: record.pluralName },
        ]}
        filters={filters}
        filterAction={`/caregivers/${record.slug}`}
        current={{
          q: filters.q,
          instantBook: filters.instantBook ? "1" : undefined,
          availableNow: filters.availableNow ? "1" : undefined,
          wwcc: filters.wwcc ? "1" : undefined,
          ndis: filters.ndis ? "1" : undefined,
        }}
        path={`/caregivers/${record.slug}`}
      />
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-ink">{record.pluralName} by state</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-4">
          {states.map((state) => (
            <li key={state.id}>
              <a className="text-teal hover:underline" href={`/caregivers/${record.slug}/${state.slug}`}>
                {state.name}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
