import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchUsdToEurRate } from "./generation-cost";

describe("generation cost exchange rate", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("loads and validates the ECB-backed USD to EUR snapshot", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ date: "2026-08-07", base: "USD", quote: "EUR", rate: 0.8784 }), { status: 200 })));
    await expect(fetchUsdToEurRate()).resolves.toEqual({ rate: 0.8784, date: new Date("2026-08-07T00:00:00.000Z"), source: "frankfurter-ecb" });
  });

  it("rejects malformed monetary data", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ date: "2026-08-07", base: "USD", quote: "EUR", rate: -1 }), { status: 200 })));
    await expect(fetchUsdToEurRate()).rejects.toThrow("USD_EUR_RATE_INVALID");
  });
});
