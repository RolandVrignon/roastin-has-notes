import { ApplicationFailure } from "@temporalio/activity";
import { Prisma } from "@/generated/prisma/client";
import { reportContentSchema, reportSchema, type ParsedConversation, type RoastReport } from "@/domain/report";
import { isLocale } from "@/i18n/config";
import { getPrisma } from "@/lib/db";
import { createFallbackReport } from "@/lib/fallback-report";
import { formatDateRange } from "@/lib/whatsapp";
import { requestStructuredCompletion, isRetryableOpenRouterError } from "@/server/llm/openrouter";
import { analysisEvidenceIsAnchored, anchorAnalysisEvidence } from "@/server/reports/analysis-evidence";
import { generationAnalysisSchema, type GenerationAnalysis } from "@/server/reports/generation-schemas";
import { groundReportContent } from "@/server/reports/report-grounding";
import { reportLanguageMatches, storedReportLanguageMatches } from "@/server/reports/report-language";
import { analysisSystemPrompt, writingSystemPrompt } from "@/server/reports/report-prompts";
import { deleteEphemeralPayload, ephemeralPayloadExists, readEphemeralPayload, type GenerationPayload } from "@/server/storage/ephemeral-payload";
import { purgeExpiredEphemeralPayloads } from "@/server/storage/ephemeral-payload-cleanup";
import type { ArtifactReference, LockedGeneration, PublicGenerationStage, ValidatedArtifact } from "@/temporal/types";

function nonRetryable(code: string): never {
  throw ApplicationFailure.nonRetryable(code, code);
}

function safeFailure(code: string, error: unknown): never {
  if (error instanceof ApplicationFailure) throw error;
  if (isRetryableOpenRouterError(error)) throw ApplicationFailure.create({ message: "OPENROUTER_TRANSIENT", type: "OPENROUTER_TRANSIENT" });
  throw ApplicationFailure.create({ message: code, type: code });
}

function toConversation(payload: GenerationPayload): ParsedConversation {
  return {
    messages: payload.conversation.messages.map((message) => ({ ...message, date: message.date ? new Date(message.date) : null })),
    participants: payload.conversation.participants,
    firstDate: payload.conversation.firstDate ? new Date(payload.conversation.firstDate) : null,
    lastDate: payload.conversation.lastDate ? new Date(payload.conversation.lastDate) : null,
  };
}

function fallbackAnalysis(payload: GenerationPayload): GenerationAnalysis {
  const conversation = toConversation(payload);
  return generationAnalysisSchema.parse({
    participants: conversation.participants.map((participant) => {
      const examples = conversation.messages.map((message, messageIndex) => ({ message, messageIndex })).filter(({ message }) => message.author === participant.name && message.body.length > 8).slice(0, 3);
      return {
        ...participant,
        behaviours: [participant.share >= 35 ? "Frequently drives the conversation forward" : "Contributes selectively with distinctive timing"],
        evidence: examples.map(({ message, messageIndex }) => ({ messageIndex, quote: message.body.slice(0, 160), observation: "A representative example of their recurring contribution style" })),
      };
    }),
    recurringPatterns: ["Plans require several follow-ups before becoming concrete", "Humour is used to acknowledge messages without resolving the question"],
    groupDynamics: ["One or two participants create most of the momentum", "The group relies on shared context and recurring callbacks"],
    vocabulary: [],
    safety: { approved: true, notes: [] },
  });
}

function previewFor(report: RoastReport): RoastReport {
  return {
    ...report,
    participants: report.participants.slice(0, 2),
    awards: [],
    dictionary: [],
    dynamics: [],
    flags: { green: [], yellow: [], red: [] },
    reactions: [],
    finalVerdict: "",
  };
}

export async function lockGeneration(reportId: string, payloadReference: string, promptVersion: string): Promise<LockedGeneration> {
  try {
    const report = await getPrisma().report.findUnique({
      where: { id: reportId },
      select: { status: true, generationRevision: true, payloadReference: true, promptVersion: true, deletedAt: true },
    });
    if (!report || report.deletedAt || report.status === "DELETED") nonRetryable("REPORT_NOT_AVAILABLE");
    if (report.payloadReference !== payloadReference || report.promptVersion !== promptVersion) nonRetryable("GENERATION_REVISION_MISMATCH");
    return { revision: report.generationRevision, alreadyReady: report.status === "READY" };
  } catch (error) {
    safeFailure("GENERATION_LOCK_FAILED", error);
  }
}

