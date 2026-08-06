import { Client, Connection } from "@temporalio/client";
import type { GenerateReportInput, GenerationWorkflowStatus } from "@/temporal/types";

type GenerateReportWorkflow = (input: GenerateReportInput) => Promise<GenerationWorkflowStatus>;

const globalForTemporal = globalThis as unknown as { temporalClientPromise?: Promise<Client> };

export function temporalTaskQueue() {
  return process.env.TEMPORAL_TASK_QUEUE ?? "report-generation";
}

export function temporalNamespace() {
  return process.env.TEMPORAL_NAMESPACE ?? "default";
}

export async function getTemporalClient() {
  if (!globalForTemporal.temporalClientPromise) {
    globalForTemporal.temporalClientPromise = Connection.connect({ address: process.env.TEMPORAL_ADDRESS ?? "localhost:7233" })
      .then((connection) => new Client({ connection, namespace: temporalNamespace() }))
      .catch((error) => {
        globalForTemporal.temporalClientPromise = undefined;
        throw error;
      });
  }
  return globalForTemporal.temporalClientPromise;
}

export async function startGenerateReportWorkflow(input: GenerateReportInput, workflowId: string) {
  const client = await getTemporalClient();
  return client.workflow.start<GenerateReportWorkflow>("GenerateReportWorkflow", {
    workflowId,
    taskQueue: temporalTaskQueue(),
    args: [input],
  });
}

export async function requestGenerationDeletion(workflowId: string) {
  const client = await getTemporalClient();
  await client.workflow.getHandle(workflowId).signal("deleteGeneration");
}
