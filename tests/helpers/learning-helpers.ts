/**
 * Learning flow test helpers
 *
 * Reusable utilities for testing learning paths, lessons, and practice sessions
 */

import { Page, Locator, expect } from '@playwright/test';

/**
 * Learning path types
 */
export interface LearningPath {
  id: string;
  name: string;
  lessons: string[];
}

/**
 * Practice session state
 */
export interface PracticeSessionState {
  currentQuestion: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
}

/**
 * Common learning paths in the app
 */
export const LEARNING_PATHS = {
  A1_ESSENTIAL: 'essenzielle-a1',
  A1_BASICS: 'a1-grundlagen',
  A2_INTERMEDIATE: 'a2-mittelstufe',
} as const;

/**
 * Navigate to the learn page
 */
export async function gotoLearnPage(page: Page): Promise<void> {
  await page.goto('/learn');
  await page.waitForSelector('.learn-hub, .loading', { timeout: 10000 });
  // Wait for loading to complete
  await page.waitForSelector('.loading', { state: 'detached', timeout: 15000 }).catch(() => {});
}

/**
 * Navigate to the practice page
 */
export async function gotoPracticePage(page: Page): Promise<void> {
  await page.goto('/practice');
  await page.waitForSelector('.practice-card, .tandem-practice', { timeout: 10000 });
}

/**
 * Start a learning path
 */
export async function startLearningPath(page: Page, pathId: string): Promise<void> {
  await gotoLearnPage(page);
  const pathCard = page.locator(`.path-card:has-text("${pathId}"), [data-path-id="${pathId}"]`).first();
  await pathCard.click();
  await page.waitForURL(/\/learn\/paths\//, { timeout: 5000 });
}

/**
 * Start a lesson from the learn page
 */
export async function startLesson(page: Page, lessonId: string): Promise<void> {
  const lessonCard = page.locator(`.lesson-card:has-text("${lessonId}"), [data-lesson-id="${lessonId}"]`).first();
  await lessonCard.click();
}

/**
 * Answer a practice question
 */
export async function answerPracticeQuestion(page: Page, answer: string): Promise<void> {
  const input = page.locator('input.answer-input, input[type="text"]').first();
  await input.fill(answer);

  const submitButton = page.locator('button:has-text("Antwort prüfen"), button:has-text("Провери отговор")').first();
  await submitButton.click();
}

/**
 * Skip the current practice question
 */
export async function skipPracticeQuestion(page: Page): Promise<void> {
  const skipButton = page.locator('button:has-text("Überspringen"), button:has-text("Пропусни")').first();
  if (await skipButton.isVisible()) {
    await skipButton.click();
  }
}

/**
 * Go to next practice question
 */
export async function nextPracticeQuestion(page: Page): Promise<void> {
  const nextButton = page.locator('button:has-text("Nächstes"), button:has-text("Следваща")').first();
  await nextButton.click();
}

/**
 * Get current practice progress
 */
export async function getPracticeProgress(page: Page): Promise<PracticeSessionState> {
  const progressText = await page.locator('.progress-text, .progress-indicator').textContent() || '';

  // Parse progress like "3 / 10" or "3/10"
  const match = progressText.match(/(\d+)\s*\/\s*(\d+)/);
  if (match) {
    return {
      currentQuestion: parseInt(match[1], 10),
      totalQuestions: parseInt(match[2], 10),
      correctAnswers: 0,
      incorrectAnswers: 0
    };
  }

  return {
    currentQuestion: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    incorrectAnswers: 0
  };
}

/**
 * Check if practice feedback is correct
 */
export async function isCorrectFeedback(page: Page): Promise<boolean> {
  const correctIndicator = page.locator('.correct, .success, [data-result="correct"], text=Richtig, text=Правилно');
  const incorrectIndicator = page.locator('.incorrect, .error, [data-result="incorrect"], text=Falsch, text=Грешно');

  const isCorrect = await correctIndicator.isVisible().catch(() => false);
  const isIncorrect = await incorrectIndicator.isVisible().catch(() => false);

  return isCorrect && !isIncorrect;
}

/**
 * Flip a flashcard
 */
export async function flipFlashcard(page: Page): Promise<void> {
  const card = page.locator('.flashcard, .word-card').first();
  await card.click();
}

/**
 * Mark a vocabulary item as known
 */
export async function markAsKnown(page: Page): Promise<void> {
  const knownButton = page.locator('button:has-text("Gekannt"), button:has-text("Познато"), button[data-action="known"]').first();
  if (await knownButton.isVisible()) {
    await knownButton.click();
  }
}

/**
 * Mark a vocabulary item as unknown
 */
export async function markAsUnknown(page: Page): Promise<void> {
  const unknownButton = page.locator('button:has-text("Nicht gekannt"), button:has-text("Непознато"), button[data-action="unknown"]').first();
  if (await unknownButton.isVisible()) {
    await unknownButton.click();
  }
}

/**
 * Get current streak count
 */
export async function getStreakCount(page: Page): Promise<number> {
  await page.goto('/');
  const streakElement = page.locator('.streak-count, [data-streak]').first();
  const text = await streakElement.textContent() || '0';
  return parseInt(text.replace(/\D/g, ''), 10) || 0;
}

/**
 * Get XP count
 */
export async function getXpCount(page: Page): Promise<number> {
  await page.goto('/');
  const xpElement = page.locator('.xp-count, [data-xp]').first();
  const text = await xpElement.textContent() || '0';
  return parseInt(text.replace(/\D/g, ''), 10) || 0;
}

/**
 * Wait for lesson to complete
 */
export async function waitForLessonComplete(page: Page): Promise<void> {
  await page.waitForSelector('.lesson-complete, .completion-screen, [data-complete="true"]', {
    timeout: 60000
  });
}

/**
 * Complete a full practice session (answer all questions)
 */
export async function completePracticeSession(page: Page, answers: string[]): Promise<void> {
  await gotoPracticePage(page);

  for (const answer of answers) {
    await answerPracticeQuestion(page, answer);
    await page.waitForTimeout(500);
    await nextPracticeQuestion(page);
    await page.waitForTimeout(500);
  }
}

/**
 * Swipe a card left (mobile gesture simulation)
 */
export async function swipeCardLeft(page: Page): Promise<void> {
  const card = page.locator('.swipeable-card, .flashcard').first();
  const box = await card.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x - 100, box.y + box.height / 2, { steps: 10 });
    await page.mouse.up();
  }
}

