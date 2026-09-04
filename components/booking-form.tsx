import { createBookingAction } from "@/lib/actions";
import { formatAud, quoteBooking } from "@/lib/money";

export function BookingForm({
  slug,
  specialties,
  hourlyRateCents,
  instantBook,
}: {
  slug: string;
  specialties: { id: string; name: string }[];
  hourlyRateCents: number;
  instantBook: boolean;
}) {
  const sample = quoteBooking(hourlyRateCents, 4);
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
      <label className="block text-sm">
        <span className="font-medium text-stone-700">Start</span>
        <input
          type="datetime-local"
          name="startAt"
          required
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
          placeholder="Who the care is for, access, routines, parking..."
          className="mt-1 w-full rounded-xl border border-line px-3 py-2.5"
        />
      </label>
      <div className="rounded-xl bg-sage/60 p-4 text-sm">
        <p className="font-medium text-teal-deep">Example for 4 hours</p>
        <ul className="mt-2 space-y-1 text-stone-700">
          <li className="flex justify-between">
            <span>Care at {formatAud(hourlyRateCents)}/hr</span>
            <span>{formatAud(sample.subtotalCents)}</span>
          </li>
          <li className="flex justify-between">
            <span>GST included in rate</span>
            <span>{formatAud(sample.gstCents)}</span>
          </li>
          <li className="flex justify-between">
            <span>CareProof fee (10%)</span>
            <span>{formatAud(sample.platformFeeCents)}</span>
          </li>
          <li className="flex justify-between font-semibold text-ink">
            <span>You pay into escrow</span>
            <span>{formatAud(sample.totalCents)}</span>
          </li>
        </ul>
        <p className="mt-2 text-xs text-stone-600">
          Funds stay with CareProof until you confirm the booking. The carer is paid only after release.
        </p>
      </div>
      <button type="submit" className="w-full rounded-xl bg-teal py-3 font-semibold text-white hover:bg-teal-deep">
        {instantBook ? "Book and pay into escrow" : "Request to book"}
      </button>
    </form>
  );
}
