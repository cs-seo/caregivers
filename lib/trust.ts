import { CREDENTIAL_LABELS } from "./constants";

export type TrustInput = {
  credentials: { type: string; verified: boolean }[];
  workHistory: { verification: string; hours: number }[];
  ratingAvg: number;
  reviewCount: number;
  completedJobs: number;
  verifiedHours: number;
  abn?: string | null;
};

export function computeTrustScore(input: TrustInput) {
  const verifiedCreds = input.credentials.filter((c) => c.verified).length;
  const verifiedRoles = input.workHistory.filter(
    (w) => w.verification !== "unverified",
  ).length;
  const credentialPoints = Math.min(48, verifiedCreds * 8);
  const workHistoryPoints = Math.min(30, verifiedRoles * 6);
  const reviewPoints =
    input.reviewCount > 0 ? Math.min(20, (input.ratingAvg / 5) * 20) : 0;
  const completionPoints = Math.min(20, input.completedJobs * 2);
  const hoursPoints = Math.min(10, input.verifiedHours / 200);
  const abnPoints = input.abn ? 4 : 0;
  return Math.min(
    100,
    Math.round(
      credentialPoints +
        workHistoryPoints +
        reviewPoints +
        completionPoints +
        hoursPoints +
        abnPoints,
    ),
  );
}

export function trustLabel(score: number) {
  if (score >= 85) return "Highly verified";
  if (score >= 65) return "Verified experience";
  if (score >= 40) return "Partially verified";
  return "New on CareProof";
}

export function credentialLabel(type: string) {
  return CREDENTIAL_LABELS[type] ?? type;
}
