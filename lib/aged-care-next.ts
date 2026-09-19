export function agedCareNextNotice() {
  return "Aged care has its own directory. Open these carers on the Sunshine Coast, or open Cairns locations.";
}

export function agedCareNextShows(args: {
  isFamily: boolean;
  specialtySlug?: string;
  specialtyPath: boolean;
  jobAttached?: boolean;
}) {
  return Boolean(args.isFamily && args.specialtyPath && args.specialtySlug === "aged-care" && !args.jobAttached);
}

export function agedCareNextLinks() {
  return [
    { href: "/caregivers/aged-care/qld/sunshine-coast", label: "Browse aged care on the Sunshine Coast" },
    { href: "/locations/qld/cairns", label: "Open Cairns locations" },
  ];
}
