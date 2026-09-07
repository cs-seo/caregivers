import Link from "next/link";
import { formatAud } from "@/lib/money";

export function MobileBookBar({
  slug,
  hourlyRateCents,
  instantBook,
}: {
  slug: string;
  hourlyRateCents: number;
  instantBook: boolean;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/95 p-3 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-teal">{formatAud(hourlyRateCents)}</p>
          <p className="text-xs text-stone-500">per hour, inc GST</p>
        </div>
        <Link
          href={`/caregiver/${slug}/book`}
          className="rounded-xl bg-teal px-5 py-2.5 text-sm font-semibold text-white no-underline"
        >
          {instantBook ? "Book now" : "Request to book"}
        </Link>
      </div>
    </div>
  );
}
