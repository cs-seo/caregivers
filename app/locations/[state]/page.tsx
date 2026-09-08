import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { locationBoardLink, locationBoardNotice } from "@/lib/job-board";
import { getSpecialties, getState } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";
import { ntNextLinks, ntNextNotice, ntNextShows } from "@/lib/nt-next";
import { qldNextLinks, qldNextNotice, qldNextShows } from "@/lib/qld-next";
import { saNextLinks, saNextNotice, saNextShows } from "@/lib/sa-next";
import { vicNextLinks, vicNextNotice, vicNextShows } from "@/lib/vic-next";
import { waNextLinks, waNextNotice, waNextShows } from "@/lib/wa-next";

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
  const [record, specialties, session] = await Promise.all([getState(state), getSpecialties(), auth()]);
  if (!record) notFound();
  const board = locationBoardLink({ state: record.slug, stateName: record.name });
  const isFamily = session?.user?.role === "FAMILY";
  const showVicNext = vicNextShows({ isFamily, stateSlug: record.slug });
  const showQldNext = qldNextShows({ isFamily, stateSlug: record.slug });
  const showSaNext = saNextShows({ isFamily, stateSlug: record.slug });
  const showNtNext = ntNextShows({ isFamily, stateSlug: record.slug });
  const showWaNext = waNextShows({ isFamily, stateSlug: record.slug });

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
      {showVicNext ? (
        <div className="mt-6 max-w-2xl rounded-xl bg-sage p-3 text-sm">
          <p>{vicNextNotice()}</p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {vicNextLinks().map((link) => (
              <Link key={link.href} href={link.href} className="font-medium text-teal hover:underline">
                {link.label}
              </Link>
            ))}
          </p>
        </div>
      ) : null}
      {showQldNext ? (
        <div className="mt-6 max-w-2xl rounded-xl bg-sage p-3 text-sm">
          <p>{qldNextNotice()}</p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {qldNextLinks().map((link) => (
              <Link key={link.href} href={link.href} className="font-medium text-teal hover:underline">
                {link.label}
              </Link>
            ))}
          </p>
        </div>
      ) : null}
      {showSaNext ? (
        <div className="mt-6 max-w-2xl rounded-xl bg-sage p-3 text-sm">
          <p>{saNextNotice()}</p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {saNextLinks().map((link) => (
              <Link key={link.href} href={link.href} className="font-medium text-teal hover:underline">
                {link.label}
              </Link>
            ))}
          </p>
        </div>
      ) : null}
      {showNtNext ? (
        <div className="mt-6 max-w-2xl rounded-xl bg-sage p-3 text-sm">
          <p>{ntNextNotice()}</p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {ntNextLinks().map((link) => (
              <Link key={link.href} href={link.href} className="font-medium text-teal hover:underline">
                {link.label}
              </Link>
            ))}
          </p>
        </div>
      ) : null}
      {showWaNext ? (
        <div className="mt-6 max-w-2xl rounded-xl bg-sage p-3 text-sm">
          <p>{waNextNotice()}</p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {waNextLinks().map((link) => (
              <Link key={link.href} href={link.href} className="font-medium text-teal hover:underline">
                {link.label}
              </Link>
            ))}
          </p>
        </div>
      ) : null}
      <p className="mt-6 text-sm text-stone-600">
        {locationBoardNotice(record.name)}{" "}
        <Link href={board.href} className="font-medium text-teal hover:underline">
          {board.label}
        </Link>
        .
      </p>
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
