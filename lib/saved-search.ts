import { filterHref, parseFilters } from "./directory";
import { formatDate, formatDateTime, parseSydneyDateTimeLocal, titleCaseSlug } from "./format";
import { formatAud } from "./money";
import type { DirectoryFilters } from "./queries";

export const MAX_SAVED_SEARCHES = 20;

export function isSafeSearchHref(href: string) {
  if (!href.startsWith("/caregivers")) return false;
  if (href.includes("://")) return false;
  if (href.length > 240) return false;
  return true;
}

export function savedSearchHref(path: string, current: Record<string, string | undefined>) {
  const query: Record<string, string | undefined> = { ...current, page: undefined, job: undefined };
  if (path !== "/caregivers") {
    query.specialty = undefined;
    query.state = undefined;
    query.city = undefined;
  }
  return filterHref(path, query);
}

export function defaultSearchName(
  title: string,
  filters: Pick<DirectoryFilters, "availableOn" | "availableAt" | "instantBook" | "wwcc" | "ndis" | "q">,
) {
  const parts = [title.trim() || "Verified carers"];
  if (filters.availableOn) {
    const clock = filters.availableAt ?? "12:00";
    const when = parseSydneyDateTimeLocal(`${filters.availableOn}T${clock}`);
    if (Number.isNaN(when.getTime())) {
      parts.push(`needed ${filters.availableOn}`);
    } else if (filters.availableAt) {
      parts.push(`needed ${formatDateTime(when)}`);
    } else {
      parts.push(`needed ${formatDate(when)}`);
    }
  }
  if (filters.instantBook) parts.push("Instant Book");
  if (filters.wwcc) parts.push("child check");
  if (filters.ndis) parts.push("NDIS");
  if (filters.q) parts.push(`“${filters.q.trim()}”`);
  return parts.join(" · ").slice(0, 80);
}

export function fallbackSearchName(href: string) {
  const [path] = href.split("?");
  const bits = path.replace(/^\/caregivers\/?/, "").split("/").filter(Boolean);
  if (bits.length === 0) return "All carers";
  return bits.map(titleCaseSlug).join(" · ");
}

export function filtersFromSearchHref(href: string): DirectoryFilters | null {
  if (!isSafeSearchHref(href)) return null;
  const url = new URL(href, "https://careproof.example");
  const parts = url.pathname.replace(/^\/caregivers\/?/, "").split("/").filter(Boolean);
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  if (parts[0]) params.specialty = parts[0];
  if (parts[1]) params.state = parts[1];
  if (parts[2]) params.city = parts[2];
  if (parts[3]) params.suburb = parts[3];
  return parseFilters(params);
}

export function savedSearchDelta(current: number, lastSeenCount: number, seenAt?: Date | null) {
  const count = Math.max(0, current);
  const seen = Math.max(0, lastSeenCount);
  if (!seenAt) return { current: count, newCount: count, unseen: true };
  return { current: count, newCount: Math.max(0, count - seen), unseen: false };
}

export function savedSearchDeltaLabel(delta: ReturnType<typeof savedSearchDelta>) {
  if (delta.current === 0) return delta.unseen ? "No carers yet" : "0 carers";
  if (delta.unseen) return `${delta.current} carers · not opened yet`;
  if (delta.newCount > 0) return `${delta.current} carers · ${delta.newCount} new`;
  return `${delta.current} carers`;
}

export function jobsFitDeltaLabel(delta: ReturnType<typeof savedSearchDelta>) {
  if (delta.current === 0) return delta.unseen ? "No matching jobs yet" : "0 matching jobs";
  const jobs = delta.current === 1 ? "job fits" : "jobs fit";
  if (delta.unseen) return `${delta.current} ${jobs} · not opened yet`;
  if (delta.newCount > 0) return `${delta.current} ${jobs} · ${delta.newCount} new`;
  return `${delta.current} ${jobs}`;
}

export function searchAlertDelta(current: number, lastAlertedCount: number, alertedAt?: Date | null) {
  return savedSearchDelta(current, lastAlertedCount, alertedAt);
}

export function searchAlertLabel(delta: ReturnType<typeof savedSearchDelta>, alertsOn: boolean) {
  if (!alertsOn) return "Email alerts off";
  if (delta.current === 0) return delta.unseen ? "Alerts on · no carers yet" : "Alerts on · 0 carers";
  if (delta.unseen) return `Alerts on · ${delta.current} carers waiting for a first digest`;
  if (delta.newCount > 0) return `Alerts on · ${delta.newCount} new since last digest`;
  return "Alerts on · no new carers";
}

export function composeSearchAlert(
  items: { name: string; href: string; current: number; newCount: number }[],
) {
  const withNew = items.filter((item) => item.newCount > 0);
  const subject =
    withNew.length === 1
      ? `CareProof: ${withNew[0].newCount} new ${withNew[0].newCount === 1 ? "carer" : "carers"} — ${withNew[0].name}`
      : withNew.length > 1
        ? `CareProof: ${withNew.length} saved searches have new carers`
        : "CareProof: no new carers on your saved searches";
  const lines =
    withNew.length === 0
      ? ["None of your saved searches have new carers since the last digest."]
      : withNew.map((item) => {
          const carers = item.current === 1 ? "carer matches" : "carers match";
          const fresh = item.newCount === 1 ? "1 new" : `${item.newCount} new`;
          return `${item.name}\n${item.current} ${carers} now · ${fresh}.\nOpen ${item.href}`;
        });
  const body = [
    "New carers on the searches you asked CareProof to watch.",
    "",
    ...lines,
    "",
    "Turn a search’s alerts off from your dashboard if you do not want another digest.",
  ].join("\n");
  return { subject, body, hasNew: withNew.length > 0 };
}

