import Link from "next/link";
import { legalNextLinks, legalNextNotice } from "@/lib/legal-next";

export function LegalNextPanel({ className = "mt-8 rounded-xl bg-sage p-3 text-sm" }: { className?: string }) {
  return (
    <div className={className}>
      <p>{legalNextNotice()}</p>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {legalNextLinks().map((link) => (
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
