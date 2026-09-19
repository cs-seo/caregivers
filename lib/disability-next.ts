export function disabilityNextNotice() {
  return "Disability support has its own directory. Open these carers in Western Australia, or open the NDIS support worker guide.";
}

export function directoryIsSpecialtyPath(path: string) {
  const parts = path.split("/").filter(Boolean);
  return parts[0] === "caregivers" && parts.length === 2;
}

export function disabilityNextShows(args: {
  isFamily: boolean;
  specialtySlug?: string;
  specialtyPath: boolean;
  jobAttached?: boolean;
}) {
  return Boolean(
    args.isFamily && args.specialtyPath && args.specialtySlug === "disability-support" && !args.jobAttached,
  );
}

export function disabilityNextLinks() {
  return [
    { href: "/caregivers/disability-support/wa", label: "Browse disability support in Western Australia" },
    { href: "/guides/ndis-support-worker", label: "Open the NDIS support worker guide" },
  ];
}
