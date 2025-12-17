<script lang="ts">
  import type { Lesson, LessonProgress } from '$lib/types/lesson';
  
  interface Props {
    lessons: Lesson[];
    lessonProgress?: Map<string, LessonProgress>;
    onLessonSelect?: (lessonId: string) => void;
    currentLessonId?: string | undefined;
  }
  
  let { 
    lessons = [], 
    lessonProgress = new Map(), 
    onLessonSelect,
    currentLessonId 
  }: Props = $props();
  
  // Derived: lessons with completion status
  const lessonsWithStatus = $derived(lessons.map(lesson => {
    const progress = lessonProgress.get(lesson.id);
    const isCompleted = progress?.completed ?? false;
    const isCurrent = lesson.id === currentLessonId;
    
    return {
      ...lesson,
      isCompleted,
      isCurrent,
      progress: progress
    };
  }));
  
  // Derived: completion stats
  const stats = $derived.by(() => {
    const total = lessons.length;
    const completed = lessonsWithStatus.filter(l => l.isCompleted).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, percentage };
  });
  
  const handleLessonClick = (lessonId: string) => {
    onLessonSelect?.(lessonId);
  };
</script>

<div class="lesson-list">
  <div class="list-header">
    <h3 class="list-title">Lessons</h3>
    
    <div class="completion-badge">
      <span class="badge-text">{stats.completed}/{stats.total}</span>
      <span class="badge-label">lessons completed</span>
    </div>
  </div>
  
  {#if lessons.length === 0}
    <div class="empty-list">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
      </svg>
      <p>No lessons in this path</p>
    </div>
  {:else}
    <div class="lessons-container">
      {#each lessonsWithStatus as lesson, index (lesson.id)}
        <div class="lesson-item" class:completed={lesson.isCompleted} class:current={lesson.isCurrent}>
          <div class="lesson-number">
            {#if lesson.isCompleted}
              <span class="checkmark">✓</span>
            {:else}
              <span class="number">{index + 1}</span>
            {/if}
          </div>
          
          <div class="lesson-content">
            <div class="lesson-header">
              <h4 class="lesson-title">{lesson.title}</h4>
              {#if lesson.subtitle}
                <p class="lesson-description">{lesson.subtitle}</p>
              {/if}
            </div>
            
            <div class="lesson-meta">
              {#if lesson.difficulty}
                <span class="meta-tag" data-difficulty={lesson.difficulty}>
                  {lesson.difficulty}
                </span>
              {/if}
              
              {#if lesson.duration}
                <span class="meta-tag">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  {lesson.duration} min
                </span>
              {/if}
              
              {#if lesson.vocabularyIds?.length}
                <span class="meta-tag">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                  {lesson.vocabularyIds.length} words
                </span>
              {/if}
            </div>
          </div>
          
          <button
            class="lesson-btn"
            onclick={() => handleLessonClick(lesson.id)}
            aria-label={`${lesson.isCompleted ? 'Review' : 'Start'} ${lesson.title}`}
          >
            {#if lesson.isCompleted}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Done
            {:else}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
              {lesson.isCurrent ? 'Continue' : 'Start'}
            {/if}
          </button>
        </div>
        
        {#if index < lessonsWithStatus.length - 1}
          <div class="lesson-divider"></div>
        {/if}
      {/each}
    </div>
    
    <div class="list-footer">
      <div class="progress-bar">
        <div class="progress-fill" style="width: {stats.percentage}%"></div>
      </div>
      <span class="progress-text">{stats.percentage}% complete</span>
    </div>
  {/if}
</div>

<style>
  .lesson-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
    background: var(--color-surface, #ffffff);
    border-radius: 0.75rem;
    border: 1px solid var(--color-border, #e5e7eb);
  }
  
  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--color-border, #e5e7eb);
  }
  
  .list-title {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-text-primary, #111827);
  }
  
  .completion-badge {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
  }
  
  .badge-text {
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-primary, #3b82f6);
  }
  
  .badge-label {
    font-size: 0.75rem;
    color: var(--color-text-secondary, #6b7280);
  }
  
  .empty-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 2rem 1rem;
    text-align: center;
    color: var(--color-text-secondary, #6b7280);
  }
  
  .empty-icon {
    width: 2rem;
    height: 2rem;
    opacity: 0.5;
  }
  
  .lessons-container {
    display: flex;
    flex-direction: column;
  }
  
  .lesson-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    border-radius: 0.5rem;
    transition: background 0.2s;
  }
  
  .lesson-item:hover {
    background: var(--color-hover, #f3f4f6);
  }
  
  .lesson-item.current {
    background: var(--color-primary-light, #eff6ff);
    border-left: 3px solid var(--color-primary, #3b82f6);
    padding-left: calc(1rem - 3px);
  }
  
  .lesson-item.completed .lesson-title {
    text-decoration: line-through;
    opacity: 0.7;
  }
  
  .lesson-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    min-width: 2rem;
    border-radius: 50%;
    background: var(--color-border, #e5e7eb);
    color: var(--color-text-secondary, #6b7280);
    font-size: 0.875rem;
    font-weight: 600;
  }
  
  .lesson-item.completed .lesson-number {
    background: var(--color-success, #10b981);
    color: white;
  }
  
  .lesson-item.current .lesson-number {
    background: var(--color-primary, #3b82f6);
    color: white;
  }
  
  .checkmark {
    font-size: 1rem;
  }
  
  .lesson-content {
    flex: 1;
    min-width: 0;
  }
  
  .lesson-header {
    margin-bottom: 0.5rem;
  }
  
  .lesson-title {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--color-text-primary, #111827);
  }
  
  .lesson-description {
    margin: 0.25rem 0 0 0;
    font-size: 0.8rem;
    color: var(--color-text-secondary, #6b7280);
  }
  
  .lesson-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .meta-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.625rem;
    background: var(--color-background, #f9fafb);
    border-radius: 9999px;
    font-size: 0.75rem;
    color: var(--color-text-secondary, #6b7280);
    white-space: nowrap;
  }
  
  .meta-tag[data-difficulty='beginner'] {
    background: #dbeafe;
    color: #075985;
  }
  
  .meta-tag[data-difficulty='intermediate'] {
    background: #fef08a;
    color: #713f12;
  }
  
  .meta-tag[data-difficulty='advanced'] {
    background: #fed7aa;
    color: #92400e;
  }
  
  .lesson-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: var(--color-primary, #3b82f6);
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.8rem;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .lesson-btn:hover {
    background: var(--color-primary-dark, #2563eb);
  }
  
  .lesson-item.completed .lesson-btn {
    background: var(--color-success, #10b981);
  }
  
  .lesson-item.completed .lesson-btn:hover {
    background: var(--color-success-dark, #059669);
  }
  
  .lesson-btn svg {
    width: 1rem;
    height: 1rem;
  }
  
  .lesson-divider {
    height: 1px;
    background: var(--color-border, #e5e7eb);
    margin: 0.5rem 0;
  }
  
  .list-footer {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding-top: 1rem;
    border-top: 1px solid var(--color-border, #e5e7eb);
  }
  
  .progress-bar {
    width: 100%;
    height: 0.375rem;
    background: var(--color-border, #e5e7eb);
    border-radius: 9999px;
    overflow: hidden;
  }
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--color-success, #10b981), var(--color-primary, #3b82f6));
    transition: width 0.3s;
  }
  
  .progress-text {
    font-size: 0.75rem;
    color: var(--color-text-secondary, #6b7280);
    text-align: right;
  }
  
  @media (max-width: 640px) {
    .lesson-list {
      padding: 1rem;
      gap: 0.75rem;
    }
    
    .list-header {
      padding-bottom: 0.75rem;
    }
    
    .lesson-item {
      padding: 0.75rem;
      gap: 0.75rem;
    }
    
    .lesson-btn {
      padding: 0.5rem;
      width: auto;
    }
  }
</style>
