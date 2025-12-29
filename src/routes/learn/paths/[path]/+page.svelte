<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import LessonList from '$lib/components/learning/LessonList.svelte';
  import ProgressIndicator from '$lib/components/learning/ProgressIndicator.svelte';
  import type { LearningPath, LearningPathProgress } from '$lib/types/learning-path';
  import type { Lesson } from '$lib/types/lesson';
  import { getLearningPaths, getLessonsForPath, getLearningPathProgress, markLessonComplete } from '$lib/services/learning-paths';

  let { data } = $props<{ data: { pathId: string } }>();

  let loading = $state(true);
  let error = $state<string | null>(null);
  let path = $state<LearningPath | null>(null);
  let lessons = $state<Lesson[]>([]);
  let progress = $state<LearningPathProgress | null>(null);

  onMount(async () => {
    try {
      const allPaths = await getLearningPaths();
      path = allPaths.find((p) => p.id === data.pathId) ?? null;
      lessons = await getLessonsForPath(data.pathId);
      progress = await getLearningPathProgress(data.pathId);
    } catch (e) {
      error = (e as Error).message ?? 'Failed to load path';
    } finally {
      loading = false;
    }
  });

  const goBack = () => goto(`${base}/learn/paths`);

  const openLesson = (lessonId: string) => {
    goto(`${base}/learn/paths/${data.pathId}/${lessonId}`);
  };

  async function completeNextLesson() {
    if (!path || lessons.length === 0) return;
    const nextLesson = lessons.find((lesson) => !progress?.completedLessons.includes(lesson.id)) ?? lessons[lessons.length - 1];
    if (!nextLesson) return;
    const updated = await markLessonComplete(data.pathId, nextLesson.id);
    progress = updated;
  }
</script>

<div class="page">
  <div class="toolbar">
    <button class="link" onclick={goBack}>← Back to all paths</button>
  </div>

  {#if loading}
    <div class="state">Loading path…</div>
  {:else if error}
    <div class="state error">{error}</div>
  {:else if !path}
    <div class="state">Path not found.</div>
  {:else}
    <div class="header">
      <div>
        <p class="eyebrow">Learning Path</p>
        <h1>{path.title}</h1>
        {#if path.subtitle}<p class="subtitle">{path.subtitle}</p>{/if}
        {#if path.description}<p class="description">{path.description}</p>{/if}
      </div>
      {#if progress}
        <div class="actions">
          <button class="action-btn" onclick={completeNextLesson}>Mark next lesson complete</button>
          <p class="hint">Updates progress and persists to IndexedDB.</p>
        </div>
      {/if}
    </div>

    {#if progress}
      <section class="panel">
        <ProgressIndicator
          completed={progress.completedLessons.length}
          total={path.lessons?.length ?? lessons.length}
          xpEarned={(progress as any).totalXP ?? 0}
          timeSpent={progress.timeSpent ?? (progress.completedLessons.length * (path.lessons?.[0]?.duration ?? 15))}
        />
      </section>
    {/if}

    <section class="panel">
      <LessonList
        lessons={lessons}
        currentLessonId={progress?.currentLesson}
        onLessonSelect={openLesson}
      />
    </section>
  {/if}
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 2rem;
    background: var(--color-background, #f9fafb);
    min-height: 100vh;
  }

  .toolbar {
    display: flex;
    justify-content: flex-start;
  }

  .link {
    background: none;
    border: none;
    color: var(--color-primary, #3b82f6);
    cursor: pointer;
    font-weight: 600;
  }

  .header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: flex-start;
  }

  .eyebrow {
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 700;
    font-size: 0.75rem;
    color: var(--color-text-secondary, #6b7280);
  }

  h1 {
    margin: 0.25rem 0;
    font-size: 1.75rem;
    color: var(--color-text-primary, #111827);
  }

  .subtitle {
    margin: 0;
    color: var(--color-text-secondary, #6b7280);
  }

  .description {
    margin: 0.5rem 0 0 0;
    color: var(--color-text-secondary, #6b7280);
    line-height: 1.5;
  }

  .panel {
    background: var(--color-surface, #ffffff);
    border: 1px solid var(--color-border, #e5e7eb);
    border-radius: 0.75rem;
    padding: 1.5rem;
  }

  .state {
    padding: 1rem;
    background: var(--color-surface, #ffffff);
    border: 1px solid var(--color-border, #e5e7eb);
    border-radius: 0.75rem;
    color: var(--color-text-primary, #111827);
  }

  .state.error {
    border-color: #ef4444;
    color: #b91c1c;
  }

  .actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.5rem;
  }

  .action-btn {
    padding: 0.6rem 1rem;
    border-radius: 0.5rem;
    border: 1px solid var(--color-primary, #3b82f6);
    background: var(--color-primary, #3b82f6);
    color: #fff;
    cursor: pointer;
    font-weight: 600;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  .action-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(59, 130, 246, 0.25);
  }

  .action-btn:focus-visible {
    outline: 3px solid rgba(59, 130, 246, 0.35);
    outline-offset: 2px;
  }

  .hint {
    margin: 0;
    color: var(--color-text-secondary, #6b7280);
    font-size: 0.875rem;
  }
</style>
