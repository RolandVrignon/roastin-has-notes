export type GenerateReportInput = {
  reportId: string;
  payloadReference: string;
  locale: string;
  conversationContext: string;
  reportStyle: "classic";
  promptVersion: string;
  requestedAt: string;
};

export type PublicGenerationStage = "QUEUED" | "VALIDATING" | "ANALYZING" | "DRAFTING" | "FINALIZING" | "READY" | "FAILED";

export type GenerationWorkflowStatus = {
  status: "GENERATING" | "READY" | "FAILED" | "DELETED";
  stage: PublicGenerationStage;
  progress: number;
  errorCode: string | null;
};

export type LockedGeneration = { revision: number; alreadyReady: boolean };
export type ArtifactReference = { artifactId: string; inputTokens?: number; outputTokens?: number; model?: string };
export type ValidatedArtifact = { artifactId: string; evidenceCount: number };
