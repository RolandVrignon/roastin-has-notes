import "dotenv/config";
import path from "node:path";
import { Client, Connection, ScheduleAlreadyRunning } from "@temporalio/client";
import { NativeConnection, Worker } from "@temporalio/worker";
import * as activities from "./activities";

async function ensureRetentionSchedule() {
  const connection = await Connection.connect({ address: process.env.TEMPORAL_ADDRESS ?? "localhost:7233" });
  try {
    const client = new Client({ connection, namespace: process.env.TEMPORAL_NAMESPACE ?? "default" });
    await client.schedule.create({
      scheduleId: "roastin-retention-cleanup",
      spec: { intervals: [{ every: "1 hour" }] },
      action: {
        type: "startWorkflow",
        workflowType: "RetentionCleanupWorkflow",
        taskQueue: process.env.TEMPORAL_TASK_QUEUE ?? "report-generation",
        args: [],
        workflowExecutionTimeout: "30 minutes",
      },
      policies: { overlap: "SKIP", catchupWindow: "2 hours", pauseOnFailure: false },
      state: { triggerImmediately: true },
    });
  } catch (error) {
    if (!(error instanceof ScheduleAlreadyRunning)) throw error;
  } finally {
    await connection.close();
  }
}

async function run() {
  await ensureRetentionSchedule();
  const connection = await NativeConnection.connect({ address: process.env.TEMPORAL_ADDRESS ?? "localhost:7233" });
  try {
    const worker = await Worker.create({
      connection,
      namespace: process.env.TEMPORAL_NAMESPACE ?? "default",
      taskQueue: process.env.TEMPORAL_TASK_QUEUE ?? "report-generation",
      workflowsPath: path.resolve(process.cwd(), "src/temporal/workflows/index.ts"),
      activities,
      maxConcurrentActivityTaskExecutions: Number(process.env.TEMPORAL_MAX_CONCURRENT_ACTIVITIES ?? "4"),
    });
    await worker.run();
  } finally {
    await connection.close();
  }
}

run().catch(() => {
  process.exitCode = 1;
});
