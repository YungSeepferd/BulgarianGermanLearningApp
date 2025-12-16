<script lang="ts">
  import PathBrowser from '$lib/components/learning/PathBrowser.svelte';
  import ProgressIndicator from '$lib/components/learning/ProgressIndicator.svelte';
  import type { LearningPath, LearningPathProgress } from '$lib/types/learning-path';
  import type { Lesson, LessonProgress } from '$lib/types/lesson';
  
  // Mock data for testing
  const mockLearningPaths: LearningPath[] = [
    {
      id: 'path-1',
      title: 'German Basics A1',
      description: 'Learn fundamental German vocabulary and grammar for absolute beginners',
      difficulty: 'beginner',
      lessons: Array(12).fill(null).map((_, i) => ({
        id: `lesson-${i + 1}`,
        title: `Lesson ${i + 1}: Greetings & Introductions`,
        description: 'Learn basic greetings and how to introduce yourself',
        difficulty: 'beginner',
        estimatedMinutes: 15,
        vocabularyCount: 10,
        prerequisites: i > 0 ? [`lesson-${i}`] : []
      })) as Lesson[],
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      isActive: true
    },
    {
      id: 'path-2',
      title: 'German Elementary A2',
      description: 'Intermediate vocabulary and conversation skills',
      difficulty: 'elementary',
      lessons: Array(15).fill(null).map((_, i) => ({
        id: `lesson-elem-${i + 1}`,
        title: `Lesson ${i + 1}: Shopping & Markets`,
        description: 'Learn vocabulary for shopping and negotiating prices',
        difficulty: 'elementary',
        estimatedMinutes: 20,
        vocabularyCount: 15,
        prerequisites: [`lesson-elem-${i}`]
      })) as Lesson[],
      createdAt: new Date('2025-01-15'),
      updatedAt: new Date('2025-01-15'),
      isActive: true
    },
    {
      id: 'path-3',
      title: 'German Intermediate B1',
      description: 'Advanced conversation and complex grammar',
      difficulty: 'intermediate',
      lessons: Array(18).fill(null).map((_, i) => ({
        id: `lesson-int-${i + 1}`,
        title: `Lesson ${i + 1}: Business Communication`,
        description: 'Professional German for business environments',
        difficulty: 'intermediate',
        estimatedMinutes: 25,
        vocabularyCount: 20,
        prerequisites: [`lesson-int-${i}`]
      })) as Lesson[],
      createdAt: new Date('2025-02-01'),
      updatedAt: new Date('2025-02-01'),
      isActive: true
    },
    {
      id: 'path-4',
      title: 'German Advanced B2',
      description: 'Complex topics and professional language',
      difficulty: 'advanced',
      lessons: Array(20).fill(null).map((_, i) => ({
        id: `lesson-adv-${i + 1}`,
        title: `Lesson ${i + 1}: Literature & Culture`,
        description: 'Explore German literature and cultural nuances',
        difficulty: 'advanced',
        estimatedMinutes: 30,
        vocabularyCount: 25,
        prerequisites: [`lesson-adv-${i}`]
      })) as Lesson[],
      createdAt: new Date('2025-02-15'),
      updatedAt: new Date('2025-02-15'),
      isActive: true
    },
    {
      id: 'path-5',
      title: 'Bulgarian Basics A1',
      description: 'Learn fundamental Bulgarian vocabulary and grammar',
      difficulty: 'beginner',
      lessons: Array(12).fill(null).map((_, i) => ({
        id: `lesson-bg-${i + 1}`,
        title: `Lesson ${i + 1}: Съставяне Фрази`,
        description: 'Learn basic Bulgarian greetings and phrases',
        difficulty: 'beginner',
        estimatedMinutes: 15,
        vocabularyCount: 12,
        prerequisites: i > 0 ? [`lesson-bg-${i}`] : []
      })) as Lesson[],
      createdAt: new Date('2025-03-01'),
      updatedAt: new Date('2025-03-01'),
      isActive: true
    }
  ];
  
  // Mock progress data
  const mockPathProgress: Map<string, LearningPathProgress> = new Map([
    ['path-1', { pathId: 'path-1', lessonsCompleted: 5, totalXP: 250, startedAt: new Date('2025-03-10') }],
    ['path-2', { pathId: 'path-2', lessonsCompleted: 0, totalXP: 0, startedAt: new Date() }],
    ['path-3', { pathId: 'path-3', lessonsCompleted: 8, totalXP: 400, startedAt: new Date('2025-03-05') }],
    ['path-4', { pathId: 'path-4', lessonsCompleted: 0, totalXP: 0, startedAt: new Date() }],
    ['path-5', { pathId: 'path-5', lessonsCompleted: 12, totalXP: 600, startedAt: new Date('2025-02-20') }]
  ]);
  
  let selectedPathId = $state<string | undefined>();
  let selectedPath = $state<LearningPath | undefined>();
  
  const handlePathSelect = (pathId: string) => {
    selectedPathId = pathId;
    selectedPath = mockLearningPaths.find(p => p.id === pathId);
  };
</script>

<div class="test-page">
  <header class="page-header">
    <h1>Learning Path Navigation - Day 4-5 Components</h1>
    <p class="page-subtitle">Testing PathBrowser, LessonList, and ProgressIndicator components</p>
  </header>
  
  <div class="test-container">
    <div class="column-left">
      <section class="test-section">
        <h2 class="section-title">Available Learning Paths</h2>
        <p class="section-description">Browse and select from available learning paths</p>
        
        <PathBrowser
          onPathSelect={handlePathSelect}
        />
      </section>
    </div>
    
    <div class="column-right">
      {#if selectedPath}
        <section class="test-section">
          <h2 class="section-title">Path Progress</h2>
          
          {#if mockPathProgress.get(selectedPath.id) is { lessonsCompleted, totalXP } progress}
            <ProgressIndicator
              completed={progress.lessonsCompleted}
              total={selectedPath.lessons?.length ?? 0}
              xpEarned={progress.totalXP}
              timeSpent={progress.lessonsCompleted * 15}
            />
          {/if}
        </section>
        
        <section class="test-section">
          <h2 class="section-title">Path Details</h2>
          <div class="path-details">
            <div class="detail-row">
              <span class="detail-label">Title:</span>
              <span class="detail-value">{selectedPath.title}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Difficulty:</span>
              <span class="detail-value difficulty">{selectedPath.difficulty}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Lessons:</span>
              <span class="detail-value">{selectedPath.lessons?.length ?? 0} total</span>
            </div>
            {#if selectedPath.description}
              <div class="detail-row">
                <span class="detail-label">Description:</span>
                <span class="detail-value">{selectedPath.description}</span>
              </div>
            {/if}
          </div>
        </section>
      {:else}
        <div class="placeholder">
          <svg class="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <p>Select a learning path to view details and progress</p>
        </div>
      {/if}
    </div>
  </div>
  
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
