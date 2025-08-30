# Aidvokat MVP

Monorepo for Aidvokat prototype.

## Quick start

```bash
pnpm install
docker compose -f infra/docker-compose.yml up -d
pnpm db:migrate:dev
pnpm dev
```

API runs on `http://localhost:4000` and Web on `http://localhost:3000`.

## Environment

Create `apps/api/.env` based on `.env.example`.
