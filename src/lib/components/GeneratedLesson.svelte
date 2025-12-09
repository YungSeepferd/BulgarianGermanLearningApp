<script lang="ts">
  /**
   * GeneratedLesson Component
   *
   * Displays a dynamically generated lesson with all its sections and content.
   * Supports different section types (introduction, vocabulary, grammar, exercise, cultural, summary)
   * and provides a rich, interactive learning experience.
   */

  import { z } from 'zod';
  import { LessonSchema, type Lesson, type LessonSection, type LearningObjective } from '$lib/schemas/lesson';
  import { Button } from '$lib/components/ui/button';
  import { Progress } from '$lib/components/ui/progress';

  // Props
  let { lesson } = $props<{ lesson: Lesson }>();

  // State
  let currentSectionIndex = $state(0);
  let showAllVocabulary = $state(false);
  let showAllObjectives = $state(false);
  let showSectionDetails = $state<Record<string, boolean>>({});

  // Computed
  $: currentSection = $derived(lesson.sections[currentSectionIndex] || null);
  $: completionPercentage = $derived(
    Math.round((lesson.objectives.filter(obj => obj.isCompleted).length / lesson.objectives.length) * 100)
  );
  $: vocabularyItems = $derived(lesson.vocabulary || []);
  $: hasVocabulary = $derived(vocabularyItems.length > 0);
  $: hasObjectives = $derived(lesson.objectives.length > 0);
  $: hasSections = $derived(lesson.sections.length > 0);
  $: isFallbackLesson = $derived(lesson.metadata?.fallback === true);

  // Methods
  function toggleObjective(objectiveId: string) {
    lesson.objectives = lesson.objectives.map(obj =>
      obj.id === objectiveId ? { ...obj, isCompleted: !obj.isCompleted } : obj
    );
    lesson.updatedAt = new Date();
  }

  function nextSection() {
    if (currentSectionIndex < lesson.sections.length - 1) {
      currentSectionIndex++;
    }
  }

  function prevSection() {
    if (currentSectionIndex > 0) {
      currentSectionIndex--;
    }
  }

  function toggleSectionDetails(sectionId: string) {
    showSectionDetails[sectionId] = !showSectionDetails[sectionId];
  }

  function getSectionIcon(type: string): string {
    const icons: Record<string, string> = {
      'introduction': '📘',
      'vocabulary': '📚',
      'grammar': '📖',
      'exercise': '✏️',
      'cultural': '🏛️',
      'summary': '📝',
      'conversation': '💬',
      'reading': '📄',
      'listening': '🔊',
      'writing': '✍️'
    };
    return icons[type] || '📖';
  }

  function getDifficultyColor(difficulty: string): string {
    const colors: Record<string, string> = {
      'A1': 'bg-green-100 text-green-800 border-green-300',
      'A2': 'bg-green-200 text-green-900 border-green-400',
      'B1': 'bg-blue-100 text-blue-800 border-blue-300',
      'B2': 'bg-blue-200 text-blue-900 border-blue-400',
      'C1': 'bg-purple-100 text-purple-800 border-purple-300'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800 border-gray-300';
  }

  function getLessonTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'vocabulary': '📚',
      'grammar': '📖',
      'conversation': '💬',
      'reading': '📄',
      'listening': '🔊',
      'writing': '✍️',
      'culture': '🏛️',
      'mixed': '🎯',
      'contextual': '🌍'
    };
    return icons[type] || '📚';
  }

  function getSectionTypeName(type: string): string {
    const names: Record<string, string> = {
      'introduction': 'Introduction',
      'vocabulary': 'Vocabulary',
      'grammar': 'Grammar',
      'exercise': 'Exercise',
      'cultural': 'Cultural Note',
      'summary': 'Summary',
      'conversation': 'Conversation',
      'reading': 'Reading',
      'listening': 'Listening',
      'writing': 'Writing'
    };
    return names[type] || type;
  }

  function renderSectionContent(content: string): string {
    // Simple markdown-like rendering for basic formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  function getVocabularyPreview(count: number): string {
    if (vocabularyItems.length === 0) return '';

    const previewItems = vocabularyItems.slice(0, count);
    return previewItems.map(item => item.german).join(', ');
  }
