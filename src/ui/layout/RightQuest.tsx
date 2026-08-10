import * as Checkbox from '@radix-ui/react-checkbox';
import type { CourseItem } from '../../engine/types';

interface RightQuestProps {
  item: CourseItem | null;
  completedMilestoneIds: ReadonlySet<string>;
  onToggleMilestone: (milestoneId: string, next: boolean) => void;
}

export function RightQuest({ item, completedMilestoneIds, onToggleMilestone }: RightQuestProps) {
  return (
    <aside
      aria-label="Quest checklist"
      className="h-full overflow-y-auto border-l border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
    >
      {!item ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No lab selected.</p>
      ) : (
        <>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Milestones
          </h2>
          <ul className="space-y-2">
            {item.milestones.map((milestone) => {
              const checked = completedMilestoneIds.has(milestone.id);
              return (
                <li key={milestone.id} className="flex items-center gap-2">
                  <Checkbox.Root
                    id={milestone.id}
                    checked={checked}
                    onCheckedChange={(next) => onToggleMilestone(milestone.id, next === true)}
                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-slate-300 data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500 dark:border-slate-600"
                  >
                    <Checkbox.Indicator>
                      <CheckIcon />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                  <label
                    htmlFor={milestone.id}
                    className={
                      checked
                        ? 'text-sm text-slate-400 line-through dark:text-slate-600'
                        : 'text-sm text-slate-700 dark:text-slate-300'
                    }
                  >
                    {milestone.title}
                  </label>
                  {milestone.xp !== undefined && (
                    <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">
                      +{milestone.xp} XP
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </aside>
  );
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M1 5L4 8L9 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
