import { updateBookingHandoverAction } from "@/lib/actions";
import { HANDOVER_LIMITS, hasHandover, type HandoverSource } from "@/lib/handover";

export function HandoverCard({
  bookingId,
  isFamily,
  isSeries,
  saved,
  fields,
}: {
  bookingId: string;
  isFamily: boolean;
  isSeries: boolean;
  saved?: boolean;
  fields: HandoverSource | null;
}) {
  const ready = hasHandover(fields);
  return (
    <section id="handover" className="mt-6 rounded-2xl border border-line bg-card p-5">
      <h2 className="font-semibold text-ink">Sit handover</h2>
      <p className="mt-1 text-sm text-stone-600">
        {isFamily
          ? "Keys, parking, allergies and who to call. The carer sees this before they travel. It stays off the public calendar."
          : "What the family left for this sit. Confirm anything missing on the thread."}
      </p>
      {saved ? <p className="mt-3 rounded-xl bg-sage p-3 text-sm">Handover saved.</p> : null}
      {!ready && !isFamily ? (
        <p className="mt-3 text-sm text-stone-500">No handover yet. Ask the family for access and care notes.</p>
      ) : null}
      {isFamily ? (
        <form action={updateBookingHandoverAction} className="mt-4 space-y-3">
          <input type="hidden" name="bookingId" value={bookingId} />
          <HandoverFields defaults={fields} />
          {isSeries ? (
            <label className="flex items-start gap-2 text-sm text-stone-600">
              <input type="checkbox" name="applySeries" value="1" className="mt-1" />
              Apply to every live week in this series
            </label>
          ) : null}
          <button className="rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white" type="submit">
            Save handover
          </button>
        </form>
      ) : ready ? (
        <HandoverReadout fields={fields} />
      ) : null}
    </section>
  );
}

export function HandoverFields({ defaults }: { defaults?: HandoverSource | null }) {
  return (
    <>
      <label className="block text-sm">
        Access, keys and parking
        <textarea
          name="handoverAccess"
          rows={3}
          maxLength={HANDOVER_LIMITS.handoverAccess}
          defaultValue={defaults?.handoverAccess ?? ""}
          placeholder="Lockbox 2048 on the side gate. Street parking after 6pm."
          className="mt-1 w-full rounded-lg border border-line px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        Care notes
        <textarea
          name="handoverCare"
          rows={3}
          maxLength={HANDOVER_LIMITS.handoverCare}
          defaultValue={defaults?.handoverCare ?? ""}
          placeholder="Allergies, medication, school pickup, bedtime."
          className="mt-1 w-full rounded-lg border border-line px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        Emergency contact
        <input
          name="handoverEmergency"
          maxLength={HANDOVER_LIMITS.handoverEmergency}
          defaultValue={defaults?.handoverEmergency ?? ""}
          placeholder="Alex Martin 0400 111 222"
          className="mt-1 w-full rounded-lg border border-line px-3 py-2"
        />
      </label>
    </>
  );
}

export function HandoverReadout({ fields }: { fields?: HandoverSource | null }) {
  const rows = [
    { label: "Access", value: fields?.handoverAccess },
    { label: "Care notes", value: fields?.handoverCare },
    { label: "Emergency", value: fields?.handoverEmergency },
  ].filter((row) => row.value);
  if (!rows.length) return null;
  return (
    <dl className="mt-4 space-y-3 text-sm">
      {rows.map((row) => (
        <div key={row.label}>
          <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">{row.label}</dt>
          <dd className="mt-1 whitespace-pre-line text-stone-700">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
