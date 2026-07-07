# ADR 0001 — Monorepo + Clean Architecture

- **Status:** Accepted
- **Date:** 2026-07-07

## Context

Mnemonic Master AI must serve a web app and, later, native Android/iOS clients
from a single backend, share vocabulary/domain logic across all of them, generate
AI content on demand, and scale to 1M+ users. We need an architecture that keeps
domain logic reusable and testable while allowing independent deployment of the
frontend (Vercel) and backend (Railway).

## Decision

1. **Turborepo + pnpm monorepo.** One repository with `apps/*` (deployables) and
   `packages/*` (shared libraries). pnpm workspaces for strict, fast, disk-
   efficient installs; Turborepo for cached task orchestration.

2. **Clean Architecture** with dependencies pointing inward: Domain →
   Application → Infrastructure/Interface. The domain layer (`@mnemonic/core`) is
   framework-free and shared by every app, so business rules are written once.

3. **Repository Pattern + Dependency Injection.** Persistence is a domain-owned
   interface; Prisma implementations are injected. Use-cases are unit-tested
   against in-memory fakes.

4. **Just-in-time internal packages.** Shared packages export TypeScript source;
   apps transpile them. Only deployables produce build artifacts, eliminating
   build-ordering complexity.

## Consequences

- ➕ Domain logic is reusable across web, API, and future mobile.
- ➕ Fast, cache-friendly CI; instant local iteration (no library build step).
- ➕ Clear testing seams (fakes at ports).
- ➖ More initial boilerplate (layer separation, DI wiring).
- ➖ Contributors must understand the dependency-direction rule; enforced by
  code review and, later, lint boundaries.

## Alternatives considered

- **Next.js full-stack (API routes only).** Rejected: couples backend to the web
  runtime and complicates serving native mobile clients and long-running/queued
  AI work. The spec explicitly calls for a standalone Express backend on Railway.
- **Polyrepo.** Rejected: painful cross-repo sharing of domain + validation.
