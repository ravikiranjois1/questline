import type { CourseManifest } from '../../engine/types';

/**
 * P0 placeholder data for the skeleton layout. Replaced in P2 by the real
 * demo-course pack loaded through engine/manifest.ts. Do not build on this
 * shape assuming it is final — it exists only to render dummy UI.
 */
export const dummyManifest: CourseManifest = {
  id: 'dummy',
  title: 'AI Engineer Track',
  version: '0.0.0',
  description: 'Placeholder course pack for the P0 skeleton.',
  gamification: {
    xpPerMilestone: 100,
    levels: [0, 300, 800, 1500, 2500, 4000],
    badges: [],
  },
  chapters: [
    {
      id: 'stage-1',
      title: 'Stage 1 — Foundations',
      kind: 'stage',
      requires: [],
      children: ['lab-0', 'lab-1'],
    },
    {
      id: 'stage-2',
      title: 'Stage 2 — Agentic Systems',
      kind: 'stage',
      requires: ['stage-1'],
      children: ['lab-2'],
    },
  ],
  items: [
    {
      id: 'lab-0',
      title: 'Lab 0 — Foundation',
      kind: 'lab',
      requires: [],
      content: ['labs/lab-0/README.md'],
      milestones: [
        { id: 'lab-0-tests-green', title: 'pytest green', xp: 100 },
        { id: 'lab-0-lint-types', title: 'ruff + mypy clean', xp: 50 },
        { id: 'lab-0-reflection', title: 'reflection written', xp: 50 },
      ],
    },
    {
      id: 'lab-1',
      title: 'Lab 1 — First Tool Call',
      kind: 'lab',
      requires: ['lab-0'],
      content: ['labs/lab-1/README.md'],
      milestones: [
        { id: 'lab-1-tests-green', title: 'tests green', xp: 100 },
        { id: 'lab-1-reflection', title: 'reflection written', xp: 50 },
      ],
    },
    {
      id: 'lab-2',
      title: 'Lab 2 — Multi-Agent Orchestration',
      kind: 'lab',
      requires: ['lab-1'],
      content: ['labs/lab-2/README.md'],
      milestones: [{ id: 'lab-2-tests-green', title: 'tests green', xp: 100 }],
    },
  ],
};
