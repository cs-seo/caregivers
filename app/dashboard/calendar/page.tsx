import Link from "next/link";
import { redirect } from "next/navigation";
import { rotateCalendarFeedAction } from "@/lib/actions";
import { newCalendarToken, subscribeUrls } from "@/lib/calendar-feed";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Calendar subscribe",
  description: "Subscribe to your CareProof roster in Google Calendar or Apple Calendar.",
  path: "/dashboard/calendar",
  noIndex: true,
});

export default async function CalendarSubscribePage() {
  const user = await requireUser();
  if (!user) redirect("/login?callbackUrl=/dashboard/calendar");

  const feed = await prisma.calendarFeed.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id, token: newCalendarToken() },
  });
  const urls = subscribeUrls(feed.token);

  return (
    <div className="mx-auto max-w-xl">
      <p className="text-sm">
        <Link href="/dashboard" className="text-teal">
          Back to dashboard
        </Link>
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-ink">Subscribe to your calendar</h1>
      <p className="mt-2 text-stone-600">
        Add this private feed to Google Calendar or Apple Calendar. It stays up to date when sits are booked,
        cancelled or you mark a day away. Anyone with the link can see sit titles
        {user.role === "CAREGIVER" ? " and your days off" : ""}.
      </p>
      <div className="mt-6 space-y-4 rounded-2xl border border-line bg-card p-5">
        <label className="block text-sm">
          <span className="font-medium text-ink">Subscribe link</span>
          <input readOnly value={urls.webcal} className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">HTTPS feed</span>
          <input readOnly value={urls.https} className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm" />
        </label>
        <p className="text-sm">
          <a href={urls.webcal} className="font-medium text-teal">
            Open in your calendar app
          </a>
          {" · "}
          <a href={urls.https} className="text-teal">
            Preview the feed
          </a>
          {" · "}
          <a href="/dashboard/calendar/ics" className="text-teal">
            Download a snapshot
          </a>
        </p>
      </div>
      <form action={rotateCalendarFeedAction} className="mt-6">
        <button className="rounded-lg border border-line px-4 py-2 text-sm" type="submit">
          Create a new secret link
        </button>
        <p className="mt-2 text-xs text-stone-500">
          The old link stops working. Use this if you shared the feed by mistake.
        </p>
      </form>
    </div>
  );
}
