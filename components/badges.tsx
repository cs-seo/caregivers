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
  credentials: { type: string; verified: boolean }[];
  abn?: string | null;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {credentials
        .filter((c) => c.verified)
        .map((credential) => (
          <Badge key={credential.type}>{credentialLabel(credential.type)}</Badge>
        ))}
      {abn ? <Badge tone="stone">ABN {abn}</Badge> : null}
    </div>
  );
}
