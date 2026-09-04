import { NextResponse } from "next/server";
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
      instantBook: carer.instantBook,
      availableNow: carer.availableNow,
      ratingAvg: carer.ratingAvg,
      trustScore: carer.trustScore,
    })),
  );
}
