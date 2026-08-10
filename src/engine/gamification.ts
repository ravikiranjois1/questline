import type { CourseManifest } from './types';

/** Highest threshold in `levels` that `xp` meets or exceeds. Levels are 1-indexed. */
export function computeLevel(xp: number, levels: readonly number[]): number {
  let level = 1;
  for (let i = 0; i < levels.length; i++) {
    if (xp >= (levels[i] ?? 0)) level = i + 1;
    else break;
  }
  return level;
}

export interface BadgeContext {
  isChapterComplete: (chapterId: string) => boolean;
  isItemComplete: (itemId: string) => boolean;
  completedMilestoneIds: ReadonlySet<string>;
  currentStreak: number;
}

/** Evaluates every badge's declarative `when` trigger against current state. */
export function evaluateBadges(manifest: CourseManifest, ctx: BadgeContext): Set<string> {
  const earned = new Set<string>();

  for (const badge of manifest.gamification.badges) {
    if (isBadgeTriggered(badge.when, ctx)) {
      earned.add(badge.id);
    }
  }

  return earned;
}

function isBadgeTriggered(when: string, ctx: BadgeContext): boolean {
  const streakMatch = /^streak:(\d+)$/.exec(when);
  if (streakMatch) {
    return ctx.currentStreak >= Number(streakMatch[1]);
  }

  const parts = when.split(':');
  if (parts.length !== 3) return false;
  const [kind, id, verb] = parts;

  if (kind === 'stage' && verb === 'complete') return ctx.isChapterComplete(id!);
  if (kind === 'lab' && verb === 'complete') return ctx.isItemComplete(id!);
  if (kind === 'milestone' && verb === 'done') return ctx.completedMilestoneIds.has(id!);

  return false;
}
