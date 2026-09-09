import Link from "next/link";
import { familyStartLinks, familyStartNotice } from "@/lib/family-start";

export function FamilyStartPanel({ className = "mt-8 rounded-xl bg-sage p-3 text-sm" }: { className?: string }) {
  return (
    <div className={className}>
      <p>{familyStartNotice()}</p>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {familyStartLinks().map((link) => (
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
