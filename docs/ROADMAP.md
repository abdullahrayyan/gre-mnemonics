# Build Roadmap

The platform is built in **verifiable vertical slices**. Each phase ships
architecture → code → schema → API → UI → tests → docs, and is completed and
verified before the next begins.

| Phase  | Feature                              | Key deliverables                                                                 | Status |
| ------ | ------------------------------------ | -------------------------------------------------------------------------------- | ------ |
| **0**  | **Foundation**                       | Monorepo, tooling, `config` + `logger`, bootable API + health, Docker, CI, docs | ✅ done |
| **1**  | **Data & Domain Core**               | Full Prisma schema (33 models), initial migration, seed harness, `core` domain, `Word` entity + repository port + Prisma adapter | ✅ done |
| **2**  | **AI Mnemonic Engine**               | `@mnemonic/ai`: provider port + OpenAI adapter + stub, prompt templates, 11 generated artifacts, Zod-validated structured output, caching, cost tracking | ✅ done |
| **3**  | **Words REST API**                   | `/api/v1/words` CRUD + search/filter/pagination, `@mnemonic/validation`, DI container, Redis rate-limit + cache, AI generate + `AiHistory`, readiness probe, integration tests | ✅ done |
| **4**  | **Auth & Users**                     | Clerk token verification + RBAC middleware, svix webhook user provisioning, `/me` + profile, subscription-gate middleware, secured word writes | ✅ done |
| 5      | Web Foundation                       | Next.js app, design system (`ui`), theming (dark/light), React Query + Zustand   | ⏭ next |
| 6      | Flashcards + SM-2 Spaced Repetition  | Animated flashcards, complete SM-2, review scheduling (Again/Hard/Good/Easy)     |        |
| 7      | Daily Learning + Dashboard           | Goals (10/20/30/50/custom), XP, streaks, retention %, analytics                  |        |
| 8      | Quiz Engine                          | 9 quiz types, attempts, accuracy/speed/weak-word tracking                        |        |
| 9      | AI Tutor                             | Streaming chat, explain/another-mnemonic/compare/etc.                            |        |
| 10     | Gamification                         | XP, levels, streaks, badges, leaderboards                                        |        |
| 11     | Community                            | Submit mnemonics, votes, comments, reports, moderation                          |        |
| 12     | Search                               | Multi-field search (word/meaning/Hindi/synonym/root/difficulty/category)         |        |
| 13     | Admin Panel                          | CRUD words, CSV/bulk import, regenerate AI, analytics, user + community mod       |        |
| 14     | Payments                             | Stripe subscriptions, webhooks, entitlements                                     |        |
| 15     | Notifications                        | FCM push + Resend email reminders                                               |        |
| 16     | Voice                                | Native/slow pronunciation, recording, AI pronunciation scoring                   |        |
| 17     | Bonus AI + PWA                       | Any-word generator, memory palace, OCR/PDF import, Chrome extension, offline PWA  |        |
| 18     | Seed Data                            | 1000 GRE words with exam frequency (corpus captured: 840 words / 28 gregmat groups; AI-generation seed pipeline built) | 🔶 data in |

### Cross-cutting (woven through every phase)

- **Testing** — unit (Vitest), integration (supertest + test DB), API contract tests.
- **Security** — Helmet, CORS, rate limiting, input validation, authZ, secret redaction.
- **Observability** — structured logs, correlation ids, health/readiness probes.
- **CI/CD** — GitHub Actions: format → lint → typecheck → test → build → deploy.
- **Performance & scale** — caching, pagination, connection pooling, idempotent AI.

---

## Phase 4 — completed

- Auth via ports: `AuthVerifier` (Clerk JWT adapter + stub) and `WebhookVerifier`
  (svix adapter + stub) — middleware and provisioning are testable without Clerk.
- `requireAuth` / `requireRole` / `optionalAuth` / `requirePlan` middleware;
  `req.auth` carries `{ userId, clerkId, role }`.
- `User` domain entity + `UserRepository`; `PrismaUserRepository` provisions
  Profile + GamificationProfile + FREE Subscription atomically on create.
- Clerk webhook (`POST /api/webhooks/clerk`, raw-body + signature verified) syncs
  `user.created/updated/deleted`. `GET /api/v1/me` + `PATCH /api/v1/me/profile`.
- Word write endpoints now require ADMIN; reads stay public.
- Verified: auth/RBAC/webhook integration tests, all gates green.

## Phase 3 — completed

- Words REST API under `/api/v1/words`: create, read (by id + slug), list
  (search/filter/sort/paginate), update (PATCH), delete, and
  `POST /:id/generate` (AI mnemonics → persisted `AiHistory`).
- Clean Architecture module: use-cases (application) · Prisma/cached/in-memory
  repositories + AI-history recorder (infrastructure) · controller + routes
  (interface), wired through a typed DI **container** with test overrides.
- `@mnemonic/validation` (shared Zod schemas), central error handler now maps
  domain errors (NotFound→404, Conflict→409, Validation→422), Redis-or-memory
  rate limiting + cache (`CachedWordRepository`), DB readiness probe.
- **Packaging decision:** the API runs via **tsx in production** (not a tsup
  bundle) so Prisma's generated client + engine resolve normally — prod mirrors
  dev. Verified: `node --import tsx src/main.ts` boots and serves.
- Verified: full CRUD + AI-generate + validation + error-mapping via supertest
  (in-memory container); typecheck, ~50 tests, lint, format all green.

## Phase 2 — completed

- `@mnemonic/ai`: `AiProvider` port with an `OpenAiProvider` adapter (token/
  latency/error handling) and a deterministic `StubAiProvider` for tests.
- `MnemonicEngine`: builds the "funny friend" prompt, generates all 11 artifacts
  as one structured JSON call, validates with Zod (parse-retry + fence-strip +
  quiz-type coercion), maps to domain `WordAiContent`, and is DB-free (returns
  metadata for the API to persist as `AiHistory`).
- `GenerationCache` port + in-memory impl (Redis in Phase 3), `estimateCostCents`.
- Verified: 8 unit tests (parse/cache/retry/error/mapping/cost), typecheck, lint,
  format, build all green; runnable offline demo (`pnpm --filter @mnemonic/ai demo`).

## Phase 1 — completed

- `@mnemonic/core`: framework-free domain — `Word` aggregate with enforced
  invariants, value-object enums, `WordRepository` port, `Guard`/pagination/
  slug utilities, domain errors. Unit tested.
- `@mnemonic/database`: full Prisma schema (33 models · 33 enums · 48 FKs),
  initial migration, Prisma client singleton, `PrismaWordRepository` (adapter)
  + `WordMapper` (row ↔ entity), idempotent seed (exams, badges, starter GRE
  words with exam frequency). Mapper unit tested.
- Verified: schema valid, migration DDL generated, client generated, all quality
  gates green (typecheck · test · lint · format · build).

## Phase 0 — completed

- pnpm + Turborepo monorepo, shared `tsconfig` + `eslint-config`.
- `@mnemonic/config` (fail-fast env validation) with unit tests.
- `@mnemonic/logger` (Pino + redaction).
- `apps/api`: Express app factory, versioned router, health module, request-id +
  structured request logging, consistent error envelope, graceful shutdown — with
  supertest integration tests.
- `docker-compose.yml` (Postgres 16 + Redis 7), `.env.example`, CI pipeline, docs.
