# Build Roadmap

The platform is built in **verifiable vertical slices**. Each phase ships
architecture → code → schema → API → UI → tests → docs, and is completed and
verified before the next begins.

| Phase  | Feature                              | Key deliverables                                                                 | Status |
| ------ | ------------------------------------ | -------------------------------------------------------------------------------- | ------ |
| **0**  | **Foundation**                       | Monorepo, tooling, `config` + `logger`, bootable API + health, Docker, CI, docs | ✅ done |
| 1      | Data & Domain Core                   | Full Prisma schema (all tables), migrations, seed harness, `core` domain, Word entity + repository | ⏭ next |
| 2      | AI Mnemonic Engine                   | `@mnemonic/ai`, OpenAI adapter, prompt templates, 11 generated artifacts, caching + `AIHistory` |        |
| 3      | Words REST API                       | CRUD, search, filter, pagination, rate limiting, caching, integration tests      |        |
| 4      | Auth & Users                         | Clerk integration, user/profile sync, RBAC, subscription gating                  |        |
| 5      | Web Foundation                       | Next.js app, design system (`ui`), theming (dark/light), React Query + Zustand   |        |
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
| 18     | Seed Data                            | 1000 GRE words with exam frequency                                              |        |

### Cross-cutting (woven through every phase)

- **Testing** — unit (Vitest), integration (supertest + test DB), API contract tests.
- **Security** — Helmet, CORS, rate limiting, input validation, authZ, secret redaction.
- **Observability** — structured logs, correlation ids, health/readiness probes.
- **CI/CD** — GitHub Actions: format → lint → typecheck → test → build → deploy.
- **Performance & scale** — caching, pagination, connection pooling, idempotent AI.

---

## Phase 0 — completed

- pnpm + Turborepo monorepo, shared `tsconfig` + `eslint-config`.
- `@mnemonic/config` (fail-fast env validation) with unit tests.
- `@mnemonic/logger` (Pino + redaction).
- `apps/api`: Express app factory, versioned router, health module, request-id +
  structured request logging, consistent error envelope, graceful shutdown — with
  supertest integration tests.
- `docker-compose.yml` (Postgres 16 + Redis 7), `.env.example`, CI pipeline, docs.
