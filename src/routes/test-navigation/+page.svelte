<script lang="ts">
  import { onMount } from 'svelte';
  import PathBrowser from '$lib/components/learning/PathBrowser.svelte';
  import LessonList from '$lib/components/learning/LessonList.svelte';
  import ProgressIndicator from '$lib/components/learning/ProgressIndicator.svelte';
  import type { LearningPath, LearningPathProgress } from '$lib/types/learning-path';
  import type { Lesson } from '$lib/types/lesson';
  import {
    getLearningPaths,
    getLearningPathProgress,
    getLessonsForPath,
    markLessonComplete
  } from '$lib/services/learning-paths';

  let loading = $state(true);
  let error = $state<string | null>(null);
  let paths = $state<LearningPath[]>([]);
  let selectedPathId = $state<string | null>(null);
  let selectedPath = $derived(paths.find(p => p.id === selectedPathId) ?? null);
  let pathProgress = $state<Map<string, LearningPathProgress>>(new Map());
  let progress = $state<LearningPathProgress | null>(null);
  let lessons = $state<Lesson[]>([]);

  onMount(async () => {
    try {
      loading = true;
      const loadedPaths = await getLearningPaths();
      paths = loadedPaths;

      if (!selectedPathId && loadedPaths.length > 0) {
        selectedPathId = loadedPaths[0]?.id ?? null;
      }

      if (selectedPathId) {
        const progressEntry = await getLearningPathProgress(selectedPathId);
        pathProgress.set(selectedPathId, progressEntry);
        pathProgress = new Map(pathProgress);
        progress = progressEntry;
        lessons = await getLessonsForPath(selectedPathId);
      }
    } catch (e) {
      error = (e as Error).message ?? 'Failed to load navigation data';
    } finally {
      loading = false;
    }
  });

  async function handleSelect(pathId: string) {
    selectedPathId = pathId;
    try {
      loading = true;
      const progressEntry = await getLearningPathProgress(pathId);
      pathProgress.set(pathId, progressEntry);
      pathProgress = new Map(pathProgress);
      progress = progressEntry;
      lessons = await getLessonsForPath(pathId);
    } finally {
      loading = false;
    }
  }

  async function completeNextLesson() {
    if (!selectedPath || lessons.length === 0) return;

    const nextLesson = lessons.find((lesson) => !progress?.completedLessons.includes(lesson.id)) ?? lessons[lessons.length - 1];
    if (!nextLesson) return;
    const updated = await markLessonComplete(selectedPath.id, nextLesson.id);

    pathProgress.set(selectedPath.id, updated);
    pathProgress = new Map(pathProgress);
    progress = updated;
  }
</script>