export async function assertPayloadAvailable(payloadReference: string) {
  try {
    if (!await ephemeralPayloadExists(payloadReference)) nonRetryable("GENERATION_PAYLOAD_MISSING");
    return { available: true };
  } catch (error) {
    safeFailure("GENERATION_PAYLOAD_CHECK_FAILED", error);
  }
}

export async function markGenerationStage(reportId: string, stage: PublicGenerationStage) {
  try {
    await getPrisma().report.updateMany({ where: { id: reportId, status: "GENERATING", deletedAt: null }, data: { generationStage: stage } });
  } catch (error) {
    safeFailure("GENERATION_STATUS_UPDATE_FAILED", error);
  }
}

export async function analyzeConversation(reportId: string, payloadReference: string, revision: number, promptVersion: string, locale: string): Promise<ArtifactReference> {
  const idempotencyKey = `${reportId}:${revision}:analysis:${promptVersion}`;
  try {
    const db = getPrisma();
    const existing = await db.generationArtifact.findUnique({ where: { idempotencyKey }, select: { id: true, inputTokens: true, outputTokens: true, model: true } });
    if (existing) return { artifactId: existing.id, inputTokens: existing.inputTokens ?? undefined, outputTokens: existing.outputTokens ?? undefined, model: existing.model ?? undefined };

    if (!isLocale(locale)) nonRetryable("REPORT_LOCALE_UNSUPPORTED");
    const payload = await readEphemeralPayload(payloadReference);
    const transcript = payload.conversation.messages.map(({ author, body, date }, messageIndex) => ({ messageIndex, author, body, date }));
    const completion = await requestStructuredCompletion({
      schemaName: "roast_conversation_analysis",
      schema: generationAnalysisSchema,
      system: analysisSystemPrompt(locale),
      user: JSON.stringify({ chatType: payload.chatType, optionalContext: payload.context, participants: payload.conversation.participants, transcript }),
    });
    const analysis = completion ? anchorAnalysisEvidence(completion.value, payload.conversation.messages, payload.conversation.participants) : fallbackAnalysis(payload);
    const artifact = await db.generationArtifact.upsert({
      where: { idempotencyKey },
      create: { reportId, revision, kind: "ANALYSIS", idempotencyKey, content: analysis as Prisma.InputJsonValue, model: completion?.model ?? "deterministic-development-fallback", inputTokens: completion?.inputTokens, outputTokens: completion?.outputTokens },
      update: {},
      select: { id: true, inputTokens: true, outputTokens: true, model: true },
    });
    return { artifactId: artifact.id, inputTokens: artifact.inputTokens ?? undefined, outputTokens: artifact.outputTokens ?? undefined, model: artifact.model ?? undefined };
  } catch (error) {
    safeFailure("CONVERSATION_ANALYSIS_FAILED", error);
  }
}

export async function validateAnalysisArtifact(reportId: string, payloadReference: string, artifactId: string): Promise<ValidatedArtifact> {
  try {
    const [artifact, payload] = await Promise.all([
      getPrisma().generationArtifact.findFirst({ where: { id: artifactId, reportId, kind: "ANALYSIS" }, select: { content: true } }),
      readEphemeralPayload(payloadReference),
    ]);
    if (!artifact) nonRetryable("ANALYSIS_ARTIFACT_MISSING");
    const analysis = generationAnalysisSchema.parse(artifact.content);
    const evidence = analysis.participants.flatMap((participant) => participant.evidence);
    if (!analysisEvidenceIsAnchored(analysis, payload.conversation.messages, payload.conversation.participants)) nonRetryable("ANALYSIS_EVIDENCE_INVALID");
    return { artifactId, evidenceCount: evidence.length };
  } catch (error) {
    safeFailure("ANALYSIS_VALIDATION_FAILED", error);
  }
}

