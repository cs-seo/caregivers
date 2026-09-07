import Link from "next/link";
import { weeklyHourChips } from "@/lib/availability";
import { formatDate, lastActiveLabel, parseSydneyDateTimeLocal } from "@/lib/format";
import { formatAud } from "@/lib/money";
import { trustLabel } from "@/lib/trust";
import type { CaregiverCard } from "@/lib/queries";
import { Badge, CredentialBadges } from "./badges";
import { Portrait } from "./portrait";
import { ShortlistButton } from "./shortlist-button";

export function CaregiverCardView({
  caregiver,
  shortlist,
  neededOn,
}: {
  caregiver: CaregiverCard & { trustScore: number };
  shortlist?: { saved: boolean; signedIn: boolean; next: string };
  neededOn?: string;
}) {
  const specialtyNames = caregiver.specialties.map((s) => s.specialty.name).join(" · ");
  return (
    <article className="rounded-2xl border border-line bg-card p-5 shadow-sm transition hover:border-teal/40">
      <div className="flex gap-4">
        <Portrait name={caregiver.user.name} size={56} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-ink">
                <Link href={`/caregiver/${caregiver.slug}`} className="hover:text-teal">
                  {caregiver.user.name}
                </Link>
              </h2>
              <p className="text-sm text-stone-600">
                {caregiver.suburb}, {caregiver.city.name} {caregiver.city.state.abbrev}
              </p>
            </div>
            <p className="text-right">
              <span className="text-lg font-semibold text-teal">{formatAud(caregiver.hourlyRateCents)}</span>
              <span className="block text-xs text-stone-500">per hour, inc GST</span>
            </p>
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-stone-700">{caregiver.headline}</p>
          {caregiver.availabilityNote ? (
            <p className="mt-2 line-clamp-2 text-sm text-stone-600">{caregiver.availabilityNote}</p>
          ) : null}
          {weeklyHourChips(caregiver.weeklyHours).length ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {weeklyHourChips(caregiver.weeklyHours).map((chip) => (
                <span key={chip} className="rounded-full bg-sage px-2 py-0.5 text-xs text-teal-deep">
                  {chip}
                </span>
              ))}
            </div>
          ) : null}
          <p className="mt-2 text-xs text-stone-500">{specialtyNames}</p>
          {caregiver.workHistory[0] ? (
            <p className="mt-1 text-xs text-stone-500">
              {caregiver.workHistory[0].title} · {caregiver.workHistory[0].employer}
            </p>
          ) : null}
          <div className="mt-3">
            <CredentialBadges credentials={caregiver.credentials} abn={caregiver.abn} />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge tone="teal">{trustLabel(caregiver.trustScore)}</Badge>
            {caregiver.instantBook ? <Badge tone="clay">Instant Book</Badge> : null}
            {caregiver.availableNow ? <Badge>Available now</Badge> : null}
            <span className="text-xs text-stone-500">{lastActiveLabel(caregiver.lastActiveAt)}</span>
            {caregiver.reviewCount > 0 ? (
              <span className="text-xs text-stone-600">
                {caregiver.ratingAvg.toFixed(1)} ★ · {caregiver.reviewCount} reviews · {caregiver.yearsExperience} yrs
              </span>
            ) : (
              <span className="text-xs text-stone-600">{caregiver.yearsExperience} yrs experience</span>
            )}
          </div>
          {neededOn ? (
            <p className="mt-3 text-sm">
              <Link href={`/caregiver/${caregiver.slug}/book?start=${neededOn}`} className="font-medium text-teal">
                Book on {formatDate(parseSydneyDateTimeLocal(`${neededOn}T17:00`))}
              </Link>
            </p>
          ) : null}
          {shortlist ? (
            <div className="mt-3">
              <ShortlistButton
                caregiverId={caregiver.id}
                saved={shortlist.saved}
                signedIn={shortlist.signedIn}
                next={shortlist.next}
                compact
              />
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
