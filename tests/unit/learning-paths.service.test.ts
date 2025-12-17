import 'fake-indexeddb/auto';
import { describe, it, expect, afterEach } from 'vitest';
import { getLearningPaths, getLessonsForPath, getLearningPathProgress, markLessonComplete } from '$lib/services/learning-paths';
import { deleteDB } from '$lib/db/idb';

afterEach(async () => {
  await deleteDB();
});

describe('learning-paths service', () => {
  it('returns seeded learning paths', async () => {
    const paths = await getLearningPaths();
    expect(paths.length).toBeGreaterThan(0);
    expect(paths.map((p) => p.id)).toContain('de-a1-greetings');
  });

  it('returns lessons sorted by order for a path', async () => {
    const lessons = await getLessonsForPath('de-a1-greetings');
    expect(lessons.length).toBeGreaterThan(0);
    const orders = lessons.map((l) => l.order);
    expect([...orders]).toEqual([...orders].sort((a, b) => a - b));
    expect(lessons[0].path).toBe('de-a1-greetings');
  });

  it('seeds and returns learning path progress baseline', async () => {
    const progress = await getLearningPathProgress('de-a1-greetings');
    expect(progress.pathId).toBe('de-a1-greetings');
    expect(progress.completedLessons).toHaveLength(0);
    expect(progress.currentLesson).toBeDefined();
    // Second call should reuse stored record, not create a new one
    const again = await getLearningPathProgress('de-a1-greetings');
    expect(again.startedAt).toBe(progress.startedAt);
  });

  it('marks a lesson complete and persists progress', async () => {
    const initial = await getLearningPathProgress('de-a1-greetings');
    const updated = await markLessonComplete('de-a1-greetings', 'de-a1-greetings-01');

    expect(updated.completedLessons).toContain('de-a1-greetings-01');
    expect(updated.progress).toBeGreaterThan(initial.progress);
    expect(updated.timeSpent).toBeGreaterThanOrEqual(initial.timeSpent);
    expect(updated.currentLesson).toBe('de-a1-greetings-02');

    const persisted = await getLearningPathProgress('de-a1-greetings');
    expect(persisted.completedLessons).toContain('de-a1-greetings-01');
  });
});
