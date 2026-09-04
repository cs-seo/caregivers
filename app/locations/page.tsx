import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getStates } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Carers by city and suburb across Australia",
  description:
    "Browse CareProof by state, city and suburb. Long-tail local pages for nannies, aged care, NDIS support workers and more.",
  path: "/locations",
});

export default async function LocationsPage() {
  const states = await getStates();
  return (
    <div>
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Locations" }]} />
      <h1 className="text-3xl font-semibold text-ink">Carers by city and suburb</h1>
      <p className="mt-3 max-w-2xl text-stone-600">
        Every capital and regional centre has specialty pages. Capitals also have suburb pages for searches like
        “nanny Bondi” or “NDIS support worker Chermside”.
      </p>
      <div className="mt-8 space-y-8">
        {states.map((state) => (
          <section key={state.id}>
            <h2 className="text-xl font-semibold">
              <Link href={`/locations/${state.slug}`} className="hover:text-teal">
                {state.name}
              </Link>
            </h2>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {state.cities.map((city) => (
                <li key={city.id}>
                  <Link className="text-teal hover:underline" href={`/locations/${state.slug}/${city.slug}`}>
                    {city.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
