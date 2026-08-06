# Roastin Has Notes

Turn a WhatsApp conversation into the unfiltered report nobody in the chat would dare to write.

The living product specification is in [Brief.md](./Brief.md).

## What is implemented

- Editorial landing page and responsive Roastin design system.
- Five-step WhatsApp onboarding with `.txt` and `.zip` parsing.
- International date-format handling, local chat summary and deterministic PII redaction.
- Strict structured report generation through OpenRouter, with an explicit local fallback.
- Server-side preview/full-report separation backed by PostgreSQL and Prisma.
- Stripe Checkout Sessions, idempotent webhooks and report entitlements.
- Revocable seven-day sharing links.
- Optional WhatsApp Cloud API delivery with encrypted phone storage and signed webhooks.
- Email OTP sign-in and private report dashboard.
- Docker Compose deployment with Caddy and PostgreSQL.

The complete brief is still being implemented. Temporal orchestration, all eight locales, the remaining settings/legal pages and production provider credentials are not finished yet.

## Local development

Requirements: Node.js 22+, pnpm 11.5.1, Docker.

```bash
cp .env.example .env
pnpm install
pnpm prisma generate
docker compose up -d postgres
pnpm dev
```

For the current production-like local stack:

```bash
docker compose up -d --build
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
- `prisma` — PostgreSQL schema and migrations.
- `branding` — source visual directions.
- `content` — launch content and editorial material.
