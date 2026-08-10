import { describe, expect, it } from 'vitest';
import { bucketEventsByDay, computeStreak, toUtcDateKey } from './calendar';
import type { ProgressEvent } from './types';

function completed(at: string): ProgressEvent {
  return { type: 'milestone_completed', courseId: 'c', milestoneId: 'm', at };
}
function noteAdded(at: string): ProgressEvent {
  return { type: 'note_added', courseId: 'c', itemId: 'i', text: 'x', at };
}

describe('toUtcDateKey', () => {
  it('buckets by the UTC calendar day, not local time', () => {
    expect(toUtcDateKey('2026-01-05T23:59:59.000Z')).toBe('2026-01-05');
    expect(toUtcDateKey('2026-01-06T00:00:01.000Z')).toBe('2026-01-06');
  });
});

describe('bucketEventsByDay', () => {
  it('counts every event type toward the day bucket', () => {
    const buckets = bucketEventsByDay([completed('2026-01-01T10:00:00Z'), noteAdded('2026-01-01T11:00:00Z')]);
    expect(buckets['2026-01-01']).toBe(2);
  });
});

describe('computeStreak', () => {
  const asOf = new Date('2026-01-10T12:00:00Z');

  it('is 0 with no events', () => {
    expect(computeStreak([], asOf)).toBe(0);
  });

  it('only counts milestone_completed events, not notes or sessions', () => {
    const events = [noteAdded('2026-01-10T00:00:00Z')];
    expect(computeStreak(events, asOf)).toBe(0);
  });

  it('counts 3 consecutive days ending today', () => {
    const events = [
      completed('2026-01-08T00:00:00Z'),
      completed('2026-01-09T00:00:00Z'),
      completed('2026-01-10T00:00:00Z'),
    ];
    expect(computeStreak(events, asOf)).toBe(3);
  });

  it('grants a one-day grace period when today has no activity yet', () => {
    const events = [completed('2026-01-08T00:00:00Z'), completed('2026-01-09T00:00:00Z')];
    expect(computeStreak(events, asOf)).toBe(2);
  });

  it('breaks the streak once the gap from today exceeds one day', () => {
    const events = [completed('2026-01-07T00:00:00Z'), completed('2026-01-08T00:00:00Z')];
    expect(computeStreak(events, asOf)).toBe(0);
  });

  it("treats 23:59:59 UTC and the next day's 00:00:01 UTC as consecutive separate days", () => {
    const events = [completed('2026-01-09T23:59:59Z'), completed('2026-01-10T00:00:01Z')];
    expect(computeStreak(events, asOf)).toBe(2);
  });

  it('does not let a gap in the middle inflate the count', () => {
    const events = [
      completed('2026-01-05T00:00:00Z'), // isolated, gap before Jan 9
      completed('2026-01-09T00:00:00Z'),
      completed('2026-01-10T00:00:00Z'),
    ];
    expect(computeStreak(events, asOf)).toBe(2);
  });
});
