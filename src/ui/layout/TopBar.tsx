import { useUiStore } from '../../store/useUiStore';

interface TopBarProps {
  courseTitle: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  progressPct: number;
}

export function TopBar({ courseTitle, level, xp, xpToNextLevel, streak, progressPct }: TopBarProps) {
  const focusMode = useUiStore((s) => s.focusMode);
  const toggleFocusMode = useUiStore((s) => s.toggleFocusMode);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900">
      <h1 className="truncate text-sm font-semibold tracking-wide text-slate-900 dark:text-slate-100">
        {courseTitle}
      </h1>

      {!focusMode && (
        <div className="hidden items-center gap-6 text-xs text-slate-600 dark:text-slate-300 sm:flex">
          <div className="flex items-center gap-2" aria-label={`Level ${level}`}>
            <span className="font-medium text-slate-900 dark:text-slate-100">Lv. {level}</span>
            <div
              className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
              role="progressbar"
              aria-valuenow={xp}
              aria-valuemin={0}
              aria-valuemax={xpToNextLevel}
              aria-label="XP progress to next level"
            >
              <div
                className="h-full rounded-full bg-emerald-500 transition-[width] motion-reduce:transition-none"
                style={{ width: `${Math.min(100, (xp / xpToNextLevel) * 100)}%` }}
              />
            </div>
          </div>

          <span>{xp} XP</span>

          <span aria-label={`${streak} day streak`}>🔥 {streak}d</span>

          <span aria-label={`Overall progress ${progressPct}%`}>{progressPct}% complete</span>
        </div>
      )}

      <button
        type="button"
        onClick={toggleFocusMode}
        aria-pressed={focusMode}
        className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        {focusMode ? 'Show HUD' : 'Focus mode'}
      </button>
    </header>
  );
}
