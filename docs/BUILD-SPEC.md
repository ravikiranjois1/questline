# QUESTLINE — Learning Tracker Web App: BUILD SPEC (self-contained)

> **What this file is.** A single, portable specification for building a **local-first,
> gamified learning-tracker web app** that turns a "course-as-code" markdown curriculum into
> an IDE-style progress tracker. It is written so a **completely fresh session, in a new
> dedicated repository**, can build the whole thing from scratch with no access to the
> originating chat.
>
> **Provisional name:** **QUESTLINE** (a learning "quest line"). Rename freely.
>
> **This app is a SEPARATE product** from the AI-Engineer curriculum it will first display.
> The curriculum is just its first *course pack* (external input). Do not couple the two.

---

## 0. Locked decisions (from the product owner — do not re-litigate)
1. **Scope v1 = personal tracker for one user.** But architect for a clean path to
   **open-source, multi-user** later. No accounts/auth/backend in v1.
2. **Platform = website** (static SPA). Not desktop, not mobile-native (responsive web is fine).
3. **Progress is entered manually** by the user in the UI for now. An automated "agent writes
   progress" integration is a *later* phase — design a seam for it, don't build it.
4. **New dedicated repository.** This does not live in the `career-profile` repo.
5. **Serious portfolio / OSS effort.** Production quality: typed, tested, documented, CI,
   accessible, licensed. This is a showcase piece, not a weekend hack.

---