export function searchAlertMailto(to: string, alert: { subject: string; body: string }) {
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(alert.subject)}&body=${encodeURIComponent(alert.body)}`;
}

export function jobAlertLabel(delta: ReturnType<typeof savedSearchDelta>, alertsOn: boolean) {
  if (!alertsOn) return "Email alerts off";
  if (delta.current === 0) return delta.unseen ? "Alerts on · no matching jobs yet" : "Alerts on · 0 matching jobs";
  if (delta.unseen) return `Alerts on · ${delta.current} ${delta.current === 1 ? "job" : "jobs"} waiting for a first digest`;
  if (delta.newCount > 0) {
    return `Alerts on · ${delta.newCount} new ${delta.newCount === 1 ? "job" : "jobs"} since last digest`;
  }
  return "Alerts on · no new jobs";
}

export function proposalAlertLabel(delta: ReturnType<typeof savedSearchDelta>, alertsOn: boolean) {
  if (!alertsOn) return "Email alerts off";
  if (delta.current === 0) {
    return delta.unseen ? "Alerts on · no pending proposals yet" : "Alerts on · 0 pending proposals";
  }
  if (delta.unseen) {
    return `Alerts on · ${delta.current} ${delta.current === 1 ? "proposal" : "proposals"} waiting for a first digest`;
  }
  if (delta.newCount > 0) {
    return `Alerts on · ${delta.newCount} new ${delta.newCount === 1 ? "proposal" : "proposals"} since last digest`;
  }
  return "Alerts on · no new proposals";
}

export function proposalAlertRate(rateCents: number, counterRateCents?: number | null) {
  const cents = counterRateCents ?? rateCents;
  return counterRateCents != null ? `${formatAud(cents)}/hr counter` : `${formatAud(cents)}/hr`;
}

export function composeProposalAlert(
  items: { title: string; href: string; carer: string; rate: string }[],
  current: number,
  newCount: number,
) {
  const subject =
    newCount > 0
      ? `CareProof: ${newCount} new ${newCount === 1 ? "proposal" : "proposals"} on your requests`
      : "CareProof: no new proposals on your requests";
  const listed = items.slice(0, 5);
  const lines =
    listed.length === 0
      ? ["No pending proposals on your open requests right now."]
      : listed.map((item) => `${item.title}\n${item.carer} · ${item.rate}\nOpen ${item.href}`);
  const body = [
    newCount > 0
      ? `${current} pending ${current === 1 ? "proposal" : "proposals"} on your open requests · ${newCount} new since your last digest.`
      : `${current} pending ${current === 1 ? "proposal" : "proposals"} on your open requests. None are new since your last digest.`,
    "",
    ...lines,
    "",
    "Turn proposal alerts off from your dashboard if you do not want another digest.",
  ].join("\n");
  return { subject, body, hasNew: newCount > 0 };
}

export function inviteAlertLabel(delta: ReturnType<typeof savedSearchDelta>, alertsOn: boolean) {
  if (!alertsOn) return "Email alerts off";
  if (delta.current === 0) {
    return delta.unseen ? "Alerts on · no pending invites yet" : "Alerts on · 0 pending invites";
  }
  if (delta.unseen) {
    return `Alerts on · ${delta.current} ${delta.current === 1 ? "invite" : "invites"} waiting for a first digest`;
  }
  if (delta.newCount > 0) {
    return `Alerts on · ${delta.newCount} new ${delta.newCount === 1 ? "invite" : "invites"} since last digest`;
  }
  return "Alerts on · no new invites";
}

export function composeInviteAlert(
  items: { title: string; href: string; family: string; when: string; note?: string | null }[],
  current: number,
  newCount: number,
) {
  const subject =
    newCount > 0
      ? `CareProof: ${newCount} new ${newCount === 1 ? "invite" : "invites"} to apply`
      : "CareProof: no new invites to apply";
  const listed = items.slice(0, 5);
  const lines =
    listed.length === 0
      ? ["No families have invited you to an open request right now."]
      : listed.map((item) => {
          const note = item.note?.trim();
          return note
            ? `${item.title}\n${item.family} · ${item.when}\n“${note}”\nOpen ${item.href}`
            : `${item.title}\n${item.family} · ${item.when}\nOpen ${item.href}`;
        });
  const body = [
    newCount > 0
      ? `${current} pending ${current === 1 ? "invite" : "invites"} · ${newCount} new since your last digest.`
      : `${current} pending ${current === 1 ? "invite" : "invites"}. None are new since your last digest.`,
    "",
    ...lines,
    "",
    "Turn invite alerts off from your dashboard if you do not want another digest.",
  ].join("\n");
  return { subject, body, hasNew: newCount > 0 };
}

export function composeJobFitAlert(
  jobs: { title: string; href: string; when: string }[],
  current: number,
  newCount: number,
) {
  const subject =
    newCount > 0
      ? `CareProof: ${newCount} new ${newCount === 1 ? "job fits" : "jobs fit"} your roster`
      : "CareProof: no new jobs on your roster";
  const listed = jobs.slice(0, 5);
  const lines =
    listed.length === 0
      ? ["No open requests match your city, specialties and usual hours right now."]
      : listed.map((job) => `${job.title}\n${job.when}\nOpen ${job.href}`);
  const body = [
    newCount > 0
      ? `${current} open ${current === 1 ? "job fits" : "jobs fit"} you now · ${newCount} new since your last digest.`
      : `${current} open ${current === 1 ? "job fits" : "jobs fit"} you now. None are new since your last digest.`,
    "",
    ...lines,
    "",
    "Turn job alerts off from your dashboard if you do not want another digest.",
  ].join("\n");
  return { subject, body, hasNew: newCount > 0 };
}
