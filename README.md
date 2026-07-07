# Mnemonic Master AI

> AI-powered vocabulary learning platform. Remember English words forever with
> AI-generated Hinglish mnemonics, funny stories, visual imagination, spaced
> repetition, quizzes, gamification, and an AI tutor.

Starts with **GRE**, and expands to TOEFL, IELTS, SAT, GMAT, CAT, UPSC, SSC, and
General English — all on one backend serving web and future Android/iOS clients.

---

## Tech stack

| Layer         | Choice                                                          |
| ------------- | -------------------------------------------------------------- |
| Frontend      | Next.js (App Router), React, TypeScript, TailwindCSS, Framer Motion, React Query, Zustand, RHF + Zod |
| Backend       | Node.js, Express, TypeScript                                   |
| Database      | PostgreSQL (Supabase) + Prisma ORM                             |
| Auth          | Clerk                                                          |
| AI            | OpenAI API                                                     |
| Storage       | Supabase Storage                                               |
| Payments      | Stripe                                                         |
| Email / Push  | Resend / Firebase Cloud Messaging                              |
| Infra         | Turborepo + pnpm · Vercel (web) · Railway (api)                |

## Monorepo layout

```
apps/
  api/          Express + TypeScript backend  → Railway
  web/          Next.js App Router frontend    → Vercel   (Phase 5)
packages/
  database/     Prisma schema + client         (Phase 1)
  core/         Framework-free domain layer    (Phase 1)
  ai/           AI mnemonic engine (OpenAI)    (Phase 2)
  validation/   Zod schemas shared FE↔BE       (Phase 1)
  types/        Shared DTOs / contracts        (Phase 1)
  config/       Fail-fast env validation       ✅
  logger/       Pino structured logging        ✅
  ui/           React design system            (Phase 5)
  tsconfig/     Shared TypeScript configs      ✅
  eslint-config/ Shared ESLint flat config     ✅
docs/           Architecture, roadmap, ADRs
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the layering rules and
[`docs/ROADMAP.md`](docs/ROADMAP.md) for the phase-by-phase build plan.

## Prerequisites

- **Node.js** `>=20.11` (see [`.nvmrc`](.nvmrc))
- **pnpm** `>=9` — `corepack enable && corepack prepare pnpm@9.15.4 --activate`
- **Docker** (for local Postgres + Redis)

## Getting started

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env        # then fill in secrets

# 3. Start local infrastructure (Postgres + Redis)
docker compose up -d

# 4. Run the API (http://localhost:4000/health)
pnpm --filter @mnemonic/api dev
```

## Workspace scripts

| Command             | Description                                  |
| ------------------- | -------------------------------------------- |
| `pnpm dev`          | Run all apps in dev mode (Turborepo)         |
| `pnpm build`        | Build every package/app                      |
| `pnpm lint`         | ESLint across the workspace                  |
| `pnpm typecheck`    | `tsc --noEmit` across the workspace          |
| `pnpm test`         | Run all unit/integration tests (Vitest)      |
| `pnpm format`       | Prettier write                               |

## Quality gates

Every package ships with `lint`, `typecheck`, and `test`. CI
([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs format-check →
lint → typecheck → test → build on every push and PR.

## License

Proprietary © Mnemonic Master AI.
