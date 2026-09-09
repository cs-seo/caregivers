export function releasedNextNotice() {
  return "Funds are released. Open reviews to write, or browse carers for the next sit.";
}

export function releasedNextLinks(args: { specialtySlug?: string | null; specialtyPlural?: string | null }) {
  const links = [{ href: "/dashboard/reviews-due", label: "Open reviews to write" }];
  if (args.specialtySlug) {
    const who = (args.specialtyPlural ?? "verified carers").toLowerCase();
    links.push({
      href: `/caregivers/${args.specialtySlug}`,
      label: `Browse ${who}`,
    });
  } else {
    links.push({ href: "/caregivers", label: "Browse verified carers" });
  }
  return links;
}