## 1. Product vision (one paragraph)
QUESTLINE renders any "course pack" (a folder of markdown + a manifest) as a game-like
learning journey. **Left panel** = the chapter/lab tree with locked/unlocked state. **Center**
= an IDE-style reader showing the current lab's content (spec, rubric, notes). **Right/top** =
a gamification HUD (XP, level, streak, badges, overall progress). An **internal calendar**
visualizes activity and planned dates, derived from progress events. The learner advances by
completing **milestones**; completing prerequisites **unlocks** later chapters. All state is
local-first (the user's browser), private by default, exportable/importable as JSON.

---

## 2. Non-negotiable principles
1. **Content-as-data / single source of truth.** The app **reads** a course pack (markdown +
   manifest). It must NEVER duplicate lesson content into its own store. This kills content
   drift — the #1 failure mode.
2. **Engine ≠ content.** The app (engine) is generic; the AI-Engineer curriculum is one
   *course pack*. Anyone can author a new pack and load it. Keep the boundary hard.
3. **Local-first, private by default.** No network needed to use it. State lives in the
   browser (IndexedDB) and is exportable to a JSON file the user owns.
4. **Progress model is event-sourced-lite.** Store an append log of progress events
   (milestone completed/uncompleted, notes). Derive XP, streaks, calendar, and unlock state
   from events. This makes the calendar/gamification "free" and future agent-writes trivial.
5. **Production quality.** Typed (TypeScript strict), tested (unit + component + e2e-smoke),
   linted/formatted, CI-gated, **accessible (WCAG AA)**, documented, MIT-licensed.
6. **No premature backend.** Every feature in v1 works with zero server. Sync/multi-user is a
   documented *future phase*, not code you write now.
7. **Generalize only after it works for one user.** Build the AI-Engineer pack experience
   first; extract "engine vs pack" cleanly, but don't over-abstract for hypothetical packs.

---

## 3. Tech stack (recommended defaults — a fresh session may substitute equivalents)
- **Language:** TypeScript (strict mode).
- **Framework:** React + **Vite** (SPA). (Next.js is acceptable but adds SSR you don't need;
  if chosen, use static export.)
- **Routing:** React Router (hash or history; hash is safest for GitHub Pages).
- **State:** lightweight store — **Zustand** (or Redux Toolkit). Avoid heavy frameworks.
- **Persistence:** **IndexedDB** via `idb` (or Dexie). LocalStorage only for tiny UI prefs.
- **Markdown:** `react-markdown` + `remark-gfm` + `rehype` (syntax highlight via `shiki` or
  `highlight.js`). Support **mermaid** rendering (labs use diagrams).
- **Styling:** Tailwind CSS (fast, consistent) + a small component layer (Radix UI or
  Headless UI for accessible primitives). Dark mode required (IDE feel).
- **Calendar:** a heatmap (GitHub-contributions style) — build from events; a small lib
  (e.g. a react calendar heatmap) or hand-rolled SVG. No backend calendar.
- **Testing:** **Vitest** (unit) + **React Testing Library** (components) + **Playwright**
  (one e2e smoke path). **axe** for accessibility checks.
- **Tooling:** ESLint + Prettier; **TypeScript strict**; Husky + lint-staged (pre-commit).
- **CI:** GitHub Actions — typecheck, lint, test, build, and deploy to **GitHub Pages** on
  main. Dependabot on.
- **License:** MIT. Add `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, issue/PR templates.

> Rationale: static SPA + local-first = zero hosting cost, trivial OSS adoption (fork →
> `npm i` → `npm run dev`), and a clean GitHub Pages demo. These are the properties a
> portfolio/OSS project wants.

---

## 4. The course-pack format (the public contract others will author against)
A **course pack** is a folder the app loads. v1 loads a **bundled** pack (shipped in the
repo under `/public/courses/<id>/`); the format is designed so a future version can load an
external pack by URL or file upload without code changes.

### 4.1 Manifest — `course.json` (or `course.yaml`)
```jsonc
{
  "id": "ai-engineer",
  "title": "AI Engineer Track",
  "version": "1.0.0",
  "description": "SDE II → Senior AI Engineer (agentic systems).",
  "gamification": {
    "xpPerMilestone": 100,
    "levels": [0, 300, 800, 1500, 2500, 4000],  // XP thresholds → level 1..N
    "badges": [
      { "id": "foundations", "title": "Foundations Cleared", "when": "stage:1:complete" },
      { "id": "first-agent", "title": "It's Alive", "when": "lab:3:complete" },
      { "id": "boss", "title": "Capstone Slain", "when": "lab:4:complete" }
    ]
  },
  "chapters": [
    {
      "id": "stage-1",
      "title": "Stage 1 — Foundations",
      "kind": "stage",
      "requires": [],
      "children": ["lab-0", "lab-1", "lab-1b"]
    }
    // ... more stages
  ],
  "items": [
    {
      "id": "lab-0",
      "title": "Lab 0 — Foundation",
      "kind": "lab",
      "requires": [],                       // unlock deps (item ids)
      "content": ["labs/lab-0/README.md", "labs/lab-0/SPEC.md", "labs/lab-0/RUBRIC.md"],
      "milestones": [
        { "id": "lab-0-tests-green", "title": "pytest green", "xp": 100 },
        { "id": "lab-0-lint-types",  "title": "ruff + mypy clean", "xp": 50 },
        { "id": "lab-0-reflection",  "title": "reflection written", "xp": 50 }
      ]
    }
    // ... more items
  ]
}
```

**Rules the engine enforces:**
- An item is **locked** until every id in `requires` (transitively) has all milestones done.
- **XP** = sum of completed milestone XP (fallback to `gamification.xpPerMilestone`).
- **Level** = highest threshold in `levels` that XP meets.
- **Badges** trigger on declarative conditions: `stage:<id>:complete`, `lab:<id>:complete`,
  `milestone:<id>:done`, `streak:<n>`.
- **Content** files are markdown loaded and rendered read-only in the center panel.
- Manifest is **validated** against a JSON Schema on load; invalid packs fail loudly with a
  helpful error (do not silently render a broken tree).

### 4.2 Content files
Plain markdown (GFM + mermaid + code highlight). Optional front-matter (title override,
estimated time). Content is **display-only**; the app never edits pack files.

### 4.3 The first pack (input, authored elsewhere)
The AI-Engineer curriculum (its `MASTER-BUILD-SPEC.md`, `curriculum.md`, and `labs/*`)
becomes the `ai-engineer` course pack. **Converting that curriculum into a valid
`course.json` + content files is a task for the course-pack author, not the engine.** Ship a
tiny **example pack** ("demo-course") so the app is usable/testable without the real one.

---

## 5. Progress model (local, event-sourced-lite)
Stored in IndexedDB. **Never** stores pack content — only the user's progress over it.

```ts
type ProgressEvent =
  | { type: "milestone_completed";  courseId: string; milestoneId: string; at: string /*ISO*/ }
  | { type: "milestone_uncompleted"; courseId: string; milestoneId: string; at: string }
  | { type: "note_added";           courseId: string; itemId: string; text: string; at: string }
  | { type: "session_logged";       courseId: string; minutes: number; at: string };

