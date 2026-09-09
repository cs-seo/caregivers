import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { locationBoardLink, locationBoardNotice } from "@/lib/job-board";
import { geelongNextLinks, geelongNextNotice, geelongNextShows } from "@/lib/geelong-next";
import { goldCoastNextLinks, goldCoastNextNotice, goldCoastNextShows } from "@/lib/gold-coast-next";
import { newcastleNextLinks, newcastleNextNotice, newcastleNextShows } from "@/lib/newcastle-next";
import { perthNextLinks, perthNextNotice, perthNextShows } from "@/lib/perth-next";
import { lismoreNextLinks, lismoreNextNotice, lismoreNextShows } from "@/lib/lismore-next";
import { toowoombaNextLinks, toowoombaNextNotice, toowoombaNextShows } from "@/lib/toowoomba-next";
import { getCity, getSpecialties } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string; city: string }>;
}) {
  const { state, city } = await params;
  const place = await getCity(state, city);
  if (!place) return {};
  return pageMeta({
    title: `Carers in ${place.name}, ${place.state.abbrev} — suburbs`,
    description: `Suburb-by-suburb carers in ${place.name}: nannies, babysitters, aged care and NDIS support workers.`,
    path: `/locations/${place.state.slug}/${place.slug}`,
  });
}

export default async function CityLocationsPage({
  params,
}: {
  params: Promise<{ state: string; city: string }>;
}) {
  const { state, city } = await params;
  const [place, specialties, session] = await Promise.all([getCity(state, city), getSpecialties(), auth()]);
  if (!place) notFound();
  const board = locationBoardLink({ city: place.slug, cityName: place.name });
  const isFamily = session?.user?.role === "FAMILY";
  const showPerthNext = perthNextShows({
    isFamily,
    stateSlug: place.state.slug,
    citySlug: place.slug,
  });
  const showGoldCoastNext = goldCoastNextShows({
    isFamily,
    stateSlug: place.state.slug,
    citySlug: place.slug,
  });
  const showGeelongNext = geelongNextShows({
    isFamily,
    stateSlug: place.state.slug,
    citySlug: place.slug,
  });
  const showNewcastleNext = newcastleNextShows({
    isFamily,
    stateSlug: place.state.slug,
    citySlug: place.slug,
  });
  const showToowoombaNext = toowoombaNextShows({
    isFamily,
    stateSlug: place.state.slug,
    citySlug: place.slug,
  });
  const showLismoreNext = lismoreNextShows({
    isFamily,
    stateSlug: place.state.slug,
    citySlug: place.slug,
  });

  return (
    <div>
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Locations", href: "/locations" },
          { name: place.state.name, href: `/locations/${place.state.slug}` },
          { name: place.name },
        ]}
      />
      <h1 className="text-3xl font-semibold text-ink">
        Carers in {place.name}, {place.state.abbrev}
      </h1>
      <p className="mt-3 text-stone-600">
        These suburb pages target local searches — “nanny in {place.suburbs[0]?.name ?? place.name}”, “aged care worker
        near {place.name}”, “NDIS support worker {place.name}”.
      </p>
      <ul className="mt-4 flex flex-wrap gap-3 text-sm">
        {specialties.map((spec) => (
          <li key={spec.id}>
            <Link
              className="text-teal hover:underline"
              href={`/caregivers/${spec.slug}/${place.state.slug}/${place.slug}`}
            >
              {spec.pluralName} in {place.name}
            </Link>
          </li>
        ))}
      </ul>
      {showPerthNext ? (
        <div className="mt-6 max-w-2xl rounded-xl bg-sage p-3 text-sm">
          <p>{perthNextNotice()}</p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {perthNextLinks().map((link) => (
              <Link key={link.href} href={link.href} className="font-medium text-teal hover:underline">
                {link.label}
              </Link>
            ))}
          </p>
        </div>
      ) : null}
      {showGoldCoastNext ? (
        <div className="mt-6 max-w-2xl rounded-xl bg-sage p-3 text-sm">
          <p>{goldCoastNextNotice()}</p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {goldCoastNextLinks().map((link) => (
              <Link key={link.href} href={link.href} className="font-medium text-teal hover:underline">
                {link.label}
              </Link>
            ))}
          </p>
        </div>
      ) : null}
      {showGeelongNext ? (
        <div className="mt-6 max-w-2xl rounded-xl bg-sage p-3 text-sm">
          <p>{geelongNextNotice()}</p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {geelongNextLinks().map((link) => (
              <Link key={link.href} href={link.href} className="font-medium text-teal hover:underline">
                {link.label}
              </Link>
            ))}
          </p>
        </div>
      ) : null}
      {showNewcastleNext ? (
        <div className="mt-6 max-w-2xl rounded-xl bg-sage p-3 text-sm">
          <p>{newcastleNextNotice()}</p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {newcastleNextLinks().map((link) => (
              <Link key={link.href} href={link.href} className="font-medium text-teal hover:underline">
                {link.label}
              </Link>
            ))}
          </p>
        </div>
      ) : null}
      {showToowoombaNext ? (
        <div className="mt-6 max-w-2xl rounded-xl bg-sage p-3 text-sm">
          <p>{toowoombaNextNotice()}</p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {toowoombaNextLinks().map((link) => (
              <Link key={link.href} href={link.href} className="font-medium text-teal hover:underline">
                {link.label}
              </Link>
            ))}
          </p>
        </div>
      ) : null}
      {showLismoreNext ? (
        <div className="mt-6 max-w-2xl rounded-xl bg-sage p-3 text-sm">
          <p>{lismoreNextNotice()}</p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {lismoreNextLinks().map((link) => (
              <Link key={link.href} href={link.href} className="font-medium text-teal hover:underline">
                {link.label}
              </Link>
            ))}
          </p>
        </div>
      ) : null}
      <p className="mt-6 text-sm text-stone-600">
        {locationBoardNotice(place.name)}{" "}
        <Link href={board.href} className="font-medium text-teal hover:underline">
          {board.label}
        </Link>
        .
      </p>
      <h2 className="mt-10 text-xl font-semibold">Suburbs</h2>
      {place.suburbs.length === 0 ? (
        <p className="mt-3 text-sm text-stone-500">Suburb pages for {place.name} are still being added.</p>
      ) : (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {place.suburbs.map((suburb) => (
            <li key={suburb.id}>
              <span className="font-medium text-ink">{suburb.name}</span>
              <ul className="mt-1 space-y-0.5 text-sm">
                {specialties.slice(0, 4).map((spec) => (
                  <li key={spec.id}>
                    <Link
                      className="text-teal hover:underline"
                      href={`/caregivers/${spec.slug}/${place.state.slug}/${place.slug}/${suburb.slug}`}
                    >
                      {spec.pluralName}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
