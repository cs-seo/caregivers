export function personalCareNextNotice() {
  return "Personal care has its own directory. Open these carers in Townsville, or open Ballarat locations.";
}

export function personalCareNextShows(args: {
  isFamily: boolean;
  specialtySlug?: string;
  specialtyPath: boolean;
  jobAttached?: boolean;
}) {
  return Boolean(args.isFamily && args.specialtyPath && args.specialtySlug === "personal-care" && !args.jobAttached);
}

export function personalCareNextLinks() {
  return [
    { href: "/caregivers/personal-care/qld/townsville", label: "Browse personal care in Townsville" },
    { href: "/locations/vic/ballarat", label: "Open Ballarat locations" },
  ];
}
