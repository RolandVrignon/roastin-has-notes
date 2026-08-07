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
        choices: [{ message: { content: '{"ok":true}' } }],
        usage: { prompt_tokens: 12, completion_tokens: 4 },
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
      model: "openai/gpt-5.6-luna",
      inputTokens: 12,
      outputTokens: 4,
    });
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
