-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('GENERATING', 'READY', 'FAILED', 'DELETED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "SharePurpose" AS ENUM ('SHARING', 'DELIVERY');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'REVOKED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" UUID NOT NULL,
    "owner_token_hash" TEXT NOT NULL,
    "user_id" UUID,
    "chat_name" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "status" "ReportStatus" NOT NULL DEFAULT 'GENERATING',
    "preview" JSONB,
    "content" JSONB,
    "message_count" INTEGER NOT NULL DEFAULT 0,
    "participant_count" INTEGER NOT NULL DEFAULT 0,
    "date_range" TEXT,
    "model" TEXT,
    "prompt_version" TEXT NOT NULL DEFAULT 'classic-v1',
    "paid_at" TIMESTAMP(3),
    "raw_deleted_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "report_id" UUID NOT NULL,
    "stripe_checkout_id" TEXT NOT NULL,
    "stripe_payment_intent_id" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entitlements" (
    "id" UUID NOT NULL,
    "report_id" UUID NOT NULL,
    "source_payment_id" UUID NOT NULL,
    "offer_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entitlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stripe_events" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stripe_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_events" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "share_links" (
    "id" UUID NOT NULL,
    "report_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "purpose" "SharePurpose" NOT NULL DEFAULT 'SHARING',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "share_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_deliveries" (
    "id" UUID NOT NULL,
    "report_id" UUID NOT NULL,
    "share_link_id" UUID NOT NULL,
    "phone_ciphertext" TEXT,
    "phone_iv" TEXT,
    "phone_tag" TEXT,
    "phone_hash" TEXT,
    "consent_version" TEXT NOT NULL,
    "consent_at" TIMESTAMP(3) NOT NULL,
    "template_name" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "provider_message_id" TEXT,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'QUEUED',
    "last_status_at" TIMESTAMP(3),
    "error_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_codes" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_hash_key" ON "sessions"("token_hash");

-- CreateIndex
CREATE INDEX "sessions_user_id_expires_at_idx" ON "sessions"("user_id", "expires_at");

-- CreateIndex
CREATE INDEX "reports_owner_token_hash_idx" ON "reports"("owner_token_hash");

-- CreateIndex
CREATE INDEX "reports_user_id_idx" ON "reports"("user_id");

-- CreateIndex
CREATE INDEX "reports_status_created_at_idx" ON "reports"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripe_checkout_id_key" ON "payments"("stripe_checkout_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripe_payment_intent_id_key" ON "payments"("stripe_payment_intent_id");

-- CreateIndex
CREATE INDEX "payments_report_id_idx" ON "payments"("report_id");

-- CreateIndex
CREATE UNIQUE INDEX "entitlements_report_id_key" ON "entitlements"("report_id");

-- CreateIndex
CREATE UNIQUE INDEX "entitlements_source_payment_id_key" ON "entitlements"("source_payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "share_links_token_hash_key" ON "share_links"("token_hash");

-- CreateIndex
CREATE INDEX "share_links_report_id_expires_at_idx" ON "share_links"("report_id", "expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_deliveries_share_link_id_key" ON "whatsapp_deliveries"("share_link_id");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_deliveries_provider_message_id_key" ON "whatsapp_deliveries"("provider_message_id");

-- CreateIndex
CREATE INDEX "whatsapp_deliveries_report_id_created_at_idx" ON "whatsapp_deliveries"("report_id", "created_at");

-- CreateIndex
CREATE INDEX "whatsapp_deliveries_phone_hash_idx" ON "whatsapp_deliveries"("phone_hash");

-- CreateIndex
CREATE INDEX "otp_codes_email_expires_at_idx" ON "otp_codes"("email", "expires_at");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entitlements" ADD CONSTRAINT "entitlements_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entitlements" ADD CONSTRAINT "entitlements_source_payment_id_fkey" FOREIGN KEY ("source_payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "share_links" ADD CONSTRAINT "share_links_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_deliveries" ADD CONSTRAINT "whatsapp_deliveries_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_deliveries" ADD CONSTRAINT "whatsapp_deliveries_share_link_id_fkey" FOREIGN KEY ("share_link_id") REFERENCES "share_links"("id") ON DELETE CASCADE ON UPDATE CASCADE;
