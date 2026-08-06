import type Stripe from "stripe";
import { getPrisma } from "@/lib/db";
import { sendReportAccessEmail } from "@/lib/email";
import { offerByCode } from "@/lib/offers";

export async function fulfillCheckout(session: Stripe.Checkout.Session, eventId?: string) {
  const reportId = session.client_reference_id;
  const offerCode = session.metadata?.offerCode;
  const offer = offerCode ? offerByCode(offerCode) : null;
  if (!reportId || !offer) return false;
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
      where: { reportId },
      create: { reportId, sourcePaymentId: payment.id, offerCode: offer.code },
      update: {},
    });
    const email = session.customer_details?.email?.trim().toLowerCase();
    const user = email && email.length <= 254
      ? await tx.user.upsert({ where: { email }, create: { email }, update: {} })
      : null;
    const report = await tx.report.update({
      where: { id: reportId },
      data: { paidAt: new Date(), ...(user ? { userId: user.id } : {}) },
      select: { chatName: true },
    });
    return { fulfilled: true, paymentId: payment.id, email: user?.email, chatName: report.chatName } as const;
  }, { isolationLevel: "Serializable" });

  if (result.fulfilled && result.email) {
    await sendReportAccessEmail({ email: result.email, reportId, chatName: result.chatName, paymentId: result.paymentId }).catch(() => undefined);
  }
  return result.fulfilled;
}
