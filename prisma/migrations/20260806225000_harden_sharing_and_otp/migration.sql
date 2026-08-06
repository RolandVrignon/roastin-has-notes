-- AlterTable
ALTER TABLE "share_links"
ADD COLUMN "anonymize_names" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "hide_quotes" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "otp_codes"
ADD COLUMN "attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "locked_at" TIMESTAMP(3);
