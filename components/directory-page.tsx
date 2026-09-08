import Link from "next/link";
import { AttachJobBanner } from "@/components/attach-job-banner";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CaregiverCardView } from "@/components/caregiver-card";
import { DirectoryFilters } from "@/components/directory-filters";
import { InviteSentNotice } from "@/components/invite-sent-notice";
import { JsonLd } from "@/components/json-ld";
import { SearchForm } from "@/components/search-form";
import { saveSearchAction } from "@/lib/actions";
import { directoryBoardLink, directoryBoardNotice, directoryJobEmptyLinks, directoryJobEmptyNotice, directoryListedPostLink, directoryListedPostNotice, filterHref } from "@/lib/directory";
import {
  caregiversNextLinks,
  caregiversNextNotice,
  caregiversNextShows,
  directoryIsNationalPath,
} from "@/lib/caregivers-next";
import {
  directoryIsSpecialtyPath,
  disabilityNextLinks,
  disabilityNextNotice,
  disabilityNextShows,
} from "@/lib/disability-next";
import { nursingNextLinks, nursingNextNotice, nursingNextShows } from "@/lib/nursing-next";
import {
  directoryIsSuburbPath,
  suburbNextCityHref,
  suburbNextLinks,
  suburbNextNotice,
  suburbNextPlace,
  suburbNextShows,
} from "@/lib/suburb-next";
import { canAttachJob } from "@/lib/job-match";
import { defaultSearchName, savedSearchHref } from "@/lib/saved-search";
import { prisma } from "@/lib/prisma";
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
  nearbyLinks,
  extras,
  invited,
  openRequests,
}: {
  title: string;
  intro: string;
  breadcrumbs: { name: string; href?: string }[];
  filters: Filters;
  filterAction: string;
  current: Record<string, string | undefined>;
  path: string;
  nearbyNote?: string;
  nearbyLinks?: { href: string; label: string }[];
  extras?: React.ReactNode;
  invited?: boolean;
  openRequests?: { href: string; label: string } | null;
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
  const searchHref = savedSearchHref(path, current);
  const savedSearch = canShortlist
    ? await prisma.savedSearch.findUnique({
        where: { familyId_href: { familyId: viewer!.id, href: searchHref } },
      })
    : null;
  if (savedSearch) {
    await prisma.savedSearch.update({
      where: { id: savedSearch.id },
      data: { lastSeenCount: stats.count, seenAt: new Date() },
    });
  }
  const attachJob =
    canShortlist && filters.job
      ? await prisma.careRequest.findUnique({
          where: { slug: filters.job },
          select: { id: true, slug: true, title: true, familyId: true, status: true, startDate: true },
        })
      : null;
  const jobTitle =
    attachJob && viewer?.id && canAttachJob(attachJob, viewer.id) ? attachJob.title : null;
  const listedPost = caregivers.length && !jobTitle ? directoryListedPostLink(filters) : null;
  const listedBoard =
    caregivers.length && !jobTitle && !openRequests && !filters.specialty ? directoryBoardLink() : null;
  const suburbPlace = suburbNextPlace(caregivers, savedIds);
  const suburbCityHref = suburbNextCityHref({
    specialty: filters.specialty,
    state: filters.state,
    city: filters.city,
  });
  const showSuburbNext =
    suburbCityHref &&
    suburbNextShows({
      isFamily: Boolean(canShortlist),
      suburbPath: directoryIsSuburbPath(path),
      profileHref: suburbPlace?.href,
      jobAttached: Boolean(jobTitle),
    });
  const showCaregiversNext = caregiversNextShows({
    isFamily: Boolean(canShortlist),
    nationalPath: directoryIsNationalPath(path),
    jobAttached: Boolean(jobTitle),
    specialtyFilter: Boolean(filters.specialty),
  });
  const specialtyPath = directoryIsSpecialtyPath(path);
  const showDisabilityNext = disabilityNextShows({
    isFamily: Boolean(canShortlist),
    specialtySlug: filters.specialty,
    specialtyPath,
    jobAttached: Boolean(jobTitle),
  });
  const showNursingNext = nursingNextShows({
    isFamily: Boolean(canShortlist),
    specialtySlug: filters.specialty,
    specialtyPath,
    jobAttached: Boolean(jobTitle),
  });
  const pageIds = caregivers.map((carer) => carer.id);
  const inviteRows =
    jobTitle && attachJob && pageIds.length
      ? await prisma.careRequestInvite.findMany({
          where: { requestId: attachJob.id, caregiverId: { in: pageIds } },
          select: { caregiverId: true, status: true },
        })
      : [];
  const proposedRows =
    jobTitle && attachJob && pageIds.length
      ? await prisma.proposal.findMany({
          where: { careRequestId: attachJob.id, caregiverId: { in: pageIds } },
          select: { caregiverId: true },
        })
      : [];
  const inviteByCarer = new Map(inviteRows.map((row) => [row.caregiverId, row]));
  const proposedIds = new Set(proposedRows.map((row) => row.caregiverId));

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
      {nearbyNote ? (
        <div className="mt-3 text-sm text-teal-deep">
          <p>{nearbyNote}</p>
          {nearbyLinks?.length ? (
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {nearbyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="font-medium text-teal hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      {openRequests ? (
        <p className="mt-3 text-sm text-teal-deep">
          {openRequests.label}.{" "}
          <Link href={openRequests.href} className="font-medium text-teal hover:underline">
            Browse requests
          </Link>
        </p>
      ) : listedBoard ? (
        <p className="mt-3 text-sm text-stone-600">
          {directoryBoardNotice()}{" "}
          <Link href={listedBoard.href} className="font-medium text-teal hover:underline">
            {listedBoard.label}
          </Link>
          .
        </p>
      ) : null}
      <p className="mt-2 text-sm text-stone-500">
        {stats.count} carers
        {stats.avgRateCents ? ` · average ${formatAud(stats.avgRateCents)}/hr` : ""}
        {stats.avgRating ? ` · ${stats.avgRating.toFixed(1)} average rating` : ""}
        {page.pages > 1
          ? ` · showing ${(page.page - 1) * page.pageSize + 1}–${Math.min(page.page * page.pageSize, page.total)}`
          : ""}
        {filters.availableOn
          ? ` · not booked or away on ${filters.availableOn}${filters.availableAt ? ` at ${filters.availableAt}` : ""}`
          : ""}
        {filters.availableNow ? " · available now in Sydney hours" : ""}
      </p>
      {showCaregiversNext ? (
        <div className="mt-4 rounded-xl bg-sage p-3 text-sm">
          <p>{caregiversNextNotice()}</p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {caregiversNextLinks().map((link) => (
              <Link key={link.href} href={link.href} className="font-medium text-teal hover:underline">
                {link.label}
              </Link>
            ))}
          </p>
        </div>
      ) : null}
      {showDisabilityNext ? (
        <div className="mt-4 rounded-xl bg-sage p-3 text-sm">
          <p>{disabilityNextNotice()}</p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {disabilityNextLinks().map((link) => (
              <Link key={link.href} href={link.href} className="font-medium text-teal hover:underline">
                {link.label}
              </Link>
            ))}
          </p>
        </div>
      ) : null}
      {showNursingNext ? (
        <div className="mt-4 rounded-xl bg-sage p-3 text-sm">
          <p>{nursingNextNotice()}</p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {nursingNextLinks().map((link) => (
              <Link key={link.href} href={link.href} className="font-medium text-teal hover:underline">
                {link.label}
              </Link>
            ))}
          </p>
        </div>
      ) : null}
      <div className="mt-6">
        <SearchForm
          specialty={filters.specialty}
          state={filters.state}
          city={filters.city}
          q={filters.q}
          availableOn={filters.availableOn}
          availableAt={filters.availableAt}
          job={filters.job}
        />
      </div>
      {canShortlist ? (
        savedSearch ? (
          <p className="mt-3 text-sm text-teal-deep">
            Saved as “{savedSearch.name}”. This visit marks the list as seen — new carers will show on your dashboard
            next time the count grows.{" "}
            <Link href="/dashboard" className="text-teal">
              Open on your dashboard
            </Link>
          </p>
        ) : (
          <form action={saveSearchAction} className="mt-3 flex flex-wrap items-end gap-2">
            <input type="hidden" name="href" value={searchHref} />
            <label className="block text-sm">
              <span className="text-stone-600">Save this search</span>
              <input
                name="name"
                required
                maxLength={80}
                defaultValue={defaultSearchName(title, filters)}
                className="mt-1 w-72 max-w-full rounded-lg border border-line px-3 py-2"
              />
            </label>
            <button className="rounded-lg border border-teal px-3 py-2 text-sm font-medium text-teal" type="submit">
              Save
            </button>
          </form>
        )
      ) : viewer ? null : (
        <p className="mt-3 text-sm text-stone-600">
          <Link href={`/login?callbackUrl=${encodeURIComponent(searchHref)}`} className="text-teal">
            Log in
          </Link>{" "}
          as a family to save this search.
        </p>
      )}
      {invited ? <InviteSentNotice className="mt-4 text-sm text-teal" /> : null}
      {jobTitle ? <AttachJobBanner title={jobTitle} surface="list" /> : null}
      <div className="mt-8 grid gap-6 md:grid-cols-[240px_1fr]">
        <DirectoryFilters action={filterAction} current={current} />
        <div className="space-y-4">
          {caregivers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line p-8">
              <p className="text-stone-600">
                {jobTitle
                  ? directoryJobEmptyNotice(jobTitle)
                  : "No carers match these filters yet. Widen the search or post a request."}
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {directoryJobEmptyLinks(
                  filters,
                  jobTitle && attachJob && filters.job
                    ? { jobSlug: filters.job, jobTitle, shortlistCount: savedIds.size }
                    : null,
                ).map((link) => (
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
                neededAt={filters.availableAt}
                job={jobTitle ? filters.job : undefined}
                invite={
                  jobTitle && attachJob && filters.job
                    ? {
                        jobSlug: filters.job,
                        job: attachJob,
                        familyId: viewer?.id,
                        existing: inviteByCarer.get(carer.id) ?? null,
                        proposed: proposedIds.has(carer.id),
                        next: filterHref(path, current),
                        signedIn: Boolean(canShortlist),
                      }
                    : undefined
                }
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
          {listedPost ? (
            <p className="pt-2 text-sm text-stone-600">
              {directoryListedPostNotice()}{" "}
              <Link href={listedPost.href} className="font-medium text-teal hover:underline">
                {listedPost.label}
              </Link>
              .
            </p>
          ) : null}
          {showSuburbNext && suburbPlace && suburbCityHref ? (
            <div className="mt-4 rounded-xl bg-sage p-3 text-sm">
              <p>{suburbNextNotice()}</p>
              <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {suburbNextLinks({
                  profileHref: suburbPlace.href,
                  profileName: suburbPlace.name,
                  cityHref: suburbCityHref,
                }).map((link) => (
                  <Link key={link.href} href={link.href} className="font-medium text-teal hover:underline">
                    {link.label}
                  </Link>
                ))}
              </p>
            </div>
          ) : null}
        </div>
      </div>
      {extras}
    </div>
  );
}
