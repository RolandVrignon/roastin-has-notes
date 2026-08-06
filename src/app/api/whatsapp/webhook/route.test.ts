import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getPrismaMock } = vi.hoisted(() => ({ getPrismaMock: vi.fn() }));

vi.mock("@/lib/db", () => ({ getPrisma: getPrismaMock }));

import { POST } from "@/app/api/whatsapp/webhook/route";

const appSecret = "test-whatsapp-app-secret";

function payload(statuses: Array<{ id: string; status: string; timestamp: string; errors?: Array<{ code: number }> }>) {
  return JSON.stringify({
    object: "whatsapp_business_account",
    entry: [{ changes: [{ field: "messages", value: { statuses } }] }],
  });
}

function signedRequest(body: string, signature?: string) {
  const digest = createHmac("sha256", appSecret).update(body).digest("hex");
  return new Request("http://localhost/api/whatsapp/webhook", {
    method: "POST",
    headers: { "x-hub-signature-256": signature ?? `sha256=${digest}` },
    body,
  });
}

function database() {
  const handledEvents = new Set<string>();
  const delivery = { id: "delivery-123", providerMessageId: "wamid.123", status: "QUEUED", lastStatusAt: null as Date | null };
  const tx = {
    whatsappEvent: {
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) => handledEvents.has(where.id) ? { id: where.id } : null),
      create: vi.fn(async ({ data }: { data: { id: string } }) => {
        handledEvents.add(data.id);
        return data;
      }),
    },
    whatsappDelivery: {
      findUnique: vi.fn(async ({ where }: { where: { providerMessageId: string } }) => where.providerMessageId === delivery.providerMessageId ? { ...delivery } : null),
      update: vi.fn(async ({ data }: { data: { status: string; lastStatusAt: Date } }) => {
        delivery.status = data.status;
        delivery.lastStatusAt = data.lastStatusAt;
        return { ...delivery, ...data };
      }),
    },
  };
  const db = { $transaction: vi.fn(async (callback: (client: typeof tx) => unknown) => callback(tx)) };
  return { db, delivery, tx };
}

describe("WhatsApp status webhook", () => {
  beforeEach(() => {
    process.env.WHATSAPP_APP_SECRET = appSecret;
    getPrismaMock.mockReset();
  });

  afterEach(() => {
    delete process.env.WHATSAPP_APP_SECRET;
  });

  it.each([
    ["missing", undefined],
    ["invalid", `sha256=${"0".repeat(64)}`],
  ])("rejects a %s signature before accessing delivery state", async (_label, signature) => {
    const body = payload([{ id: "wamid.123", status: "sent", timestamp: "1786010400" }]);
    const request = signature === undefined
      ? new Request("http://localhost/api/whatsapp/webhook", { method: "POST", body })
      : signedRequest(body, signature);

    const response = await POST(request);

    expect(response.status).toBe(401);
    expect(getPrismaMock).not.toHaveBeenCalled();
  });

  it("processes an exactly replayed status event only once", async () => {
    const { db, tx } = database();
    getPrismaMock.mockReturnValue(db);
    const body = payload([{ id: "wamid.123", status: "delivered", timestamp: "1786010400" }]);

    expect((await POST(signedRequest(body))).status).toBe(200);
    expect((await POST(signedRequest(body))).status).toBe(200);

    expect(tx.whatsappEvent.create).toHaveBeenCalledTimes(1);
    expect(tx.whatsappDelivery.update).toHaveBeenCalledTimes(1);
    expect(tx.whatsappDelivery.update).toHaveBeenCalledWith({
      where: { id: "delivery-123" },
      data: { status: "DELIVERED", lastStatusAt: new Date(1786010400 * 1000), errorCode: null },
    });
  });

  it("does not let a delayed older status overwrite a newer one", async () => {
    const { db, delivery, tx } = database();
    getPrismaMock.mockReturnValue(db);
    const newer = payload([{ id: "wamid.123", status: "read", timestamp: "1786010500" }]);
    const older = payload([{ id: "wamid.123", status: "failed", timestamp: "1786010400", errors: [{ code: 131000 }] }]);

    await POST(signedRequest(newer));
    await POST(signedRequest(older));

    expect(tx.whatsappEvent.create).toHaveBeenCalledTimes(2);
    expect(tx.whatsappDelivery.update).toHaveBeenCalledTimes(1);
    expect(delivery.lastStatusAt).toEqual(new Date(1786010500 * 1000));
    expect(tx.whatsappDelivery.update).toHaveBeenLastCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: "READ", errorCode: null }),
    }));
  });

  it("does not regress a delivery when statuses with different precedence share the same timestamp", async () => {
    const { db, delivery, tx } = database();
    getPrismaMock.mockReturnValue(db);
    const timestamp = "1786010500";
    await POST(signedRequest(payload([{ id: "wamid.123", status: "read", timestamp }])));
    await POST(signedRequest(payload([{ id: "wamid.123", status: "delivered", timestamp }])));

    expect(tx.whatsappEvent.create).toHaveBeenCalledTimes(2);
    expect(tx.whatsappDelivery.update).toHaveBeenCalledTimes(1);
    expect(delivery.status).toBe("READ");
  });
});
