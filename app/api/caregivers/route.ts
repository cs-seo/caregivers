import { NextResponse } from "next/server";
import { isAvailableNowLive, isAwayToday, isInstantBookLive } from "@/lib/availability";
import { parseFilters } from "@/lib/directory";
import { searchCaregivers } from "@/lib/queries";

export async function GET(request: Request) {
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
