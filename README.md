# Roastin Has Notes

Turn a WhatsApp conversation into the unfiltered report nobody in the chat would dare to write.

The living product specification is in [Brief.md](./Brief.md).

## What is implemented

- Editorial landing page and responsive Roastin design system.
- Eight localized landing pages and five-step localized WhatsApp onboarding with `.txt` and `.zip` parsing.
- International date-format handling, local chat summary and deterministic PII redaction.
- Durable Temporal generation with encrypted ephemeral payloads, idempotent artifacts, retry-safe activities and a localized deterministic fallback.
- Server-side preview/full-report separation backed by PostgreSQL and Prisma.
- Stripe Checkout Sessions, localized offer selection, idempotent webhooks, email recovery and report entitlements.
- Revocable seven-day sharing links with optional name anonymization and quote hiding.
- Optional WhatsApp Cloud API delivery with encrypted phone storage and signed webhooks.
- Attempt-limited email OTP sign-in, recovery, purchase history, export and self-service deletion.
- Localized public, legal, support and synthetic example pages with international SEO metadata.
- Hourly Temporal retention cleanup for expired payloads, sessions, OTPs, links and WhatsApp destinations.
- Docker Compose deployment with Caddy, separate PostgreSQL databases, Temporal Server/UI and a dedicated worker.

The application is fully runnable in local demo mode. Real OpenRouter, Stripe, Resend, WhatsApp credentials and final legal entity details are required before a public commercial launch.

## Local development

Requirements: Node.js 22+, pnpm 11.5.1, Docker.

```bash
pnpm install
pnpm setup:env
pnpm prisma generate
docker compose up -d --build
```

`pnpm setup:env` creates only missing local secrets and blank provider slots without printing secret values. Do not commit `.env`.

For development outside Docker:

```bash
docker compose up -d postgres temporal-postgres temporal-server
pnpm dev
pnpm worker
```

Replace every placeholder secret before using it outside a local machine. Demo payments and development OTPs are off by default.

## Checks

```bash
pnpm test
pnpm lint
pnpm build
docker compose config --quiet
```

## Architecture

- `src/app` — Next.js routes and server endpoints.
- `src/components` — landing, onboarding, reports and account UI.
- `src/domain` — versioned report contracts.
- `src/lib` — parsing, privacy, persistence and provider integrations.
- `src/temporal` — deterministic workflows, activities, schedule and worker.
- `src/i18n` — eight locale dictionaries and report copy.
- `prisma` — PostgreSQL schema and migrations.
- `branding` — source visual directions.
- `content` — launch content and editorial material.