<div class="test-page">
  <header class="page-header">
    <h1>Learning Path Navigation - Day 4-5 Components</h1>
    <p class="page-subtitle">Testing PathBrowser, LessonList, and ProgressIndicator components</p>
  </header>
  
  {#if loading}
    <div class="loading">Loading navigation…</div>
  {:else if error}
    <div class="error">{error}</div>
  {:else}
    <div class="test-container">
      <div class="column-left">
        <section class="test-section">
          <h2 class="section-title">Available Learning Paths</h2>
          <p class="section-description">Browse and select from available learning paths</p>
          <PathBrowser paths={paths} pathProgress={pathProgress} onPathSelect={handleSelect} />
        </section>
      </div>
      
      <div class="column-right">
        {#if selectedPath}
          <section class="test-section">
            <h2 class="section-title">Path Progress</h2>
            {#if progress}
              <div class="actions">
                <button class="action-btn" on:click={completeNextLesson}>Mark next lesson complete</button>
                <p class="hint">Use this to simulate completion and refresh the progress ring.</p>
              </div>
              <ProgressIndicator
                completed={progress.completedLessons.length}
                total={selectedPath.lessons?.length ?? 0}
                xpEarned={(progress as any).totalXP ?? 0}
                timeSpent={progress.timeSpent ?? (progress.completedLessons.length * (lessons.reduce((sum, l) => sum + (l.duration ?? 15), 0) / lessons.length || 15))}
              />
            {/if}
          </section>
          
          <section class="test-section">
            <h2 class="section-title">Lessons</h2>
            {#if lessons.length > 0}
              <LessonList lessons={lessons} onLessonSelect={() => { /* nav hook */ }} />
            {:else}
              <div class="empty-list">
                <p>No lessons for this path.</p>
              </div>
            {/if}
          </section>
        {:else}
          <div class="placeholder">
            <svg class="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <p>Select a learning path to view progress and lessons</p>
          </div>
        {/if}
      </div>
    </div>
  {/if}
  
  <section class="test-section full-width">
    <h2 class="section-title">Component Testing Notes</h2>
    <div class="testing-notes">
      <div class="note-item">
        <h4>PathBrowser Component</h4>
        <ul>
          <li>✅ Displays learning paths in responsive grid</li>
          <li>✅ Filter by difficulty level</li>
          <li>✅ Shows completion statistics</li>
          <li>✅ Selection state management</li>
        </ul>
      </div>
      
      <div class="note-item">
        <h4>ProgressIndicator Component</h4>
        <ul>
          <li>✅ Animated progress bar</li>
          <li>✅ Status indicators (Not started, In progress, Almost done, Completed)</li>
          <li>✅ Metrics display (remaining, time spent, XP earned)</li>
          <li>✅ Progress breakdown visualization</li>
        </ul>
      </div>
      
      <div class="note-item">
        <h4>PathCard Component (nested in PathBrowser)</h4>
        <ul>
          <li>✅ Individual path cards with metadata</li>
          <li>✅ Circular progress ring visualization</li>
          <li>✅ Difficulty badges with color coding</li>
          <li>✅ Quick action buttons</li>
          <li>✅ Responsive hover states</li>
        </ul>
      </div>
      
      <div class="note-item">
        <h4>LessonList Component (ready for integration)</h4>
        <ul>
          <li>✅ Lists lessons in learning path</li>
          <li>✅ Shows completion status with visual indicators</li>
          <li>✅ Displays lesson metadata (difficulty, time, vocabulary count)</li>
          <li>✅ Navigation and progress tracking</li>
        </ul>
      </div>
    </div>
  </section>
</div>

<style>
  .test-page {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 2rem;
    background: var(--color-background, #f9fafb);
    min-height: 100vh;
  }
  
  .page-header {
    text-align: center;
    padding-bottom: 1rem;
    border-bottom: 2px solid var(--color-border, #e5e7eb);
  }
  
  .page-header h1 {
    margin: 0 0 0.5rem 0;
    font-size: 2rem;
    color: var(--color-text-primary, #111827);
  }
  
  .page-subtitle {
    margin: 0;
    font-size: 1rem;
    color: var(--color-text-secondary, #6b7280);
  }
  
  .test-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
  
  .column-left,
  .column-right {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  
  .test-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    background: var(--color-surface, #ffffff);
    padding: 1.5rem;
    border-radius: 0.75rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .test-section.full-width {
    grid-column: 1 / -1;
  }
  
  .section-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-text-primary, #111827);
  }
  
  .section-description {
    margin: 0;
    font-size: 0.875rem;
    color: var(--color-text-secondary, #6b7280);
  }
  
  .placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 3rem 1rem;
    text-align: center;
    color: var(--color-text-secondary, #6b7280);
    background: var(--color-background, #f9fafb);
    border-radius: 0.75rem;
    border: 2px dashed var(--color-border, #d1d5db);
  }
  
  .placeholder-icon {
    width: 3rem;
    height: 3rem;
    opacity: 0.5;
  }
  
  .path-details {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .detail-row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.75rem;
    background: var(--color-background, #f9fafb);
    border-radius: 0.5rem;
  }
  
  .detail-label {
    font-weight: 600;
    color: var(--color-text-secondary, #6b7280);
    min-width: 100px;
  }
  
  .detail-value {
    color: var(--color-text-primary, #111827);
    text-align: right;
    flex: 1;
  }
  
  .detail-value.difficulty {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background: var(--color-primary-light, #dbeafe);
    color: var(--color-primary-dark, #075985);
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 600;
  }
  
  .testing-notes {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }
  
  .note-item {
    padding: 1rem;
    background: var(--color-background, #f9fafb);
    border-left: 3px solid var(--color-primary, #3b82f6);
    border-radius: 0.5rem;
  }
  
  .note-item h4 {
    margin: 0 0 0.75rem 0;
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--color-text-primary, #111827);
  }
  
  .note-item ul {
    margin: 0;
    padding-left: 1.5rem;
    list-style: none;
  }
  
  .note-item li {
    margin: 0.5rem 0;
    font-size: 0.875rem;
    color: var(--color-text-secondary, #6b7280);
  }
  
  .note-item li:before {
    content: '✓ ';
    color: var(--color-success, #10b981);
    font-weight: 600;
    margin-right: 0.5rem;
  }

  .actions {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    flex-wrap: wrap;
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
  
  @media (max-width: 1024px) {
    .test-container {
      grid-template-columns: 1fr;
    }
  }
  
  @media (max-width: 640px) {
    .test-page {
      padding: 1rem;
      gap: 1rem;
    }
    
    .page-header h1 {
      font-size: 1.5rem;
    }
    
    .test-section {
      padding: 1rem;
    }
    
    .testing-notes {
      grid-template-columns: 1fr;
    }
  }
</style>