interface CourseProgress {
  courseId: string;
  events: ProgressEvent[];   // append-only log
}
```
**Derived (computed, never stored as source of truth):** completed-milestone set, XP, level,
per-item/stage completion %, unlock state, current streak (consecutive UTC-days with ≥1
completion event), and the calendar heatmap (count of events per day).

**Export/Import:** a single JSON blob (`{ version, courses: CourseProgress[] }`) the user can
download and re-import. This is the v1 "backup/sync." It is also the **exact shape a future
agent-writes-progress integration will POST** — design it now, wire it later.

---

## 6. UI / layout (IDE-style, three zones + calendar)
```
┌───────────────────────────────────────────────────────────────────┐
│  Top bar: course title • Level ▮▮▯ • XP • streak • progress %   │  ← gamification HUD
├───────────┬───────────────────────────────────────┬───────────────┤
│ LEFT      │ CENTER (IDE reader)                    │ RIGHT (Quest)  │
│ chapter/  │ - breadcrumbs                          │ - current lab  │
│ lab tree  │ - rendered markdown (spec/rubric/...)  │   milestones    │
│ - locked  │ - tabs when item has >1 content file   │   (checkboxes)  │
│   items │ - mermaid + code highlight            │ - badges earned │
│ - % rings │                                        │ - next unlock   │
├───────────┴───────────────────────────────────────┴───────────────┤
│  CALENDAR: contribution-style heatmap of activity + planned dates   │
└───────────────────────────────────────────────────────────────────┘
```
- **Left (chapters):** collapsible tree from the manifest. Locked items show + the
  unmet prerequisite on hover. Each node shows a completion ring. Clicking selects the item.
- **Center (content):** renders the selected item's markdown read-only, IDE-styled (dark,
  monospace headers optional), tabs if multiple content files. This is the "textbook."
- **Right (quest/HUD):** the selected item's **milestone checklist** (manual toggle →
  emits a progress event), badges earned, and "next unlock" hint. Toggling a milestone
  animates XP gain.
- **Calendar:** heatmap of activity days (from events) + optional user-set planned/target
  dates per lab. Read-only derived view; clicking a day filters/annotates.
- **Accessibility:** full keyboard nav, focus order, ARIA on tree/tabs/checkboxes, contrast
  AA, reduced-motion respect. This is graded (it's a portfolio piece).
- **Responsive:** on narrow screens, panels collapse to tabs (Chapters / Content / Quest).

---

## 7. Gamification rules (keep it tasteful, not childish)
- **XP** per completed milestone (from manifest). **Level** from thresholds. Subtle
  level-up animation; respect reduced-motion.
- **Streak** = consecutive days with ≥1 completion event (UTC). Show count; never punish
  (no streak-loss guilt loops beyond resetting the number).
- **Badges** from declarative triggers (stage/lab/milestone/streak). Capstone lab = a
  "boss" badge.
- **Locking** = dependency gating from `requires`. The tension of a locked chapter is the
  core motivator — get it right and honest (no fake locks).
- **Guardrail:** gamification must be **skippable/quiet-able** (a "focus mode" that hides
  the HUD). Pro learners bounce off gimmicky UX.

---

## 8. Architecture (modules & boundaries)
```
src/
  engine/            # pure, framework-agnostic domain logic (heavily unit-tested)
    manifest.ts      # load + JSON-Schema validate a course pack
    progress.ts      # event log → derived state (xp, level, unlock, streak, %)
    calendar.ts      # events → heatmap buckets
    gamification.ts  # badge/level rules
    types.ts
  store/             # Zustand store + IndexedDB persistence adapter
    db.ts            # idb wrapper (progress events, prefs)
    useCourse.ts     # selected course/item, actions
  ui/
    layout/          # TopBar, LeftTree, CenterReader, RightQuest, CalendarStrip
    components/      # MilestoneCheckbox, XPBar, Badge, LockBadge, MermaidBlock, ...
    pages/           # CourseView, Settings, ImportExport
  content/           # markdown renderer setup (remark/rehype/mermaid/shiki)
public/
  courses/
    demo-course/     # tiny example pack (ships in-repo; used by tests & first-run)
      course.json
      labs/...