</script>

<div class="generated-lesson-container">
  {#if isFallbackLesson}
    <div class="fallback-lesson-message">
      <div class="fallback-icon">⚠️</div>
      <h3>Lesson Unavailable</h3>
      <p>{lesson.description}</p>
      <Button variant="secondary" on:click={() => window.location.reload()}>
        Try Again
      </Button>
    </div>
  {:else}
    <div class="lesson-header">
      <div class="lesson-title-section">
        <div class="lesson-type-icon" aria-label={`Lesson type: ${lesson.type}`}>
          {getLessonTypeIcon(lesson.type)}
        </div>
        <h1 class="lesson-title">{lesson.title}</h1>
      </div>

      <div class="lesson-meta">
        <div class="lesson-badge {getDifficultyColor(lesson.difficulty)}">
          {lesson.difficulty} • {lesson.duration} min
        </div>
        {#if lesson.metadata?.tags && lesson.metadata.tags.length > 0}
          <div class="lesson-tags">
            {#each lesson.metadata.tags.slice(0, 3) as tag}
              <span class="lesson-tag">{tag}</span>
            {/each}
            {#if lesson.metadata.tags.length > 3}
              <span class="lesson-tag more">+{lesson.metadata.tags.length - 3}</span>
            {/if}
          </div>
        {/if}
      </div>
    </div>

    <div class="lesson-description">
      {lesson.description}
    </div>

    <div class="lesson-progress-container">
      <Progress value={completionPercentage} />
      <span class="progress-text">{completionPercentage}% complete</span>
    </div>

    {#if hasObjectives}
      <div class="lesson-objectives">
        <div class="objectives-header">
          <h3>Learning Objectives</h3>
          <button
            class="toggle-objectives"
            on:click={() => showAllObjectives = !showAllObjectives}
          >
            {showAllObjectives ? 'Show Less' : 'Show All'}
          </button>
        </div>

        <ul class="objectives-list">
          {#each (showAllObjectives ? lesson.objectives : lesson.objectives.slice(0, 3)) as objective (objective.id)}
            <li class="objective-item">
              <label class="objective-checkbox">
                <input
                  type="checkbox"
                  checked={objective.isCompleted}
                  on:change={() => toggleObjective(objective.id)}
                />
                <span class:completed={objective.isCompleted}>
                  {objective.description}
                </span>
              </label>
            </li>
          {/each}
          {#if lesson.objectives.length > 3 && !showAllObjectives}
            <li class="objective-item more-objectives">
              <button on:click={() => showAllObjectives = true}>
                +{lesson.objectives.length - 3} more objectives
              </button>
            </li>
          {/if}
        </ul>
      </div>
    {/if}

    {#if hasVocabulary}
      <div class="lesson-vocabulary">
        <div class="vocabulary-header">
          <h3>Vocabulary ({vocabularyItems.length})</h3>
          <button
            class="toggle-vocabulary"
            on:click={() => showAllVocabulary = !showAllVocabulary}
          >
            {showAllVocabulary ? 'Show Less' : 'Show All'}
          </button>
        </div>

        <div class="vocabulary-preview">
          {getVocabularyPreview(showAllVocabulary ? vocabularyItems.length : 5)}
          {#if vocabularyItems.length > 5 && !showAllVocabulary}
            <span class="more-vocabulary">+{vocabularyItems.length - 5} more</span>
          {/if}
        </div>

        {#if showAllVocabulary}
          <div class="vocabulary-list">
            {#each vocabularyItems as vocab}
              <div class="vocabulary-item">
                <div class="vocabulary-german">{vocab.german}</div>
                <div class="vocabulary-bulgarian">{vocab.bulgarian}</div>
                {#if vocab.partOfSpeech}
                  <div class="vocabulary-part-of-speech">
                    {vocab.partOfSpeech}
                  </div>
                {/if}
                {#if vocab.difficulty}
                  <div class="vocabulary-difficulty">
                    {'⭐'.repeat(Math.round(vocab.difficulty))}
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}

    {#if hasSections}
      <div class="lesson-sections">
        <div class="sections-navigation">
          <button
            on:click={prevSection}
            disabled={currentSectionIndex === 0}
            aria-label="Previous section"
          >
            ◀️ Previous
          </button>

          <div class="section-indicator">
            Section {currentSectionIndex + 1} of {lesson.sections.length}
          </div>

          <button
            on:click={nextSection}
            disabled={currentSectionIndex === lesson.sections.length - 1}
            aria-label="Next section"
          >
            Next ▶️
          </button>
        </div>

        <div class="section-content">
          <div class="section-header">
            <div class="section-icon">
              {getSectionIcon(currentSection.type)}
            </div>
            <h2 class="section-title">
              {currentSection.title}
            </h2>
            <div class="section-type">
              {getSectionTypeName(currentSection.type)}
            </div>
          </div>

          <div class="section-body">
            <div class="section-content-text" innerHTML={renderSectionContent(currentSection.content)} />

            {#if currentSection.metadata?.templateId}
              <div class="section-meta">
                <span class="template-id">
                  Template: {currentSection.metadata.templateId}
                </span>
              </div>
            {/if}
          </div>
        </div>

        <div class="sections-overview">
          <h3>Lesson Sections</h3>
          <div class="sections-list">
            {#each lesson.sections as section, index (section.id)}
              <div
                class="section-overview-item {index === currentSectionIndex ? 'active' : ''}"
                on:click={() => currentSectionIndex = index}
              >
                <div class="section-overview-icon">
                  {getSectionIcon(section.type)}
                </div>
                <div class="section-overview-title">
                  {section.title}
                </div>
                <div class="section-overview-type">
                  {getSectionTypeName(section.type)}
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    {:else}
      <div class="no-sections-message">
        This lesson doesn't have any sections yet.
      </div>
    {/if}

    <div class="lesson-actions">
      <Button variant="secondary" on:click={() => window.history.back()}>
        Back to Lessons
      </Button>
      <Button variant="default" on:click={() => alert('Lesson started!')}>
        Start Lesson
      </Button>
    </div>
  {/if}
</div>

<style>
  .generated-lesson-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .fallback-lesson-message {
    text-align: center;
    padding: 2rem;
    background: #fef2f2;
    border-radius: 12px;
    margin: 2rem 0;
  }

  .fallback-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .lesson-header {
    margin-bottom: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .lesson-title-section {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .lesson-type-icon {
    font-size: 2rem;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(59, 130, 246, 0.1);
  }

  .lesson-title {
    font-size: 2rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }

  .lesson-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
  }

  .lesson-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 600;
    border: 1px solid;
    display: inline-block;
  }

  .lesson-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .lesson-tag {
    padding: 0.25rem 0.75rem;
    background: #f1f5f9;
    border-radius: 20px;
    font-size: 0.75rem;
    color: #475569;
    border: 1px solid #e2e8f0;
  }

  .lesson-tag.more {
    background: #e2e8f0;
  }

  .lesson-description {
    color: #64748b;
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }

  .lesson-progress-container {
    margin-bottom: 2rem;
  }

  .progress-text {
    display: block;
    text-align: right;
    font-size: 0.875rem;
    color: #64748b;
    margin-top: 0.5rem;
  }

  .lesson-objectives {
    background: #f8fafc;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .objectives-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .objectives-header h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }

  .toggle-objectives {
    background: none;
    border: none;
    color: #3b82f6;
    cursor: pointer;
    font-size: 0.875rem;
    text-decoration: underline;
  }

  .objectives-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .objective-item {
    margin-bottom: 0.75rem;
    padding: 0.5rem 0;
  }

  .objective-item:last-child {
    margin-bottom: 0;
  }

  .objective-checkbox {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
  }

  .objective-checkbox input {
    margin: 0;
  }

  .objective-checkbox span {
    font-size: 0.95rem;
    color: #475569;
  }

  .objective-checkbox span.completed {
    text-decoration: line-through;
    color: #94a3b8;
  }

  .more-objectives {
    color: #3b82f6;
    font-size: 0.875rem;
  }

  .more-objectives button {
    background: none;
    border: none;
    color: #3b82f6;
    cursor: pointer;
    text-decoration: underline;
    padding: 0;
  }

  .lesson-vocabulary {
    background: #f8fafc;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .vocabulary-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .vocabulary-header h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }

  .toggle-vocabulary {
    background: none;
    border: none;
    color: #3b82f6;
    cursor: pointer;
    font-size: 0.875rem;
    text-decoration: underline;
  }

  .vocabulary-preview {
    font-size: 0.95rem;
    color: #475569;
    line-height: 1.5;
  }

  .more-vocabulary {
    color: #3b82f6;
    font-size: 0.875rem;
  }

  .vocabulary-list {
    margin-top: 1rem;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  .vocabulary-item {
    background: white;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .vocabulary-german {
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 0.5rem;
  }

  .vocabulary-bulgarian {
    color: #3b82f6;
    margin-bottom: 0.5rem;
  }

  .vocabulary-part-of-speech {
    font-size: 0.75rem;
    color: #64748b;
    background: #f1f5f9;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    display: inline-block;
    margin-right: 0.5rem;
  }

  .vocabulary-difficulty {
    font-size: 0.75rem;
    color: #f59e0b;
  }

  .lesson-sections {
    margin-bottom: 2rem;
  }

  .sections-navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .sections-navigation button {
    padding: 0.5rem 1rem;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .sections-navigation button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .section-indicator {
    font-size: 0.875rem;
    color: #64748b;
  }

  .section-content {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 1rem;
  }

  .section-icon {
    font-size: 1.5rem;
  }

  .section-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
    flex: 1;
  }

  .section-type {
    padding: 0.25rem 0.75rem;
    background: #f1f5f9;
    border-radius: 20px;
    font-size: 0.75rem;
    color: #475569;
  }

  .section-body {
    line-height: 1.7;
  }

  .section-content-text {
    font-size: 1rem;
    color: #334155;
  }

  .section-content-text :global(strong) {
    font-weight: 600;
    color: #1e293b;
  }

  .section-content-text :global(em) {
    font-style: italic;
  }

  .section-content-text :global(code) {
    background: #f1f5f9;
    padding: 0.1rem 0.3rem;
    border-radius: 4px;
    font-family: monospace;
  }

  .section-meta {
    margin-top: 1rem;
    font-size: 0.75rem;
    color: #94a3b8;
  }

  .sections-overview {
    margin-top: 2rem;
  }

  .sections-overview h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 1rem;
  }

  .sections-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }

  .section-overview-item {
    background: #f8fafc;
    border-radius: 8px;
    padding: 1rem;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .section-overview-item:hover {
    background: #f1f5f9;
  }

  .section-overview-item.active {
    background: #e2e8f0;
    border-left: 3px solid #3b82f6;
  }

  .section-overview-icon {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }

  .section-overview-title {
    font-weight: 500;
    color: #1e293b;
    margin-bottom: 0.25rem;
  }

  .section-overview-type {
    font-size: 0.75rem;
    color: #64748b;
  }

  .no-sections-message {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 1rem;
  }

  .lesson-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
  }

  @media (max-width: 768px) {
    .generated-lesson-container {
      padding: 1rem;
    }

    .lesson-title {
      font-size: 1.5rem;
    }

    .sections-list {
      grid-template-columns: 1fr;
    }

    .vocabulary-list {
      grid-template-columns: 1fr;
    }

    .lesson-actions {
      flex-direction: column;
    }
  }
</style>