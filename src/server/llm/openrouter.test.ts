import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { requestStructuredCompletion } from "./openrouter";

describe("OpenRouter structured completions", () => {
  const previousApiKey = process.env.OPENROUTER_API_KEY;
  const previousModel = process.env.OPENROUTER_MODEL;

  beforeEach(() => {
    process.env.OPENROUTER_API_KEY = "test-key";
    process.env.OPENROUTER_MODEL = "openai/gpt-5.6-luna";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (previousApiKey === undefined) delete process.env.OPENROUTER_API_KEY;
    else process.env.OPENROUTER_API_KEY = previousApiKey;
    if (previousModel === undefined) delete process.env.OPENROUTER_MODEL;
    else process.env.OPENROUTER_MODEL = previousModel;
  });

  it("omits unsupported sampling parameters when strict provider routing is enabled", async () => {
    const fetchMock = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
      expect(body).not.toHaveProperty("temperature");
      expect(body.provider).toEqual({ data_collection: "deny", require_parameters: true });
      return new Response(JSON.stringify({
        model: "openai/gpt-5.6-luna-20260801",
        choices: [{ message: { content: '{"ok":true}' } }],
        usage: { prompt_tokens: 12, completion_tokens: 4, cost: 0.00042 },
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    });
    vi.stubGlobal("fetch", fetchMock);

    const completion = await requestStructuredCompletion({
      schemaName: "health_check",
      schema: z.object({ ok: z.boolean() }),
      system: "Return JSON.",
      user: "Confirm readiness.",
    });

    expect(completion).toEqual({
      value: { ok: true },
      model: "openai/gpt-5.6-luna-20260801",
      inputTokens: 12,
      outputTokens: 4,
      costUsd: 0.00042,
    });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("refuses an unpriced provider response", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ model: "openai/gpt-5.6-luna", choices: [{ message: { content: '{"ok":true}' } }], usage: { prompt_tokens: 12, completion_tokens: 4 } }), { status: 200 })));
    await expect(requestStructuredCompletion({ schemaName: "health_check", schema: z.object({ ok: z.boolean() }), system: "Return JSON.", user: "Confirm readiness." })).rejects.toThrow("OPENROUTER_COST_MISSING");
  });

  it("adds the cost of a billed JSON repair attempt", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ model: "provider/model-a", choices: [{ message: { content: '{"ok":"wrong"}' } }], usage: { prompt_tokens: 10, completion_tokens: 3, cost: 0.001 } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ model: "provider/model-b", choices: [{ message: { content: '{"ok":true}' } }], usage: { prompt_tokens: 20, completion_tokens: 4, cost: 0.002 } }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const completion = await requestStructuredCompletion({ schemaName: "health_check", schema: z.object({ ok: z.boolean() }), system: "Return JSON.", user: "Confirm readiness." });
    expect(completion).toMatchObject({ model: "provider/model-b", inputTokens: 30, outputTokens: 7, costUsd: 0.003 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
