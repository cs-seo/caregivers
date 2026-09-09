import { DirectoryResults } from "@/components/directory-page";
import { FaqBlock, LinkGrid } from "@/components/seo-landing";
import { filterCurrent, parseFilters } from "@/lib/directory";
import { isInviteFlash } from "@/lib/job-invite";
import { getSpecialties, getStates } from "@/lib/queries";
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
  const [params, specialties, states] = await Promise.all([
    searchParams,
    getSpecialties(),
    getStates(),
  ]);
  const filters = parseFilters(params);
  const current = filterCurrent(filters);

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
      invited={isInviteFlash(params.invited)}
      extras={
        <>
          <FaqBlock
            faqs={[
              {
                q: "How do I hire a carer in Australia?",
                a: "Search by specialty and suburb, open a verified profile, then Instant Book. Payment is held in escrow until the booking is complete.",
              },
              {
                q: "What checks do CareProof carers have?",
                a: "Profiles show WWCC or the local equivalent, NDIS Worker Screening, police checks, AHPRA and first aid — with expiry dates.",
              },
              {
                q: "Can I search by suburb?",
                a: "Yes. Open Cities & suburbs, pick a city, then a suburb page such as nannies in Bondi or aged care in Marrickville.",
              },
            ]}
          />
          <LinkGrid
            title="Browse by care type"
            links={specialties.map((spec) => ({
              href: `/caregivers/${spec.slug}`,
              label: spec.pluralName,
            }))}
          />
          <LinkGrid
            title="Browse by state"
            links={states.map((state) => ({
              href: `/locations/${state.slug}`,
              label: state.name,
            }))}
          />
        </>
      }
    />
  );
}
