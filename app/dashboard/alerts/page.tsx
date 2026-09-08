import Link from "next/link";
import { redirect } from "next/navigation";
import { markSavedSearchAlertSentAction, toggleSavedSearchAlertsAction } from "@/lib/actions";
import { directoryStats } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { pageMeta } from "@/lib/seo";
import { ROLES } from "@/lib/constants";
import {
  composeSearchAlert,
  filtersFromSearchHref,
  searchAlertDelta,
  searchAlertLabel,
  searchAlertMailto,
} from "@/lib/saved-search";
import { searchAlertsNextLinks, searchAlertsNextNotice, searchAlertsNextPlace } from "@/lib/search-alerts";
import { prisma } from "@/lib/prisma";

export const metadata = pageMeta({
  title: "Saved search alerts",
  description: "Preview the digest CareProof would email when saved searches gain new carers.",
  path: "/dashboard/alerts",
  noIndex: true,
});

export default async function SavedSearchAlertsPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const user = await requireUser();
  if (!user) redirect("/login?callbackUrl=/dashboard/alerts");
  if (user.role !== ROLES.FAMILY) redirect("/dashboard");
  const query = await searchParams;
  const searches = await prisma.savedSearch.findMany({
    where: { familyId: user.id },
    orderBy: { createdAt: "desc" },
  });
  const rows = await Promise.all(
    searches.map(async (search) => {
      const filters = filtersFromSearchHref(search.href);
      const current = filters ? (await directoryStats(filters)).count : 0;
      const delta = searchAlertDelta(current, search.lastAlertedCount, search.alertedAt);
      return { search, current, delta };
    }),
  );
  const watched = rows.filter((row) => row.search.alertsOn);
  const email = user.email ?? "family@careproof.com.au";
  const digest = composeSearchAlert(
    watched.map((row) => ({
      name: row.search.name,
      href: row.search.href,
      current: row.current,
      newCount: row.delta.newCount,
    })),
  );
  const nextPlace = searchAlertsNextPlace(
    rows.map((row) => ({
      href: row.search.href,
      name: row.search.name,
      alertsOn: row.search.alertsOn,
      newCount: row.delta.newCount,
    })),
  );
  const nextLinks = nextPlace ? searchAlertsNextLinks(nextPlace) : [];

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/dashboard" className="text-sm text-teal">
        Back to dashboard
      </Link>
      <h1 className="mt-3 text-3xl font-semibold text-ink">Saved search alerts</h1>
      <p className="mt-2 text-stone-600">
        This demo has no mail server. The digest below is what CareProof would email when a watched search gains
        carers. Send it to yourself, or mark it sent so the new count resets.
      </p>
      {query.sent ? (
        <p className="mt-4 rounded-xl bg-sage p-3 text-sm">Digest marked sent. New-carer counts start from this visit.</p>
      ) : null}

      {watched.length === 0 ? (
        <p className="mt-6 text-sm text-stone-600">
          Turn alerts on from a saved search on your{" "}
          <Link href="/dashboard" className="font-medium text-teal hover:underline">
            dashboard
          </Link>
          .
        </p>
      ) : (
        <article className="mt-6 rounded-2xl border border-line bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal">Email preview</p>
          <h2 className="mt-2 text-xl font-semibold text-ink">{digest.subject}</h2>
          <p className="mt-3 whitespace-pre-line text-sm text-stone-700">{digest.body}</p>
          <p className="mt-4">
            <a href={searchAlertMailto(email, digest)} className="text-sm font-medium text-teal hover:underline">
              Email this digest to {email}
            </a>
          </p>
        </article>
      )}

      <ul className="mt-6 space-y-3">
        {rows.map(({ search, delta }) => (
          <li key={search.id} className="rounded-2xl border border-line bg-card p-4">
            <Link href={search.href} className="font-medium text-teal hover:underline">
              {search.name}
            </Link>
            <p className="mt-1 text-sm text-stone-500">{searchAlertLabel(delta, search.alertsOn)}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <form action={toggleSavedSearchAlertsAction}>
                <input type="hidden" name="id" value={search.id} />
                <input type="hidden" name="next" value="/dashboard/alerts" />
                <input type="hidden" name="alertsOn" value={search.alertsOn ? "0" : "1"} />
                <button className="text-stone-500 hover:text-ink" type="submit">
                  {search.alertsOn ? "Turn alerts off" : "Turn alerts on"}
                </button>
              </form>
              {search.alertsOn && delta.newCount > 0 ? (
                <form action={markSavedSearchAlertSentAction}>
                  <input type="hidden" name="id" value={search.id} />
                  <input type="hidden" name="next" value="/dashboard/alerts" />
                  <button className="text-teal hover:underline" type="submit">
                    Mark digest sent
                  </button>
                </form>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      {nextPlace ? (
        <div className="mt-6 rounded-xl bg-sage p-3 text-sm">
          <p>{searchAlertsNextNotice()}</p>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {nextLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="font-medium text-teal hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
