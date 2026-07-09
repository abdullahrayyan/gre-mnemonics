# Zero-infra demo mode

Run the entire product — words, spaced-repetition review, quizzes, dashboard,
achievements, and the AI tutor — with **no Postgres, Redis, OpenAI, or Clerk**.
Everything is served from an in-memory, pre-seeded container so you can click
through the app immediately.

## Run it

Two processes, from the repo root:

```bash
# 1) API on :4000 — in-memory, seeded with 15 GRE words + a demo learner
pnpm --filter @mnemonic/api demo        # (or: node apps/api/scripts/demo.mjs)

# 2) Web on :3000 — signed-in as the demo learner, pointed at the demo API
node apps/web/scripts/dev-demo.mjs
```

Then open http://localhost:3000.

The Claude Code preview uses `.claude/launch.json`, which defines both servers
(`api` and `web`) so they can be started from the preview panel.

## What demo mode changes

- **API** (`src/main.demo.ts` → `createDemoContainer`): swaps every Prisma store
  for its in-memory counterpart, seeds the vocabulary catalog + a demo
  user/profile/stats/achievements, and uses the `StubAiProvider` so the tutor
  streams an offline canned reply. `DemoAuthVerifier` accepts any bearer token
  and resolves it to the seeded demo user, so no real Clerk session is needed.
  Env defaults (incl. a placeholder `DATABASE_URL` that is never queried) are set
  in `src/bootstrap/demo-env.ts`.

- **Web** (`NEXT_PUBLIC_DEMO_MODE=1`): `src/lib/auth.tsx` replaces the Clerk
  provider, `SignedIn`/`SignedOut`/`SignInButton`/`UserButton`, and
  `useAuth`/`useUser` with demo implementations that report a fixed signed-in
  learner whose token is `demo`. Middleware skips Clerk. Every page that would
  import from `@clerk/nextjs` imports from `@/lib/auth` instead, so the switch is
  in one file. With no real key set, normal `pnpm dev` still uses Clerk unchanged.

## Going beyond the demo

Add real credentials to switch each capability from stub to live:

| Capability            | Env                                                        |
| --------------------- | ---------------------------------------------------------- |
| Persistent data       | `DATABASE_URL` (+ `pnpm db:migrate`, `pnpm db:seed:gre`)   |
| Real authentication   | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`    |
| Live AI mnemonics/tutor | `OPENAI_API_KEY`                                         |
