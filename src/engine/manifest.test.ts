import { describe, expect, it } from 'vitest';
import { ManifestValidationError, parseManifest } from './manifest';
import { buildManifest } from './fixtures';

describe('parseManifest', () => {
  it('accepts a well-formed manifest and returns it unchanged', () => {
    const manifest = buildManifest();
    expect(parseManifest(manifest)).toEqual(manifest);
  });

  it('rejects a payload missing required top-level fields', () => {
    const { id: _id, ...withoutId } = buildManifest();
    expect(() => parseManifest(withoutId)).toThrow(ManifestValidationError);
  });

  it('reports every schema violation, not just the first', () => {
    const broken = { title: 'Only a title' };
    try {
      parseManifest(broken);
      expect.unreachable('expected parseManifest to throw');
    } catch (err) {
      expect(err).toBeInstanceOf(ManifestValidationError);
      const issues = (err as ManifestValidationError).issues;
      expect(issues.length).toBeGreaterThan(1);
    }
  });

  it('rejects duplicate ids across chapters and items', () => {
    const manifest = buildManifest();
    manifest.items[0]!.id = 'chapter-1'; // collides with a chapter id
    expect(() => parseManifest(manifest)).toThrow(/id "chapter-1" used by both/);
  });

  it('rejects duplicate milestone ids', () => {
    const manifest = buildManifest();
    manifest.items[1]!.milestones[0]!.id = 'item-a-m1'; // dupes item-a's milestone
    expect(() => parseManifest(manifest)).toThrow(/duplicate milestone id/);
  });

  it('rejects a chapter or item requiring an unknown id', () => {
    const manifest = buildManifest();
    manifest.items[0]!.requires = ['does-not-exist'];
    expect(() => parseManifest(manifest)).toThrow(/requires unknown id "does-not-exist"/);
  });

  it('rejects a chapter listing an unknown item in children', () => {
    const manifest = buildManifest();
    manifest.chapters[0]!.children = ['ghost-item'];
    expect(() => parseManifest(manifest)).toThrow(/unknown item "ghost-item"/);
  });

  it('rejects a circular requires graph', () => {
    const manifest = buildManifest();
    manifest.items[0]!.requires = ['item-c']; // item-a -> ... -> item-c -> item-a
    expect(() => parseManifest(manifest)).toThrow(/circular "requires" dependency/);
  });

  it('rejects a badge with an unrecognized trigger format', () => {
    const manifest = buildManifest();
    manifest.gamification.badges = [{ id: 'bad', title: 'Bad', when: 'nonsense-trigger' }];
    expect(() => parseManifest(manifest)).toThrow(/unrecognized trigger/);
  });

  it('rejects non-ascending level thresholds', () => {
    const manifest = buildManifest();
    manifest.gamification.levels = [0, 100, 50];
    expect(() => parseManifest(manifest)).toThrow(/strictly ascending/);
  });
});
