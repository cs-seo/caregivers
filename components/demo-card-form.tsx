import { DEMO_VISA_DISPLAY } from "@/lib/demo-card";

export function DemoCardForm({
  bookingId,
  action,
  submitLabel,
  amountLabel,
}: {
  bookingId: string;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  amountLabel: string;
}) {
  return (
    <form action={action} className="w-full space-y-3 rounded-2xl border border-line bg-card p-5">
      <input type="hidden" name="bookingId" value={bookingId} />
      <p className="font-medium text-ink">Pay {amountLabel} into escrow</p>
      <p className="text-xs text-stone-500">
        Demo card only — there are no live Stripe keys here. Use Visa {DEMO_VISA_DISPLAY}, any expiry in this month
        or later, and any 3-digit CVC.
      </p>
      <label className="block text-xs text-stone-500">
        Name on card
        <input
          name="cardName"
          required
          autoComplete="cc-name"
          defaultValue="Alex Martin"
          className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm text-ink"
        />
      </label>
      <label className="block text-xs text-stone-500">
        Card number
        <input
          name="cardNumber"
          required
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder={DEMO_VISA_DISPLAY}
          className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm text-ink"
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-xs text-stone-500">
          Expiry
          <input
            name="cardExpiry"
            required
            autoComplete="cc-exp"
            placeholder="10/26"
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm text-ink"
          />
        </label>
        <label className="block text-xs text-stone-500">
          CVC
          <input
            name="cardCvc"
            required
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="123"
            maxLength={4}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm text-ink"
          />
        </label>
      </div>
      <button className="rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}
