// Domain types shared by the engine, store, and UI.
// This module has no framework dependencies — see docs/COURSE-PACK-FORMAT.md.

export interface Milestone {
  id: string;
  title: string;
  xp?: number;
}

export type ItemKind = 'lab' | 'reading' | 'project' | (string & {});

export interface CourseItem {
  id: string;
  title: string;
  kind: ItemKind;
  requires: string[];
  content: string[];
  milestones: Milestone[];
}

export type ChapterKind = 'stage' | (string & {});

export interface Chapter {
  id: string;
  title: string;
  kind: ChapterKind;
  requires: string[];
  children: string[];
}

export interface Badge {
  id: string;
  title: string;
  /** Declarative trigger: "stage:<id>:complete" | "lab:<id>:complete" | "milestone:<id>:done" | "streak:<n>" */
  when: string;
}

export interface Gamification {
  xpPerMilestone: number;
  /** XP thresholds → level 1..N, ascending, first entry is level 1's floor (usually 0). */
  levels: number[];
  badges: Badge[];
}

export interface CourseManifest {
  id: string;
  title: string;
  version: string;
  description: string;
  gamification: Gamification;
  chapters: Chapter[];
  items: CourseItem[];
}

export type ProgressEvent =
  | { type: 'milestone_completed'; courseId: string; milestoneId: string; at: string }
  | { type: 'milestone_uncompleted'; courseId: string; milestoneId: string; at: string }
  | { type: 'note_added'; courseId: string; itemId: string; text: string; at: string }
  | { type: 'session_logged'; courseId: string; minutes: number; at: string };

export interface CourseProgress {
  courseId: string;
  events: ProgressEvent[];
}

export interface ProgressExportV1 {
  version: 1;
  courses: CourseProgress[];
}

/** Derived, never persisted directly — always recomputed from ProgressEvent[]. */
export interface DerivedCourseState {
  completedMilestoneIds: Set<string>;
  xp: number;
  level: number;
  unlockedItemIds: Set<string>;
  unlockedChapterIds: Set<string>;
  earnedBadgeIds: Set<string>;
  currentStreak: number;
  itemCompletionPct: Record<string, number>;
  chapterCompletionPct: Record<string, number>;
}
