ALTER TABLE "reports"
ADD COLUMN "generation_cost_usd" DECIMAL(18,10),
ADD COLUMN "generation_cost_eur" DECIMAL(18,10),
ADD COLUMN "usd_to_eur_rate" DECIMAL(18,10),
ADD COLUMN "exchange_rate_date" DATE,
ADD COLUMN "exchange_rate_source" TEXT;

ALTER TABLE "generation_artifacts"
ADD COLUMN "cost_usd" DECIMAL(18,10) NOT NULL DEFAULT 0;
