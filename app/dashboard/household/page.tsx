import Link from "next/link";
import { redirect } from "next/navigation";
import { HandoverFields } from "@/components/handover-card";
import { applyHouseholdToUpcomingAction, updateFamilyProfileAction } from "@/lib/actions";
import { BOOKING_STATUS } from "@/lib/constants";
import { canFillFromHousehold, hasHandover } from "@/lib/handover";
import { householdNextLinks, householdNextNotice } from "@/lib/household-next";
import { householdSavedLinks, householdSavedNotice, isHouseholdSavedFlash } from "@/lib/household-saved";
import { plural } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getStates } from "@/lib/queries";
import { requireRole } from "@/lib/session";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Household details",
  description: "Update the suburb, funding refs and default handover families share with carers.",
  path: "/dashboard/household",
  noIndex: true,
});

export default async function HouseholdPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; copied?: string }>;
}) {
  const user = await requireRole("FAMILY");
  if (!user) redirect("/login?callbackUrl=/dashboard/household");
  const query = await searchParams;
  const states = await getStates();
  const liveBookings = await prisma.booking.findMany({
    where: {
      familyId: user.id,
      status: {
        notIn: [BOOKING_STATUS.CANCELLED, BOOKING_STATUS.REFUNDED, BOOKING_STATUS.RELEASED],
      },
    },
    select: { id: true, handoverAccess: true, handoverCare: true, handoverEmergency: true },
  });
  const emptyCount = liveBookings.filter((booking) => canFillFromHousehold(booking, user.familyProfile)).length;

  return (
    <div className="mx-auto max-w-xl">
      <p className="text-sm">
        <Link href="/dashboard" className="text-teal">
          Back to dashboard
        </Link>
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-ink">Household details</h1>
      <p className="mt-2 text-stone-600">
        Carers see the suburb on care requests. NDIS and My Aged Care numbers print on tax invoices and the
        financial-year statement. Default handover notes copy onto new bookings so you are not retyping keys and
        allergies each week. Empty upcoming sits can pull the same defaults without overwriting notes already on a
        booking.
      </p>
      {isHouseholdSavedFlash(query.saved) ? (
        <div className="mt-4 rounded-xl bg-sage p-3 text-sm">
          <p>{householdSavedNotice()}</p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {householdSavedLinks().map((link) => (
              <Link key={link.href} href={link.href} className="font-medium text-teal hover:underline">
                {link.label}
              </Link>
            ))}
          </p>
        </div>
      ) : !query.copied ? (
        <div className="mt-4 rounded-xl bg-sage p-3 text-sm">
          <p>{householdNextNotice()}</p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {householdNextLinks().map((link) => (
              <Link key={link.href} href={link.href} className="font-medium text-teal hover:underline">
                {link.label}
              </Link>
            ))}
          </p>
        </div>
      ) : null}
      {query.copied ? (
        <p className="mt-4 rounded-xl bg-sage p-3 text-sm">
          Copied household defaults onto {plural(Number(query.copied), "upcoming sit")}. Sit-specific notes were left
          as they were.
        </p>
      ) : null}
      {hasHandover(user.familyProfile) && emptyCount > 0 ? (
        <form action={applyHouseholdToUpcomingAction} className="mt-4 rounded-2xl border border-line bg-card p-5">
          <p className="text-sm text-stone-700">
            {plural(emptyCount, "upcoming sit")} {emptyCount === 1 ? "has" : "have"} empty handover fields. Copy
            household defaults onto those sits only — existing notes stay.
          </p>
          <button className="mt-3 rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white" type="submit">
            Copy onto empty upcoming sits
          </button>
        </form>
      ) : null}
      <form action={updateFamilyProfileAction} className="mt-6 space-y-4 rounded-2xl border border-line bg-card p-5">
        <label className="block text-sm">
          Phone
          <input
            name="phone"
            defaultValue={user.phone ?? ""}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Suburb
          <input
            name="suburb"
            defaultValue={user.familyProfile?.suburb ?? ""}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          City
          <select
            name="cityId"
            defaultValue={user.familyProfile?.cityId ?? ""}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
          >
            <option value="">Select a city</option>
            {states.flatMap((state) =>
              state.cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}, {state.abbrev}
                </option>
              )),
            )}
          </select>
        </label>
        <label className="block text-sm">
          NDIS number (optional)
          <input
            name="ndisNumber"
            defaultValue={user.familyProfile?.ndisNumber ?? ""}
            placeholder="430 112 223"
            maxLength={40}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          My Aged Care / HCP reference (optional)
          <input
            name="agedCareRef"
            defaultValue={user.familyProfile?.agedCareRef ?? ""}
            placeholder="HCP-NSW-88421"
            maxLength={40}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Notes for carers
          <textarea
            name="bio"
            rows={4}
            defaultValue={user.familyProfile?.bio ?? ""}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
          />
        </label>
        <fieldset className="space-y-3 rounded-xl border border-line p-4">
          <legend className="px-1 text-sm font-medium text-ink">Default sit handover</legend>
          <p className="text-sm text-stone-600">
            Copied onto Instant Book and request-to-book sits. You can still edit one booking without changing the
            household default, or copy these notes onto empty upcoming sits from the button above.
          </p>
          <HandoverFields defaults={user.familyProfile} />
        </fieldset>
        <button className="rounded-xl bg-teal px-5 py-2.5 font-medium text-white" type="submit">
          Save household
        </button>
      </form>
    </div>
  );
}
