import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma } from "@/lib/db";
import { viewerReportWhere } from "@/lib/report-access";
import { getStripe } from "@/lib/stripe";

const paramsSchema = z.object({ reportId: z.string().uuid() });

export async function GET(_: Request, context: { params: Promise<{ reportId: string }> }) {
  try {
    const { reportId } = paramsSchema.parse(await context.params);
    const access = await viewerReportWhere();
    if (!access || !process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: "Receipt unavailable" }, { status: 404 });
    const payment = await getPrisma().payment.findFirst({
      where: { reportId, status: "PAID", stripePaymentIntentId: { not: null }, report: { ...access, deletedAt: null } },
      orderBy: { createdAt: "desc" },
      select: { stripePaymentIntentId: true },
    });
    if (!payment?.stripePaymentIntentId) return NextResponse.json({ error: "Receipt unavailable" }, { status: 404 });
    const intent = await getStripe().paymentIntents.retrieve(payment.stripePaymentIntentId, { expand: ["latest_charge"] });
    const charge = typeof intent.latest_charge === "string" ? null : intent.latest_charge;
    if (!charge?.receipt_url) return NextResponse.json({ error: "Receipt unavailable" }, { status: 404 });
    return NextResponse.redirect(charge.receipt_url, 303);
  } catch {
    return NextResponse.json({ error: "Receipt unavailable" }, { status: 404 });
  }
}
