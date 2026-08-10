import Ajv, { type ErrorObject } from 'ajv';
import { courseManifestSchema } from './schema';
import type { CourseManifest } from './types';

const ajv = new Ajv({ allErrors: true });
const validateSchema = ajv.compile(courseManifestSchema);

export class ManifestValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(`Invalid course pack manifest:\n${issues.map((i) => `  - ${i}`).join('\n')}`);
    this.name = 'ManifestValidationError';
    this.issues = issues;
  }
}

/**
 * Parses and validates a course.json payload. Throws ManifestValidationError
 * with every problem found (not just the first) — a malformed pack must fail
 * loudly, never render a partially-broken tree.
 */
export function parseManifest(raw: unknown): CourseManifest {
  if (!validateSchema(raw)) {
    throw new ManifestValidationError(formatAjvErrors(validateSchema.errors));
  }

  const manifest = raw;
  const issues = collectSemanticIssues(manifest);
  if (issues.length > 0) {
    throw new ManifestValidationError(issues);
  }

  return manifest;
}

function formatAjvErrors(errors: ErrorObject[] | null | undefined): string[] {
  return (errors ?? []).map((e) => `${e.instancePath || '(root)'} ${e.message ?? 'is invalid'}`);
}

function collectSemanticIssues(manifest: CourseManifest): string[] {
  const issues: string[] = [];

  const chapterIds = new Set(manifest.chapters.map((c) => c.id));
  const itemIds = new Set(manifest.items.map((i) => i.id));
  const knownIds = new Set([...chapterIds, ...itemIds]);

  for (const dupe of findDuplicates(manifest.chapters.map((c) => c.id))) {
    issues.push(`duplicate chapter id "${dupe}"`);
  }
  for (const dupe of findDuplicates(manifest.items.map((i) => i.id))) {
    issues.push(`duplicate item id "${dupe}"`);
  }
  for (const overlap of intersect(chapterIds, itemIds)) {
    issues.push(`id "${overlap}" used by both a chapter and an item — ids must be unique across both`);
  }

  const allMilestoneIds = manifest.items.flatMap((i) => i.milestones.map((m) => m.id));
  for (const dupe of findDuplicates(allMilestoneIds)) {
    issues.push(`duplicate milestone id "${dupe}"`);
  }

  for (const chapter of manifest.chapters) {
    for (const req of chapter.requires) {
      if (!knownIds.has(req)) {
        issues.push(`chapter "${chapter.id}" requires unknown id "${req}"`);
      }
    }
    for (const childId of chapter.children) {
      if (!itemIds.has(childId)) {
        issues.push(`chapter "${chapter.id}" lists unknown item "${childId}" in children`);
      }
    }
  }

  for (const item of manifest.items) {
    for (const req of item.requires) {
      if (!knownIds.has(req)) {
        issues.push(`item "${item.id}" requires unknown id "${req}"`);
      }
    }
  }

  const badgeWhenPattern = /^(stage|lab|milestone):[^:]+:(complete|done)$|^streak:\d+$/;
  for (const badge of manifest.gamification.badges) {
    if (!badgeWhenPattern.test(badge.when)) {
      issues.push(
        `badge "${badge.id}" has an unrecognized trigger "${badge.when}" (expected stage:<id>:complete, lab:<id>:complete, milestone:<id>:done, or streak:<n>)`,
      );
    }
  }

  const levels = manifest.gamification.levels;
  for (let i = 1; i < levels.length; i++) {
    if ((levels[i] ?? 0) <= (levels[i - 1] ?? 0)) {
      issues.push('gamification.levels must be strictly ascending');
      break;
    }
  }

  // Only run cycle detection once the graph references are otherwise sound —
  // an unknown id would make the cycle report noisy and redundant.
  if (issues.length === 0) {
    const cycle = findRequiresCycle(manifest);
    if (cycle) {
      issues.push(`circular "requires" dependency: ${cycle.join(' -> ')}`);
    }
  }

  return issues;
}

function findRequiresCycle(manifest: CourseManifest): string[] | null {
  const requiresById = new Map<string, string[]>();
  for (const chapter of manifest.chapters) requiresById.set(chapter.id, chapter.requires);
  for (const item of manifest.items) requiresById.set(item.id, item.requires);

  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color = new Map<string, number>();
  const path: string[] = [];

  function visit(id: string): string[] | null {
    color.set(id, GRAY);
    path.push(id);

    for (const dep of requiresById.get(id) ?? []) {
      const depColor = color.get(dep) ?? WHITE;
      if (depColor === GRAY) {
        const cycleStart = path.indexOf(dep);
        return [...path.slice(cycleStart), dep];
      }
      if (depColor === WHITE) {
        const found = visit(dep);
        if (found) return found;
      }
    }

    path.pop();
    color.set(id, BLACK);
    return null;
  }

  for (const id of requiresById.keys()) {
    if ((color.get(id) ?? WHITE) === WHITE) {
      const found = visit(id);
      if (found) return found;
    }
  }

  return null;
}

function findDuplicates(ids: string[]): string[] {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) dupes.add(id);
    seen.add(id);
  }
  return [...dupes];
}

function intersect<T>(a: Set<T>, b: Set<T>): T[] {
  return [...a].filter((x) => b.has(x));
}
