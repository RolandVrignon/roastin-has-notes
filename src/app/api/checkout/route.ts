import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma } from "@/lib/db";
import { offerForLocale } from "@/lib/offers";
import { checkoutIntegrationIdentifier, getStripe } from "@/lib/stripe";
import { readUserSession } from "@/lib/user-session";

const inputSchema = z.object({ reportId: z.string().uuid() });

export async function POST(request: Request) {
  try {
    const { reportId } = inputSchema.parse(await request.json());
    const userSession = await readUserSession();
    if (!userSession) return NextResponse.json({ error: "WhatsApp sign-in required" }, { status: 401 });
    const db = getPrisma();
    const report = await db.report.findFirst({ where: { id: reportId, userId: userSession.userId, deletedAt: null, status: "READY" } });
    if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });
    const offer = offerForLocale(report.locale);
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;

    if (!process.env.STRIPE_SECRET_KEY) {
      if (process.env.DEPLOYMENT_ENV === "local" && process.env.ALLOW_DEMO_PAYMENTS === "true") {
        await db.$transaction(async (tx) => {
          const payment = await tx.payment.create({ data: { reportId, stripeCheckoutId: `demo:${crypto.randomUUID()}`, status: "PAID", amount: offer.amount, currency: offer.currency } });
          await tx.entitlement.upsert({ where: { reportId }, create: { reportId, sourcePaymentId: payment.id, offerCode: offer.code }, update: {} });
          await tx.report.update({ where: { id: reportId }, data: { paidAt: new Date() } });
        });
        return NextResponse.json({ checkoutUrl: `${origin}/r/${reportId}?unlocked=demo` });
      }
      return NextResponse.json({ error: "Payments are not configured" }, { status: 503 });
    }
    if (!offer.stripePriceId) return NextResponse.json({ error: "This offer is not configured" }, { status: 503 });

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${origin}/r/${reportId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/r/${reportId}`,
      client_reference_id: reportId,
      metadata: { reportId, offerCode: offer.code },
      line_items: [{ quantity: 1, price: offer.stripePriceId }],
      integration_identifier: checkoutIntegrationIdentifier(reportId),
    }, { idempotencyKey: `checkout:${reportId}` });
    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    await db.payment.upsert({
      where: { stripeCheckoutId: session.id },
      create: { reportId, stripeCheckoutId: session.id, status: "PENDING", amount: offer.amount, currency: offer.currency },
      update: {},
    });
    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid report" }, { status: 400 });
    return NextResponse.json({ error: "Checkout could not be started" }, { status: 500 });
  }
}
