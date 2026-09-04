import { DirectoryResults } from "@/components/directory-page";
import { parseFilters } from "@/lib/directory";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Find verified carers across Australia",
  description:
    "Browse aged care carers, nannies, NDIS support workers, housekeepers and nurses in every Australian state and city. Instant Book with escrow.",
  path: "/caregivers",
});

export default async function CaregiversPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const current = {
    q: filters.q,
    specialty: filters.specialty,
    state: filters.state,
    city: filters.city,
    instantBook: filters.instantBook ? "1" : undefined,
    availableNow: filters.availableNow ? "1" : undefined,
    wwcc: filters.wwcc ? "1" : undefined,
    ndis: filters.ndis ? "1" : undefined,
    minRating: filters.minRating ? String(filters.minRating) : undefined,
    minYears: filters.minYears ? String(filters.minYears) : undefined,
  };

  return (
    <DirectoryResults
      title="Verified carers across Australia"
      intro="Compare work history, WWCC, NDIS screening and AHPRA registration, then book with payment held in escrow until care is complete."
      breadcrumbs={[
        { name: "Home", href: "/" },
        { name: "Carers" },
      ]}
      filters={filters}
      filterAction="/caregivers"
      current={current}
      path="/caregivers"
    />
  );
}
