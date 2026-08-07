DROP INDEX "entitlements_report_id_key";

CREATE UNIQUE INDEX "entitlements_report_id_offer_code_key"
ON "entitlements"("report_id", "offer_code");
