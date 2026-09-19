export function caregiversNextNotice() {
  return "This list is every specialty in Australia. Open babysitters, or open every city in New South Wales.";
}

export function directoryIsNationalPath(path: string) {
  const parts = path.split("/").filter(Boolean);
  return parts[0] === "caregivers" && parts.length === 1;
}

export function caregiversNextShows(args: {
  isFamily: boolean;
  nationalPath: boolean;
  jobAttached?: boolean;
  specialtyFilter?: boolean;
}) {
  return Boolean(args.isFamily && args.nationalPath && !args.jobAttached && !args.specialtyFilter);
}

export function caregiversNextLinks() {
  return [
    { href: "/caregivers/babysitters", label: "Browse babysitters Australia-wide" },
    { href: "/locations/nsw", label: "Open New South Wales cities" },
  ];
}
