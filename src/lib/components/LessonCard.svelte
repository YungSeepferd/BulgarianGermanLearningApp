<script lang="ts">
  /**
   * LessonCard Component
   *
   * Displays a lesson with vocabulary items and progress tracking.
   */

  import { z } from 'zod';
  import { LessonSchema, type Lesson } from '../schemas/lesson';

  // Props
  let { lesson } = $props<{ lesson: Lesson }>();

  // State
  let isFlipped = $state(false);
  let currentVocabularyIndex = $state(0);
  let showAllVocabulary = $state(false);

  // Computed
  let vocabularyItems = $derived(
    lesson.vocabulary.map(vocab =>
      typeof vocab === 'string' ? { id: vocab, german: '', bulgarian: '' } : vocab
    )
  );

  let currentVocabulary = $derived(vocabularyItems[currentVocabularyIndex]);
  let completionPercentage = $derived(
    Math.round((lesson.objectives.filter(obj => obj.isCompleted).length / lesson.objectives.length) * 100)
  );

  // Methods
  function toggleFlip() {
    isFlipped = !isFlipped;
  }

  function nextVocabulary() {
    if (currentVocabularyIndex < vocabularyItems.length - 1) {
      currentVocabularyIndex++;
    }
  }

  function prevVocabulary() {
    if (currentVocabularyIndex > 0) {
      currentVocabularyIndex--;
    }
  }

  function toggleObjective(objectiveId: string) {
    lesson.objectives = lesson.objectives.map(obj =>
      obj.id === objectiveId ? { ...obj, isCompleted: !obj.isCompleted } : obj
    );
    lesson.updatedAt = new Date();
  }

  function getDifficultyColor(difficulty: LessonDifficulty): string {
    const colors: Record<LessonDifficulty, string> = {
      'A1': 'bg-green-100 text-green-800 border-green-300',
      'A2': 'bg-green-200 text-green-900 border-green-400',
      'B1': 'bg-blue-100 text-blue-800 border-blue-300',
      'B2': 'bg-blue-200 text-blue-900 border-blue-400',
      'C1': 'bg-purple-100 text-purple-800 border-purple-300'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800 border-gray-300';
  }

  function getLessonTypeIcon(type: LessonType): string {
    const icons: Record<LessonType, string> = {
      'vocabulary': '📚',
      'grammar': '📖',
      'conversation': '💬',
      'reading': '📄',
      'listening': '🔊',
      'writing': '✍️',
      'culture': '🏛️',
      'mixed': '🎯'
    };
    return icons[type] || '📚';
  }
</script>

<!-- Lesson Card Container -->
<div class="lesson-card-container">
  <!-- Lesson Card -->
  <div
    class="lesson-card {isFlipped ? 'flipped' : ''}"
    tabindex="0"
    onkeydown={e => e.key === 'Enter' || e.key === ' ' ? toggleFlip() : null}
    aria-label={`Lesson: ${lesson.title}`}
    role="button"
  >
    <!-- Front Side -->
    <div class="lesson-card-front">
      <div class="lesson-header">
        <div class="lesson-badge {getDifficultyColor(lesson.difficulty)}">
          {lesson.difficulty} • {lesson.duration} min
        </div>
        <div class="lesson-type-icon" aria-label={`Lesson type: ${lesson.type}`}>
          {getLessonTypeIcon(lesson.type)}
        </div>
      </div>

      <h3 class="lesson-title">{lesson.title}</h3>

      <p class="lesson-description">
        {lesson.description}
      </p>

      <div class="lesson-progress">
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

      <div class="lesson-vocabulary-preview">
        <div class="vocabulary-tags">
          {#if showAllVocabulary}
            {#each vocabularyItems.slice(0, 5) as vocab}
              <span class="vocabulary-tag" title={vocab.german}>
                {vocab.german}
              </span>
            {/each}
            {#if vocabularyItems.length > 5}
              <span class="vocabulary-tag more">+{vocabularyItems.length - 5}</span>
            {/if}
          {:else}
            {#each vocabularyItems.slice(0, 3) as vocab}
              <span class="vocabulary-tag" title={vocab.german}>
                {vocab.german}
              </span>
            {/each}
            {#if vocabularyItems.length > 3}
              <button
                class="show-more-button"
                onclick={() => showAllVocabulary = true}
                aria-label={`Show all ${vocabularyItems.length} vocabulary items`}
              >
                +{vocabularyItems.length - 3}
              </button>
            {/if}
          {/if}
        </div>
      </div>

      <div class="lesson-actions">
        <button
          class="action-button primary"
          onclick={toggleFlip}
          aria-label="View lesson details"
        >
          Start Lesson
        </button>
        <button
          class="action-button secondary"
          onclick={() => alert(`Lesson ${lesson.title} started!`)}
          aria-label="Start this lesson"
        >
          ▶️
        </button>
      </div>
    </div>

    <!-- Back Side -->
    <div class="lesson-card-back">
      <div class="lesson-header">
        <button
          class="back-button"
          onclick={toggleFlip}
          aria-label="Back to lesson overview"
        >
          ← Back
        </button>
        <div class="lesson-badge {getDifficultyColor(lesson.difficulty)}">
          {lesson.difficulty} • {lesson.duration} min
        </div>
      </div>

      <h3 class="lesson-title">{lesson.title}</h3>

      <div class="lesson-objectives">
        <h4>Learning Objectives</h4>
        <ul class="objectives-list">
          {#each lesson.objectives as objective (objective.id)}
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
        </ul>
      </div>

      <div class="lesson-vocabulary-details">
        <h4>Vocabulary ({vocabularyItems.length})</h4>

        <div class="vocabulary-navigation">
          <button
            onclick={prevVocabulary}
            disabled={currentVocabularyIndex === 0}
            aria-label="Previous vocabulary item"
          >
            ◀️
          </button>
          <span class="vocabulary-counter">
            {currentVocabularyIndex + 1} / {vocabularyItems.length}
          </span>
          <button
            onclick={nextVocabulary}
            disabled={currentVocabularyIndex === vocabularyItems.length - 1}
            aria-label="Next vocabulary item"
          >
            ▶️
          </button>
        </div>

        <div class="vocabulary-card">
          <div class="vocabulary-language german">
            {currentVocabulary.german}
          </div>
          <div class="vocabulary-language bulgarian">
            {currentVocabulary.bulgarian}
          </div>
          <div class="vocabulary-meta">
            {#if currentVocabulary.partOfSpeech}
              <span class="part-of-speech">
                {currentVocabulary.partOfSpeech}
              </span>
            {/if}
            {#if currentVocabulary.difficulty}
              <span class="difficulty-indicator">
                {'⭐'.repeat(currentVocabulary.difficulty)}
              </span>
            {/if}
          </div>
        </div>

        <div class="vocabulary-list">
          {#each vocabularyItems as vocab, index}
            <div
              class="vocabulary-list-item {index === currentVocabularyIndex ? 'active' : ''}"
              onclick={() => currentVocabularyIndex = index}
              role="button"
              tabindex="0"
              onkeydown={e => e.key === 'Enter' ? currentVocabularyIndex = index : null}
            >
              <span class="vocab-german">{vocab.german}</span>
              <span class="vocab-bulgarian">{vocab.bulgarian}</span>
            </div>
          {/each}
        </div>
      </div>

      <div class="lesson-actions">
        <button
          class="action-button primary"
          onclick={() => alert(`Lesson ${lesson.title} started!`)}
          aria-label="Start this lesson"
        >
          Start Lesson
        </button>
      </div>
    </div>
  </div>
</div>

<!-- Styles -->
<style>
  .lesson-card-container {
    perspective: 1000px;
    width: 100%;
    max-width: 400px;
    height: 500px;
  }

  .lesson-card {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.6s;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    background: white;
    overflow: hidden;
  }

  .lesson-card.flipped {
    transform: rotateY(180deg);
  }

  .lesson-card-front, .lesson-card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    padding: 20px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .lesson-card-front {
    z-index: 2;
  }

  .lesson-card-back {
    transform: rotateY(180deg);
    background: #f8fafc;
  }

  .lesson-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .lesson-badge {
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    border: 1px solid;
    display: inline-block;
  }

  .lesson-type-icon {
    font-size: 1.5rem;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(59, 130, 246, 0.1);
  }

  .lesson-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 8px;
    line-height: 1.5;
  }

  .lesson-description {
    color: #64748b;
    font-size: 0.875rem;
    line-height: 1.5;
    margin-bottom: 16px;
  }

  .lesson-progress {
    margin-bottom: 16px;
  }

  .progress-bar-container {
    height: 6px;
    background: #e2e8f0;
    border-radius: 3px;
    margin-bottom: 6px;
    overflow: hidden;
  }

  .progress-bar {
    height: 100%;
    background: #3b82f6;
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  .progress-text {
    font-size: 0.75rem;
    color: #64748b;
    font-weight: 500;
  }

  .lesson-vocabulary-preview {
    margin-bottom: 16px;
  }

  .vocabulary-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .vocabulary-tag {
    padding: 4px 10px;
    background: #f1f5f9;
    border-radius: 20px;
    font-size: 0.75rem;
    color: #475569;
    border: 1px solid #e2e8f0;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .vocabulary-tag.more {
    background: #e2e8f0;
  }

  .show-more-button {
    padding: 4px 8px;
    background: #f1f5f9;
    border-radius: 20px;
    font-size: 0.75rem;
    color: #475569;
    border: 1px solid #e2e8f0;
    cursor: pointer;
    margin-left: 4px;
  }

  .lesson-actions {
    display: flex;
    gap: 8px;
    margin-top: auto;
  }

  .action-button {
    flex: 1;
    padding: 10px;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    font-size: 0.875rem;
  }

  .action-button.primary {
    background: #3b82f6;
    color: white;
  }

  .action-button.primary:hover {
    background: #2563eb;
  }

  .action-button.secondary {
    background: #e2e8f0;
    color: #475569;
  }

  .action-button.secondary:hover {
    background: #cbd5e1;
  }

  .back-button {
    padding: 6px 12px;
    background: #f1f5f9;
    border-radius: 6px;
    font-size: 0.875rem;
    color: #475569;
    border: 1px solid #e2e8f0;
    cursor: pointer;
  }

  .lesson-objectives {
    margin-bottom: 20px;
  }

  .lesson-objectives h4 {
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 12px;
  }

  .objectives-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .objective-item {
    margin-bottom: 8px;
  }

  .objective-checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .objective-checkbox input {
    margin: 0;
  }

  .objective-checkbox span {
    font-size: 0.875rem;
    color: #475569;
  }

  .objective-checkbox span.completed {
    text-decoration: line-through;
    color: #94a3b8;
  }

  .lesson-vocabulary-details h4 {
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 12px;
  }

  .vocabulary-navigation {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
  }

  .vocabulary-counter {
    font-size: 0.875rem;
    color: #64748b;
  }

  .vocabulary-navigation button {
    padding: 6px;
    background: #f1f5f9;
    border-radius: 50%;
    border: 1px solid #e2e8f0;
    cursor: pointer;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .vocabulary-navigation button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .vocabulary-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 16px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  .vocabulary-language {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .vocabulary-language.german {
    color: #1e293b;
  }

  .vocabulary-language.bulgarian {
    color: #3b82f6;
    font-size: 1.25rem;
  }

  .vocabulary-meta {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 12px;
  }

  .part-of-speech {
    padding: 2px 8px;
    background: #f1f5f9;
    border-radius: 12px;
    font-size: 0.75rem;
    color: #475569;
  }

  .difficulty-indicator {
    color: #f59e0b;
  }

  .vocabulary-list {
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
  }

  .vocabulary-list-item {
    padding: 12px 16px;
    border-bottom: 1px solid #e2e8f0;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .vocabulary-list-item:last-child {
    border-bottom: none;
  }

  .vocabulary-list-item.active {
    background: #f1f5f9;
  }

  .vocabulary-list-item:hover {
    background: #f8fafc;
  }

  .vocab-german {
    font-weight: 500;
    color: #1e293b;
  }

  .vocab-bulgarian {
    color: #64748b;
    font-size: 0.875rem;
  }

  @media (max-width: 640px) {
    .lesson-card-container {
      height: 480px;
    }

    .lesson-title {
      font-size: 1.125rem;
    }
  }
</style>