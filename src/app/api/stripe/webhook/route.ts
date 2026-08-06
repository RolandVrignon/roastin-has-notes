import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getPrisma } from "@/lib/db";
import { fulfillCheckout } from "@/lib/stripe-fulfillment";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const apiKey = process.env.STRIPE_SECRET_KEY;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !apiKey || !signature) return NextResponse.json({ error: "Webhook is not configured" }, { status: 503 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    await fulfillCheckout(event.data.object, event.id);
  } else if (event.type === "checkout.session.async_payment_failed" || event.type === "checkout.session.expired") {
    await getPrisma().$transaction(async (tx) => {
      const alreadyHandled = await tx.stripeEvent.findUnique({ where: { id: event.id } });
      if (alreadyHandled) return;
      await tx.stripeEvent.create({ data: { id: event.id, type: event.type } });
      await tx.payment.updateMany({ where: { stripeCheckoutId: event.data.object.id, status: { in: ["PENDING", "PROCESSING"] } }, data: { status: "FAILED" } });
    }, { isolationLevel: "Serializable" });
  }
  return NextResponse.json({ received: true });
}
