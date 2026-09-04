import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getSpecialties, getState } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params;
  const record = await getState(state);
  if (!record) return {};
  return pageMeta({
    title: `Carers in ${record.name} — cities and suburbs`,
    description: `Find nannies, aged care carers and NDIS support workers across ${record.name}. Browse by city and suburb.`,
    path: `/locations/${record.slug}`,
  });
}

export default async function StateLocationsPage({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params;
  const [record, specialties] = await Promise.all([getState(state), getSpecialties()]);
  if (!record) notFound();

  return (
    <div>
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Locations", href: "/locations" },
          { name: record.name },
        ]}
      />
      <h1 className="text-3xl font-semibold text-ink">Carers in {record.name}</h1>
      <p className="mt-3 text-stone-600">
        Open a city to see suburb pages, or jump straight into a care type for the whole state.
      </p>
      <ul className="mt-4 flex flex-wrap gap-3 text-sm">
        {specialties.map((spec) => (
          <li key={spec.id}>
            <Link className="text-teal hover:underline" href={`/caregivers/${spec.slug}/${record.slug}`}>
              {spec.pluralName} in {record.abbrev}
            </Link>
          </li>
        ))}
      </ul>
      <h2 className="mt-10 text-xl font-semibold">Cities</h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
        {record.cities.map((city) => (
          <li key={city.id}>
            <Link className="text-teal hover:underline" href={`/locations/${record.slug}/${city.slug}`}>
              {city.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
