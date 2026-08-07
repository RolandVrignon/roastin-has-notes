import type Stripe from "stripe";
import { getPrisma } from "@/lib/db";
import { offerKindForCode } from "@/lib/entitlements";
import { offerByCode } from "@/lib/offers";
import { deliverPaidReport } from "@/lib/whatsapp-delivery";

export async function fulfillCheckout(session: Stripe.Checkout.Session, eventId?: string) {
  const reportId = session.client_reference_id;
  const offerCode = session.metadata?.offerCode;
  const offer = offerCode ? offerByCode(offerCode) : null;
  const offerKind = offerCode ? offerKindForCode(offerCode) : null;
  if (!reportId || !offer || !offerKind || session.amount_total !== offer.amount || session.currency !== offer.currency) return false;
  const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  const isPaid = session.payment_status === "paid" || session.payment_status === "no_payment_required";
  const db = getPrisma();

  const result = await db.$transaction(async (tx) => {
    if (eventId) {
      const alreadyHandled = await tx.stripeEvent.findUnique({ where: { id: eventId } });
      if (!alreadyHandled) await tx.stripeEvent.create({ data: { id: eventId, type: "checkout.fulfillment" } });
    }
    const payment = await tx.payment.upsert({
      where: { stripeCheckoutId: session.id },
      create: {
        reportId,
        stripeCheckoutId: session.id,
        stripePaymentIntentId: paymentIntentId,
        status: isPaid ? "PAID" : "PROCESSING",
        amount: session.amount_total ?? offer.amount,
        currency: session.currency ?? offer.currency,
      },
      update: { stripePaymentIntentId: paymentIntentId, status: isPaid ? "PAID" : "PROCESSING" },
    });
    if (!isPaid) return { fulfilled: false } as const;
    await tx.entitlement.upsert({
      where: { reportId_offerCode: { reportId, offerCode: offer.code } },
      create: { reportId, sourcePaymentId: payment.id, offerCode: offer.code },
      update: {},
    });
    if (offerKind === "classic") await tx.report.update({ where: { id: reportId }, data: { paidAt: new Date() } });
    return { fulfilled: true, offerKind } as const;
  }, { isolationLevel: "Serializable" });

  if (result.fulfilled && result.offerKind === "classic") await deliverPaidReport(reportId).catch(() => undefined);
  return result.fulfilled;
}
