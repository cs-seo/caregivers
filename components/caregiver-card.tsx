import Link from "next/link";
import { initials } from "@/lib/format";
import { formatAud } from "@/lib/money";
import { trustLabel } from "@/lib/trust";
import type { CaregiverCard } from "@/lib/queries";
import { Badge } from "./badges";

export function CaregiverCardView({
  caregiver,
}: {
  caregiver: CaregiverCard & { trustScore: number };
}) {
  const specialtyNames = caregiver.specialties.map((s) => s.specialty.name).join(" · ");
  return (
    <article className="rounded-2xl border border-line bg-card p-5 shadow-sm transition hover:border-teal/40">
      <div className="flex gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-teal text-sm font-semibold text-white">
          {initials(caregiver.user.name)}
        </div>
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
          <p className="mt-2 text-xs text-stone-500">{specialtyNames}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge tone="teal">{trustLabel(caregiver.trustScore)}</Badge>
            {caregiver.instantBook ? <Badge tone="clay">Instant Book</Badge> : null}
            {caregiver.availableNow ? <Badge>Available now</Badge> : null}
            {caregiver.reviewCount > 0 ? (
              <span className="text-xs text-stone-600">
                {caregiver.ratingAvg.toFixed(1)} ★ · {caregiver.reviewCount} reviews · {caregiver.yearsExperience} yrs
              </span>
            ) : (
              <span className="text-xs text-stone-600">{caregiver.yearsExperience} yrs experience</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
