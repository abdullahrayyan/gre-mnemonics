# GRE Words with Mnemonics

Read 1111 GRE words, each with a memory hook and a Hindi meaning, in groups of
25 — then revise the group you just read.

**Live:** https://gremnemonics.netlify.app

That is the whole product. There is no account, no AI at runtime, no backend.
Progress ("which groups are done") lives in your browser's localStorage.

## How it works

```
/                    45 groups of 25, with done ticks and a progress bar
/group/[id]          read the words — swipe, or use ← →
/group/[id]/revise   flashcards: word → tap to reveal → next
```

Every word ships with the app in a single JSON file, so each route is
pre-rendered to static HTML at build time. The deployed site is a folder of
files — nothing runs on a server.

It is also a PWA: add it to your phone's home screen and it works offline.

## The words

All 1111 mnemonics are hand-checked, not generated at runtime. A hook only works
if it is anchored to something the reader already knows — "Car + Mud" for
*curmudgeon* — so each one was reviewed rather than accepted from a model.

```
data/curated.json   source of truth: meaning, Hindi gloss, hook (1111 entries)
data/corpus.json    the word list and parts of speech
```

`apps/web/src/data/words.json` is generated from those two. Never edit it by
hand — it is overwritten on every build of the word data.

### Adding or fixing mnemonics

Paste a batch into a file, one word per line, in either shape:

```
word | english meaning | hindi gloss | "Hook": sentence using the word
word | english meaning (hindi gloss) | "Hook": sentence using the word
```

The second is what Gemini emits; a copied markdown table can be pasted in
untouched, bold markers and all. Then:

```bash
pnpm words:import path/to/batch.md   # merge into data/curated.json
pnpm words:build                     # regenerate words.json + remaining-groups.md
```

Both steps are required — importing alone changes nothing the app can show. A
headword that is not in the corpus is rejected rather than imported, because an
entry the corpus cannot match would silently never appear.

[`remaining-groups.md`](remaining-groups.md) lists any words still lacking a
curated mnemonic, grouped as the app groups them. It is currently empty.

## Layout

```
apps/web/           the app (Next.js App Router, static export)
packages/ui/        React design system
packages/tsconfig/  shared TypeScript configs
packages/eslint-config/
data/               word data (source of truth)
scripts/            word pipeline
```

## Getting started

Needs Node `>=20.11` (see [`.nvmrc`](.nvmrc)) and pnpm `>=9`
(`corepack enable && corepack prepare pnpm@9.15.4 --activate`). No `.env`, no
database, no Docker.

```bash
pnpm install
pnpm --filter @mnemonic/web dev    # http://localhost:3000
```

To reach it from your phone on the same Wi-Fi, `node apps/web/scripts/dev-demo.mjs`
serves on your LAN address and prints the URL.

## Scripts

| Command            | Description                                              |
| ------------------ | -------------------------------------------------------- |
| `pnpm build`       | Build the site into `apps/web/out` — this is what deploys |
| `pnpm dev`         | Dev server                                                |
| `pnpm lint`        | ESLint across the workspace                               |
| `pnpm typecheck`   | `tsc --noEmit` across the workspace                       |
| `pnpm test`        | Vitest                                                    |
| `pnpm format`      | Prettier write                                            |
| `pnpm words:import`| Merge a mnemonic batch into `data/curated.json`           |
| `pnpm words:build` | Regenerate `words.json` + `remaining-groups.md`           |

## Deploying

`pnpm build` writes `apps/web/out`. Any static host serves it as-is.

[`netlify.toml`](netlify.toml) configures a Netlify build from this repo. Note
it only applies to a git-connected or CLI deploy — dragging `out/` to Netlify
Drop uploads that folder alone, so Netlify never sees the config and falls back
to its defaults.

## Quality gates

[CI](.github/workflows/ci.yml) runs format-check → lint → typecheck → test →
build on every push and PR, and asserts the static export was actually emitted —
a build that exits 0 without producing pages is the failure worth catching.

## License

Proprietary.