export async function draftReport(reportId: string, payloadReference: string, analysisArtifactId: string, revision: number, promptVersion: string, locale: string): Promise<ArtifactReference> {
  const idempotencyKey = `${reportId}:${revision}:report:${promptVersion}`;
  try {
    const db = getPrisma();
    const existing = await db.generationArtifact.findUnique({ where: { idempotencyKey }, select: { id: true, inputTokens: true, outputTokens: true, model: true } });
    if (existing) return { artifactId: existing.id, inputTokens: existing.inputTokens ?? undefined, outputTokens: existing.outputTokens ?? undefined, model: existing.model ?? undefined };

    const [analysisArtifact, payload, reportRecord] = await Promise.all([
      db.generationArtifact.findFirst({ where: { id: analysisArtifactId, reportId, kind: "ANALYSIS" }, select: { content: true } }),
      readEphemeralPayload(payloadReference),
      db.report.findUnique({ where: { id: reportId }, select: { createdAt: true } }),
    ]);
    if (!analysisArtifact || !reportRecord) nonRetryable("REPORT_INPUT_MISSING");
    if (!isLocale(locale)) nonRetryable("REPORT_LOCALE_UNSUPPORTED");
    const analysis = generationAnalysisSchema.parse(analysisArtifact.content);
    const conversation = toConversation(payload);
    let completion = await requestStructuredCompletion({
      schemaName: "roast_report",
      schema: reportContentSchema,
      system: writingSystemPrompt(locale),
      user: JSON.stringify({ chatName: payload.chatName, chatType: payload.chatType, optionalContext: payload.context, analysis }),
    });
    if (completion && !reportLanguageMatches(completion.value, locale)) {
      const firstCompletion = completion;
      const retry = await requestStructuredCompletion({
        schemaName: "roast_report_language_recovery",
        schema: reportContentSchema,
        system: writingSystemPrompt(locale, true),
        user: JSON.stringify({ chatName: payload.chatName, chatType: payload.chatType, optionalContext: payload.context, analysis }),
      });
      if (!retry || !reportLanguageMatches(retry.value, locale)) nonRetryable("REPORT_LANGUAGE_INVALID");
      completion = {
        ...retry,
        inputTokens: (firstCompletion.inputTokens ?? 0) + (retry.inputTokens ?? 0) || undefined,
        outputTokens: (firstCompletion.outputTokens ?? 0) + (retry.outputTokens ?? 0) || undefined,
      };
    }
    const report = completion ? reportSchema.parse({
      ...groundReportContent(completion.value, analysis),
      id: reportId,
      chatName: payload.chatName,
      locale,
      createdAt: reportRecord.createdAt.toISOString(),
      stats: { messageCount: conversation.messages.length, participantCount: conversation.participants.length, dateRange: formatDateRange(conversation.firstDate, conversation.lastDate, locale) },
    }) : { ...createFallbackReport(conversation, payload.chatName, locale), id: reportId, createdAt: reportRecord.createdAt.toISOString() };

    const artifact = await db.generationArtifact.upsert({
      where: { idempotencyKey },
      create: { reportId, revision, kind: "REPORT", idempotencyKey, content: report as Prisma.InputJsonValue, model: completion?.model ?? "deterministic-development-fallback", inputTokens: completion?.inputTokens, outputTokens: completion?.outputTokens },
      update: {},
      select: { id: true, inputTokens: true, outputTokens: true, model: true },
    });
    return { artifactId: artifact.id, inputTokens: artifact.inputTokens ?? undefined, outputTokens: artifact.outputTokens ?? undefined, model: artifact.model ?? undefined };
  } catch (error) {
    safeFailure("REPORT_DRAFT_FAILED", error);
  }
}

export async function validateReportArtifact(reportId: string, artifactId: string): Promise<ValidatedArtifact> {
  try {
    const artifact = await getPrisma().generationArtifact.findFirst({ where: { id: artifactId, reportId, kind: "REPORT" }, select: { content: true } });
    if (!artifact) nonRetryable("REPORT_ARTIFACT_MISSING");
    const report = reportSchema.parse(artifact.content);
    if (!isLocale(report.locale) || !storedReportLanguageMatches(report, report.locale)) nonRetryable("REPORT_LANGUAGE_INVALID");
    const serialized = JSON.stringify(reportContentSchema.parse(report));
    if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(serialized) || /(?<!\w)(?:\+?\d[\s().-]?){8,15}(?!\w)/.test(serialized)) nonRetryable("REPORT_PRIVACY_VALIDATION_FAILED");
    return { artifactId, evidenceCount: report.participants.reduce((total, participant) => total + participant.evidence.length, 0) };
  } catch (error) {
    safeFailure("REPORT_VALIDATION_FAILED", error);
  }
}

