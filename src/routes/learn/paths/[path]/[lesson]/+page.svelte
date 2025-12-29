<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import type { Lesson } from '$lib/types/lesson';
  import type { LearningPathProgress } from '$lib/types/learning-path';
  import { getLessonsForPath, getLearningPathProgress, markLessonComplete } from '$lib/services/learning-paths';

  let { data } = $props<{ data: { pathId: string; lessonId: string } }>();

  let loading = $state(true);
  let error = $state<string | null>(null);
  let lesson = $state<Lesson | null>(null);
  let progress = $state<LearningPathProgress | null>(null);

  onMount(async () => {
    try {
      const lessons = await getLessonsForPath(data.pathId);
      lesson = lessons.find((l) => l.id === data.lessonId) ?? null;
      progress = await getLearningPathProgress(data.pathId);
    } catch (e) {
      error = (e as Error).message ?? 'Failed to load lesson';
    } finally {
      loading = false;
    }
  });

  const backToPath = () => goto(`${base}/learn/paths/${data.pathId}`);

  async function completeLesson() {
    if (!lesson) return;
    const updated = await markLessonComplete(data.pathId, lesson.id);
    progress = updated;
  }
</script>

<div class="page">
  <div class="toolbar">
    <button class="link" onclick={backToPath}>← Back to path</button>
  </div>

  {#if loading}
    <div class="state">Loading lesson…</div>
  {:else if error}
    <div class="state error">{error}</div>
  {:else if !lesson}
    <div class="state">Lesson not found.</div>
  {:else}
    <header class="header">
      <div>
        <p class="eyebrow">Lesson</p>
        <h1>{lesson.title}</h1>
        {#if lesson.subtitle}<p class="subtitle">{lesson.subtitle}</p>{/if}
      </div>
      <div class="actions">
        <button class="action-btn" onclick={completeLesson}>Mark lesson complete</button>
        {#if progress}
          <p class="hint">Progress is persisted; current lesson: {progress.currentLesson}</p>
        {/if}
      </div>
    </header>

    <section class="panel">
      <h3>Details</h3>
      <ul class="meta">
        <li><strong>Path:</strong> {data.pathId}</li>
        <li><strong>Duration:</strong> {lesson.duration ?? 15} min</li>
        {#if lesson.difficulty}<li><strong>Level:</strong> {lesson.difficulty}</li>{/if}
        {#if lesson.vocabularyIds?.length}
          <li><strong>Vocabulary IDs:</strong> {lesson.vocabularyIds.join(', ')}</li>
        {/if}
      </ul>
      {#if lesson.objectives?.length}
        <h4>Objectives</h4>
        <ul>
          {#each lesson.objectives as objective}
            <li>{objective}</li>
          {/each}
        </ul>
      {/if}
      {#if lesson.grammarTopics?.length}
        <h4>Grammar Topics</h4>
        <ul>
          {#each lesson.grammarTopics as topic}
            <li>{topic}</li>
          {/each}
        </ul>
      {/if}
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

  .meta {
    list-style: none;
    padding-left: 0;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .meta strong {
    color: var(--color-text-primary, #111827);
  }
</style>
