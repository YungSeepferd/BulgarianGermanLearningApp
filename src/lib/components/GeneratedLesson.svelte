<script>
  /**
   * GeneratedLesson Component
   *
   * Displays a dynamically generated lesson with all its sections and content.
   * Supports different section types (introduction, vocabulary, grammar, exercise, cultural, summary)
   * and provides a rich, interactive learning experience with bilingual support.
   */

  import { t } from '$lib/services/localization';
  import { appState } from '$lib/state/app-state';

  // Language adapter functions
  function getSourceText(item) {
    return appState.languageMode === 'DE_BG' ? item.german : item.bulgarian;
  }

  function getTargetText(item) {
    return appState.languageMode === 'DE_BG' ? item.bulgarian : item.german;
  }

  function correctPartOfSpeech(pos) {
    const parts = {
      'noun': 'Noun', 'verb': 'Verb', 'adjective': 'Adjective',
      'adverb': 'Adverb', 'preposition': 'Preposition', 'conjunction': 'Conjunction'
    };
    return parts[pos] || pos;
  }

  // Props
  let { lesson } = $props();

  // Error state
  let hasError = $state(false);
  let errorMessage = $state(null);

  // Simple error handler
  function handleError(error, context) {
    console.error(`[${context}]`, error);
  }

  // State
  let currentSectionIndex = $state(0);
  let showAllVocabulary = $state(false);
  let showAllObjectives = $state(false);
  let showSectionDetails = $state({});

  // Initialize with error handling
  $effect(() => {
    try {
      // Validate lesson data on initialization
      if (!lesson) {
        throw new Error('Lesson data is required');
      }
    } catch (err) {
      handleError(err, 'Failed to initialize GeneratedLesson component');
      hasError = true;
      errorMessage = err instanceof Error ? err.message : 'Invalid lesson data';
    }
  });

  // Computed
  // Derived state with error handling
  let sections = $derived.by(() => {
    try {
      if (!lesson.sections || lesson.sections.length === 0) {
        return [{
          id: 'default-section',
          title: 'Lesson Content',
          content: lesson.content || 'No content available',
          type: 'summary',
          metadata: {}
        }];
      }
      return lesson.sections;
    } catch (err) {
      handleError(err, 'Failed to derive lesson sections');
      hasError = true;
      errorMessage = 'Failed to load lesson sections';
      return [{
        id: 'error-section',
        title: 'Error',
        content: 'Failed to load lesson content',
        type: 'summary',
        metadata: {}
      }];
    }
  });

  // Current section with error handling
  let currentSection = $derived.by(() => {
    try {
      return sections[currentSectionIndex] || null;
    } catch (err) {
      handleError(err, 'Failed to get current section');
      hasError = true;
      errorMessage = 'Failed to load section content';
      return null;
    }
  });
  // Completion percentage with error handling
  let completionPercentage = $derived.by(() => {
    try {
      if (!lesson.objectives || lesson.objectives.length === 0) return 0;
      return Math.round((lesson.objectives.filter((obj) => obj.isCompleted).length / lesson.objectives.length) * 100);
    } catch (err) {
      handleError(err, 'Failed to calculate completion percentage');
      hasError = true;
      errorMessage = 'Failed to calculate progress';
      return 0;
    }
  });
  // Vocabulary items with error handling
  let vocabularyItems = $derived.by(() => {
    try {
      return lesson.vocabulary || [];
    } catch (err) {
      handleError(err, 'Failed to load vocabulary items');
      hasError = true;
      errorMessage = 'Failed to load vocabulary';
      return [];
    }
  });
  // Derived boolean states with error handling
  let hasVocabulary = $derived.by(() => {
    try {
      return vocabularyItems.length > 0;
    } catch (err) {
      handleError(err, 'Failed to check vocabulary availability');
      return false;
    }
  });

  let hasObjectives = $derived.by(() => {
    try {
      return lesson.objectives && lesson.objectives.length > 0;
    } catch (err) {
      handleError(err, 'Failed to check objectives availability');
      return false;
    }
  });

  let hasSections = $derived.by(() => {
    try {
      return sections.length > 0;
    } catch (err) {
      handleError(err, 'Failed to check sections availability');
      return false;
    }
  });

  let isFallbackLesson = $derived.by(() => {
    try {
      return lesson.metadata?.fallback === true;
    } catch (err) {
      handleError(err, 'Failed to check fallback status');
      return false;
    }
  });

  // Methods
  /**
   * Toggle objective completion status with error handling
   */
  function toggleObjective(objectiveId) {
    try {
      if (!lesson.objectives) {
        throw new Error('Lesson objectives are not available');
      }

      lesson.objectives = lesson.objectives.map((obj) =>
        obj.id === objectiveId ? { ...obj, isCompleted: !obj.isCompleted } : obj
      );
      lesson.updatedAt = new Date();
    } catch (err) {
      handleError(err, 'Failed to toggle objective');
      hasError = true;
      errorMessage = 'Failed to update objective status';
    }
  }

  /**
   * Navigate to next section with error handling
   */
  function nextSection() {
    try {
      if (currentSectionIndex < sections.length - 1) {
        currentSectionIndex++;
      }
    } catch (err) {
      handleError(err, 'Failed to navigate to next section');
      hasError = true;
      errorMessage = 'Failed to navigate sections';
    }
  }

  /**
   * Navigate to previous section with error handling
   */
  function prevSection() {
    try {
      if (currentSectionIndex > 0) {
        currentSectionIndex--;
      }
    } catch (err) {
      handleError(err, 'Failed to navigate to previous section');
      hasError = true;
      errorMessage = 'Failed to navigate sections';
    }
  }

  /**
   * Toggle section details visibility with error handling
   */
  function toggleSectionDetails(sectionId) {
    try {
      showSectionDetails[sectionId] = !showSectionDetails[sectionId];
    } catch (err) {
      handleError(err, 'Failed to toggle section details');
      hasError = true;
      errorMessage = 'Failed to toggle section details';
    }
  }

  function getSectionIcon(type) {
    const icons = {
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

  function getDifficultyColor(difficulty) {
    const colors = {
      'A1': 'bg-green-100 text-green-800 border-green-300',
      'A2': 'bg-green-200 text-green-900 border-green-400',
      'B1': 'bg-blue-100 text-blue-800 border-blue-300',
      'B2': 'bg-blue-200 text-blue-900 border-blue-400',
      'C1': 'bg-purple-100 text-purple-800 border-purple-300'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800 border-gray-300';
  }

  function getLessonTypeIcon(type) {
    const icons = {
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

  // Reactive section names using Svelte 5 runes
  const sectionNames = $derived({
    'introduction': t('sections.introduction') || 'Introduction',
    'vocabulary': t('sections.vocabulary') || 'Vocabulary',
    'grammar': t('sections.grammar') || 'Grammar',
    'exercise': t('sections.exercise') || 'Exercise',
    'cultural': t('sections.cultural_note') || 'Cultural Note',
    'summary': t('sections.summary') || 'Summary',
    'conversation': t('sections.conversation') || 'Conversation',
    'reading': t('sections.reading') || 'Reading',
    'listening': t('sections.listening') || 'Listening',
    'writing': t('sections.writing') || 'Writing'
  });

  function getSectionTypeName(type) {
    return sectionNames[type] || type;
  }

  function renderSectionContent(content) {
    // Simple markdown-like rendering for basic formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  function getVocabularyPreview(count) {
    if (vocabularyItems.length === 0) return '';

    const previewItems = vocabularyItems.slice(0, count);
    // Show only the source language based on current direction
    return previewItems.map((item) => getSourceText(item)).join(', ');
  }
</script>

<div class="generated-lesson-container">
  {#if hasError}
    <div class="error-message">
      <div class="error-icon">⚠️</div>
      <h3>{t('errors.lesson_load_error')}</h3>
      <p>{errorMessage || t('errors.unknown_error')}</p>
      <button class="btn btn-secondary" onclick={() => window.location.reload()}>
        {t('common.reload_page')}
      </button>
    </div>
  {:else if isFallbackLesson}
    <div class="fallback-lesson-message">
      <div class="fallback-icon">⚠️</div>
      <h3>{t('lesson.unavailable')}</h3>
      <p>{lesson.description}</p>
      <button class="btn btn-secondary" onclick={() => window.location.reload()}>
        {t('common.try_again')}
      </button>
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
          {lesson.difficulty} • {lesson.duration} {t('common.minutes')}
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
      <div class="progress-bar-container">
        <div
          class="progress-bar"
          style={`width: ${completionPercentage}%`}
          role="progressbar"
          aria-valuenow={completionPercentage}
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>
      <span class="progress-text">{completionPercentage}% complete</span>
    </div>

    {#if hasObjectives}
      <div class="lesson-objectives">
        <div class="objectives-header">
          <h3>{t('sections.learning_objectives')}</h3>
          <button
            class="toggle-objectives"
            onclick={() => showAllObjectives = !showAllObjectives}
          >
            {showAllObjectives ? t('common.show_less') : t('common.show_all')}
          </button>
        </div>

        <ul class="objectives-list">
          {#each (showAllObjectives ? lesson.objectives : lesson.objectives.slice(0, 3)) as objective (objective.id)}
            <li class="objective-item">
              <label class="objective-checkbox">
                <input
                  type="checkbox"
                  checked={objective.isCompleted}
                  onchange={() => toggleObjective(objective.id)}
                />
                <span class:completed={objective.isCompleted}>
                  {objective.description}
                </span>
              </label>
            </li>
          {/each}
          {#if lesson.objectives.length > 3 && !showAllObjectives}
            <li class="objective-item more-objectives">
              <button onclick={() => showAllObjectives = true}>
                +{lesson.objectives.length - 3} {t('common.more_objectives')}
              </button>
            </li>
          {/if}
        </ul>
      </div>
    {/if}

    {#if hasVocabulary}
      <div class="lesson-vocabulary">
        <div class="vocabulary-header">
          <h3>{t('sections.vocabulary')} ({vocabularyItems.length})</h3>
          <button
            class="toggle-vocabulary"
            onclick={() => showAllVocabulary = !showAllVocabulary}
          >
            {showAllVocabulary ? t('common.show_less') : t('common.show_all')}
          </button>
        </div>

        <div class="vocabulary-preview">
          {getVocabularyPreview(showAllVocabulary ? vocabularyItems.length : 5)}
          {#if vocabularyItems.length > 5 && !showAllVocabulary}
            <span class="more-vocabulary">+{vocabularyItems.length - 5} {t('common.more_words')}</span>
          {/if}
        </div>

        {#if showAllVocabulary}
          <div class="vocabulary-list">
            {#each vocabularyItems as vocab (vocab.german)}
              <div class="vocabulary-item">
                <!-- Show source language prominently -->
                <div class="vocabulary-source">
                  {getSourceText(vocab)}
                </div>
                <!-- Show target language on hover/click or as secondary info -->
                <div class="vocabulary-target">
                  {getTargetText(vocab)}
                </div>
                {#if vocab.partOfSpeech}
                  <div class="vocabulary-part-of-speech">
                    {correctPartOfSpeech(vocab.partOfSpeech)}
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
            onclick={prevSection}
            disabled={currentSectionIndex === 0}
            aria-label={t('common.previous_section')}
          >
            ◀️ {t('common.previous')}
          </button>

          <div class="section-indicator">
            {t('common.section')} {currentSectionIndex + 1} {t('common.of')} {sections.length}
          </div>

          <button
            onclick={nextSection}
            disabled={currentSectionIndex === sections.length - 1}
            aria-label={t('common.next_section')}
          >
            {t('common.next')} ▶️
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
            <div class="section-content-text" innerHTML={renderSectionContent(currentSection.content)}></div>

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
            {#each sections as section, index (section.id)}
              <div
                class="section-overview-item {index === currentSectionIndex ? 'active' : ''}"
                onclick={() => currentSectionIndex = index}
                role="button"
                tabindex="0"
                onkeydown={e => e.key === 'Enter' || e.key === ' ' ? currentSectionIndex = index : null}
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
        {t('lesson.no_sections')}
      </div>
    {/if}

    <div class="lesson-actions">
      <button class="btn btn-secondary" onclick={() => window.history.back()}>
        {t('common.back_to_lessons')}
      </button>
      <button class="btn btn-primary" onclick={() => alert(t('lesson.start_alert'))}>
        {t('common.start_lesson')}
      </button>
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

  .vocabulary-source {
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
  }

  .vocabulary-target {
    color: #3b82f6;
    margin-bottom: 0.5rem;
    opacity: 0.8;
    font-size: 0.95rem;
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