# Айдвокат Monorepo

Монохранилище для MVP ИИ-ассистента «Айдвокат». Репозиторий построен на pnpm и включает приложения Next.js (frontend) и NestJS (backend), а также общие пакеты с UI-компонентами и контрактами данных.

## Структура

- `apps/web` — клиентское приложение Next.js 14 (App Router, TailwindCSS, next-intl, Zustand, React Query).
- `apps/api` — серверное приложение на NestJS с Prisma и BullMQ.
- `packages/contracts` — общие схемы DTO на базе Zod.
- `packages/ui` — библиотека UI-компонентов в стиле shadcn/ui.
- `packages/config` — единые конфигурации ESLint/Prettier/TS.

## Скрипты верхнего уровня

- `pnpm dev` — параллельный запуск `web` и `api` в режиме разработки.
- `pnpm build` — сборка всех пакетов.
- `pnpm lint` — линтинг кодовой базы.
- `pnpm test` — запуск тестов (Jest + Vitest).
- `pnpm migrate` — применение миграций Prisma для API.
- `pnpm prisma:generate` — генерация Prisma Client (в офлайн-среде команда создаёт заглушку и напоминает запустить `pnpm prisma:generate --strict`, когда доступ к интернету появится).
- `pnpm prisma:generate --strict` — форсированная генерация Prisma Client с ошибкой при недоступных бинарниках.

## Требования

- Node.js LTS (>=18)
- pnpm 8+
- PostgreSQL 15+
- Redis для очередей BullMQ
