import clsx from 'clsx';
import type { CourseManifest } from '../../engine/types';
import { useUiStore } from '../../store/useUiStore';

interface LeftTreeProps {
  manifest: CourseManifest;
  /** Item ids that are locked (derivation TBD — engine/progress.ts wires this in P3). */
  lockedItemIds: ReadonlySet<string>;
  /** Completion percentage per item id, 0-100 (real derivation lands in P3). */
  completionPct: Readonly<Record<string, number>>;
}

export function LeftTree({ manifest, lockedItemIds, completionPct }: LeftTreeProps) {
  const selectedItemId = useUiStore((s) => s.selectedItemId);
  const selectItem = useUiStore((s) => s.selectItem);
  const itemsById = new Map(manifest.items.map((item) => [item.id, item]));

  return (
    <nav
      aria-label="Course chapters"
      className="h-full overflow-y-auto border-r border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
    >
      {manifest.chapters.map((chapter) => (
        <div key={chapter.id} className="mb-4">
          <h2 className="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {chapter.title}
          </h2>
          <ul className="space-y-0.5">
            {chapter.children.map((itemId) => {
              const item = itemsById.get(itemId);
              if (!item) return null;
              const locked = lockedItemIds.has(itemId);
              const pct = completionPct[itemId] ?? 0;
              const isSelected = selectedItemId === itemId;

              return (
                <li key={itemId}>
                  <button
                    type="button"
                    disabled={locked}
                    aria-current={isSelected ? 'true' : undefined}
                    aria-label={locked ? `${item.title} (locked)` : item.title}
                    onClick={() => selectItem(itemId)}
                    className={clsx(
                      'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm',
                      locked && 'cursor-not-allowed text-slate-400 dark:text-slate-600',
                      !locked &&
                        isSelected &&
                        'bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200',
                      !locked &&
                        !isSelected &&
                        'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                    )}
                  >
                    <CompletionRing pct={locked ? 0 : pct} />
                    <span className="truncate">{item.title}</span>
                    {locked && (
                      <span aria-hidden="true" className="ml-auto text-xs">
                        🔒
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function CompletionRing({ pct }: { pct: number }) {
  const radius = 7;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);

  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className="shrink-0">
      <circle
        cx="8"
        cy="8"
        r={radius}
        className="stroke-slate-200 dark:stroke-slate-700"
        strokeWidth="2"
        fill="none"
      />
      <circle
        cx="8"
        cy="8"
        r={radius}
        className="stroke-emerald-500 transition-[stroke-dashoffset] motion-reduce:transition-none"
        strokeWidth="2"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 8 8)"
      />
    </svg>
  );
}
