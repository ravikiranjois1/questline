import { test, expect } from '@playwright/test';

// P0 harness check only. The real flow (complete milestone -> XP rises ->
// lab unlocks -> export -> reload -> import -> state restored) lands in P4
// once progress is wired to IndexedDB.
test('app loads and shows the course title', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'AI Engineer Track' })).toBeVisible();
});
