import Link from "next/link";
import { toggleShortlistAction } from "@/lib/actions";

export function ShortlistButton({
  caregiverId,
  saved,
  next,
  signedIn,
  compact = false,
}: {
  caregiverId: string;
  saved: boolean;
  next: string;
  signedIn: boolean;
  compact?: boolean;
}) {
  const className = compact
    ? "rounded-full border border-line px-3 py-1 text-xs font-medium no-underline hover:border-teal hover:text-teal"
    : "rounded-full border border-line px-4 py-2 text-sm font-medium no-underline hover:border-teal hover:text-teal";

  if (!signedIn) {
    return (
      <Link href={`/login?callbackUrl=${encodeURIComponent(next)}`} className={className}>
        Save to shortlist
      </Link>
    );
  }

  return (
    <form action={toggleShortlistAction}>
      <input type="hidden" name="caregiverId" value={caregiverId} />
      <input type="hidden" name="next" value={next} />
      <button type="submit" className={saved ? `${className} border-teal bg-sage text-teal` : className}>
        {saved ? "Saved" : "Save to shortlist"}
      </button>
    </form>
  );
}
