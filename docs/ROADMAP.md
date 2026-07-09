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
| **5**  | **Web Foundation**                   | Next.js App Router app, `@mnemonic/ui` design system + `@mnemonic/types`, dark/light theming, React Query + Zustand, Clerk on web, typed API client, landing + words + dashboard | ✅ done |
| **6**  | **Flashcards + SM-2 Spaced Repetition** | Complete SM-2 scheduler in `core`, review API (`/reviews/queue` + submit → schedule + progress + XP), animated flip flashcard UI (Again/Hard/Good/Easy) | ✅ done |
| **7**  | **Daily Learning + Dashboard**       | XP↔level math in `core`, `/stats/dashboard` aggregation (goal/streak/retention/reviews-due/weekly), analytics events, dashboard UI (goal ring + selector + weekly chart) | ✅ done |
| **8**  | **Quiz Engine**                      | 9-type quiz generator in `core` (MCQ w/ distractors), quiz API (start/answer/complete + XP, weak-words), quiz UI with instant feedback + results | ✅ done |
| **9**  | **AI Tutor**                         | Streaming provider + `TutorEngine` (9 actions), SSE `/tutor/chat` API (auth + rate-limit + AiHistory), streaming chat UI | ✅ done |
| **10** | **Gamification**                     | Achievement engine (badges from criteria + auto-award), leaderboard API, badges + leaderboard UI (XP/level/streak already surfaced) | ✅ done |
| **11** | **Community**                        | Submit mnemonics, votes, threaded comments, reports; sort newest/top; demo feed  | ✅ done |
| **12** | **Search**                           | Debounced multi-field search page (word/meaning/Hindi/synonym/root) + difficulty/POS filters + header search box | ✅ done |
| **13** | **Admin Panel**                      | ADMIN-gated overview stats, community moderation (mnemonics + reports), AI word generation | ✅ done |
| 14     | Payments                             | Stripe subscriptions, webhooks, entitlements                                     |        |
| 15     | Notifications                        | FCM push + Resend email reminders                                               |        |
| 16     | Voice                                | Native/slow pronunciation, recording, AI pronunciation scoring                   |        |
| 17     | Bonus AI + PWA                       | Any-word generator, memory palace, OCR/PDF import, Chrome extension, offline PWA  |        |
| 18     | Seed Data                            | 1000 GRE words with exam frequency (corpus captured: **1112 words / 38 gregmat groups**; AI-generation seed pipeline built) | 🔶 data in |

### Cross-cutting (woven through every phase)

- **Testing** — unit (Vitest), integration (supertest + test DB), API contract tests.
- **Security** — Helmet, CORS, rate limiting, input validation, authZ, secret redaction.
- **Observability** — structured logs, correlation ids, health/readiness probes.
- **CI/CD** — GitHub Actions: format → lint → typecheck → test → build → deploy.
- **Performance & scale** — caching, pagination, connection pooling, idempotent AI.

---

## Phase 8 — completed

- `@mnemonic/core`: `generateQuizQuestions` — deterministic (injectable RNG)
  multiple-choice generator covering all 9 kinds (word↔meaning, synonym, antonym,
  sentence-completion, fill-in-blank, root, mnemonic-recall) with distractors
  drawn from the word pool; `QuizType`/`QuizQuestionKind` enums. Unit tests.
- API `quizzes` module: `POST /quizzes` (generate + persist, answers hidden),
  `POST /quizzes/:id/answers` (grade, auto-complete on last → score + XP),
  `GET /quizzes/weak-words` (most-missed words). Prisma + in-memory stores;
  integration tests.
- Web `/quiz`: type picker → question screen with instant correct/incorrect
  highlighting → results (score + XP). Verified: typecheck, tests, lint, format,
  `next build` (6 routes).

## Phase 7 — completed

- `@mnemonic/core`: XP↔level math (`levelFromXp`, `xpForLevel`, `levelProgress`,
  quadratic curve) with tests.
- API: `stats` module — `GET /api/v1/stats/dashboard` aggregates daily goal +
  completed/remaining, reviews due, XP/level, streak (grace-day rule), retention
  %, words learned/mastered, and 7-day activity in one read transaction.
  `analytics` module — `POST /api/v1/analytics` (auth optional) records events.
  Integration tests.
- Web `/dashboard`: animated goal ring, 10/20/30/50 goal selector (updates the
  profile), stat cards (level/streak/retention/reviews-due), dependency-free
  weekly bar chart. Verified: typecheck, tests, lint, format, `next build`.

## Phase 6 — completed

- `@mnemonic/core`: the **complete SM-2 algorithm** (`scheduleSm2`) — ease-factor
  update (clamped to 1.3), interval progression (1 → 6 → interval×EF), lapse
  reset on Again, next due date. 7 dedicated unit tests. `ReviewRating`,
  `LearningStatus`, `StudySource` enums.
- API `reviews` module: `GET /api/v1/reviews/queue` (due cards + new cards) and
  `POST /api/v1/reviews` (auth) — one transaction updates the SM-2 schedule,
  learning progress, review log, and awards XP. Prisma + in-memory stores;
  integration tests.
- Web `/review`: animated 3D-flip flashcard (front word/pronunciation, back
  meaning/mnemonic/synonyms), Again/Hard/Good/Easy rating, React Query hooks
  with Clerk token. Verified: typecheck, tests, lint, format, `next build`.

## Phase 5 — completed

- `apps/web`: Next.js 15 App Router app — landing (Framer Motion hero + feature
  cards), `/words` (React Query list + skeletons + glass cards), `/dashboard`
  (auth-aware). Clerk on the web (provider, middleware, sign-in / user button),
  dark/light theming via next-themes, typed API client, Zustand UI store.
- `@mnemonic/ui`: design system — `cn`, Button (motion), Card (glass), Badge,
  Skeleton, Spinner; component tests (Vitest + Testing Library + jsdom).
- `@mnemonic/types`: framework-free HTTP contracts (WordDto, MeDto, Pagination,
  envelopes) shared by API and clients. Shared React ESLint config.
- Verified: typecheck (incl. CI-sim without build artifacts), unit tests, lint,
  format, and a full `next build` (4 static routes + middleware).

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
