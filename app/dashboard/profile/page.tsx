import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/badges";
import { WeeklyHoursField } from "@/components/weekly-hours-field";
import {
  addBlockedDateAction,
  addCredentialAction,
  addWorkHistoryAction,
  removeBlockedDateAction,
  removeCredentialAction,
  removeWorkHistoryAction,
  updateCaregiverProfileAction,
} from "@/lib/actions";
import { CREDENTIAL_LABELS, CREDENTIAL_TYPES } from "@/lib/constants";
import { credentialLabel } from "@/lib/trust";
import { credentialWatchlist, watchLabel } from "@/lib/credentials";
import { monthYear } from "@/lib/format";
import { profileChecklist } from "@/lib/profile";
import { getSpecialties, getStates, getUpcomingAvailability } from "@/lib/queries";
import { requireRole } from "@/lib/session";
import { pageMeta } from "@/lib/seo";
import { prisma } from "@/lib/prisma";

export const metadata = pageMeta({
  title: "Edit your carer profile",
  description: "Update the public CareProof profile families see.",
  path: "/dashboard/profile",
  noIndex: true,
});

export default async function CarerProfileEditorPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string; saved?: string; error?: string }>;
}) {
  const user = await requireRole("CAREGIVER");
  if (!user?.caregiverProfile) redirect("/login?callbackUrl=/dashboard/profile");
  const query = await searchParams;

  const [profile, specialties, states, upcoming] = await Promise.all([
    prisma.caregiverProfile.findUnique({
      where: { id: user.caregiverProfile.id },
      include: {
        specialties: true,
        credentials: true,
        workHistory: { orderBy: { startDate: "desc" } },
        city: { include: { state: true } },
      },
    }),
    getSpecialties(),
    getStates(),
    getUpcomingAvailability(user.caregiverProfile.id, 21),
  ]);
  if (!profile) redirect("/dashboard");

  const checklist = profileChecklist(profile);
  const expiring = credentialWatchlist(profile.credentials);
  const selected = new Set(profile.specialties.map((item) => item.specialtyId));

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-sm">
        <Link href="/dashboard" className="text-teal">
          Back to dashboard
        </Link>
        {" · "}
        <Link href={`/caregiver/${profile.slug}`} className="text-teal">
          View public profile
        </Link>
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-ink">Your carer profile</h1>
      <p className="mt-2 text-stone-600">
        Families see this on specialty and suburb pages. Complete the checklist so you appear in the right searches.
      </p>

      {query.welcome ? (
        <p className="mt-4 rounded-xl bg-sage p-3 text-sm">
          Welcome. Add a headline, specialties and at least one check so families can find you.
        </p>
      ) : null}
      {query.saved ? (
        <p className="mt-4 rounded-xl bg-sage p-3 text-sm">Profile saved.</p>
      ) : null}
      {query.error ? (
        <p className="mt-4 rounded-xl bg-orange-50 p-3 text-sm text-clay">
          Check the required fields and try again.
        </p>
      ) : null}
      {expiring.length ? (
        <p className="mt-4 rounded-xl bg-orange-50 p-3 text-sm text-clay">
          {expiring.map((item) => watchLabel(item)).join(" · ")}
        </p>
      ) : null}

      <section className="mt-6 rounded-2xl border border-line bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold text-ink">Profile completeness</h2>
          <Badge tone={checklist.ready ? "teal" : "clay"}>
            {checklist.complete}/{checklist.total}
          </Badge>
        </div>
        <ul className="mt-3 space-y-1 text-sm">
          {checklist.items.map((item) => (
            <li key={item.key} className={item.done ? "text-stone-500" : "text-ink"}>
              {item.done ? "Done — " : "To do — "}
              {item.label}
            </li>
          ))}
        </ul>
      </section>

      <form action={updateCaregiverProfileAction} className="mt-8 space-y-4 rounded-2xl border border-line bg-card p-5">
        <h2 className="font-semibold text-ink">Public details</h2>
        <label className="block text-sm">
          Headline
          <input
            name="headline"
            required
            defaultValue={profile.headline}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          About you
          <textarea
            name="bio"
            required
            rows={5}
            defaultValue={profile.bio}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            Hourly rate (AUD)
            <input
              name="hourlyRateAud"
              type="number"
              min={20}
              step="0.5"
              required
              defaultValue={(profile.hourlyRateCents / 100).toFixed(2)}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Years of experience
            <input
              name="yearsExperience"
              type="number"
              min={0}
              required
              defaultValue={profile.yearsExperience}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2"
            />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            Suburb
            <input
              name="suburb"
              required
              defaultValue={profile.suburb}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            City
            <select name="cityId" required defaultValue={profile.cityId} className="mt-1 w-full rounded-lg border border-line px-3 py-2">
              {states.flatMap((state) =>
                state.cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}, {state.abbrev}
                  </option>
                )),
              )}
            </select>
          </label>
        </div>
        <label className="block text-sm">
          ABN (optional)
          <input name="abn" defaultValue={profile.abn ?? ""} className="mt-1 w-full rounded-lg border border-line px-3 py-2" />
        </label>
        <fieldset className="text-sm">
          <legend className="mb-2 font-medium">Specialties</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {specialties.map((specialty) => (
              <label key={specialty.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="specialtyId"
                  value={specialty.id}
                  defaultChecked={selected.has(specialty.id)}
                />
                {specialty.name}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="instantBook" value="1" defaultChecked={profile.instantBook} />
            Instant Book
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="availableNow" value="1" defaultChecked={profile.availableNow} />
            Available now
          </label>
        </div>
        <WeeklyHoursField defaultValue={profile.weeklyHours ?? ""} />
        <label className="block text-sm">
          Availability note (optional)
          <textarea
            name="availabilityNote"
            rows={2}
            maxLength={240}
            defaultValue={profile.availabilityNote ?? ""}
            placeholder="Weekday mornings around your suburb. Overnight with 48 hours’ notice."
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
          />
          <span className="mt-1 block text-xs text-stone-500">Shown on your public profile and directory cards. 240 characters max.</span>
        </label>
        <button className="rounded-xl bg-teal px-5 py-2.5 font-medium text-white" type="submit">
          Save profile
        </button>
      </form>

      <section className="mt-8 rounded-2xl border border-line bg-card p-5">
        <h2 className="font-semibold text-ink">Days off</h2>
        <p className="mt-1 text-sm text-stone-600">
          Mark a day away and families cannot book it, or find you with Needed on that date. Marking today away also
          pauses Instant Book until tomorrow — families send a request instead of paying into escrow immediately. Booked
          sits still show as booked.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {upcoming.map((day) => (
            <form
              key={day.key}
              action={day.blocked ? removeBlockedDateAction : addBlockedDateAction}
              className="text-xs"
            >
              <input type="hidden" name="dateKey" value={day.key} />
              <button
                className={`w-full rounded-xl px-2 py-2 ${
                  day.blocked
                    ? "bg-stone-100 text-stone-700"
                    : day.booked
                      ? "bg-orange-50 text-clay"
                      : "bg-sage text-teal-deep"
                }`}
                type="submit"
              >
                <span className="block font-medium">{day.label}</span>
                <span className="mt-0.5 block">
                  {day.blocked ? "Away · clear" : day.booked ? "Booked · mark away" : "Open · mark away"}
                </span>
              </button>
            </form>
          ))}
        </div>
        <form action={addBlockedDateAction} className="mt-4 flex flex-wrap items-end gap-3">
          <label className="block text-sm">
            Another date
            <input type="date" name="dateKey" required className="mt-1 rounded-lg border border-line px-3 py-2" />
          </label>
          <label className="block text-sm">
            Note (optional)
            <input name="note" maxLength={80} placeholder="School holidays" className="mt-1 rounded-lg border border-line px-3 py-2" />
          </label>
          <button className="rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white" type="submit">
            Add day off
          </button>
        </form>
      </section>

      <section className="mt-8 rounded-2xl border border-line bg-card p-5">
        <h2 className="font-semibold text-ink">Checks and registrations</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {profile.credentials.length === 0 ? (
            <li className="text-stone-500">No checks added yet.</li>
          ) : (
            profile.credentials.map((credential) => (
              <li key={credential.id} className="flex items-start justify-between gap-3 rounded-xl border border-line px-3 py-2">
                <div>
                  <p className="font-medium">{credentialLabel(credential.type, credential.issuingState)}</p>
                  <p className="text-stone-500">
                    {credential.number ? `No. ${credential.number}` : "Number on file later"}
                    {credential.issuingState ? ` · ${credential.issuingState.toUpperCase()}` : ""}
                    {credential.expiresAt ? ` · expires ${monthYear(credential.expiresAt)}` : ""}
                    {credential.verified ? " · verified" : " · pending review"}
                  </p>
                </div>
                <form action={removeCredentialAction}>
                  <input type="hidden" name="credentialId" value={credential.id} />
                  <button className="text-xs text-clay" type="submit">
                    Remove
                  </button>
                </form>
              </li>
            ))
          )}
        </ul>
        <form action={addCredentialAction} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            Type
            <select name="type" required className="mt-1 w-full rounded-lg border border-line px-3 py-2">
              {Object.values(CREDENTIAL_TYPES).map((type) => (
                <option key={type} value={type}>
                  {CREDENTIAL_LABELS[type]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Number
            <input name="number" className="mt-1 w-full rounded-lg border border-line px-3 py-2" />
          </label>
          <label className="block text-sm">
            Issuing state
            <input name="issuingState" placeholder="nsw" className="mt-1 w-full rounded-lg border border-line px-3 py-2" />
          </label>
          <label className="block text-sm">
            Expires
            <input name="expiresAt" type="date" className="mt-1 w-full rounded-lg border border-line px-3 py-2" />
          </label>
          <button className="rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white sm:col-span-2" type="submit">
            Add check
          </button>
        </form>
      </section>

      <section className="mt-8 rounded-2xl border border-line bg-card p-5">
        <h2 className="font-semibold text-ink">Work history</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {profile.workHistory.length === 0 ? (
            <li className="text-stone-500">No roles added yet.</li>
          ) : (
            profile.workHistory.map((role) => (
              <li key={role.id} className="flex items-start justify-between gap-3 rounded-xl border border-line px-3 py-2">
                <div>
                  <p className="font-medium">
                    {role.title} · {role.employer}
                  </p>
                  <p className="text-stone-500">
                    {monthYear(role.startDate)} – {role.endDate ? monthYear(role.endDate) : "Present"} · {role.hours.toLocaleString("en-AU")} hours
                  </p>
                </div>
                <form action={removeWorkHistoryAction}>
                  <input type="hidden" name="workId" value={role.id} />
                  <button className="text-xs text-clay" type="submit">
                    Remove
                  </button>
                </form>
              </li>
            ))
          )}
        </ul>
        <form action={addWorkHistoryAction} className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              Title
              <input name="title" required className="mt-1 w-full rounded-lg border border-line px-3 py-2" />
            </label>
            <label className="block text-sm">
              Employer
              <input name="employer" required className="mt-1 w-full rounded-lg border border-line px-3 py-2" />
            </label>
            <label className="block text-sm">
              Start
              <input name="startDate" type="date" required className="mt-1 w-full rounded-lg border border-line px-3 py-2" />
            </label>
            <label className="block text-sm">
              End (optional)
              <input name="endDate" type="date" className="mt-1 w-full rounded-lg border border-line px-3 py-2" />
            </label>
          </div>
          <label className="block text-sm">
            Hours
            <input name="hours" type="number" min={0} defaultValue={200} className="mt-1 w-full rounded-lg border border-line px-3 py-2" />
          </label>
          <label className="block text-sm">
            Duties
            <textarea name="duties" required rows={3} className="mt-1 w-full rounded-lg border border-line px-3 py-2" />
          </label>
          <button className="rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white" type="submit">
            Add role
          </button>
        </form>
      </section>
    </div>
  );
}
