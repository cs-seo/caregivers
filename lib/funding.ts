export function normalizeFundingRef(value: string, max = 40) {
  const cleaned = value.replace(/\s+/g, " ").trim().slice(0, max);
  return cleaned || null;
}

export function fundingLines(profile?: { ndisNumber?: string | null; agedCareRef?: string | null } | null) {
  const lines: string[] = [];
  if (profile?.ndisNumber) lines.push(`NDIS ${profile.ndisNumber}`);
  if (profile?.agedCareRef) lines.push(`My Aged Care ${profile.agedCareRef}`);
  return lines;
}
