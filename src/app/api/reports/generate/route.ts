import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { reportContentSchema, reportSchema } from "@/domain/report";
import { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/db";
import { createFallbackReport } from "@/lib/fallback-report";
import { getOrCreateOwnerSession, ownerCookie } from "@/lib/owner-session";
import { hasMinorSignal, sanitizeConversation } from "@/lib/privacy";
import { formatDateRange, parseWhatsApp } from "@/lib/whatsapp";

export const runtime = "nodejs";

const inputSchema = z.object({
  chatName: z.string().trim().min(1).max(80),
  locale: z.string().trim().min(2).max(10).default("en"),
  chatType: z.enum(["partner", "friends", "best-friend", "family", "work", "other"]),
  context: z.string().trim().max(500).optional(),
  rawText: z.string().min(40).max(2_000_000),
});

async function generateWithOpenRouter(input: z.infer<typeof inputSchema>, parsed: ReturnType<typeof parseWhatsApp>) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const transcript = parsed.messages.map(({ author, body, date }) => ({ author, body, date: date?.toISOString() ?? null }));
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": "Roastin Has Notes",
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL ?? "openai/gpt-5.6-luna",
      temperature: 0.8,
      messages: [
        {
          role: "system",
          content: "You are Roastin, a sharp but affectionate comedy host. Analyse only observable chat behaviours. Never infer sensitive traits, diagnose, shame appearance, expose contact details, or target identity. Every strong observation must be grounded in repeated behaviour. Write in the requested locale and return only valid JSON matching the schema.",
        },
        {
          role: "user",
          content: JSON.stringify({ chatName: input.chatName, chatType: input.chatType, locale: input.locale, optionalContext: input.context, transcript }),
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "roast_report", strict: true, schema: z.toJSONSchema(reportContentSchema) },
      },
      provider: { data_collection: "deny", require_parameters: true },
    }),
    signal: AbortSignal.timeout(180_000),
  });

  if (!response.ok) throw new Error(`OpenRouter request failed with ${response.status}`);
  const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenRouter returned an empty report");
  const generated = reportContentSchema.parse(JSON.parse(content));
  return reportSchema.parse({
    ...generated,
    id: randomUUID(),
    chatName: input.chatName,
    locale: input.locale,
    createdAt: new Date().toISOString(),
    stats: { messageCount: parsed.messages.length, participantCount: parsed.participants.length, dateRange: formatDateRange(parsed.firstDate, parsed.lastDate, input.locale) },
  });
}

export async function POST(request: Request) {
  try {
    const input = inputSchema.parse(await request.json());
    const parsed = parseWhatsApp(input.rawText);
    if (parsed.messages.length < 8 || parsed.participants.length < 2) {
      return NextResponse.json({ error: "This conversation is too short. Try a chat with at least two people and a few more messages." }, { status: 422 });
    }
    if (hasMinorSignal(parsed)) return NextResponse.json({ error: "Roastin cannot analyse conversations that appear to involve minors." }, { status: 422 });
    const sanitized = sanitizeConversation(parsed);

    let report;
    try {
      report = await generateWithOpenRouter(input, sanitized);
    } catch {
      report = null;
    }
    report ??= createFallbackReport(sanitized, input.chatName, input.locale);

    const preview = {
      ...report,
      participants: report.participants.slice(0, 2),
      awards: [],
      dictionary: [],
      dynamics: [],
      flags: { green: [], yellow: [], red: [] },
      reactions: [],
      finalVerdict: "",
    };
    const owner = await getOrCreateOwnerSession();
    await getPrisma().report.create({
      data: {
        id: report.id,
        ownerTokenHash: owner.hash,
        chatName: report.chatName,
        locale: report.locale,
        status: "READY",
        preview: preview as Prisma.InputJsonValue,
        content: report as Prisma.InputJsonValue,
        messageCount: report.stats.messageCount,
        participantCount: report.stats.participantCount,
        dateRange: report.stats.dateRange,
        model: process.env.OPENROUTER_API_KEY ? (process.env.OPENROUTER_MODEL ?? "openai/gpt-5.6-luna") : "deterministic-development-fallback",
        rawDeletedAt: new Date(),
      },
    });
    const response = NextResponse.json({ reportId: report.id }, { status: 201 });
    if (owner.isNew) response.cookies.set(ownerCookie(owner.token));
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid conversation" }, { status: 400 });
    return NextResponse.json({ error: "The report could not be created. Please try again." }, { status: 500 });
  }
}
