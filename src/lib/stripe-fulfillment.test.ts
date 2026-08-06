import type Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getPrismaMock } = vi.hoisted(() => ({ getPrismaMock: vi.fn() }));

vi.mock("@/lib/db", () => ({ getPrisma: getPrismaMock }));

import { fulfillCheckout } from "@/lib/stripe-fulfillment";

function checkout(overrides: Partial<Stripe.Checkout.Session> = {}) {
  return {
    id: "cs_test_123",
    client_reference_id: "report-123",
    metadata: { offerCode: "classic_usd" },
    payment_intent: "pi_test_123",
    payment_status: "paid",
    amount_total: 1299,
    currency: "usd",
    ...overrides,
  } as Stripe.Checkout.Session;
}

function database() {
  const handledEvents = new Set<string>();
  const tx = {
    stripeEvent: {
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) => handledEvents.has(where.id) ? { id: where.id } : null),
      create: vi.fn(async ({ data }: { data: { id: string } }) => {
        handledEvents.add(data.id);
        return data;
      }),
    },
    payment: { upsert: vi.fn(async () => ({ id: "payment-123" })) },
    entitlement: { upsert: vi.fn(async () => ({ id: "entitlement-123" })) },
    user: { upsert: vi.fn(async () => ({ id: "user-123", email: "buyer@example.com" })) },
    report: { update: vi.fn(async () => ({ id: "report-123", chatName: "The chat" })) },
  };
  const db = {
    $transaction: vi.fn(async (callback: (client: typeof tx) => unknown, options?: { isolationLevel: string }) => {
      void options;
      return callback(tx);
    }),
  };
  return { db, tx };
}

describe("Stripe checkout fulfillment", () => {
  beforeEach(() => {
    getPrismaMock.mockReset();
  });

  it("fulfills a paid checkout once when Stripe redelivers the same event", async () => {
    const { db, tx } = database();
    getPrismaMock.mockReturnValue(db);

    await expect(fulfillCheckout(checkout(), "evt_checkout_completed")).resolves.toBe(true);
    await expect(fulfillCheckout(checkout(), "evt_checkout_completed")).resolves.toBe(true);

    expect(tx.stripeEvent.create).toHaveBeenCalledTimes(1);
    expect(tx.payment.upsert).toHaveBeenCalledTimes(2);
    expect(tx.entitlement.upsert).toHaveBeenCalledTimes(2);
    expect(tx.report.update).toHaveBeenCalledTimes(2);
    expect(db.$transaction).toHaveBeenCalledTimes(2);
    expect(db.$transaction.mock.calls[0][1]).toEqual({ isolationLevel: "Serializable" });
  });

  it.each(["unpaid", "pending"] as const)("does not unlock a checkout whose payment status is %s", async (paymentStatus) => {
    const { db, tx } = database();
    getPrismaMock.mockReturnValue(db);

    await expect(fulfillCheckout(checkout({ payment_status: paymentStatus }), `evt_${paymentStatus}`)).resolves.toBe(false);

    expect(tx.payment.upsert).toHaveBeenCalledWith(expect.objectContaining({
      create: expect.objectContaining({ status: "PROCESSING" }),
      update: expect.objectContaining({ status: "PROCESSING" }),
    }));
    expect(tx.entitlement.upsert).not.toHaveBeenCalled();
    expect(tx.report.update).not.toHaveBeenCalled();
  });

  it("rejects checkout data that is not bound to a known report offer", async () => {
    getPrismaMock.mockImplementation(() => {
      throw new Error("database must not be reached");
    });

    await expect(fulfillCheckout(checkout({ metadata: {} }), "evt_invalid")).resolves.toBe(false);
    await expect(fulfillCheckout(checkout({ client_reference_id: null }), "evt_invalid_2")).resolves.toBe(false);
    expect(getPrismaMock).not.toHaveBeenCalled();
  });
});
