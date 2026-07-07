# Data Model

PostgreSQL schema managed by Prisma (`packages/database/prisma/schema.prisma`).
33 models across seven domains, 33 enums, 48 foreign keys. Every table from the
product spec is present; supporting join/association tables are added where the
relational model requires them.

## Domains

### Identity & Billing

| Model | Purpose |
| --- | --- |
| `User` | Account, linked to Clerk (`clerkId`), role + status. |
| `Profile` | 1:1 preferences — display name, native language, target exam, daily goal, timezone. |
| `GamificationProfile` | 1:1 XP total, level, current/longest streak. |
| `Subscription` | Stripe plan + status, period end. |
| `Payment` | Individual Stripe payments. |

### Catalog

| Model | Purpose |
| --- | --- |
| `Word` | The vocabulary aggregate: lexical fields + canonical AI content. |
| `Exam` | GRE, TOEFL, … (one row per `ExamType`). |
| `WordExam` | Word↔Exam with **per-exam frequency rank** (a word can appear in many exams at different frequencies). |
| `WordCategory` / `WordCategoryOnWord` | Topical grouping (many-to-many). |
| `WordRelation` | Self-referential curated links (synonym/antonym/related/confusable). |
| `QuizQuestion` | Per-word generated/curated question bank. |
| `ImagePrompt` | Image prompt + generated image URL + status. |
| `AiHistory` | Audit log of every AI generation (model, prompt, tokens, cost, latency). |

### Learning

`LearningProgress` (mastery + counters), `Sm2ReviewSchedule` (SM-2 state:
ease, interval, repetitions, lapses, due date), `Review` (append-only answer
log), `Flashcard` (deck membership), `DailyGoal` (per-day targets/progress),
`StudySession` (session analytics).

### Gamification

`XpEvent` (append-only XP ledger), `Badge` (catalog), `Achievement`
(user↔badge with progress/earned state).

### Community

`CommunityMnemonic` (user submissions + moderation status + vote tallies),
`Vote`, `Comment` (threaded), `Report`, `Favorite`.

### Platform

`Notification` (in-app/push/email), `AnalyticsEvent`, `AdminLog` (audit trail).

### Quiz

`Quiz` (a session: type, score, timing) and `QuizAttempt` (per-question answer
with response time — powers accuracy/speed/weak-word analytics).

## Conventions

- **IDs**: `cuid()` strings.
- **Timestamps**: `createdAt` / `updatedAt` on mutable models.
- **Cascade**: user- and word-owned rows cascade on delete; optional references
  (`AiHistory.word`, `Report.resolvedBy`, `AnalyticsEvent.user`) use `SetNull`.
- **Uniqueness**: natural keys enforced (`@@unique([userId, wordId])`,
  `@@unique([word, partOfSpeech])`, `Word.slug`, `Exam.type`, …).
- **Indexes**: hot query paths indexed (`Sm2ReviewSchedule[userId, dueAt]`,
  `WordExam[examId, frequencyRank]`, `Word[difficulty|status|frequency]`, …).
- **Enums**: domain enums (`Difficulty`, `PartOfSpeech`, `ExamType`, `Language`,
  `WordStatus`, `MnemonicType`, `ReviewRating`) mirror `@mnemonic/core`.

## Migrations & seeding

```bash
docker compose up -d postgres        # local Postgres
pnpm db:migrate                      # apply migrations (dev) / db:migrate:deploy (prod)
pnpm db:seed                         # exams + badges + starter GRE words
pnpm db:studio                       # browse data
```

The initial migration (`prisma/migrations/20260707000000_init`) creates the full
schema. The seed is idempotent (upserts); the full 1000-word GRE corpus lands in
Phase 18.
