import { useMemo, useState } from 'react';
import { TopBar } from '../layout/TopBar';
import { LeftTree } from '../layout/LeftTree';
import { CenterReader } from '../layout/CenterReader';
import { RightQuest } from '../layout/RightQuest';
import { CalendarStrip } from '../layout/CalendarStrip';
import { useUiStore } from '../../store/useUiStore';
import { dummyManifest } from './dummyFixture';

/**
 * P0 skeleton: composes the five layout regions with static/local state.
 * Real progress derivation (engine/progress.ts) and persistence (store/db.ts)
 * replace the useState calls here in P1/P3 without changing this file's shape.
 */
export function CourseView() {
  const selectedItemId = useUiStore((s) => s.selectedItemId);
  const [completedMilestoneIds, setCompletedMilestoneIds] = useState<Set<string>>(new Set());

  const lockedItemIds = useMemo(() => new Set<string>(['lab-2']), []);

  const selectedItem = dummyManifest.items.find((i) => i.id === selectedItemId) ?? null;
  const selectedChapter =
    dummyManifest.chapters.find((c) => c.children.includes(selectedItemId ?? '')) ?? null;

  const xp = [...completedMilestoneIds].reduce((sum, milestoneId) => {
    const milestone = dummyManifest.items.flatMap((i) => i.milestones).find((m) => m.id === milestoneId);
    return sum + (milestone?.xp ?? dummyManifest.gamification.xpPerMilestone);
  }, 0);
  const totalMilestones = dummyManifest.items.flatMap((i) => i.milestones).length;
  const progressPct =
    totalMilestones === 0 ? 0 : Math.round((completedMilestoneIds.size / totalMilestones) * 100);

  const completionPct = Object.fromEntries(
    dummyManifest.items.map((item) => {
      const total = item.milestones.length;
      const done = item.milestones.filter((m) => completedMilestoneIds.has(m.id)).length;
      return [item.id, total === 0 ? 0 : Math.round((done / total) * 100)];
    }),
  );

  function handleToggleMilestone(milestoneId: string, next: boolean) {
    setCompletedMilestoneIds((prev) => {
      const copy = new Set(prev);
      if (next) copy.add(milestoneId);
      else copy.delete(milestoneId);
      return copy;
    });
  }

  return (
    <div className="grid h-full grid-rows-[auto_1fr_auto]">
      <TopBar
        courseTitle={dummyManifest.title}
        level={1}
        xp={xp}
        xpToNextLevel={dummyManifest.gamification.levels[1] ?? 300}
        streak={0}
        progressPct={progressPct}
      />

      <div className="grid min-h-0 grid-cols-[240px_1fr_280px]">
        <LeftTree manifest={dummyManifest} lockedItemIds={lockedItemIds} completionPct={completionPct} />
        <CenterReader chapterTitle={selectedChapter?.title ?? null} item={selectedItem} />
        <RightQuest
          item={selectedItem}
          completedMilestoneIds={completedMilestoneIds}
          onToggleMilestone={handleToggleMilestone}
        />
      </div>

      <CalendarStrip />
    </div>
  );
}
