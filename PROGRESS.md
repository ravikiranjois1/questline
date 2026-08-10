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

**Not done yet (later phases):** engine logic (manifest validation, progress derivation — P1),
IndexedDB persistence (P3), real markdown/mermaid rendering (P2), calendar heatmap data (P4),
responsive tab-collapse on narrow screens (P5), AI-Engineer pack conversion (P6).

## P1 — Engine core

_(not started)_

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
