/**
 * Background Sync Tests for Workbox Service Worker
 * Tests offline functionality and background sync capabilities
 */

import { test, expect } from '@playwright/test';
import { ServiceWorkerManager } from '../../playwright-utils/service-worker-utils';

test.describe('Background Sync Functionality', () => {
  let swManager: ServiceWorkerManager;

  test.beforeEach(async ({ page }) => {
    swManager = new ServiceWorkerManager(page);
    await page.goto('/');
    await swManager.waitForServiceWorker();
  });

  test('service worker registers background sync queues', async ({ page }) => {
    // Check if background sync queues are properly initialized
    const syncStatus = await swManager.getSyncStatus();
    
    expect(syncStatus).toHaveProperty('success', true);
    expect(syncStatus.status).toHaveProperty('progress');
    expect(syncStatus.status).toHaveProperty('vocabularyProgress');
    expect(syncStatus.status).toHaveProperty('userPreferences');
  });

  test('progress data is queued when offline', async ({ page, context }) => {
    // Simulate offline mode
    await context.setOffline(true);

    // Try to save progress data
    const progressData = {
      lessonId: 'test-lesson-1',
      score: 85,
      timeSpent: 1200,
      completed: true
    };

    const response = await page.evaluate(async (data) => {
      try {
        const result = await fetch('/api/progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        return {
          status: result.status,
          text: await result.text()
        };
      } catch (error) {
        return {
          status: 'error',
          text: error.message
        };
      }
    }, progressData);

    // Should return 202 (queued) when offline
    expect(response.status).toBe(202);
    expect(response.text).toContain('queued');

    // Check if data is in sync queue
    const syncStatus = await swManager.getSyncStatus();
    expect(syncStatus.status.progress.length).toBeGreaterThan(0);
  });

  test('vocabulary progress is queued when offline', async ({ page, context }) => {
    // Simulate offline mode
    await context.setOffline(true);

    // Try to save vocabulary progress
    const vocabProgress = {
      vocabularyId: 'test-vocab-1',
      correctAnswers: 5,
      totalAttempts: 6,
      lastReviewed: new Date().toISOString(),
      difficulty: 'medium'
    };

    const response = await page.evaluate(async (data) => {
      try {
        const result = await fetch('/api/vocabulary/progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        return {
          status: result.status,
          text: await result.text()
        };
      } catch (error) {
        return {
          status: 'error',
          text: error.message
        };
      }
    }, vocabProgress);

    // Should return 202 (queued) when offline
    expect(response.status).toBe(202);
    expect(response.text).toContain('queued');

    // Check if data is in sync queue
    const syncStatus = await swManager.getSyncStatus();
    expect(syncStatus.status.vocabularyProgress.length).toBeGreaterThan(0);
  });

  test('user preferences are queued when offline', async ({ page, context }) => {
    // Simulate offline mode
    await context.setOffline(true);

    // Try to save user preferences
    const preferences = {
      language: 'bg',
      theme: 'dark',
      soundEnabled: true,
      autoPlay: false,
      dailyGoal: 20
    };

    const response = await page.evaluate(async (data) => {
      try {
        const result = await fetch('/api/user/preferences', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        return {
          status: result.status,
          text: await result.text()
        };
      } catch (error) {
        return {
          status: 'error',
          text: error.message
        };
      }
    }, preferences);

    // Should return 202 (queued) when offline
    expect(response.status).toBe(202);
    expect(response.text).toContain('queued');

    // Check if data is in sync queue
    const syncStatus = await swManager.getSyncStatus();
    expect(syncStatus.status.userPreferences.length).toBeGreaterThan(0);
  });

  test('sync triggers when back online', async ({ page, context }) => {
    // Start offline
    await context.setOffline(true);

    // Queue some data
    const progressData = {
      lessonId: 'test-lesson-2',
      score: 90,
      timeSpent: 1500,
      completed: true
    };

    await page.evaluate(async (data) => {
      await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
    }, progressData);

    // Verify data is queued
    let syncStatus = await swManager.getSyncStatus();
    expect(syncStatus.status.progress.length).toBeGreaterThan(0);

    // Go back online
    await context.setOffline(false);

    // Trigger manual sync
    const syncResult = await swManager.triggerSync();
    expect(syncResult.success).toBe(true);

    // Wait a moment for sync to process
    await page.waitForTimeout(1000);

    // Check if queue is empty (synced)
    syncStatus = await swManager.getSyncStatus();
    expect(syncStatus.status.progress.length).toBe(0);
  });

  test('receives sync success notifications', async ({ page }) => {
    // Listen for sync success messages
    const syncMessages: any[] = [];
    page.on('message', (msg) => {
      if (msg.type === 'SYNC_SUCCESS') {
        syncMessages.push(msg);
      }
    });

    // Queue some data
    const progressData = {
      lessonId: 'test-lesson-3',
      score: 75,
      timeSpent: 900,
      completed: false
    };

    await page.evaluate(async (data) => {
      await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
    }, progressData);

    // Trigger sync
    await swManager.triggerSync();

    // Wait for sync completion
    await page.waitForTimeout(2000);

    // Should have received sync success notification
    expect(syncMessages.length).toBeGreaterThan(0);
    expect(syncMessages[0].data.type).toBe('progress');
  });

  test('handles multiple queued items', async ({ page, context }) => {
    // Start offline
    await context.setOffline(true);

    // Queue multiple progress items
    const progressItems = [
      { lessonId: 'lesson-1', score: 80, timeSpent: 1000, completed: true },
      { lessonId: 'lesson-2', score: 85, timeSpent: 1200, completed: true },
      { lessonId: 'lesson-3', score: 90, timeSpent: 1500, completed: true }
    ];

    for (const item of progressItems) {
      await page.evaluate(async (data) => {
        await fetch('/api/progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
      }, item);
    }

    // Verify all items are queued
    let syncStatus = await swManager.getSyncStatus();
    expect(syncStatus.status.progress.length).toBe(3);

    // Go back online and sync
    await context.setOffline(false);
    await swManager.triggerSync();

    // Wait for sync completion
    await page.waitForTimeout(2000);

    // All items should be synced
    syncStatus = await swManager.getSyncStatus();
    expect(syncStatus.status.progress.length).toBe(0);
  });

  test('maintains sync queue across service worker restart', async ({ page, context }) => {
    // Start offline
    await context.setOffline(true);

    // Queue some data
    const progressData = {
      lessonId: 'test-lesson-restart',
      score: 95,
      timeSpent: 1800,
      completed: true
    };

    await page.evaluate(async (data) => {
      await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
    }, progressData);

    // Verify data is queued
    let syncStatus = await swManager.getSyncStatus();
    expect(syncStatus.status.progress.length).toBeGreaterThan(0);

    // Restart service worker
    await swManager.restartServiceWorker();
    await swManager.waitForServiceWorker();

    // Queue should still contain the data
    syncStatus = await swManager.getSyncStatus();
    expect(syncStatus.status.progress.length).toBeGreaterThan(0);

    // Go back online and sync
    await context.setOffline(false);
    await swManager.triggerSync();

    // Wait for sync completion
    await page.waitForTimeout(2000);

    // Data should be synced
    syncStatus = await swManager.getSyncStatus();
    expect(syncStatus.status.progress.length).toBe(0);
  });
});