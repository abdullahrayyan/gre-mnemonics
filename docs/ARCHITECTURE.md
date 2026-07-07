# Architecture

Mnemonic Master AI is a **Turborepo monorepo** applying **Clean Architecture**.
The guiding rule: **dependencies point inward**. Domain logic knows nothing
about Express, Prisma, React, or OpenAI. Frameworks are details plugged in at the
edges, so the same core powers the web app, the REST API, and future mobile
clients.

```
            ┌─────────────────────────────────────────────┐
            │                Interface                     │  Express controllers/routes,
            │            (delivery mechanism)              │  Next.js pages, CLI
            ├─────────────────────────────────────────────┤
            │               Application                    │  Use-cases orchestrating
            │           (use-cases / services)             │  domain + ports
            ├─────────────────────────────────────────────┤
            │                 Domain                       │  Entities, value objects,
            │      (entities, value objects, ports)        │  repository INTERFACES
            ├─────────────────────────────────────────────┤
            │              Infrastructure                  │  Prisma repos, OpenAI client,
            │        (adapters / port implementations)     │  Redis, Stripe, Resend
            └─────────────────────────────────────────────┘
                   Infrastructure implements Domain ports.
                   Nothing inner imports anything outer.
```

## Layer responsibilities

| Layer              | May depend on            | Must NOT import                    |
| ------------------ | ------------------------ | ---------------------------------- |
| **Domain**         | nothing (pure TS + Zod)  | Express, Prisma, React, OpenAI     |
| **Application**    | Domain                   | HTTP, ORM specifics                |
| **Infrastructure** | Domain, Application ports| Interface layer                    |
| **Interface**      | Application              | Infrastructure internals directly  |

The **Repository Pattern** expresses persistence as a domain-owned interface
(port). Prisma-backed implementations live in Infrastructure and are wired in via
**Dependency Injection** (a lightweight container in `apps/api`), so use-cases are
unit-testable against in-memory fakes with zero database.

## Backend module shape (`apps/api/src/modules/<feature>`)

```
modules/words/
  domain/          Word entity, value objects, WordRepository (interface)
  application/     CreateWord, SearchWords use-cases + DTOs
  infrastructure/  PrismaWordRepository, mappers
  interface/       words.controller.ts, words.routes.ts, request validators
```

Cross-cutting concerns live in `apps/api/src/shared` (HTTP errors, middleware,
logging) and in shared packages.

## Shared packages

- **`@mnemonic/config`** — fail-fast environment validation with Zod. The API
  will not boot with a malformed environment; each feature validates only the
  slice it needs.
- **`@mnemonic/logger`** — Pino structured logging with secret/PII redaction.
- **`@mnemonic/core`** *(Phase 1)* — the framework-free domain layer shared by
  every app.
- **`@mnemonic/database`** *(Phase 1)* — Prisma schema + generated client.
- **`@mnemonic/validation`** *(Phase 1)* — Zod contracts shared between the API
  and the web app, so client and server validate identically.
- **`@mnemonic/ai`** *(Phase 2)* — the mnemonic engine behind a provider port.

### Just-in-time packages

Internal packages export their TypeScript **source** (`"exports": "./src/index.ts"`)
rather than a compiled `dist`. Apps transpile them via `tsx` (dev), `tsup` (api
prod build, which bundles `@mnemonic/*` from source), and `transpilePackages`
(Next.js). This removes an entire build-ordering class of problems and keeps
iteration instant. Deployable apps are the only things that produce build output.

## Cross-cutting principles

- **Versioned API** under `/api/v1`. Breaking changes ship as `/api/v2`.
- **Consistent error envelope**: `{ error: { code, message, requestId, details? } }`.
- **Correlation ids**: every request carries an `x-request-id` propagated to logs.
- **Fail fast**: config validated at boot; inputs validated at the edge with Zod.
- **Scalability**: stateless API (horizontally scalable), Redis for
  rate-limiting/caching/queues, pooled Postgres connections, AI work idempotent
  and cacheable.

## Scale targets

Designed for 1,000,000+ users, 3,000+ words across multiple exams, multiple
languages, native mobile clients on the same backend, on-demand AI generation,
and offline sync. Every decision is checked against these targets — see ADRs in
[`docs/adr`](adr).
