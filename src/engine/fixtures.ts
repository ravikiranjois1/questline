import type { CourseManifest } from './types';

/**
 * Shared test fixture: a chain designed to exercise transitive unlocking.
 *
 *   chapter-1 (no requires) -> [item-a]
 *   chapter-2 (requires chapter-1) -> [item-b (requires item-a), item-c (requires item-b)]
 *
 * Not used by the app itself — see ui/pages/dummyFixture.ts for that.
 */
export function buildManifest(overrides: Partial<CourseManifest> = {}): CourseManifest {
  return {
    id: 'test-course',
    title: 'Test Course',
    version: '1.0.0',
    description: 'Fixture for engine unit tests.',
    gamification: {
      xpPerMilestone: 100,
      levels: [0, 100, 250],
      badges: [
        { id: 'ch1-badge', title: 'Chapter 1 Cleared', when: 'stage:chapter-1:complete' },
        { id: 'item-a-badge', title: 'Item A Done', when: 'lab:item-a:complete' },
        { id: 'milestone-badge', title: 'First Step', when: 'milestone:item-a-m1:done' },
        { id: 'streak-badge', title: 'On a Roll', when: 'streak:3' },
      ],
    },
    chapters: [
      { id: 'chapter-1', title: 'Chapter 1', kind: 'stage', requires: [], children: ['item-a'] },
      {
        id: 'chapter-2',
        title: 'Chapter 2',
        kind: 'stage',
        requires: ['chapter-1'],
        children: ['item-b', 'item-c'],
      },
    ],
    items: [
      {
        id: 'item-a',
        title: 'Item A',
        kind: 'lab',
        requires: [],
        content: [],
        milestones: [
          { id: 'item-a-m1', title: 'A milestone 1', xp: 50 },
          { id: 'item-a-m2', title: 'A milestone 2' },
        ],
      },
      {
        id: 'item-b',
        title: 'Item B',
        kind: 'lab',
        requires: ['item-a'],
        content: [],
        milestones: [{ id: 'item-b-m1', title: 'B milestone 1' }],
      },
      {
        id: 'item-c',
        title: 'Item C',
        kind: 'lab',
        requires: ['item-b'],
        content: [],
        milestones: [{ id: 'item-c-m1', title: 'C milestone 1' }],
      },
    ],
    ...overrides,
  };
}
