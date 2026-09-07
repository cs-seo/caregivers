import { CREDENTIAL_LABELS } from "./constants";

export type CredentialWatch = {
  type: string;
  label: string;
  expiresAt: Date;
  days: number;
  state: "expired" | "soon";
};

export function daysUntil(expiresAt: Date, now = new Date()) {
  return Math.ceil((expiresAt.getTime() - now.getTime()) / 86_400_000);
}

export function credentialWatchlist(
  credentials: { type: string; expiresAt?: Date | string | null }[],
  now = new Date(),
  soonDays = 60,
): CredentialWatch[] {
  return credentials
    .flatMap((credential) => {
      if (!credential.expiresAt) return [];
      const expiresAt = typeof credential.expiresAt === "string" ? new Date(credential.expiresAt) : credential.expiresAt;
      if (Number.isNaN(expiresAt.getTime())) return [];
      const days = daysUntil(expiresAt, now);
      if (days > soonDays) return [];
      return [
        {
          type: credential.type,
          label: CREDENTIAL_LABELS[credential.type] ?? credential.type,
          expiresAt,
          days,
          state: days < 0 ? ("expired" as const) : ("soon" as const),
        },
      ];
    })
    .sort((left, right) => left.days - right.days);
}

export function watchLabel(item: CredentialWatch) {
  if (item.state === "expired") return `${item.label} expired`;
  if (item.days === 0) return `${item.label} expires today`;
  if (item.days === 1) return `${item.label} expires tomorrow`;
  return `${item.label} expires in ${item.days} days`;
}
