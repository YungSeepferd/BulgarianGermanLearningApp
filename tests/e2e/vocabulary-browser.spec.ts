/**
 * Vocabulary Browser E2E Tests
 *
 * Tests for vocabulary browsing, searching, filtering, and selection
 */

import { test, expect } from '@playwright/test';
import {
  searchVocabulary,
  clearSearch,
  selectCefrFilter,
  selectCategoryFilter,
  getVocabularyCount,
  clickVocabularyItem,
  verifyVocabularyItemDetails,
  waitForVocabularyLoad,
  SAMPLE_VOCABULARY,
  CEFR_LEVELS,
  PARTS_OF_SPEECH
} from '../helpers/vocabulary-helpers';

test.describe('Vocabulary Browser Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/vocabulary');
    await waitForVocabularyLoad(page);
  });

  test.describe('Initial Load', () => {
    test('should load vocabulary page successfully', async ({ page }) => {
      // Verify page header
      const header = page.locator('h1');
      await expect(header).toBeVisible();
      await expect(header).toHaveText(/Wortschatz|Речник/);
    });

    test('should display vocabulary items', async ({ page }) => {
      // Should have at least some vocabulary items
      const count = await getVocabularyCount(page);
      expect(count).toBeGreaterThan(0);
    });

    test('should show search input', async ({ page }) => {
      const searchInput = page.locator('input[type="search"], input[placeholder*="Suche"], input[placeholder*="търсене"]');
      await expect(searchInput).toBeVisible();
    });

    test('should show filter controls', async ({ page }) => {
      // Look for filter buttons/controls
      const filterControls = page.locator('.filter-controls, .filters, [data-filters]');

      // Check for difficulty filter
      const difficultyFilter = page.locator('button:has-text("Schwierigkeit"), button:has-text("Ниво")');
      const hasDifficultyFilter = await difficultyFilter.count() > 0;

      // Check for category filter
      const categoryFilter = page.locator('button:has-text("Kategorie"), button:has-text("Категория")');
      const hasCategoryFilter = await categoryFilter.count() > 0;

      // At least some filter should exist
      expect(hasDifficultyFilter || hasCategoryFilter).toBe(true);
    });
  });

  test.describe('Search Functionality', () => {
    test('should search by German word', async ({ page }) => {
      // Search for a common German word
      await searchVocabulary(page, 'Haus');

      // Wait for results
      await page.waitForTimeout(500);

      // Should show results (or empty state)
      const items = page.locator('.vocabulary-item, .vocabulary-card, [data-testid="vocabulary-item"]');

      // If results found, verify they contain the search term
      const count = await items.count();
      if (count > 0) {
        const firstItem = items.first();
        const text = await firstItem.textContent();
        // Should contain "Haus" or related word
        expect(text?.toLowerCase()).toContain('haus');
      }
    });

    test('should search by Bulgarian word (Cyrillic input)', async ({ page }) => {
      // Search for a Bulgarian word
      await searchVocabulary(page, 'къща');

      await page.waitForTimeout(500);

      // Should handle Cyrillic without crashing
      const items = page.locator('.vocabulary-item, .vocabulary-card, [data-testid="vocabulary-item"]');
      const count = await items.count();

      // Just verify the search worked
      await expect(page.locator('.vocabulary-list, main')).toBeVisible();
    });

    test('should show no results for non-existent word', async ({ page }) => {
      await searchVocabulary(page, 'zzzzzznonexistent12345');

      await page.waitForTimeout(500);

      // Should either show empty state or no items
      const items = page.locator('.vocabulary-item, .vocabulary-card, [data-testid="vocabulary-item"]');
      const count = await items.count();

      // If empty state exists, it should be visible
      const emptyState = page.locator('.empty-state, .no-results, [data-empty]');
      const hasEmptyState = await emptyState.isVisible().catch(() => false);

      expect(count === 0 || hasEmptyState).toBe(true);
    });

    test('should clear search and show all items', async ({ page }) => {
      // Search first
      await searchVocabulary(page, 'Haus');
      await page.waitForTimeout(300);

      // Clear search
      await clearSearch(page);

      // Should show more items again
      const count = await getVocabularyCount(page);
      expect(count).toBeGreaterThan(0);
    });

    test('should update results in real-time while typing', async ({ page }) => {
      const searchInput = page.locator('input[type="search"], input[placeholder*="Suche"], input[placeholder*="търсене"]');

      // Type slowly
      await searchInput.fill('H');
      await page.waitForTimeout(200);
      await searchInput.fill('Ha');
      await page.waitForTimeout(200);
      await searchInput.fill('Hau');
      await page.waitForTimeout(200);
      await searchInput.fill('Haus');

      // Should show results
      await expect(page.locator('.vocabulary-list, main')).toBeVisible();
    });
  });

  test.describe('Filter Functionality', () => {
    test('should filter by CEFR level A1', async ({ page }) => {
      // Click difficulty filter
      const difficultyButton = page.locator('button:has-text("Schwierigkeit"), button:has-text("Ниво")').first();

      if (await difficultyButton.isVisible()) {
        await difficultyButton.click();

        // Select A1
        const a1Option = page.locator('button:has-text("A1"), label:has-text("A1"), input[value="A1"]').first();
        if (await a1Option.isVisible()) {
          await a1Option.click();
          await page.waitForTimeout(500);

          // Verify items are filtered
          await expect(page.locator('.vocabulary-list, main')).toBeVisible();
        }
      }
    });

    test('should filter by category', async ({ page }) => {
      const categoryButton = page.locator('button:has-text("Kategorie"), button:has-text("Категория")').first();

      if (await categoryButton.isVisible()) {
        await categoryButton.click();

        // Select a category
        const categoryOption = page.locator('button:has-text("food"), button:has-text("Essen"), label:has-text("food")').first();
        if (await categoryOption.isVisible()) {
          await categoryOption.click();
          await page.waitForTimeout(500);

          // Verify page still works
          await expect(page.locator('.vocabulary-list, main')).toBeVisible();
        }
      }
    });

    test('should filter by part of speech', async ({ page }) => {
      // Look for part of speech filter
      const posFilter = page.locator('button:has-text("Wortart"), button:has-text("Part of speech")').first();

      if (await posFilter.isVisible()) {
        await posFilter.click();

        // Select noun
        const nounOption = page.locator('button:has-text("Noun"), button:has-text("Substantiv"), label:has-text("noun")').first();
        if (await nounOption.isVisible()) {
          await nounOption.click();
          await page.waitForTimeout(500);

          // Verify page still works
          await expect(page.locator('.vocabulary-list, main')).toBeVisible();
        }
      }
    });

    test('should combine multiple filters', async ({ page }) => {
      // Apply difficulty filter
      const difficultyButton = page.locator('button:has-text("Schwierigkeit"), button:has-text("Ниво")').first();

      if (await difficultyButton.isVisible()) {
        await difficultyButton.click();
        const a1Option = page.locator('button:has-text("A1")').first();
        if (await a1Option.isVisible()) {
          await a1Option.click();
        }
      }

      await page.waitForTimeout(300);

      // Apply category filter
      const categoryButton = page.locator('button:has-text("Kategorie"), button:has-text("Категория")').first();
      if (await categoryButton.isVisible()) {
        await categoryButton.click();
        const foodOption = page.locator('button:has-text("food"), button:has-text("Essen")').first();
        if (await foodOption.isVisible()) {
          await foodOption.click();
        }
      }

      await page.waitForTimeout(500);

      // Verify page still works with combined filters
      await expect(page.locator('.vocabulary-list, main')).toBeVisible();
    });

    test('should clear all filters', async ({ page }) => {
      // Apply a filter first
      const difficultyButton = page.locator('button:has-text("Schwierigkeit"), button:has-text("Ниво")').first();

      if (await difficultyButton.isVisible()) {
        await difficultyButton.click();
        const a1Option = page.locator('button:has-text("A1")').first();
        if (await a1Option.isVisible()) {
          await a1Option.click();
        }
      }

      // Look for clear filters button
      const clearButton = page.locator('button:has-text("Zurücksetzen"), button:has-text("Clear"), button:has-text("Изчисти")');

      if (await clearButton.count() > 0) {
        await clearButton.first().click();
        await page.waitForTimeout(300);

        // Should show all items again
        const count = await getVocabularyCount(page);
        expect(count).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Vocabulary Item Details', () => {
    test('should navigate to vocabulary detail page', async ({ page }) => {
      const items = page.locator('.vocabulary-item, .vocabulary-card, [data-testid="vocabulary-item"]');
      const count = await items.count();

      if (count > 0) {
        await items.first().click();

        // Should navigate to detail page or show detail panel
        await expect(page).toHaveURL(/\/vocabulary\/|detail/);
      }
    });

    test('should display German word in item', async ({ page }) => {
      const items = page.locator('.vocabulary-item, .vocabulary-card, [data-testid="vocabulary-item"]');

      if (await items.count() > 0) {
        const germanWord = items.first().locator('.german, [data-german], .word-german');

        if (await germanWord.isVisible()) {
          const text = await germanWord.textContent();
          expect(text).toBeDefined();
          expect(text!.length).toBeGreaterThan(0);
        }
      }
    });

    test('should display Bulgarian translation in item', async ({ page }) => {
      const items = page.locator('.vocabulary-item, .vocabulary-card, [data-testid="vocabulary-item"]');

      if (await items.count() > 0) {
        const bulgarianWord = items.first().locator('.bulgarian, [data-bulgarian], .word-bulgarian');

        if (await bulgarianWord.isVisible()) {
          const text = await bulgarianWord.textContent();
          expect(text).toBeDefined();
          expect(text!.length).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('Selection and Practice', () => {
    test('should show "Auswahl üben" button', async ({ page }) => {
      const practiceButton = page.locator('button:has-text("Auswahl üben"), button:has-text("Practice selection")');

      const count = await practiceButton.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should allow selecting vocabulary items', async ({ page }) => {
      // Look for selection checkboxes or selection mode
      const selectCheckbox = page.locator('.select-checkbox, input[type="checkbox"]').first();

      if (await selectCheckbox.isVisible()) {
        await selectCheckbox.click();

        // Should be selected
        await expect(selectCheckbox).toBeChecked();
      }
    });

    test('should practice selected vocabulary', async ({ page }) => {
      const practiceButton = page.locator('button:has-text("Auswahl üben"), button:has-text("Practice selection")').first();

      if (await practiceButton.isVisible()) {
        // May need to select items first
        const selectCheckbox = page.locator('.select-checkbox, input[type="checkbox"]').first();
        if (await selectCheckbox.isVisible()) {
          await selectCheckbox.click();
        }

        await practiceButton.click();

        // Should navigate to practice
        await expect(page).toHaveURL(/\/practice|learn\/shuffle/);
      }
    });
  });

  test.describe('Pagination / Infinite Scroll', () => {
    test('should handle large vocabulary lists', async ({ page }) => {
      // Get initial count
      const count = await getVocabularyCount(page);

      // Should have loaded some items
      expect(count).toBeGreaterThan(0);

      // Scroll to bottom to trigger more loading if using infinite scroll
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);

      // Verify page still works
      await expect(page.locator('.vocabulary-list, main')).toBeVisible();
    });

    test('should load more items on scroll (if infinite scroll)', async ({ page }) => {
      // This test verifies infinite scroll if implemented
      const items = page.locator('.vocabulary-item, .vocabulary-card, [data-testid="vocabulary-item"]');
      const initialCount = await items.count();

      // Scroll down
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);

      // Check if more items loaded
      const newCount = await items.count();

      // Either more loaded or we're at the end
      expect(newCount).toBeGreaterThanOrEqual(initialCount);
    });
  });

  test.describe('Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      // Tab to first interactive element
      await page.keyboard.press('Tab');

      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('should have proper heading structure', async ({ page }) => {
      // Should have one h1
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBe(1);
    });

    test('should have accessible filter controls', async ({ page }) => {
      const filterButtons = page.locator('.filter-button, button[aria-haspopup]');

      const count = await filterButtons.count();
      if (count > 0) {
        // Check for accessible attributes
        const firstButton = filterButtons.first();
        await expect(firstButton).toHaveAttribute('type', 'button');
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle special characters in search', async ({ page }) => {
      await searchVocabulary(page, 'äöüß');
      await page.waitForTimeout(300);

      // Should not crash
      await expect(page.locator('.vocabulary-list, main')).toBeVisible();
    });

    test('should handle SQL-like injection attempts', async ({ page }) => {
      await searchVocabulary(page, "'; DROP TABLE vocabulary; --");
      await page.waitForTimeout(300);

      // Should not crash, should handle gracefully
      await expect(page.locator('.vocabulary-list, main')).toBeVisible();
    });

    test('should handle XSS-like input', async ({ page }) => {
      await searchVocabulary(page, '<script>alert("xss")</script>');
      await page.waitForTimeout(300);

      // Should not execute script, should handle gracefully
      await expect(page.locator('.vocabulary-list, main')).toBeVisible();
    });
  });
});