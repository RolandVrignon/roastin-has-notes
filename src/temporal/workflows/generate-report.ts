import { defineQuery, defineSignal, proxyActivities, setHandler } from "@temporalio/workflow";
import type * as activities from "@/temporal/activities/report-generation";
import type { GenerateReportInput, GenerationWorkflowStatus, PublicGenerationStage } from "@/temporal/types";

const operational = proxyActivities<typeof activities>({
  startToCloseTimeout: "30 seconds",
  retry: { initialInterval: "1 second", backoffCoefficient: 2, maximumInterval: "30 seconds", maximumAttempts: 8 },
});

const llm = proxyActivities<typeof activities>({
  startToCloseTimeout: "4 minutes",
  scheduleToCloseTimeout: "12 minutes",
  retry: { initialInterval: "5 seconds", backoffCoefficient: 2, maximumInterval: "2 minutes", maximumAttempts: 4, nonRetryableErrorTypes: ["REPORT_NOT_AVAILABLE", "GENERATION_REVISION_MISMATCH", "GENERATION_PAYLOAD_MISSING", "ANALYSIS_EVIDENCE_INVALID", "REPORT_PRIVACY_VALIDATION_FAILED"] },
});

export const cancelGenerationSignal = defineSignal("cancelGeneration");
export const deleteGenerationSignal = defineSignal("deleteGeneration");
export const generationStatusQuery = defineQuery<GenerationWorkflowStatus>("generationStatus");

const progressByStage: Record<PublicGenerationStage, number> = {
  QUEUED: 5,
  VALIDATING: 15,
  ANALYZING: 40,
  DRAFTING: 70,
  FINALIZING: 90,
  READY: 100,
  FAILED: 100,
};

export async function GenerateReportWorkflow(input: GenerateReportInput): Promise<GenerationWorkflowStatus> {
  let cancellationRequested = false;
  let deletionRequested = false;
  let current: GenerationWorkflowStatus = { status: "GENERATING", stage: "QUEUED", progress: progressByStage.QUEUED, errorCode: null };

  setHandler(cancelGenerationSignal, () => { cancellationRequested = true; });
  setHandler(deleteGenerationSignal, () => { deletionRequested = true; });
  setHandler(generationStatusQuery, () => current);

  const setStage = async (stage: PublicGenerationStage) => {
    current = { status: stage === "READY" ? "READY" : stage === "FAILED" ? "FAILED" : "GENERATING", stage, progress: progressByStage[stage], errorCode: current.errorCode };
    await operational.markGenerationStage(input.reportId, stage);
  };

  const stopIfRequested = async () => {
    if (!cancellationRequested && !deletionRequested) return false;
    await operational.deleteSourcePayload(input.reportId, input.payloadReference);
    if (deletionRequested) {
      await operational.deleteCancelledReport(input.reportId);
      current = { status: "DELETED", stage: "FAILED", progress: 100, errorCode: null };
    } else {
      await operational.markReportFailed(input.reportId, "GENERATION_CANCELLED");
      current = { status: "FAILED", stage: "FAILED", progress: 100, errorCode: "GENERATION_CANCELLED" };
    }
    return true;
  };

  try {
    const locked = await operational.lockGeneration(input.reportId, input.payloadReference, input.promptVersion);
    if (locked.alreadyReady) {
      current = { status: "READY", stage: "READY", progress: 100, errorCode: null };
      return current;
    }
    if (await stopIfRequested()) return current;

    await setStage("VALIDATING");
    await operational.assertPayloadAvailable(input.payloadReference);
    if (await stopIfRequested()) return current;

    await setStage("ANALYZING");
    const analysis = await llm.analyzeConversation(input.reportId, input.payloadReference, locked.revision, input.promptVersion, input.locale);
    await llm.validateAnalysisArtifact(input.reportId, input.payloadReference, analysis.artifactId);
    if (await stopIfRequested()) return current;

    await setStage("DRAFTING");
    const report = await llm.draftReport(input.reportId, input.payloadReference, analysis.artifactId, locked.revision, input.promptVersion, input.locale);
    await llm.validateReportArtifact(input.reportId, report.artifactId);
    if (await stopIfRequested()) return current;

    await setStage("FINALIZING");
    await operational.persistReportArtifact(input.reportId, report.artifactId, report.model);
    await operational.deleteSourcePayload(input.reportId, input.payloadReference);
    await operational.markReportReady(input.reportId);
    current = { status: "READY", stage: "READY", progress: 100, errorCode: null };

    return current;
  } catch {
    try {
      await operational.deleteSourcePayload(input.reportId, input.payloadReference);
    } catch {
      // The TTL cleanup remains the final safety net if storage is unavailable.
    }
    await operational.markReportFailed(input.reportId, "GENERATION_FAILED");
    current = { status: "FAILED", stage: "FAILED", progress: 100, errorCode: "GENERATION_FAILED" };
    return current;
  }
}
