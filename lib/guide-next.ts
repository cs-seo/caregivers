export function guideNextNotice() {
  return "This hiring guide is for families comparing checks and rates. Open this specialty in one state, or see how a sit reaches escrow.";
}

export function guideNextShows(args: { isFamily: boolean; invoiceGuide: boolean; stateSlug?: string | null }) {
  return Boolean(args.isFamily && !args.invoiceGuide && args.stateSlug);
}

export function guideNextState(states: { slug: string; name: string }[]) {
  return states.find((state) => state.slug === "nsw") ?? states[0] ?? null;
}

export function guideNextLinks(args: {
  specialtySlug: string;
  specialtyPlural: string;
  stateSlug: string;
  stateName: string;
}) {
  return [
    {
      href: `/caregivers/${args.specialtySlug}/${args.stateSlug}`,
      label: `Browse ${args.specialtyPlural.toLowerCase()} in ${args.stateName}`,
    },
    { href: "/how-it-works", label: "See how a sit reaches escrow" },
  ];
}
