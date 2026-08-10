# Course pack format

A **course pack** is a folder the app loads: a manifest (`course.json`) plus markdown content
files. v1 loads a pack **bundled in the repo** under `public/courses/<id>/`. The format is
designed so a future version can load an external pack by URL or upload without changing the
schema.

This is the contract other pack authors write against — the engine (`src/engine/manifest.ts`)
validates every pack against it on load and fails loudly on a malformed pack rather than
rendering a broken tree.

## Manifest — `course.json`

```jsonc
{
  "id": "ai-engineer",
  "title": "AI Engineer Track",
  "version": "1.0.0",
  "description": "SDE II → Senior AI Engineer (agentic systems).",
  "gamification": {
    "xpPerMilestone": 100,
    "levels": [0, 300, 800, 1500, 2500, 4000], // XP thresholds → level 1..N
    "badges": [
      { "id": "foundations", "title": "Foundations Cleared", "when": "stage:1:complete" },
      { "id": "first-agent", "title": "It's Alive", "when": "lab:3:complete" },
      { "id": "boss", "title": "Capstone Slain", "when": "lab:4:complete" },
    ],
  },
  "chapters": [
    {
      "id": "stage-1",
      "title": "Stage 1 — Foundations",
      "kind": "stage",
      "requires": [],
      "children": ["lab-0", "lab-1"],
    },
  ],
  "items": [
    {
      "id": "lab-0",
      "title": "Lab 0 — Foundation",
      "kind": "lab",
      "requires": [],
      "content": ["labs/lab-0/README.md", "labs/lab-0/SPEC.md"],
      "milestones": [
        { "id": "lab-0-tests-green", "title": "pytest green", "xp": 100 },
        { "id": "lab-0-reflection", "title": "reflection written", "xp": 50 },
      ],
    },
  ],
}
```

### Fields

- **`chapters`** — the left-tree groups. `requires` gates the whole chapter; `children` lists item
  ids in display order.
- **`items`** — labs/readings/projects. `requires` lists item ids that must be fully complete
  (every milestone done) before this item unlocks. `content` is an ordered list of markdown files,
  rendered as tabs when there's more than one.
- **`milestones`** — the checklist for an item. `xp` is optional; omit it to fall back to
  `gamification.xpPerMilestone`.

### Rules the engine enforces

- An item is **locked** until every id in `requires` is transitively satisfied (all of that item's
  milestones done). Cyclic `requires` graphs are rejected at load time.
- **XP** = sum of completed milestones' `xp` (or `xpPerMilestone` where unset).
- **Level** = the highest threshold in `gamification.levels` that current XP meets or exceeds.
- **Badges** trigger on declarative conditions:
  - `stage:<chapterId>:complete`
  - `lab:<itemId>:complete`
  - `milestone:<milestoneId>:done`
  - `streak:<n>`
- Content files are markdown, rendered **read-only**. The app never writes to pack files.
- The manifest is validated against a JSON Schema on load. An invalid pack fails with a specific,
  actionable error — it never silently renders a partial tree.

## Content files

Plain GitHub-Flavored Markdown. Mermaid code blocks render as diagrams; code blocks get syntax
highlighting. Optional front-matter may override the display title or add an estimated time.
Content is display-only and is never duplicated into the progress store — the engine reads it
fresh from the pack every time.

## The bundled demo pack

`public/courses/demo-course/` is a minimal pack that exercises every manifest feature (locked
chapters, multi-file items, badges) so the app is testable without a real curriculum.