```
**Boundary rules:**
- `engine/` is **pure** (no React, no IndexedDB) → 100% unit-testable, and reusable if a
  backend is ever added.
- `store/` is the only place that touches IndexedDB. UI reads via selectors.
- UI never computes XP/unlock itself — always via `engine/`. Single source of derived truth.

---

## 9. Testing & quality gates (the grade)
- **Unit (Vitest):** `engine/` — unlock logic (incl. transitive deps + cycles rejected), XP,
  level thresholds, streak edge cases (timezone/day boundaries), badge triggers, manifest
  validation (valid + malformed packs).
- **Component (RTL):** LeftTree renders locks correctly; MilestoneCheckbox emits an event and
  updates XP; CenterReader renders markdown + mermaid; ImportExport round-trips JSON.
- **e2e smoke (Playwright):** load demo pack → complete a milestone → XP rises → a locked lab
  unlocks → export JSON → reload → import → state restored.
- **a11y:** axe checks on main views; keyboard-only pass of the tree + checklist.
- **Gates in CI:** typecheck (tsc strict), ESLint, Prettier check, all tests, build, axe.
  PRs blocked on red. Deploy Pages on green main.
- **Definition of done (v1):** demo pack fully playable; AI-Engineer pack loads; export/import
  works; a11y AA on core flows; CI green; README with screenshots + live Pages link.

---

## 10. Repository setup (new dedicated repo)
- **Name suggestion:** `questline` (or `learnquest`, `coursecast`). Choose one; be consistent.
- **Top-level:** `README.md` (what/why/demo gif/quickstart), `LICENSE` (MIT),
  `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `.github/` (CI, Dependabot, issue/PR templates),
  `docs/COURSE-PACK-FORMAT.md` (the §4 contract, expanded — this is what pack authors read).
- **README must show:** a screenshot/gif, one-command local run, how to author a course pack,
  and the local-first/privacy statement.
- **Quickstart target:** `git clone … && npm i && npm run dev` → app runs with the demo pack,
  zero config, zero backend.

---

## 11. Build phases (suggested order; each phase ships something usable)
1. **P0 — Skeleton:** Vite+TS+Tailwind+router; three-panel layout with dummy data; CI
   (typecheck/lint/test/build/Pages). *Ship: a deployed empty shell.*
2. **P1 — Engine core:** `manifest` load+validate, `progress` derivations, unit tests.
   *Ship: green engine, no UI wiring yet.*
3. **P2 — Read a pack:** load `demo-course`, render Left tree + Center markdown (+mermaid).
   *Ship: you can browse a course.*
4. **P3 — Progress + gamify:** IndexedDB store, milestone checkboxes, XP/level/streak HUD,
   lock/unlock. *Ship: it's a game.*
5. **P4 — Calendar + export/import:** heatmap from events; JSON backup/restore.
   *Ship: durable, portable progress.*
6. **P5 — Polish + a11y + docs:** focus mode, responsive collapse, axe pass, README/screens,
   `COURSE-PACK-FORMAT.md`. *Ship: portfolio-ready v1.*
7. **P6 — Load the real pack:** convert the AI-Engineer curriculum into a valid pack (author
   task). *Ship: your actual tracker.*

---

## 12. Explicitly OUT of scope for v1 (documented future phases)
- Accounts, auth, multi-user, server, database, cloud sync.
- **Agent-writes-progress** automation (the manual UI + the JSON import shape are the seam
  for it — a future agent/CLI writes the same `ProgressEvent[]` the UI produces).
- Embedding an AI tutor / LLM calls in the app (the tutor stays in the coding-agent session;
  the app only tracks). Revisit only after v1.
- External/remote course-pack loading by URL or upload (format already supports it; wiring is
  later).
- Social features, leaderboards, notifications.

> Anti-scope-creep rule: if a task needs a server, it is not v1.

---

## 13. First-session checklist (for the fresh build session)
1. Read this spec top-to-bottom. Confirm Node version + package manager with the owner
   (no assumptions).
2. Create the new repo per §10; set up CI + Pages + MIT license first (P0).
3. Build the **engine** with tests before any UI (P1) — it's the reusable, gradable core.
4. Ship the **demo-course** experience end-to-end (P2–P4) before touching the real curriculum.
5. Keep **engine ≠ content** and **content-as-data** sacred. Never copy lesson text into the store.
6. Track progress + decisions in the repo's own `PROGRESS.md`.

---

## 14. Open questions to confirm with the owner (before/early in build)
- Repo/product **name**? (default: `questline`)
- Package manager: **npm / pnpm / yarn**? Node LTS version?
- Manifest format: **JSON** (default, schema-validatable easily) or **YAML** (nicer to
  hand-author)?
- Visual vibe: **IDE-dark/VS-Code-like** (default) or lighter "course platform" look?
- Is a **GitHub Pages** public demo desired from day one (implies the demo pack is public)?
- Any constraint on **which curriculum content** becomes the public first pack (ensure it's
  the clean-room generic AI-Engineer track — no proprietary content)?