export function declinedNextNotice() {
  return "They cannot do this sit. Browse carers who still take this kind of care, or compare someone already on your shortlist.";
}

export function declinedNextLinks(args: { specialtySlug?: string | null; specialtyPlural?: string | null }) {
  const who = (args.specialtyPlural ?? "verified carers").toLowerCase();
  const links = [];
  if (args.specialtySlug) {
    links.push({
      href: `/caregivers/${args.specialtySlug}`,
      label: `Browse ${who}`,
    });
  } else {
    links.push({ href: "/caregivers", label: "Browse verified carers" });
  }
  links.push({ href: "/dashboard/shortlist", label: "Open your shortlist" });
  return links;
}
