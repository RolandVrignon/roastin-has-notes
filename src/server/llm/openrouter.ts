import { z } from "zod";

type OpenRouterUsage = { prompt_tokens?: number; completion_tokens?: number };

export type StructuredCompletion<T> = {
  value: T;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
};

class OpenRouterError extends Error {
  constructor(public readonly status: number, public readonly retryable: boolean) {
    super(`OPENROUTER_${status}`);
  }
}

async function complete(messages: Array<{ role: "system" | "user" | "assistant"; content: string }>, schemaName: string, schema: z.ZodType) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;
  const model = process.env.OPENROUTER_MODEL ?? "openai/gpt-5.6-luna";
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": "Roastin Has Notes",
    },
    body: JSON.stringify({
      model,
      messages,
      response_format: { type: "json_schema", json_schema: { name: schemaName, strict: true, schema: z.toJSONSchema(schema) } },
      provider: { data_collection: "deny", require_parameters: true },
    }),
    signal: AbortSignal.timeout(180_000),
  });
  if (!response.ok) throw new OpenRouterError(response.status, response.status === 408 || response.status === 409 || response.status === 429 || response.status >= 500);
  const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }>; usage?: OpenRouterUsage };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("OPENROUTER_EMPTY_RESPONSE");
  return { content, model, usage: payload.usage };
}

export async function requestStructuredCompletion<T>(options: {
  schemaName: string;
  schema: z.ZodType<T>;
  system: string;
  user: string;
}): Promise<StructuredCompletion<T> | null> {
  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: options.system },
    { role: "user", content: options.user },
  ];
  const first = await complete(messages, options.schemaName, options.schema);
  if (!first) return null;
  try {
    return {
      value: options.schema.parse(JSON.parse(first.content)),
      model: first.model,
      inputTokens: first.usage?.prompt_tokens,
      outputTokens: first.usage?.completion_tokens,
    };
  } catch {
    const repaired = await complete([
      ...messages,
      { role: "assistant", content: first.content },
      { role: "user", content: "Repair the previous response so it is valid JSON matching the schema. Return JSON only." },
    ], options.schemaName, options.schema);
    if (!repaired) return null;
    return {
      value: options.schema.parse(JSON.parse(repaired.content)),
      model: repaired.model,
      inputTokens: (first.usage?.prompt_tokens ?? 0) + (repaired.usage?.prompt_tokens ?? 0),
      outputTokens: (first.usage?.completion_tokens ?? 0) + (repaired.usage?.completion_tokens ?? 0),
    };
  }
}

export function isRetryableOpenRouterError(error: unknown) {
  return error instanceof OpenRouterError && error.retryable;
}
