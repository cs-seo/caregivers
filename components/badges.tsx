import { credentialWatchlist, watchLabel } from "@/lib/credentials";
import { credentialLabel } from "@/lib/trust";

export function Badge({
  children,
  tone = "sage",
}: {
  children: React.ReactNode;
  tone?: "sage" | "teal" | "clay" | "stone";
}) {
  const tones = {
    sage: "bg-sage text-teal-deep",
    teal: "bg-teal text-white",
    clay: "bg-orange-100 text-clay",
    stone: "bg-stone-100 text-stone-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function CredentialBadges({
  credentials,
  abn,
}: {
  credentials: {
    type: string;
    verified: boolean;
    issuingState?: string | null;
    expiresAt?: Date | string | null;
  }[];
  abn?: string | null;
}) {
  const watch = new Map(credentialWatchlist(credentials).map((item) => [item.type, item]));
  return (
    <div className="flex flex-wrap gap-2">
      {credentials
        .filter((c) => c.verified)
        .map((credential) => {
          const alert = watch.get(credential.type);
          return (
            <Badge key={credential.type} tone={alert ? "clay" : "sage"}>
              {alert ? watchLabel(alert) : credentialLabel(credential.type, credential.issuingState, true)}
            </Badge>
          );
        })}
      {abn ? <Badge tone="stone">ABN {abn}</Badge> : null}
    </div>
  );
}

export function CredentialDetails({
  credentials,
  abn,
}: {
  credentials: {
    type: string;
    verified: boolean;
    number?: string | null;
    issuingState?: string | null;
    expiresAt?: Date | string | null;
  }[];
  abn?: string | null;
}) {
  return (
    <ul className="mt-3 space-y-2">
      {credentials
        .filter((credential) => credential.verified)
        .map((credential) => (
          <li
            key={`${credential.type}-${credential.number ?? ""}`}
            className="rounded-xl border border-line bg-card px-4 py-3 text-sm"
          >
            <p className="font-medium text-ink">{credentialLabel(credential.type, credential.issuingState)}</p>
            <p className="mt-1 text-stone-600">
              {credential.number ? `No. ${credential.number}` : "Verified document on file"}
              {credential.issuingState ? ` · ${credential.issuingState.toUpperCase()}` : ""}
              {credential.expiresAt
                ? ` · expires ${new Date(credential.expiresAt).toLocaleDateString("en-AU", {
                    month: "short",
                    year: "numeric",
                    timeZone: "Australia/Sydney",
                  })}`
                : ""}
            </p>
            {credentialWatchlist([credential]).map((item) => (
              <p key={item.type} className="mt-1 text-xs font-medium text-clay">
                {watchLabel(item)}
              </p>
            ))}
          </li>
        ))}
      {abn ? (
        <li className="rounded-xl border border-line bg-card px-4 py-3 text-sm">
          <p className="font-medium text-ink">ABN</p>
          <p className="mt-1 text-stone-600">{abn}</p>
        </li>
      ) : null}
    </ul>
  );
}
