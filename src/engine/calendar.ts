import type { ProgressEvent } from './types';

/** YYYY-MM-DD in UTC. */
export function toUtcDateKey(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

/** Event count per UTC day, across all event types — the calendar heatmap's raw data. */
export function bucketEventsByDay(events: ProgressEvent[]): Record<string, number> {
  const buckets: Record<string, number> = {};
  for (const event of events) {
    const key = toUtcDateKey(event.at);
    buckets[key] = (buckets[key] ?? 0) + 1;
  }
  return buckets;
}

/**
 * Consecutive UTC-days with >=1 milestone_completed event, ending "now" (or
 * `asOf` in tests). Today not having activity yet doesn't break the streak —
 * a one-day grace period, same as GitHub/Duolingo-style streaks — but a gap
 * of two or more days does.
 */
export function computeStreak(events: ProgressEvent[], asOf: Date = new Date()): number {
  const activeDays = new Set(
    events.filter((e) => e.type === 'milestone_completed').map((e) => toUtcDateKey(e.at)),
  );
  if (activeDays.size === 0) return 0;

  const todayKey = asOf.toISOString().slice(0, 10);
  let cursor = new Date(`${todayKey}T00:00:00.000Z`);

  if (!activeDays.has(dateKey(cursor))) {
    cursor = addDays(cursor, -1);
    if (!activeDays.has(dateKey(cursor))) return 0;
  }

  let streak = 0;
  while (activeDays.has(dateKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}
