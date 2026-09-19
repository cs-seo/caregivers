export function nursingNextNotice() {
  return "Nurses have their own directory. Open these carers in Tasmania, or open the after-school nanny guide.";
}

export function nursingNextShows(args: {
  isFamily: boolean;
  specialtySlug?: string;
  specialtyPath: boolean;
  jobAttached?: boolean;
}) {
  return Boolean(args.isFamily && args.specialtyPath && args.specialtySlug === "nursing" && !args.jobAttached);
}

export function nursingNextLinks() {
  return [
    { href: "/caregivers/nursing/tas", label: "Browse nurses in Tasmania" },
    { href: "/guides/after-school-nanny", label: "Open the after-school nanny guide" },
  ];
}
