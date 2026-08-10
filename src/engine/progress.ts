import { bucketEventsByDay, computeStreak } from './calendar';
import { computeLevel, evaluateBadges } from './gamification';
import type { Chapter, CourseItem, CourseManifest, DerivedCourseState, ProgressEvent } from './types';

/**
 * Folds the event log into the net set of completed milestone ids. Events
 * are sorted by `at` (stable, so same-timestamp events keep log order)
 * before folding — the log is append-only but not guaranteed to arrive
 * pre-sorted once a future agent-writes-progress integration exists.
 */
export function netCompletedMilestoneIds(events: readonly ProgressEvent[]): Set<string> {
  const sorted = [...events].sort((a, b) => a.at.localeCompare(b.at));
  const completed = new Set<string>();

  for (const event of sorted) {
    if (event.type === 'milestone_completed') completed.add(event.milestoneId);
    else if (event.type === 'milestone_uncompleted') completed.delete(event.milestoneId);
  }

  return completed;
}

export function computeXp(manifest: CourseManifest, completedMilestoneIds: ReadonlySet<string>): number {
  let xp = 0;
  for (const item of manifest.items) {
    for (const milestone of item.milestones) {
      if (completedMilestoneIds.has(milestone.id)) {
        xp += milestone.xp ?? manifest.gamification.xpPerMilestone;
      }
    }
  }
  return xp;
}

export function isItemComplete(item: CourseItem, completedMilestoneIds: ReadonlySet<string>): boolean {
  return item.milestones.every((m) => completedMilestoneIds.has(m.id));
}

export function isChapterComplete(
  chapter: Chapter,
  itemsById: ReadonlyMap<string, CourseItem>,
  completedMilestoneIds: ReadonlySet<string>,
): boolean {
  return chapter.children.every((childId) => {
    const item = itemsById.get(childId);
    return item ? isItemComplete(item, completedMilestoneIds) : false;
  });
}

/**
 * An id is unlocked when every id in its `requires` is both "satisfied"
 * (complete) AND itself unlocked — a manifest-validated acyclic graph makes
 * this recursion terminate. Ids with no `requires` are always unlocked.
 */
export function computeUnlockedIds(
  manifest: CourseManifest,
  completedMilestoneIds: ReadonlySet<string>,
): { unlockedItemIds: Set<string>; unlockedChapterIds: Set<string> } {
  const itemsById = new Map(manifest.items.map((i) => [i.id, i]));
  const chaptersById = new Map(manifest.chapters.map((c) => [c.id, c]));
  const requiresById = new Map<string, string[]>([
    ...manifest.chapters.map((c): [string, string[]] => [c.id, c.requires]),
    ...manifest.items.map((i): [string, string[]] => [i.id, i.requires]),
  ]);

  const memo = new Map<string, boolean>();

  function isSatisfied(id: string): boolean {
    const item = itemsById.get(id);
    if (item) return isItemComplete(item, completedMilestoneIds);
    const chapter = chaptersById.get(id);
    if (chapter) return isChapterComplete(chapter, itemsById, completedMilestoneIds);
    return false;
  }

  function isUnlocked(id: string): boolean {
    const cached = memo.get(id);
    if (cached !== undefined) return cached;

    // Guard against cycles that slipped past manifest validation (e.g. a
    // hand-edited pack that skipped parseManifest): treat as locked rather
    // than recursing forever.
    memo.set(id, false);

    const requires = requiresById.get(id) ?? [];
    const unlocked = requires.every((dep) => isSatisfied(dep) && isUnlocked(dep));
    memo.set(id, unlocked);
    return unlocked;
  }

  return {
    unlockedItemIds: new Set(manifest.items.map((i) => i.id).filter(isUnlocked)),
    unlockedChapterIds: new Set(manifest.chapters.map((c) => c.id).filter(isUnlocked)),
  };
}

function completionPct(done: number, total: number): number {
  return total === 0 ? 100 : Math.round((done / total) * 100);
}

export function computeItemCompletionPct(
  manifest: CourseManifest,
  completedMilestoneIds: ReadonlySet<string>,
): Record<string, number> {
  return Object.fromEntries(
    manifest.items.map((item) => {
      const done = item.milestones.filter((m) => completedMilestoneIds.has(m.id)).length;
      return [item.id, completionPct(done, item.milestones.length)];
    }),
  );
}

export function computeChapterCompletionPct(
  manifest: CourseManifest,
  completedMilestoneIds: ReadonlySet<string>,
): Record<string, number> {
  const itemsById = new Map(manifest.items.map((i) => [i.id, i]));
  return Object.fromEntries(
    manifest.chapters.map((chapter) => {
      const items = chapter.children.map((id) => itemsById.get(id)).filter((i): i is CourseItem => !!i);
      const done = items.filter((i) => isItemComplete(i, completedMilestoneIds)).length;
      return [chapter.id, completionPct(done, items.length)];
    }),
  );
}

/** Composes every pure derivation into the single state the UI reads. */
export function deriveCourseState(
  manifest: CourseManifest,
  events: readonly ProgressEvent[],
  asOf: Date = new Date(),
): DerivedCourseState {
  const completedMilestoneIds = netCompletedMilestoneIds(events);
  const xp = computeXp(manifest, completedMilestoneIds);
  const level = computeLevel(xp, manifest.gamification.levels);
  const { unlockedItemIds, unlockedChapterIds } = computeUnlockedIds(manifest, completedMilestoneIds);
  const currentStreak = computeStreak([...events], asOf);

  const itemsById = new Map(manifest.items.map((i) => [i.id, i]));
  const chaptersById = new Map(manifest.chapters.map((c) => [c.id, c]));

  const earnedBadgeIds = evaluateBadges(manifest, {
    isItemComplete: (id) => {
      const item = itemsById.get(id);
      return item ? isItemComplete(item, completedMilestoneIds) : false;
    },
    isChapterComplete: (id) => {
      const chapter = chaptersById.get(id);
      return chapter ? isChapterComplete(chapter, itemsById, completedMilestoneIds) : false;
    },
    completedMilestoneIds,
    currentStreak,
  });

  return {
    completedMilestoneIds,
    xp,
    level,
    unlockedItemIds,
    unlockedChapterIds,
    earnedBadgeIds,
    currentStreak,
    itemCompletionPct: computeItemCompletionPct(manifest, completedMilestoneIds),
    chapterCompletionPct: computeChapterCompletionPct(manifest, completedMilestoneIds),
  };
}

export { bucketEventsByDay };
