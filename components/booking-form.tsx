import { createBookingAction } from "@/lib/actions";
import { BOOKING_OCCASIONS } from "@/lib/constants";
import { formatAud, quoteBooking, quoteDaySit, quoteOvernightSit } from "@/lib/money";

export function BookingForm({
  slug,
  specialties,
  hourlyRateCents,
  instantBook,
  defaultStart,
}: {
  slug: string;
  specialties: { id: string; name: string }[];
  hourlyRateCents: number;
  instantBook: boolean;
  defaultStart?: string;
}) {
  const sample = quoteBooking(hourlyRateCents, 4);
  const day = quoteDaySit(hourlyRateCents);
  const overnight = quoteOvernightSit(hourlyRateCents);
  const childCare = specialties.some((item) =>
    ["Babysitter", "Nanny", "After-school care"].includes(item.name),
  );

  return (
    <form action={createBookingAction} className="space-y-4">
      <input type="hidden" name="slug" value={slug} />
      <label className="block text-sm">
        <span className="font-medium text-stone-700">Care type</span>
        <select name="specialtyId" required className="mt-1 w-full rounded-xl border border-line px-3 py-2.5">
          {specialties.map((specialty) => (
            <option key={specialty.id} value={specialty.id}>
              {specialty.name}
            </option>
          ))}
        </select>
      </label>
      {childCare ? (
        <>
          <label className="block text-sm">
            <span className="font-medium text-stone-700">Occasion</span>
            <select name="occasion" className="mt-1 w-full rounded-xl border border-line px-3 py-2.5">
              {BOOKING_OCCASIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-stone-700">Children</span>
            <select name="children" className="mt-1 w-full rounded-xl border border-line px-3 py-2.5">
              {["1", "2", "3", "4+"].map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-xs text-stone-500">
              No extra per sibling. The hourly rate stays the same for the household.
            </span>
          </label>
        </>
      ) : null}
      <label className="block text-sm">
        <span className="font-medium text-stone-700">Start</span>
        <input
          type="datetime-local"
          name="startAt"
          required
          defaultValue={defaultStart}
          className="mt-1 w-full rounded-xl border border-line px-3 py-2.5"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium text-stone-700">Hours</span>
        <input
          type="number"
          name="hours"
          min={1}
          max={24}
          step={0.5}
          defaultValue={4}
          required
          className="mt-1 w-full rounded-xl border border-line px-3 py-2.5"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium text-stone-700">Notes for the carer</span>
        <textarea
          name="notes"
          rows={4}
          placeholder="Who the care is for, access, routines, allergies, parking..."
          className="mt-1 w-full rounded-xl border border-line px-3 py-2.5"
        />
      </label>
      <div className="rounded-xl bg-sage/60 p-4 text-sm">
        <p className="font-medium text-teal-deep">Example quotes at this rate</p>
        <ul className="mt-2 space-y-1 text-stone-700">
          <li className="flex justify-between">
            <span>4-hour evening</span>
            <span>{formatAud(sample.totalCents)} into escrow</span>
          </li>
          <li className="flex justify-between">
            <span>Weekday day sit (8 hrs)</span>
            <span>{formatAud(day.totalCents)}</span>
          </li>
          <li className="flex justify-between">
            <span>Overnight (10 hrs)</span>
            <span>{formatAud(overnight.totalCents)}</span>
          </li>
        </ul>
        <p className="mt-2 text-xs text-stone-600">
          Rate includes GST. CareProof adds 10% on top and holds the total until you confirm. Sits that run after
          midnight should be agreed in the notes — some sitters add an after-midnight rate.
        </p>
      </div>
      <button type="submit" className="w-full rounded-xl bg-teal py-3 font-semibold text-white hover:bg-teal-deep">
        {instantBook ? "Book and pay into escrow" : "Request to book"}
      </button>
    </form>
  );
}
