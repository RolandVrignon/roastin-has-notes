-- The application was not publicly launched when phone-only identity replaced
-- the provisional email login. Existing local test identities are discarded;
-- reports remain intact and become unassigned through the existing FK rule.
DELETE FROM "otp_codes";
DELETE FROM "users";

-- AlterTable
ALTER TABLE "users"
DROP COLUMN "email",
ADD COLUMN "phone_ciphertext" TEXT NOT NULL,
ADD COLUMN "phone_iv" TEXT NOT NULL,
ADD COLUMN "phone_tag" TEXT NOT NULL,
ADD COLUMN "phone_hash" TEXT NOT NULL,
ADD COLUMN "whatsapp_consent_version" TEXT NOT NULL,
ADD COLUMN "whatsapp_consent_at" TIMESTAMP(3) NOT NULL;

-- DropIndex
DROP INDEX "otp_codes_email_expires_at_idx";

-- AlterTable
ALTER TABLE "otp_codes"
DROP COLUMN "email",
ADD COLUMN "phone_hash" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_hash_key" ON "users"("phone_hash");

-- CreateIndex
CREATE INDEX "otp_codes_phone_hash_expires_at_idx" ON "otp_codes"("phone_hash", "expires_at");
