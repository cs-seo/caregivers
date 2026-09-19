import Link from "next/link";
import { postedJobLinks, postedJobNotice, type PostedJobPlace } from "@/lib/job-post";

export function PostedJobFlash({
  job,
  className = "text-sm text-teal",
}: {
  job: PostedJobPlace;
  className?: string;
}) {
  return (
    <div className={className}>
      <p>{postedJobNotice()}</p>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {postedJobLinks(job).map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="font-medium hover:underline">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
