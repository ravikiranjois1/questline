import { describe, expect, it } from 'vitest';
import { buildManifest } from './fixtures';
import {
  computeChapterCompletionPct,
  computeItemCompletionPct,
  computeUnlockedIds,
  computeXp,
  deriveCourseState,
  isChapterComplete,
  isItemComplete,
  netCompletedMilestoneIds,
} from './progress';
import type { ProgressEvent } from './types';

function completed(milestoneId: string, at: string): ProgressEvent {
  return { type: 'milestone_completed', courseId: 'test-course', milestoneId, at };
}
function uncompleted(milestoneId: string, at: string): ProgressEvent {
  return { type: 'milestone_uncompleted', courseId: 'test-course', milestoneId, at };
}

describe('netCompletedMilestoneIds', () => {
  it('nets a completed event followed by an uncompleted event to "not done"', () => {
    const events = [
      completed('item-a-m1', '2026-01-01T00:00:00Z'),
      uncompleted('item-a-m1', '2026-01-02T00:00:00Z'),
    ];
    expect(netCompletedMilestoneIds(events)).toEqual(new Set());
  });

  it('sorts by timestamp before folding, regardless of array order', () => {
    // uncompleted arrives first in the array but happened *after* completed chronologically reversed
    const events = [
      completed('item-a-m1', '2026-01-05T00:00:00Z'),
      uncompleted('item-a-m1', '2026-01-01T00:00:00Z'),
    ];
    // chronologically: uncompleted (Jan 1) then completed (Jan 5) -> net completed
    expect(netCompletedMilestoneIds(events)).toEqual(new Set(['item-a-m1']));
  });
});

describe('computeXp', () => {
  it('sums explicit milestone xp and falls back to xpPerMilestone when unset', () => {
    const manifest = buildManifest();
    // item-a-m1 has xp:50 explicit; item-a-m2 has no xp -> falls back to xpPerMilestone (100)
    const completedIds = new Set(['item-a-m1', 'item-a-m2']);
    expect(computeXp(manifest, completedIds)).toBe(150);
  });

  it('is zero with no completions', () => {
    expect(computeXp(buildManifest(), new Set())).toBe(0);
  });
});

describe('isItemComplete / isChapterComplete', () => {
  it('an item with zero milestones is vacuously complete', () => {
    const manifest = buildManifest();
    const emptyItem = { ...manifest.items[0]!, milestones: [] };
    expect(isItemComplete(emptyItem, new Set())).toBe(true);
  });

  it('a chapter is complete only when every child item is complete', () => {
    const manifest = buildManifest();
    const itemsById = new Map(manifest.items.map((i) => [i.id, i]));
    const chapter1 = manifest.chapters[0]!; // children: [item-a]

    expect(isChapterComplete(chapter1, itemsById, new Set())).toBe(false);
    expect(isChapterComplete(chapter1, itemsById, new Set(['item-a-m1', 'item-a-m2']))).toBe(true);
  });
});

describe('computeUnlockedIds', () => {
  it('items with no requires are always unlocked', () => {
    const { unlockedItemIds } = computeUnlockedIds(buildManifest(), new Set());
    expect(unlockedItemIds.has('item-a')).toBe(true);
  });

  it('an item stays locked until its direct requirement is complete', () => {
    const manifest = buildManifest();
    const partial = computeUnlockedIds(manifest, new Set());
    expect(partial.unlockedItemIds.has('item-b')).toBe(false);

    const afterA = computeUnlockedIds(manifest, new Set(['item-a-m1', 'item-a-m2']));
    expect(afterA.unlockedItemIds.has('item-b')).toBe(true);
  });

  it("transitively blocks a grandchild even if its direct parent's milestones are marked done out of order", () => {
    const manifest = buildManifest();
    // item-b's own milestone is marked done, but item-b's prerequisite (item-a) never was.
    const completedIds = new Set(['item-b-m1']);

    const { unlockedItemIds } = computeUnlockedIds(manifest, completedIds);
    // item-b is "complete" (its milestone is done) but not "unlocked" (its own prereq unmet)...
    expect(isItemComplete(manifest.items[1]!, completedIds)).toBe(true);
    expect(unlockedItemIds.has('item-b')).toBe(false);
    // ...so item-c, which requires item-b, must also stay locked.
    expect(unlockedItemIds.has('item-c')).toBe(false);
  });

  it('unlocks a chapter once its required chapter is fully complete', () => {
    const manifest = buildManifest();
    const { unlockedChapterIds: before } = computeUnlockedIds(manifest, new Set());
    expect(before.has('chapter-2')).toBe(false);

    const { unlockedChapterIds: after } = computeUnlockedIds(manifest, new Set(['item-a-m1', 'item-a-m2']));
    expect(after.has('chapter-2')).toBe(true);
  });
});

describe('completion percentages', () => {
  it('reports 0/50/100 for items and treats an empty chapter as 100%', () => {
    const manifest = buildManifest();
    const half = new Set(['item-a-m1']); // 1 of 2 milestones on item-a
    const itemPct = computeItemCompletionPct(manifest, half);
    expect(itemPct['item-a']).toBe(50);
    expect(itemPct['item-b']).toBe(0);

    const chapterPct = computeChapterCompletionPct(manifest, new Set(['item-a-m1', 'item-a-m2']));
    expect(chapterPct['chapter-1']).toBe(100);
  });
});

describe('deriveCourseState', () => {
  it('composes xp, level, unlock, streak, and badges consistently', () => {
    const manifest = buildManifest();
    const asOf = new Date('2026-01-01T12:00:00Z');
    const events: ProgressEvent[] = [
      completed('item-a-m1', '2026-01-01T00:00:00Z'),
      completed('item-a-m2', '2026-01-01T00:01:00Z'),
    ];

    const state = deriveCourseState(manifest, events, asOf);

    expect(state.xp).toBe(150); // 50 explicit + 100 fallback
    expect(state.level).toBe(2); // levels: [0, 100, 250] -> 150 reaches the second threshold
    expect(state.unlockedItemIds.has('item-b')).toBe(true);
    expect(state.currentStreak).toBe(1);
    expect(state.earnedBadgeIds.has('item-a-badge')).toBe(true);
    expect(state.earnedBadgeIds.has('ch1-badge')).toBe(true);
    expect(state.earnedBadgeIds.has('milestone-badge')).toBe(true);
    expect(state.earnedBadgeIds.has('streak-badge')).toBe(false); // streak is 1, badge needs 3
  });
});
