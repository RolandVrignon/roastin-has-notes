import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma } from "@/lib/db";
import { locales } from "@/i18n/config";
import { getOrCreateOwnerSession, ownerCookie } from "@/lib/owner-session";
import { applyParticipantAliases, ParticipantAliasError } from "@/lib/participant-aliases";
import { hasMinorSignal, sanitizeConversation } from "@/lib/privacy";
import { readUserSession } from "@/lib/user-session";
import { formatDateRange, parseWhatsApp } from "@/lib/whatsapp";
import { createEphemeralPayload, deleteEphemeralPayload } from "@/server/storage/ephemeral-payload";
import { reportPromptVersion } from "@/server/reports/report-locales";
import { startGenerateReportWorkflow } from "@/temporal/client";

export const runtime = "nodejs";

const inputSchema = z.object({
  chatName: z.string().trim().min(1).max(80),
  locale: z.enum(locales).default("en"),
  chatType: z.enum(["partner", "friends", "best-friend", "family", "work", "other"]),
  context: z.string().trim().max(500).optional(),
  participantAliases: z.array(z.object({ sourceName: z.string().trim().min(1).max(80), displayName: z.string().trim().min(1).max(40) })).max(100).default([]),
  rawText: z.string().min(40).max(2_000_000),
});

export async function POST(request: Request) {
  let payloadReference: string | undefined;
  let reportId: string | undefined;
  try {
    const userSession = await readUserSession();
    if (!userSession) return NextResponse.json({ error: "Verify your WhatsApp number before creating a report" }, { status: 401 });
    const input = inputSchema.parse(await request.json());
    const parsed = parseWhatsApp(input.rawText);
    if (parsed.messages.length < 8 || parsed.participants.length < 2) {
      return NextResponse.json({ error: "This conversation is too short. Try a chat with at least two people and a few more messages." }, { status: 422 });
    }
    if (hasMinorSignal(parsed)) return NextResponse.json({ error: "Roastin cannot analyse conversations that appear to involve minors." }, { status: 422 });

    const sanitized = sanitizeConversation(applyParticipantAliases(parsed, input.participantAliases));
    const owner = await getOrCreateOwnerSession();
    const payload = await createEphemeralPayload({
      chatName: input.chatName,
      chatType: input.chatType,
      context: input.context,
      conversation: {
        messages: sanitized.messages.map((message) => ({ ...message, date: message.date?.toISOString() ?? null })),
        participants: sanitized.participants,
        firstDate: sanitized.firstDate?.toISOString() ?? null,
        lastDate: sanitized.lastDate?.toISOString() ?? null,
      },
    });
    payloadReference = payload.reference;
    reportId = randomUUID();
    const workflowId = `generate-report-${reportId}`;
    const requestedAt = new Date();
    const promptVersion = reportPromptVersion(input.locale);

    await getPrisma().report.create({
      data: {
        id: reportId,
        ownerTokenHash: owner.hash,
        userId: userSession.userId,
        chatName: input.chatName,
        locale: input.locale,
        status: "GENERATING",
        generationStage: "QUEUED",
        workflowId,
        payloadReference,
        payloadExpiresAt: payload.expiresAt,
        messageCount: sanitized.messages.length,
        participantCount: sanitized.participants.length,
        dateRange: formatDateRange(sanitized.firstDate, sanitized.lastDate, input.locale),
        promptVersion,
      },
    });

    await startGenerateReportWorkflow({
      reportId,
      payloadReference,
      locale: input.locale,
      conversationContext: input.chatType,
      reportStyle: "classic",
      promptVersion,
      requestedAt: requestedAt.toISOString(),
    }, workflowId);

    const response = NextResponse.json({ reportId, status: "GENERATING", statusUrl: `/api/reports/${reportId}/status` }, { status: 202 });
    if (owner.isNew) response.cookies.set(ownerCookie(owner.token));
    return response;
  } catch (error) {
    if (payloadReference) await deleteEphemeralPayload(payloadReference).catch(() => undefined);
    if (reportId) {
      await getPrisma().report.updateMany({
        where: { id: reportId, status: "GENERATING" },
        data: { status: "FAILED", generationStage: "FAILED", publicErrorCode: "GENERATION_START_FAILED", rawDeletedAt: new Date(), payloadReference: null, payloadExpiresAt: null },
      }).catch(() => undefined);
    }
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid conversation" }, { status: 400 });
    if (error instanceof ParticipantAliasError) return NextResponse.json({ error: "Participant names must be unique and match the imported conversation" }, { status: 400 });
    return NextResponse.json({ error: "The report could not be queued. Please try again." }, { status: 503 });
  }
}
