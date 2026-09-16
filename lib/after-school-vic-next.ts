export function afterSchoolVicNextNotice() {
  return "After-school carers in Victoria have their own list. Open Geraldton locations, or open Albany locations.";
}

export function afterSchoolVicNextShows(args: {
  isFamily: boolean;
  specialtySlug?: string;
  stateSlug?: string;
  stateSpecialtyPath: boolean;
  jobAttached?: boolean;
}) {
  return Boolean(
    args.isFamily &&
      args.stateSpecialtyPath &&
      args.specialtySlug === "after-school-care" &&
      args.stateSlug === "vic" &&
      !args.jobAttached,
  );
}

export function afterSchoolVicNextLinks() {
  return [
    { href: "/locations/wa/geraldton", label: "Open Geraldton locations" },
    { href: "/locations/wa/albany", label: "Open Albany locations" },
  ];
}
