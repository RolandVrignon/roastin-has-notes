import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma } from "@/lib/db";

export const runtime = "nodejs";

const statusSchema = z.object({
  id: z.string(),
  status: z.enum(["sent", "delivered", "read", "failed", "deleted"]),
  timestamp: z.string(),
  errors: z.array(z.object({ code: z.number().optional() }).passthrough()).optional(),
}).passthrough();

const webhookSchema = z.object({
  object: z.literal("whatsapp_business_account"),
  entry: z.array(z.object({
    changes: z.array(z.object({
      field: z.literal("messages"),
      value: z.object({ statuses: z.array(statusSchema).optional() }).passthrough(),
    }).passthrough()),
  }).passthrough()),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const challenge = url.searchParams.get("hub.challenge");
  const token = url.searchParams.get("hub.verify_token");
  if (mode === "subscribe" && challenge && token && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(request: Request) {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  const provided = request.headers.get("x-hub-signature-256");
  const rawBody = await request.text();
  if (!appSecret || !provided?.startsWith("sha256=")) return new NextResponse("Unauthorized", { status: 401 });
  const expected = `sha256=${createHmac("sha256", appSecret).update(rawBody).digest("hex")}`;
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  if (providedBuffer.length !== expectedBuffer.length || !timingSafeEqual(providedBuffer, expectedBuffer)) return new NextResponse("Unauthorized", { status: 401 });

  const parsed = webhookSchema.safeParse(JSON.parse(rawBody));
  if (!parsed.success) return NextResponse.json({ received: true });
  const statuses = parsed.data.entry.flatMap((entry) => entry.changes.flatMap((change) => change.value.statuses ?? []));
  const db = getPrisma();
  for (const status of statuses) {
    const eventId = createHash("sha256").update(`${status.id}:${status.status}:${status.timestamp}`).digest("hex");
    const statusAt = new Date(Number(status.timestamp) * 1000);
    const mapped = { sent: "SENT", delivered: "DELIVERED", read: "READ", failed: "FAILED", deleted: "REVOKED" }[status.status] as "SENT" | "DELIVERED" | "READ" | "FAILED" | "REVOKED";
    await db.$transaction(async (tx) => {
      const existing = await tx.whatsappEvent.findUnique({ where: { id: eventId } });
      if (existing) return;
      await tx.whatsappEvent.create({ data: { id: eventId } });
      const delivery = await tx.whatsappDelivery.findUnique({ where: { providerMessageId: status.id } });
      if (!delivery || (delivery.lastStatusAt && delivery.lastStatusAt > statusAt)) return;
      await tx.whatsappDelivery.update({
        where: { id: delivery.id },
        data: { status: mapped, lastStatusAt: statusAt, errorCode: status.errors?.[0]?.code ? String(status.errors[0].code) : null },
      });
    });
  }
  return NextResponse.json({ received: true });
}
