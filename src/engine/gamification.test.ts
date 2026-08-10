import { describe, expect, it } from 'vitest';
import { computeLevel, evaluateBadges } from './gamification';
import { buildManifest } from './fixtures';

describe('computeLevel', () => {
  const levels = [0, 300, 800, 1500];

  it('starts at level 1 with zero xp', () => {
    expect(computeLevel(0, levels)).toBe(1);
  });

  it('stays on the current level just below a threshold', () => {
    expect(computeLevel(299, levels)).toBe(1);
  });

  it('advances exactly at a threshold', () => {
    expect(computeLevel(300, levels)).toBe(2);
    expect(computeLevel(800, levels)).toBe(3);
  });

  it('caps at the highest level once xp exceeds every threshold', () => {
    expect(computeLevel(999_999, levels)).toBe(4);
  });
});

describe('evaluateBadges', () => {
  const manifest = buildManifest();

  it('triggers a stage:<id>:complete badge only once that chapter is complete', () => {
    const notEarned = evaluateBadges(manifest, {
      isChapterComplete: () => false,
      isItemComplete: () => false,
      completedMilestoneIds: new Set(),
      currentStreak: 0,
    });
    expect(notEarned.has('ch1-badge')).toBe(false);

    const earned = evaluateBadges(manifest, {
      isChapterComplete: (id) => id === 'chapter-1',
      isItemComplete: () => false,
      completedMilestoneIds: new Set(),
      currentStreak: 0,
    });
    expect(earned.has('ch1-badge')).toBe(true);
  });

  it('triggers a lab:<id>:complete badge via isItemComplete', () => {
    const earned = evaluateBadges(manifest, {
      isChapterComplete: () => false,
      isItemComplete: (id) => id === 'item-a',
      completedMilestoneIds: new Set(),
      currentStreak: 0,
    });
    expect(earned.has('item-a-badge')).toBe(true);
  });

  it('triggers a milestone:<id>:done badge from the completed set directly', () => {
    const earned = evaluateBadges(manifest, {
      isChapterComplete: () => false,
      isItemComplete: () => false,
      completedMilestoneIds: new Set(['item-a-m1']),
      currentStreak: 0,
    });
    expect(earned.has('milestone-badge')).toBe(true);
  });

  it('triggers a streak:<n> badge only once the streak meets the threshold', () => {
    const ctx = {
      isChapterComplete: () => false,
      isItemComplete: () => false,
      completedMilestoneIds: new Set<string>(),
    };
    expect(evaluateBadges(manifest, { ...ctx, currentStreak: 2 }).has('streak-badge')).toBe(false);
    expect(evaluateBadges(manifest, { ...ctx, currentStreak: 3 }).has('streak-badge')).toBe(true);
    expect(evaluateBadges(manifest, { ...ctx, currentStreak: 10 }).has('streak-badge')).toBe(true);
  });
});
