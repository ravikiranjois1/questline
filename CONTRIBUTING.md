# Contributing

## Setup

```bash
git clone <this repo>
cd questline
npm install
npm run dev
```

## Before you open a PR

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test
npm run test:e2e   # if you touched UI/behavior
```

All of these run in CI; PRs are blocked on red.

## Ground rules

- **Engine ≠ content.** `src/engine/` is pure TypeScript — no React, no IndexedDB. It must stay
  unit-testable in isolation.
- **Content-as-data.** Never copy course-pack lesson text into the progress store. The store only
  holds the user's `ProgressEvent[]`.
- **UI never computes XP/unlock/streak itself** — always through `src/engine/`.
- Accessibility is not optional: keyboard nav, ARIA, and AA contrast are reviewed on every UI PR.

## Authoring a course pack

See [`docs/COURSE-PACK-FORMAT.md`](docs/COURSE-PACK-FORMAT.md) for the manifest contract.

## Commit style

Small, focused commits. Explain _why_ in the body when it's not obvious from the diff.
