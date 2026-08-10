# Questline

A local-first, gamified tracker for **course-as-code** learning paths. Point it at a _course
pack_ (markdown + a manifest) and it renders an IDE-style progress tracker: a chapter/lab tree
with lock/unlock state, a reader for the current lab's content, and a gamification HUD (XP,
levels, streaks, badges) — all derived from an append-only log of progress events you own.

> **Status:** early build (P0 skeleton). See [PROGRESS.md](PROGRESS.md) for what's shipped.

## Why

Most course trackers either duplicate lesson content into a database (drift risk) or are just a
todo list with no sense of progression. Questline treats the course pack as the single source of
truth — it never stores lesson text — and treats your progress as an event log, so XP, streaks,
and the activity calendar all fall out of the same data for free.

## Local-first & private

No accounts, no backend, no network calls. All progress lives in your browser's IndexedDB and is
exportable/importable as a single JSON file you control.

## Quickstart

```bash
git clone <this-repo>
cd questline
npm install
npm run dev
```

Opens with the bundled demo course pack — no config, no backend.

## Scripts

| Command                   | Does                            |
| ------------------------- | ------------------------------- |
| `npm run dev`             | Start the dev server            |
| `npm run build`           | Typecheck + production build    |
| `npm run test`            | Unit + component tests (Vitest) |
| `npm run test:e2e`        | Playwright e2e smoke            |
| `npm run lint` / `format` | ESLint / Prettier               |

## Authoring a course pack

A course pack is a folder of markdown plus a `course.json` manifest declaring chapters, items,
milestones, and unlock dependencies. See [`docs/COURSE-PACK-FORMAT.md`](docs/COURSE-PACK-FORMAT.md)
for the full contract.

## Architecture

```
src/
  engine/   pure domain logic (manifest validation, progress derivation, gamification) — no React
  store/    Zustand + IndexedDB persistence
  ui/       layout, components, pages
  content/  markdown rendering (remark/rehype/mermaid)
public/courses/  bundled course packs
```

`engine/` never touches React or IndexedDB, so it's unit-tested in isolation and reusable if a
backend is ever added later.

## License

MIT — see [LICENSE](LICENSE).
