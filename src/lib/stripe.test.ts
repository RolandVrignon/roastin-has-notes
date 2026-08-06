import { describe, expect, it } from "vitest";
import { checkoutIntegrationIdentifier } from "@/lib/stripe";

describe("checkoutIntegrationIdentifier", () => {
  it("adds a stable eight-letter suffix for idempotent checkout retries", () => {
    const first = checkoutIntegrationIdentifier("report-123");
    const retry = checkoutIntegrationIdentifier("report-123");

    expect(first).toBe(retry);
    expect(first).toMatch(/^roastin_checkout_[a-z]{8}$/);
    expect(checkoutIntegrationIdentifier("report-456")).not.toBe(first);
  });
});