export async function persistReportArtifact(reportId: string, artifactId: string, model?: string) {
  try {
    const artifact = await getPrisma().generationArtifact.findFirst({ where: { id: artifactId, reportId, kind: "REPORT" }, select: { content: true, model: true } });
    if (!artifact) nonRetryable("REPORT_ARTIFACT_MISSING");
    const report = reportSchema.parse(artifact.content);
    const result = await getPrisma().report.updateMany({
      where: { id: reportId, status: "GENERATING", deletedAt: null },
      data: {
        preview: previewFor(report) as Prisma.InputJsonValue,
        content: report as Prisma.InputJsonValue,
        messageCount: report.stats.messageCount,
        participantCount: report.stats.participantCount,
        dateRange: report.stats.dateRange,
        model: model ?? artifact.model,
        publicErrorCode: null,
      },
    });
    if (!result.count) nonRetryable("REPORT_NOT_AVAILABLE");
    return { reportId };
  } catch (error) {
    safeFailure("REPORT_PERSISTENCE_FAILED", error);
  }
}

export async function deleteSourcePayload(reportId: string, payloadReference: string) {
  try {
    await deleteEphemeralPayload(payloadReference);
    await getPrisma().report.updateMany({ where: { id: reportId }, data: { rawDeletedAt: new Date(), payloadReference: null, payloadExpiresAt: null } });
  } catch (error) {
    safeFailure("GENERATION_PAYLOAD_DELETE_FAILED", error);
  }
}

export async function markReportReady(reportId: string) {
  try {
    await getPrisma().report.updateMany({ where: { id: reportId, status: "GENERATING", deletedAt: null }, data: { status: "READY", generationStage: "READY", publicErrorCode: null } });
  } catch (error) {
    safeFailure("REPORT_READY_UPDATE_FAILED", error);
  }
}

export async function markReportFailed(reportId: string, errorCode: string) {
  try {
    const db = getPrisma();
    await db.$transaction([
      db.generationArtifact.deleteMany({ where: { reportId } }),
      db.report.updateMany({ where: { id: reportId, status: "GENERATING", deletedAt: null }, data: { status: "FAILED", generationStage: "FAILED", publicErrorCode: errorCode } }),
    ]);
  } catch (error) {
    safeFailure("REPORT_FAILURE_UPDATE_FAILED", error);
  }
}

export async function deleteCancelledReport(reportId: string) {
  try {
    await getPrisma().$transaction([
      getPrisma().generationArtifact.deleteMany({ where: { reportId } }),
      getPrisma().report.updateMany({ where: { id: reportId }, data: { status: "DELETED", deletedAt: new Date(), preview: Prisma.DbNull, content: Prisma.DbNull, publicErrorCode: null } }),
    ]);
  } catch (error) {
    safeFailure("REPORT_DELETE_FAILED", error);
  }
}

export async function purgeExpiredData() {
  try {
    const db = getPrisma();
    const now = new Date();
    const whatsappRetentionCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const expiredReports = await db.report.findMany({
      where: { status: "GENERATING", payloadExpiresAt: { lte: now } },
      select: { id: true, payloadReference: true },
      take: 500,
    });
    await Promise.allSettled(expiredReports.map(({ payloadReference }) => payloadReference ? deleteEphemeralPayload(payloadReference) : Promise.resolve()));
    const reportIds = expiredReports.map(({ id }) => id);
    await db.$transaction(async (tx) => {
      if (reportIds.length) {
        await tx.generationArtifact.deleteMany({ where: { reportId: { in: reportIds } } });
        await tx.report.updateMany({
          where: { id: { in: reportIds }, status: "GENERATING" },
          data: { status: "FAILED", generationStage: "FAILED", publicErrorCode: "GENERATION_EXPIRED", payloadReference: null, payloadExpiresAt: null, rawDeletedAt: now },
        });
      }
      await tx.otpCode.deleteMany({ where: { expiresAt: { lte: now } } });
      await tx.session.deleteMany({ where: { expiresAt: { lte: now } } });
      await tx.shareLink.deleteMany({ where: { purpose: "SHARING", expiresAt: { lte: now } } });
      await tx.shareLink.updateMany({ where: { purpose: "DELIVERY", expiresAt: { lte: now }, revokedAt: null }, data: { revokedAt: now } });
      await tx.whatsappDelivery.updateMany({
        where: { createdAt: { lte: whatsappRetentionCutoff }, phoneCiphertext: { not: null } },
        data: { phoneCiphertext: null, phoneIv: null, phoneTag: null, phoneHash: null },
      });
    });
    const orphanedPayloadsDeleted = await purgeExpiredEphemeralPayloads(now);
    return { expiredReports: reportIds.length, orphanedPayloadsDeleted };
  } catch (error) {
    safeFailure("RETENTION_CLEANUP_FAILED", error);
  }
}
