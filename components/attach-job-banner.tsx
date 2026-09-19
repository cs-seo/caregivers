import { attachJobPrefix, type AttachJobSurface } from "@/lib/job-match";

export function AttachJobBanner({
  title,
  surface,
  className = "mt-4 rounded-xl border border-teal/25 bg-sage px-3 py-2 text-sm text-ink",
}: {
  title: string;
  surface: AttachJobSurface;
  className?: string;
}) {
  return (
    <p className={className}>
      {attachJobPrefix(surface)} <span className="font-semibold">{title}</span> request and attach the sit
      to that job.
      {surface === "book" ? null : " Invite a carer to apply if you want a proposal first."}
    </p>
  );
}
