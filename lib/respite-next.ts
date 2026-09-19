export function respiteNextNotice() {
  return "Respite carers have their own directory. Open these carers in the ACT, or open the babysitter guide.";
}

export function respiteNextShows(args: {
  isFamily: boolean;
  specialtySlug?: string;
  specialtyPath: boolean;
  jobAttached?: boolean;
}) {
  return Boolean(args.isFamily && args.specialtyPath && args.specialtySlug === "respite" && !args.jobAttached);
}

export function respiteNextLinks() {
  return [
    { href: "/caregivers/respite/act", label: "Browse respite in the ACT" },
    { href: "/guides/hire-a-babysitter", label: "Open the babysitter guide" },
  ];
}
