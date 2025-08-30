# Aidvokat MVP

Monorepo with Next.js web app, NestJS API and shared contracts.

## Setup

```bash
pnpm install
docker compose -f infra/docker-compose.yml up -d
pnpm db:migrate:dev
pnpm dev
```

API runs on http://localhost:4000

## Environment Variables

See `apps/api/.env.example` for required variables:

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `WEB_ORIGIN`
- `S3_ENDPOINT`
- `S3_REGION`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `S3_BUCKET_EXPORTS`
- `SENTRY_DSN`
- `OTEL_EXPORTER_OTLP_ENDPOINT`
- `NODE_ENV`
