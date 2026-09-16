import { NextResponse } from "next/server";
import { isAvailableNowLive, isAwayToday, isInstantBookLive } from "@/lib/availability";
import { parseFilters } from "@/lib/directory";
import { searchCaregivers } from "@/lib/queries";
import { rateLimit } from "@/lib/rate-limit";
import { clientIpFromRequest } from "@/lib/request-ip";

export async function GET(request: Request) {
  // Throttle scraping of the public directory endpoint per client IP.
  const ip = clientIpFromRequest(request);
  const limit = rateLimit(`api-caregivers:${ip}`, { limit: 60, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) } },
    );
  }
  const url = new URL(request.url);
  const filters = parseFilters(Object.fromEntries(url.searchParams.entries()));
  const caregivers = await searchCaregivers(filters, 40);
  return NextResponse.json(
    caregivers.map((carer) => ({
      id: carer.id,
      slug: carer.slug,
      name: carer.user.name,
      headline: carer.headline,
      city: carer.city.name,
      state: carer.city.state.abbrev,
      hourlyRateCents: carer.hourlyRateCents,
      instantBook: isInstantBookLive(
        carer.instantBook,
        carer.blockedDates.map((row) => row.dateKey),
      ),
      availableNow: isAvailableNowLive(
        carer.availableNow,
        carer.blockedDates.map((row) => row.dateKey),
        carer.weeklyWindows,
      ),
      awayToday: isAwayToday(carer.blockedDates.map((row) => row.dateKey)),
      ratingAvg: carer.ratingAvg,
      photoUrl: carer.photoUrl,
      trustScore: carer.trustScore,
    })),
  );
}
