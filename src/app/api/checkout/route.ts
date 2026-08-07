import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma } from "@/lib/db";
import { hasEntitlement } from "@/lib/entitlements";
import { offerForLocale } from "@/lib/offers";
import { checkoutIntegrationIdentifier, getStripe } from "@/lib/stripe";
import { readUserSession } from "@/lib/user-session";

const inputSchema = z.object({ reportId: z.string().uuid(), product: z.enum(["classic", "quiz"]).default("classic") });

export async function POST(request: Request) {
  try {
    const { reportId, product } = inputSchema.parse(await request.json());
    const userSession = await readUserSession();
    if (!userSession) return NextResponse.json({ error: "WhatsApp sign-in required" }, { status: 401 });
    const db = getPrisma();
    const report = await db.report.findFirst({
      where: { id: reportId, userId: userSession.userId, deletedAt: null, status: "READY" },
      include: { entitlements: { select: { offerCode: true } } },
    });
    if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });
    if (product === "quiz" && !hasEntitlement(report.entitlements, "classic")) return NextResponse.json({ error: "Unlock the Classic report before adding the quiz" }, { status: 409 });
    if (hasEntitlement(report.entitlements, product)) return NextResponse.json({ checkoutUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin}/r/${reportId}?${product}=unlocked`, alreadyUnlocked: true });
    const offer = offerForLocale(report.locale, product);
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;

    if (!process.env.STRIPE_SECRET_KEY) {
      if (process.env.DEPLOYMENT_ENV === "local" && process.env.ALLOW_DEMO_PAYMENTS === "true") {
        await db.$transaction(async (tx) => {
          const payment = await tx.payment.create({ data: { reportId, stripeCheckoutId: `demo:${crypto.randomUUID()}`, status: "PAID", amount: offer.amount, currency: offer.currency } });
          await tx.entitlement.upsert({ where: { reportId_offerCode: { reportId, offerCode: offer.code } }, create: { reportId, sourcePaymentId: payment.id, offerCode: offer.code }, update: {} });
          if (product === "classic") await tx.report.update({ where: { id: reportId }, data: { paidAt: new Date() } });
        });
        return NextResponse.json({ checkoutUrl: `${origin}/r/${reportId}?${product}=demo` });
      }
      return NextResponse.json({ error: "Payments are not configured" }, { status: 503 });
    }
    if (!offer.stripePriceId) return NextResponse.json({ error: "This offer is not configured" }, { status: 503 });

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${origin}/r/${reportId}?session_id={CHECKOUT_SESSION_ID}&product=${product}`,
      cancel_url: `${origin}/r/${reportId}`,
      client_reference_id: reportId,
      metadata: { reportId, offerCode: offer.code },
      line_items: [{ quantity: 1, price: offer.stripePriceId }],
      integration_identifier: checkoutIntegrationIdentifier(`${reportId}:${offer.code}`),
    }, { idempotencyKey: `checkout:${reportId}:${offer.code}` });
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
