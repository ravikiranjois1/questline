# Progress log

Tracks build phases (see build spec `docs/BUILD-SPEC.md`) and decisions made along the way.

## Decisions

- **Node/package manager:** Node 26 (via Homebrew), npm (not pnpm/yarn) — simplest path, matches
  spec's quickstart verbatim.
- **Manifest format:** JSON (not YAML) — trivial JSON-Schema validation, no extra parser dep.
- **Repo location:** new sibling folder `~/Learning/questline`, separate from the spec-only
  `~/Learning/Tracker` folder.
- **ESLint pinned to v9** (not v10) — `eslint-plugin-jsx-a11y` doesn't yet support ESLint 10's peer
  range; revisit when it does.
- **Tailwind v4** via `@tailwindcss/vite` — CSS-first config (`@theme`/`@plugin` in `index.css`),
  no `tailwind.config.js`.
- **Dark mode default:** IDE-dark is the only theme for now (`class="dark"` hardcoded on `<html>`
  in `index.html`). A light-mode toggle is a P5 polish candidate, not required for v1.
- **Base path:** Vite `base: '/questline/'` for GitHub Pages project-site hosting; Playwright's
  `baseURL` matches.

## P0 — Skeleton ✅

- Vite + React 19 + TypeScript (strict, `noUncheckedIndexedAccess`) scaffolded.
- Tailwind v4 + dark mode + Radix primitives (checkbox used in RightQuest so far).
- React Router (`HashRouter` — GitHub Pages-safe). Routes: `/`, `/settings`, `/import-export`.
- Zustand `useUiStore` for UI-only selection/focus-mode state.
- ESLint (flat config, typed rules, jsx-a11y, react-hooks) + Prettier + Husky + lint-staged.
- Vitest + React Testing Library wired; one component test suite (`LeftTree.test.tsx`).
- Playwright wired; one harness smoke test (`e2e/smoke.spec.ts`) — real user-flow coverage lands
  in P4 once progress/persistence exist.
- Three-panel layout (TopBar / LeftTree / CenterReader / RightQuest / CalendarStrip) built against
  dummy fixture data (`src/ui/pages/dummyFixture.ts`), verified visually via Playwright screenshot.
- GitHub Actions CI: typecheck → lint → format:check → test → build, then Playwright e2e, then
  deploy to GitHub Pages on green `main`. Dependabot configured (npm + actions, weekly).
- MIT LICENSE, CONTRIBUTING.md, CODE_OF_CONDUCT.md, issue/PR templates, README,
  `docs/COURSE-PACK-FORMAT.md`.

**Not done yet (later phases):** IndexedDB persistence (P3), real markdown/mermaid rendering (P2),
calendar heatmap wired to real data (P4), responsive tab-collapse on narrow screens (P5),
AI-Engineer pack conversion (P6).

## P1 — Engine core ✅

- `engine/schema.ts` + `engine/manifest.ts`: JSON-Schema structural validation (ajv) plus semantic
  checks — duplicate/overlapping ids, dangling `requires`/`children` references, malformed badge
  trigger strings, non-ascending level thresholds, and cyclic `requires` graphs (DFS with
  white/gray/black coloring). `parseManifest` throws `ManifestValidationError` with _every_ issue
  found, not just the first.
- `engine/progress.ts`: event log → net completed-milestone set (sorted by `at`, so out-of-order
  arrival is safe for a future agent-writes integration); XP; unlock derivation; item/chapter
  completion %.
  - **Unlock is transitive and re-verified, not just "is the direct parent complete."** An id is
    unlocked only if every dependency is both complete _and itself unlocked_ — recursion is safe
    because manifest validation already rejects cycles. This catches the case where an item's own
    milestones are marked done but its prerequisite chain wasn't (tested explicitly).
- `engine/calendar.ts`: UTC-day bucketing for the heatmap; streak with a one-day grace period
  (today not having activity yet doesn't zero the streak, but a 2+ day gap does) — timezone/day-
  boundary edge cases unit-tested.
- `engine/gamification.ts`: level-from-threshold, and badge trigger evaluation for all four
  declarative forms (`stage:`, `lab:`, `milestone:`, `streak:`).
- 41 Vitest cases across manifest/progress/calendar/gamification, including the transitive-unlock
  and cycle-rejection cases the spec calls out explicitly.

## P2 — Read a pack

_(not started)_

## P3 — Progress + gamify

_(not started)_

## P4 — Calendar + export/import

_(not started)_

## P5 — Polish + a11y + docs

_(not started)_

## P6 — Load the real pack

_(not started)_
