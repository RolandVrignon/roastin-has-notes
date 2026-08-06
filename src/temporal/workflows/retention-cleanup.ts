import { proxyActivities } from "@temporalio/workflow";
import type * as activities from "@/temporal/activities/report-generation";

const retention = proxyActivities<typeof activities>({
  startToCloseTimeout: "5 minutes",
  retry: { initialInterval: "30 seconds", backoffCoefficient: 2, maximumInterval: "15 minutes", maximumAttempts: 5 },
});

export async function RetentionCleanupWorkflow() {
  return retention.purgeExpiredData();
}
