export function shortlistNextNotice() {
  return "Carers you saved are ready to compare. Open the shortlist, or add household defaults before the next sit.";
}

export function shortlistNextLinks() {
  return [
    { href: "/dashboard/shortlist", label: "Open your shortlist" },
    { href: "/dashboard/household", label: "Open household defaults" },
  ];
}
