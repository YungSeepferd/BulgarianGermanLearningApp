import { getDB } from '$lib/db/idb';
import type { Lesson, DifficultyLevel } from '$lib/types/lesson';
import type { LearningPath, LearningPathProgress } from '$lib/types/learning-path';

// Minimal real dataset seeded for Day 6-7 integration
const lessons: Lesson[] = [
  {
    id: 'de-a1-greetings-01',
    title: 'Begrüßungen und Kennenlernen',
    order: 1,
    path: 'de-a1-greetings',
    contentUrl: '/lessons/de-a1-greetings/lesson-1.md',
    duration: 15,
    difficulty: 'A1',
    vocabularyIds: ['zdravej_001', 'zusammen_bg_zaedno_sample'],
    grammarTopics: ['greetings', 'basic-formalities'],
    objectives: [
      'Begrüßungen im Deutschen sicher anwenden',
      'Erste Fragen zum Kennenlernen stellen'
    ]
  },
  {
    id: 'de-a1-greetings-02',
    title: 'Tageszeiten und Abschied',
    order: 2,
    path: 'de-a1-greetings',
    contentUrl: '/lessons/de-a1-greetings/lesson-2.md',
    duration: 15,
    difficulty: 'A1',
    vocabularyIds: ['guten_morgen_001', 'gute_nacht_001'],
    grammarTopics: ['times-of-day'],
    objectives: [
      'Tageszeitabhängige Grüße korrekt nutzen',
      'Höfliche Abschiedsformeln anwenden'
    ]
  },
  {
    id: 'de-a1-greetings-03',
    title: 'Höflichkeit und Bitten',
    order: 3,
    path: 'de-a1-greetings',
    contentUrl: '/lessons/de-a1-greetings/lesson-3.md',
    duration: 15,
    difficulty: 'A1',
    vocabularyIds: ['bitte_001', 'danke_001'],
    grammarTopics: ['politeness'],
    objectives: [
      'Dank und Bitte situativ angemessen ausdrücken',
      'Höfliche Frageformen nutzen'
    ]
  },
  {
    id: 'bg-a1-essentials-01',
    title: 'Поздрави и запознанства',
    order: 1,
    path: 'bg-a1-essentials',
    contentUrl: '/lessons/bg-a1-essentials/lesson-1.md',
    duration: 15,
    difficulty: 'A1',
    vocabularyIds: ['zdravej_001', 'dobur_den_001'],
    grammarTopics: ['greetings', 'basic-formalities'],
    objectives: [
      'Използване на основни поздрави на български',
      'Първи въпроси при запознанство'
    ]
  },
  {
    id: 'bg-a1-essentials-02',
    title: 'Учтивост и благодарност',
    order: 2,
    path: 'bg-a1-essentials',
    contentUrl: '/lessons/bg-a1-essentials/lesson-2.md',
    duration: 15,
    difficulty: 'A1',
    vocabularyIds: ['molq_001', 'blagodarya_001'],
    grammarTopics: ['politeness'],
    objectives: [
      'Формулиране на молба по учтив начин',
      'Изразяване на благодарност в различни ситуации'
    ]
  }
];

const learningPaths: LearningPath[] = [
  {
    id: 'de-a1-greetings',
    title: 'Deutsch A1: Begrüßungen',
    subtitle: 'Erste Schritte und Höflichkeitsformen',
    description: 'Starte mit den wichtigsten Begrüßungen, Tageszeiten und höflichen Floskeln.',
    difficulty: 'A1' as DifficultyLevel,
    lessons: lessons.filter((l) => l.path === 'de-a1-greetings'),
    totalDuration: 45,
    totalVocabulary: 8,
    icon: '👋',
    color: '#2563eb',
    order: 1
  },
  {
    id: 'bg-a1-essentials',
    title: 'Български A1: Основи',
    subtitle: 'Поздрави, учтивост и първи фрази',
    description: 'Освои базови поздрави и учтиви формули на български за ежедневни ситуации.',
    difficulty: 'A1' as DifficultyLevel,
    lessons: lessons.filter((l) => l.path === 'bg-a1-essentials'),
    totalDuration: 30,
    totalVocabulary: 6,
    icon: '🌱',
    color: '#059669',
    order: 2
  }
];

export async function getLearningPaths(): Promise<LearningPath[]> {
  return learningPaths;
}

export async function getLessonsForPath(pathId: string): Promise<Lesson[]> {
  const pathLessons = lessons.filter((lesson) => lesson.path === pathId);
  return pathLessons.sort((a, b) => a.order - b.order);
}

export async function getLearningPathProgress(pathId: string): Promise<LearningPathProgress> {
  const db = await getDB();
  const existing = await db.get('learningPathProgress', pathId);
  if (existing) return existing;

  const firstLessonId = lessons.find((lesson) => lesson.path === pathId)?.id ?? '';
  const baseline: LearningPathProgress = {
    pathId,
    currentLesson: firstLessonId,
    completedLessons: [],
    progress: 0,
    timeSpent: 0,
    startedAt: new Date().toISOString()
  };

  await db.put('learningPathProgress', baseline);
  return baseline;
}

export async function markLessonComplete(
  pathId: string,
  lessonId: string,
  timeSpentMinutes?: number
): Promise<LearningPathProgress> {
  const db = await getDB();
  const current = await getLearningPathProgress(pathId);
  const pathLessons = await getLessonsForPath(pathId);

  if (pathLessons.length === 0) return current;

  const targetLesson = pathLessons.find((lesson) => lesson.id === lessonId);
  if (!targetLesson) return current;

  const alreadyCompleted = current.completedLessons.includes(lessonId);
  const completedLookup = new Set(current.completedLessons);
  completedLookup.add(lessonId);

  const orderedCompleted = pathLessons
    .filter((lesson) => completedLookup.has(lesson.id))
    .map((lesson) => lesson.id);

  const totalLessons = pathLessons.length;
  const completionPercentage = totalLessons > 0 ? Math.round((orderedCompleted.length / totalLessons) * 100) : 0;
  const nextLessonId = pathLessons.find((lesson) => !completedLookup.has(lesson.id))?.id ?? lessonId;
  const elapsedMinutes = alreadyCompleted ? 0 : timeSpentMinutes ?? targetLesson.duration ?? 0;

  const updated: LearningPathProgress = {
    pathId: current.pathId,
    currentLesson: nextLessonId,
    completedLessons: orderedCompleted,
    progress: completionPercentage,
    timeSpent: Math.max(0, current.timeSpent + elapsedMinutes),
    completedAt: completionPercentage === 100 ? current.completedAt ?? new Date().toISOString() : undefined,
    startedAt: current.startedAt
  };

  await db.put('learningPathProgress', updated);
  return updated;
}
