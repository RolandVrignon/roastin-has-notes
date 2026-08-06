-- CreateEnum
CREATE TYPE "ReportGenerationStage" AS ENUM ('QUEUED', 'VALIDATING', 'ANALYZING', 'DRAFTING', 'FINALIZING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "GenerationArtifactKind" AS ENUM ('ANALYSIS', 'REPORT');

-- AlterTable
ALTER TABLE "reports"
ADD COLUMN "generation_stage" "ReportGenerationStage" NOT NULL DEFAULT 'QUEUED',
ADD COLUMN "generation_revision" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "workflow_id" TEXT,
ADD COLUMN "payload_reference" TEXT,
ADD COLUMN "payload_expires_at" TIMESTAMP(3),
ADD COLUMN "public_error_code" TEXT;

-- CreateTable
CREATE TABLE "generation_artifacts" (
    "id" UUID NOT NULL,
    "report_id" UUID NOT NULL,
    "revision" INTEGER NOT NULL,
    "kind" "GenerationArtifactKind" NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "model" TEXT,
    "input_tokens" INTEGER,
    "output_tokens" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generation_artifacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reports_workflow_id_key" ON "reports"("workflow_id");

-- CreateIndex
CREATE UNIQUE INDEX "reports_payload_reference_key" ON "reports"("payload_reference");

-- CreateIndex
CREATE UNIQUE INDEX "generation_artifacts_idempotency_key_key" ON "generation_artifacts"("idempotency_key");

-- CreateIndex
CREATE UNIQUE INDEX "generation_artifacts_report_id_revision_kind_key" ON "generation_artifacts"("report_id", "revision", "kind");

-- CreateIndex
CREATE INDEX "generation_artifacts_report_id_created_at_idx" ON "generation_artifacts"("report_id", "created_at");

-- AddForeignKey
ALTER TABLE "generation_artifacts" ADD CONSTRAINT "generation_artifacts_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
