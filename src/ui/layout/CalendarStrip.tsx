/**
 * Contribution-style activity heatmap. Real event buckets arrive from
 * engine/calendar.ts in P4 — this renders an empty grid so the layout is
 * final before that wiring happens.
 */
export function CalendarStrip() {
  const weeks = 26;
  const days = 7;

  return (
    <footer className="shrink-0 border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Activity
      </h2>
      <div className="flex gap-[3px] overflow-x-auto" role="img" aria-label="Activity heatmap, no data yet">
        {Array.from({ length: weeks }, (_, week) => (
          <div key={week} className="flex flex-col gap-[3px]">
            {Array.from({ length: days }, (_, day) => (
              <div
                key={day}
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-sm bg-slate-100 dark:bg-slate-800"
              />
            ))}
          </div>
        ))}
      </div>
    </footer>
  );
}