/**
 * Swipe a card right (mobile gesture simulation)
 */
export async function swipeCardRight(page: Page): Promise<void> {
  const card = page.locator('.swipeable-card, .flashcard').first();
  const box = await card.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width + 100, box.y + box.height / 2, { steps: 10 });
    await page.mouse.up();
  }
}

/**
 * Navigate through daily carousel
 */
export async function navigateDailyCarousel(page: Page, direction: 'next' | 'prev'): Promise<void> {
  const button = direction === 'next'
    ? page.locator('.carousel-next, button[data-direction="next"]').first()
    : page.locator('.carousel-prev, button[data-direction="prev"]').first();

  if (await button.isVisible()) {
    await button.click();
  }
}

/**
 * Get daily carousel current index
 */
export async function getDailyCarouselIndex(page: Page): Promise<number> {
  const indicator = page.locator('.carousel-indicator.active, [data-carousel-index].active').first();
  const index = await indicator.getAttribute('data-index');
  return index ? parseInt(index, 10) : 0;
}

/**
 * Complete all daily 10 items
 */
export async function completeDaily10(page: Page): Promise<void> {
  await page.goto('/');

  // Click on daily 10 section if available
  const dailySection = page.locator('.daily-carousel, [data-section="daily-10"]').first();
  if (await dailySection.isVisible()) {
    for (let i = 0; i < 10; i++) {
      await flipFlashcard(page);
      await page.waitForTimeout(300);
      await markAsKnown(page);
      await page.waitForTimeout(300);
      await navigateDailyCarousel(page, 'next');
      await page.waitForTimeout(300);
    }
  }
}