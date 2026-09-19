import { NextResponse } from "next/server";
import { holdPayment, refundPayment, releasePayment } from "@/lib/escrow";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ ok: true, mode: "demo" });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const payload = await request.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const bookingId =
    "metadata" in event.data.object
      ? (event.data.object as { metadata?: { bookingId?: string } }).metadata?.bookingId
      : undefined;

  if (bookingId && event.type === "payment_intent.succeeded") {
    await holdPayment(bookingId).catch(() => undefined);
  }
  if (bookingId && event.type === "charge.refunded") {
    await refundPayment(bookingId).catch(() => undefined);
  }
  if (bookingId && event.type === "transfer.created") {
    await releasePayment(bookingId).catch(() => undefined);
  }

  return NextResponse.json({ received: true });
}
