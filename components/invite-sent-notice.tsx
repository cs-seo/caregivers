import { inviteSentNotice } from "@/lib/job-invite";

export function InviteSentNotice({
  className = "mb-3 text-sm text-teal",
}: {
  className?: string;
}) {
  return <p className={className}>{inviteSentNotice()}</p>;
}
