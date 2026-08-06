import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(process.cwd(), ".env");
const existing = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
const lines = existing.split(/\r?\n/).filter(Boolean);
const values = new Map(lines.filter((line) => !line.trim().startsWith("#") && line.includes("=")).map((line) => {
  const separator = line.indexOf("=");
  return [line.slice(0, separator), line.slice(separator + 1)];
}));

const defaults = {
  DATABASE_URL: "postgresql://roastin:change-me@localhost:5432/roastin?schema=public",
  NEXT_PUBLIC_APP_URL: "http://localhost",
  APP_ADDRESS: "http://localhost",
  DEPLOYMENT_ENV: "local",
  ALLOW_DEMO_PAYMENTS: "true",
  ALLOW_DEV_OTP: "true",
  DATA_ENCRYPTION_KEY: randomBytes(32).toString("base64"),
  TEMPORAL_PAYLOAD_MASTER_KEY: randomBytes(32).toString("base64"),
  PHONE_HASH_SECRET: randomBytes(32).toString("hex"),
  AUTH_SECRET: randomBytes(32).toString("hex"),
  POSTGRES_USER: "roastin",
  POSTGRES_PASSWORD: randomBytes(32).toString("base64url"),
  POSTGRES_DB: "roastin",
  TEMPORAL_POSTGRES_USER: "temporal",
  TEMPORAL_POSTGRES_PASSWORD: randomBytes(32).toString("base64url"),
  TEMPORAL_POSTGRES_DB: "temporal",
  WHATSAPP_VERIFY_TOKEN: randomBytes(24).toString("base64url"),
};

for (const [key, value] of Object.entries(defaults)) {
  if (!values.get(key)) values.set(key, value);
}

const providerKeys = [
  "OPENROUTER_API_KEY",
  "OPENROUTER_MODEL",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_CLASSIC_USD",
  "STRIPE_PRICE_CLASSIC_EUR",
  "STRIPE_PRICE_CLASSIC_BRL",
  "WHATSAPP_GRAPH_VERSION",
  "WHATSAPP_ACCESS_TOKEN",
  "WHATSAPP_PHONE_NUMBER_ID",
  "WHATSAPP_APP_SECRET",
  "WHATSAPP_AUTH_TEMPLATE_NAME",
  "WHATSAPP_AUTH_TEMPLATE_LANGUAGE",
  "WHATSAPP_REPORT_TEMPLATE_NAME",
  "WHATSAPP_REPORT_TEMPLATE_LANGUAGE",
  "NEXT_PUBLIC_WHATSAPP_SUPPORT_NUMBER",
];

for (const key of providerKeys) {
  if (!values.has(key)) values.set(key, key === "OPENROUTER_MODEL" ? "openai/gpt-5.6-luna" : key === "WHATSAPP_GRAPH_VERSION" ? "v26.0" : key === "WHATSAPP_AUTH_TEMPLATE_NAME" ? "roastin_login_code" : key === "WHATSAPP_AUTH_TEMPLATE_LANGUAGE" ? "en_US" : key === "WHATSAPP_REPORT_TEMPLATE_NAME" ? "roastin_report_ready" : "");
}

const output = [
  "# Generated locally. Never commit this file.",
  ...[...values.entries()].map(([key, value]) => `${key}=${value}`),
  "",
].join("\n");

writeFileSync(envPath, output, { mode: 0o600 });
process.stdout.write(`Prepared ${envPath} without printing secrets.\n`);
