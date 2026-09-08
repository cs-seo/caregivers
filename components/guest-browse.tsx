import Link from "next/link";
import { guestBrowseLinks, guestBrowseNotice } from "@/lib/guest-browse";

export function GuestBrowsePanel({ className = "mt-6 rounded-xl bg-sage p-3 text-sm" }: { className?: string }) {
  return (
    <div className={className}>
      <p>{guestBrowseNotice()}</p>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {guestBrowseLinks().map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="font-medium text-teal hover:underline">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
