<script lang="ts">
  import TandemToggle from './TandemToggle.svelte';
  import SearchList from './SearchList.svelte';
  import * as dataLoader from '$lib/data/loader';
  import { appState } from '$lib/state/app-state';
  import { t } from '$lib/services/localization';
  import { fade, fly, slide, scale } from 'svelte/transition';
  import { browser } from '$app/environment';

  // Track if component is mounted to prevent SSR fetch calls
  let isMounted = $state(false);
  let currentItem = $state(null);
  let userAnswer = $state('');
  let isAnswered = $state(false);
  let isCorrect = $state(false);
  let showExamples = $state(false);
  let searchQuery = $state('');
  let searchResults = $state([]);
  let isLoading = $state(true);
  let error = $state(null);
  // Error state
  let hasError = $state(false);
  let errorMessage = $state(null);

  // Simple error handler
  function handleError(error, context) {
    console.error(`[${context}]`, error);
  }

  // Derived state from global appState with error handling
  // Note: We keep this for backward compatibility with SearchList component
  let direction = $derived.by(() => {
    try {
      return appState.languageMode === 'DE_BG' ? 'DE->BG' : 'BG->DE';
    } catch (err) {
      handleError(err, 'Failed to get language direction');
      hasError = true;
      errorMessage = t('errors.load_direction_failed');
      return 'DE->BG';
    }
  });

  let mode = $state<'practice' | 'search'>('practice');
  let stats = $state<{
    correct: number,
    total: number,
    streak: number,
    lastResponseTime: number,
    averageResponseTime: number
  }>({
    correct: 0,
    total: 0,
    streak: 0,
    lastResponseTime: 0,
    averageResponseTime: 0
  });
  let startTime = $state(0);
  // Enhanced animation functions
  function feedbackAnimation(node: HTMLElement) {
    return fly(node, {
      y: -20,
      opacity: 1,
      duration: 400,
      easing: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
    });
  }

  function statAnimation(node: HTMLElement) {
    return scale(node, {
      duration: 300,
      easing: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
      start: 0.8,
      opacity: 1
    });
  }

  function cardSlideAnimation(node: HTMLElement) {
    return slide(node, {
      duration: 500,
      easing: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
      axis: 'y'
    });
  }

  function pulseAnimation(node: HTMLElement) {
    return scale(node, {
      duration: 200,
      easing: t => 1 - Math.pow(1 - t, 3),
      start: 1,
      opacity: 1
    });
  }

  function shakeAnimation(node: HTMLElement) {
    const duration = 500;
    return {
      duration,
      tick: (t: number, u: number) => {
        const shake = Math.sin(t * 10) * (1 - t) * 2;
        node.style.transform = `translateX(${shake}px)`;
        node.style.opacity = `${u}`;
      }
    };
  }

  // Enhanced load with animation
  /**
   * Load a new vocabulary item with proper error handling
   * @throws Error if loading fails
   */
  async function loadNewItem() {
    try {
      isLoading = true;
      error = null;
      hasError = false;

      // Simulate loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));

      const items = await dataLoader.getRandomVocabulary(1);
      currentItem = items[0] || null;
      resetAnswer();
    } catch (err) {
      handleError(err, 'Failed to load vocabulary item');
      error = t('practice.load_vocabulary_failed');
      hasError = true;
      errorMessage = err instanceof Error ? err.message : t('practice.load_vocabulary_failed');

      // Re-throw to allow parent components to handle the error
      throw err;
    } finally {
      isLoading = false;
    }
  }

  function resetAnswer() {
    userAnswer = '';
    isAnswered = false;
    isCorrect = false;
    showExamples = false;
    startTime = performance.now();
  }

  /**
   * Check user answer with proper error handling
   * @throws Error if answer checking fails
   */
  async function checkAnswer() {
    try {
      if (!currentItem || !userAnswer.trim()) return;

      isAnswered = true;
      const correctAnswer = appState.languageMode === 'DE_BG' ? currentItem.bulgarian : currentItem.german;
      isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase();

      // Calculate response time
      const responseTime = Math.round(performance.now() - startTime);

      // Update stats
      stats.total++;
      if (isCorrect) {
        stats.correct++;
        stats.streak++;
        stats.lastResponseTime = responseTime;

        // Update average response time
        if (stats.averageResponseTime === 0) {
          stats.averageResponseTime = responseTime;
        } else {
          stats.averageResponseTime = Math.round(
            (stats.averageResponseTime * (stats.total - 1) + responseTime) / stats.total
          );
        }
      } else {
        stats.streak = 0;
      }

      // Update global stats and app state
      if (currentItem) {
        await appState.recordPracticeResult(currentItem.id, isCorrect, responseTime);
      }
    } catch (err) {
      handleError(err, 'Failed to check answer');
      hasError = true;
      errorMessage = t('errors.record_result_failed');
      throw err;
    }
  }

  /**
   * Load next item with error handling
   */
  async function nextItem() {
    try {
      await loadNewItem();
    } catch (err) {
      // Error is already handled in loadNewItem
    }
  }

  /**
   * Toggle examples visibility with error handling
   */
  function toggleExamples() {
    try {
      showExamples = !showExamples;
    } catch (err) {
      handleError(err, 'Failed to toggle examples');
      hasError = true;
      errorMessage = t('errors.toggle_examples_failed');
    }
  }

  // Enhanced practice features
  /**
   * Toggle favorite status with error handling
   */
  function toggleFavorite() {
    try {
      if (currentItem) {
        appState.toggleFavorite(currentItem.id);
      }
    } catch (err) {
      handleError(err, 'Failed to toggle favorite');
      hasError = true;
      errorMessage = t('errors.update_favorites_failed');
    }
  }

  /**
   * Practice a specific item with error handling
   * @param item The vocabulary item to practice
   */
  function practiceThisItem(item: VocabularyItem) {
    try {
      currentItem = item;
      mode = 'practice';
      resetAnswer();
    } catch (err) {
      handleError(err, 'Failed to practice item');
      hasError = true;
      errorMessage = t('errors.load_practice_item_failed');
    }
  }

  function getDifficultyColor(difficulty?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'): string {
    switch (difficulty) {
      case 'A1': return '#28a745';
      case 'A2': return '#20c997';
      case 'B1': return '#ffc107';
      case 'B2': return '#fd7e14';
      case 'C1': return '#dc3545';
      case 'C2': return '#6f42c1';
      default: return '#6c757d';
    }
  }

  function getStreakEmoji(streak: number): string {
    if (streak >= 10) return '🔥';
    if (streak >= 5) return '⭐';
    if (streak >= 3) return '✨';
    return '';
  }

  /**
   * Handle search with error handling
   * @param query The search query
   */
  async function handleSearch(query: string) {
    try {
      searchQuery = query;
      if (query.trim()) {
        const results = await dataLoader.loadVocabularyBySearch(query);
        searchResults = results.items;
      } else {
        searchResults = [];
      }
    } catch (err) {
      handleError(err, 'Failed to search vocabulary');
      hasError = true;
      errorMessage = t('errors.search_failed');
      searchResults = [];
    }
  }

  /**
   * Handle direction change with error handling
   * @param newLanguageMode The new language mode to set
   */
  function handleDirectionChange(newLanguageMode: 'DE_BG' | 'BG_DE') {
    try {
      // Update global state with the new language mode directly
      if (appState.languageMode !== newLanguageMode) {
        appState.toggleDirection();
      }
      resetAnswer();
    } catch (err) {
      handleError(err, 'Failed to change direction');
      hasError = true;
      errorMessage = t('errors.change_direction_failed');
    }
  }

  /**
   * Handle mode change with error handling
   * @param newMode The new mode to set
   */
  function handleModeChange(newMode: 'practice' | 'search') {
    try {
      mode = newMode;
      if (newMode === 'practice') {
        searchQuery = '';
        searchResults = [];
      }
    } catch (err) {
      handleError(err, 'Failed to change mode');
      hasError = true;
      errorMessage = t('errors.change_mode_failed');
    }
  }

  /**
   * Handle item selection with error handling
   * @param item The item to select
   */
  function handleSelectItem(item: VocabularyItem) {
    try {
      // Set the item first, then change mode to ensure proper rendering
      currentItem = item;
      // Use a small timeout to ensure the mode change triggers re-render
      setTimeout(() => {
        try {
          mode = 'practice';
          resetAnswer();
        } catch (err) {
          handleError(err, 'Failed to switch to practice mode');
          hasError = true;
          errorMessage = t('errors.switch_mode_failed');
        }
      }, 10);
    } catch (err) {
      handleError(err, 'Failed to select item');
      hasError = true;
      errorMessage = t('errors.select_item_failed');
    }
  }

  function getQuestionText() {
    if (!currentItem) return '';
    return appState.languageMode === 'DE_BG' ? currentItem.german : currentItem.bulgarian;
  }

  function getCorrectAnswer() {
    if (!currentItem) return '';
    return appState.languageMode === 'DE_BG' ? currentItem.bulgarian : currentItem.german;
  }

  function getSourceLanguageName() {
    return appState.languageMode === 'DE_BG' ? t('languages.german') : t('languages.bulgarian');
  }

  function getTargetLanguageName() {
    return appState.languageMode === 'DE_BG' ? t('languages.bulgarian') : t('languages.german');
  }

  /**
   * Convert language mode to direction string for SearchList component
   * @param languageMode The language mode to convert
   * @returns Direction string in format 'DE->BG' or 'BG->DE'
   */
  function convertLanguageModeToDirection(languageMode: 'DE_BG' | 'BG_DE'): string {
    return languageMode === 'DE_BG' ? 'DE->BG' : 'BG->DE';
  }

  // Removed getAnswerOptions as it was unused and causing errors

  // Load initial item only when component is mounted (client-side)
  // Initialize with error handling
  $effect(() => {
    try {
      if (browser && !isMounted) {
        isMounted = true;
        loadNewItem();
      }
    } catch (err) {
      handleError(err, 'Failed to initialize TandemPractice component');
      hasError = true;
      errorMessage = t('errors.init_practice_failed');
    }
  });
</script>

<div class="tandem-practice" class:ci-mode={typeof process !== 'undefined' && process.env['PLAYWRIGHT_TEST_MODE'] === 'ci'}>
  {#if hasError}
    <div class="error-message">
      <div class="error-icon">⚠️</div>
      <h3>{t('errors.practice_load_error')}</h3>
      <p>{errorMessage || t('errors.unknown_error')}</p>
      <div class="error-actions">
        <button class="btn-primary" onclick={() => window.location.reload()}>
          {t('common.reload_page')}
        </button>
        <button class="btn-secondary" onclick={() => {
          try {
            hasError = false;
            errorMessage = null;
            loadNewItem();
          } catch (err) {
            handleError(err, 'Failed to retry loading');
          }
        }}>
          {t('common.try_again')}
        </button>
      </div>
    </div>
  {:else}
  <div class="header">
    <h2 class="app-title">
      <span class="title-icon">🔄</span>
      {t('practice.tandem_learning')}
    </h2>
    <TandemToggle
      mode={mode}
      onDirectionChange={handleDirectionChange}
      onModeChange={handleModeChange}
    />
  </div>

  <div class="stats-bar" in:cardSlideAnimation>
    <div class="stat" in:statAnimation>
      <span class="stat-label">{t('practice.correct')}:</span>
      <span class="stat-value">{stats.correct}/{stats.total}</span>
    </div>
    <div class="stat" in:statAnimation>
      <span class="stat-label">{t('practice.streak')}:</span>
      <span class="stat-value">
        {stats.streak} {getStreakEmoji(stats.streak)}
      </span>
    </div>
    <div class="stat" in:statAnimation>
      <span class="stat-label">{t('practice.accuracy')}:</span>
      <span class="stat-value">{stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%</span>
    </div>
    {#if stats.averageResponseTime > 0}
      <div class="stat" in:statAnimation>
        <span class="stat-label">{t('practice.avg_time')}:</span>
        <span class="stat-value">{stats.averageResponseTime}{t('common.milliseconds')}</span>
      </div>
    {/if}
  </div>

  {#if mode === 'practice'}
    {#if isLoading}
      <div class="loading" role="status" aria-live="polite" aria-label={t('practice.loading_vocabulary')} in:cardSlideAnimation>
        <div class="spinner" aria-hidden="true"></div>
        <p class="loading-text">{t('practice.loading_vocabulary')}</p>
        <div class="progress-container">
          <div class="progress-bar" style="width: {Math.min(100, stats.total * 10)}%"></div>
        </div>
      </div>
    {:else if error}
      <div class="error" role="alert" aria-live="assertive" in:shakeAnimation>
        <div class="error-icon">⚠️</div>
        <h3 class="error-title">{t('practice.loading_failed')}</h3>
        <p class="error-message">{error}</p>
        <div class="error-actions">
          <button class="btn-primary" onclick={() => {
            try {
              loadNewItem();
            } catch (err) {
              handleError(err, 'Failed to retry loading');
            }
          }} aria-label={t('practice.retry_loading')}>
            {t('common.retry')}
          </button>
          <button class="btn-secondary" onclick={() => {
            try {
              mode = 'search';
            } catch (err) {
              handleError(err, 'Failed to switch to search mode');
            }
          }} aria-label={t('practice.switch_to_search')}>
            {t('practice.search_vocabulary')}
          </button>
        </div>
      </div>
    {:else if currentItem}
      <div class="practice-card" in:cardSlideAnimation>
        <div class="question-section">
          <div class="direction-indicator" in:fade>
            {appState.languageMode === 'DE_BG' ? `🇩🇪 ${t('languages.german')} → 🇧🇬 ${t('languages.bulgarian')}` : `🇧🇬 ${t('languages.bulgarian')} → 🇩🇪 ${t('languages.german')}`}
          </div>
          <h3 class="question-text" in:scale>{getQuestionText()}</h3>
          <div class="item-meta">
            <span class="category">{currentItem.category}</span>
            {#if currentItem.level}
              <span class="difficulty" style="color: {getDifficultyColor(currentItem.level)}">
                {currentItem.level}
              </span>
            {/if}
            <button
              class="favorite-btn"
              onclick={toggleFavorite}
              class:favorited={appState.isFavorite(currentItem.id)}
              aria-label="Toggle favorite"
            >
              {appState.isFavorite(currentItem.id) ? '❤️' : '🤍'}
            </button>
          </div>
        </div>

        <div class="answer-section">
          {#if !isAnswered}
            <div class="input-group" in:fade>
              <input
                type="text"
                bind:value={userAnswer}
                placeholder={t('practice.type_answer_placeholder')}
                onkeydown={(e) => {
                  if (e.key === 'Enter' && !isAnswered) {
                    checkAnswer();
                  }
                }}
                class="answer-input"
              />
              <button
                class="btn-primary"
                onclick={checkAnswer}
                disabled={!userAnswer.trim()}
                in:pulseAnimation
              >
                {t('practice.check_answer')}
              </button>
            </div>
          {:else}
            <div
              class="feedback-section"
              class:correct={isCorrect}
              class:incorrect={!isCorrect}
              in:feedbackAnimation
              aria-live="polite"
            >
              <div class="feedback-icon">
                {isCorrect ? '✅' : '❌'}
              </div>
              <div class="feedback-text">
                <p class="feedback-message">
                  {isCorrect ? t('practice.correct_answer') : `${t('practice.incorrect_answer')} ${getCorrectAnswer()}`}
                  {#if isCorrect && stats.lastResponseTime}
                    <span class="response-time"> ({t('practice.response_time')}: {stats.lastResponseTime}{t('common.milliseconds')})</span>
                  {/if}
                </p>
                {#if !isCorrect}
                  <p class="hint-text">{t('practice.your_answer')}: "{userAnswer}"</p>
                {/if}
              </div>
            </div>

            <div class="action-buttons" in:fade>
              <button class="btn-secondary" onclick={nextItem} in:pulseAnimation>
                {t('practice.next_word')}
              </button>
              <button class="btn-tertiary" onclick={toggleExamples}>
                {showExamples ? t('common.hide') : t('common.show')} {t('practice.examples')}
              </button>
              <button
                class="btn-favorite"
                onclick={toggleFavorite}
                class:favorited={appState.isFavorite(currentItem.id)}
              >
                {appState.isFavorite(currentItem.id) ? '❤️ ' + t('practice.favorited') : '🤍 ' + t('practice.favorite')}
              </button>
            </div>
          {/if}
        </div>

        {#if showExamples && currentItem.examples && currentItem.examples.length > 0 && currentItem.examples[0]}
          <div class="examples-section" in:slide>
            <h4>{t('practice.example')}:</h4>
            <div class="example">
              <p class="example-sentence">{currentItem.examples[0].sentence}</p>
              <p class="example-translation">{currentItem.examples[0].translation}</p>
            </div>
          </div>
        {/if}

        <!-- Practice recommendations -->
        {#if appState.practiceRecommendations.length > 0}
          <div class="recommendations-section" in:fade>
            <h4>{t('practice.recommended_for_practice')}:</h4>
            <div class="recommendation-list">
              {#each appState.practiceRecommendations.slice(0, 3) as item}
                <div
                  class="recommendation-item"
                  onclick={() => practiceThisItem(item)}
                  role="button"
                  tabindex="0"
                  onkeydown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      practiceThisItem(item);
                    }
                  }}
                  aria-label={`${t('practice.practice_word')}: ${appState.languageMode === 'DE_BG' ? item.german : item.bulgarian}. ${t('practice.category')}: ${item.category}`}
                >
                  <span class="rec-text">
                    {appState.languageMode === 'DE_BG' ? item.german : item.bulgarian}
                  </span>
                  <span class="rec-meta">{item.category}</span>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {/if}
  {:else}
    <div class="search-section">
      <div class="search-header">
        <h3>{t('practice.search_vocabulary')}</h3>
        <div class="search-direction">
          {appState.languageMode === 'DE_BG' ? `🇩🇪 ${t('languages.german')} → 🇧🇬 ${t('languages.bulgarian')}` : `🇧🇬 ${t('languages.bulgarian')} → 🇩🇪 ${t('languages.german')}`}
        </div>
      </div>

      <div class="search-input-group">
        <input
          type="text"
          bind:value={searchQuery}
          placeholder={t('practice.search_placeholder')}
          oninput={(e) => handleSearch(e.target.value)}
          class="search-input"
        />
        <div class="search-direction">
          {getSourceLanguageName()} → {getTargetLanguageName()}
        </div>
      </div>

      <SearchList
        items={searchResults}
        direction={convertLanguageModeToDirection(appState.languageMode)}
        onSelectItem={handleSelectItem}
      />
    </div>
  {/if}
{/if}

</div>

<style>
  .tandem-practice {
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;
    position: relative;
  }

  /* Feedback animation */
  .feedback-section {
    animation: pulse 0.5s;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
  }

  /* Stat animations */
  .stat-value {
    transition: all 0.3s ease;
  }

  .stat-value:hover {
    transform: scale(1.1);
    color: #007bff;
  }

  /* Response time styling */
  .response-time {
    font-size: 0.8rem;
    color: #6c757d;
    margin-left: 0.5rem;
  }

  /* Tooltips */
  .stat {
    position: relative;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .header h2 {
    margin: 0;
    color: #2c3e50;
    font-size: 1.8rem;
  }

  .stats-bar {
    display: flex;
    gap: 2rem;
    margin-bottom: 2rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stat-label {
    font-size: 0.9rem;
    color: #6c757d;
    margin-bottom: 0.25rem;
  }

  .stat-value {
    font-size: 1.2rem;
    font-weight: 600;
    color: #2c3e50;
  }

  .loading {
    text-align: center;
    padding: 3rem;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .error {
    text-align: center;
    padding: 2rem;
    color: #dc3545;
    background: #fef2f2;
    border-radius: 12px;
    border: 1px solid #fecaca;
  }

  .error-message {
    padding: 1.5rem;
    background: #fef2f2;
    border-radius: 12px;
    color: #ef4444;
    margin: 2rem 0;
    text-align: center;
    border: 1px solid #fecaca;
  }

  .error-message .error-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .error-message h3 {
    margin: 0 0 1rem 0;
    font-size: 1.5rem;
    color: #dc2626;
  }

  .error-message p {
    margin: 0 0 1.5rem 0;
    color: #b91c1c;
  }

  .error-message .error-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 1rem;
  }

  .practice-card {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .question-section {
    text-align: center;
    margin-bottom: 2rem;
  }

  .direction-indicator {
    font-size: 1.2rem;
    margin-bottom: 1rem;
    opacity: 0.8;
  }

  .question-text {
    font-size: 2.5rem;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 1rem;
    line-height: 1.2;
  }

  .item-meta {
    display: flex;
    justify-content: center;
    gap: 1rem;
    font-size: 0.9rem;
    color: #6c757d;
  }

  .category, .difficulty {
    background: #e9ecef;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
  }

  .answer-section {
    margin-bottom: 2rem;
  }

  .input-group {
    display: flex;
    gap: 1rem;
    max-width: 500px;
    margin: 0 auto;
  }

  .answer-input {
    flex: 1;
    padding: 1rem;
    border: 2px solid #dee2e6;
    border-radius: 8px;
    font-size: 1.1rem;
  }

  .answer-input:focus {
    outline: none;
    border-color: #007bff;
  }

  .feedback-section {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  .feedback-section.correct {
    background: #d4edda;
    border: 1px solid #c3e6cb;
  }

  .feedback-section.incorrect {
    background: #f8d7da;
    border: 1px solid #f5c6cb;
  }

  .feedback-icon {
    font-size: 2rem;
  }

  .feedback-text {
    flex: 1;
  }

  .feedback-message {
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .action-buttons {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }

  .btn-primary, .btn-secondary, .btn-tertiary {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-primary {
    background: #007bff;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: #0056b3;
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-secondary {
    background: #6c757d;
    color: white;
  }

  .btn-secondary:hover {
    background: #545b62;
  }

  .btn-tertiary {
    background: #f8f9fa;
    color: #6c757d;
    border: 1px solid #dee2e6;
  }

  .btn-tertiary:hover {
    background: #e9ecef;
  }

  .examples-section {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid #dee2e6;
  }

  .examples-section h4 {
    margin-bottom: 1rem;
    color: #2c3e50;
  }

  .example {
    margin-bottom: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 6px;
  }

  .example-sentence {
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  .search-section {
    max-width: 800px;
  }

  .search-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .search-header h3 {
    margin: 0;
    color: #2c3e50;
  }

  .search-direction {
    font-size: 0.9rem;
    color: #6c757d;
  }

  .search-input-group {
    margin-bottom: 2rem;
  }

  .search-input {
    width: 100%;
    padding: 1rem;
    border: 2px solid #dee2e6;
    border-radius: 8px;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }

  .search-input:focus {
    outline: none;
    border-color: #007bff;
  }

  @media (max-width: 768px) {
    .tandem-practice {
      padding: 0.5rem;
    }

    .header {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }

    .stats-bar {
      flex-direction: column;
      gap: 1rem;
    }

    .stat {
      flex-direction: row;
      justify-content: space-between;
    }

    .question-text {
      font-size: 2rem;
    }

    .input-group {
      flex-direction: column;
    }

    .action-buttons {
      flex-direction: column;
    }

    .search-header {
      flex-direction: column;
      gap: 0.5rem;
      text-align: center;
    }
  }

  /* Recommendations section */
  .recommendations-section {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid #dee2e6;
  }

  .recommendations-section h4 {
    margin-bottom: 1rem;
    color: #2c3e50;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .recommendation-list {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .recommendation-item {
    flex: 1;
    min-width: 200px;
    padding: 1rem;
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
  }

  .recommendation-item:hover {
    background: #e9ecef;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .recommendation-item:focus {
    outline: 2px solid #007bff;
    outline-offset: 2px;
  }

  .rec-text {
    display: block;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }

  .rec-meta {
    display: block;
    font-size: 0.8rem;
    color: #6c757d;
  }

  /* Enhanced mobile responsiveness */
  @media (max-width: 768px) {
    .app-title {
      font-size: 1.5rem;
    }

    .stats-bar {
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
    }

    .stat {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }

    .stat-value {
      font-size: 1.1rem;
    }

    .question-text {
      font-size: 2.2rem;
    }

    .practice-card {
      padding: 1.5rem;
    }

    .input-group {
      flex-direction: column;
      gap: 0.75rem;
    }

    .answer-input {
      padding: 1rem;
      font-size: 1rem;
    }

    .action-buttons {
      flex-direction: column;
      gap: 0.75rem;
    }

    .btn-primary, .btn-secondary, .btn-tertiary, .btn-favorite {
      width: 100%;
      padding: 1rem;
    }

    .search-header {
      flex-direction: column;
      gap: 0.5rem;
      text-align: center;
    }

    .recommendation-list {
      flex-direction: column;
    }

    .recommendation-item {
      min-width: auto;
    }

    .item-meta {
      flex-direction: column;
      gap: 0.5rem;
      align-items: center;
    }
  }

  @media (max-width: 480px) {
    .tandem-practice {
      padding: 0.25rem;
    }

    .question-text {
      font-size: 1.8rem;
    }

    .stats-bar {
      padding: 0.75rem;
    }

    .practice-card {
      padding: 1rem;
    }
  }

  /* CI mode - disable animations for stable E2E testing */
  .tandem-practice.ci-mode * {
    animation: none !important;
    transition: none !important;
  }

  .tandem-practice.ci-mode .stat-value:hover {
    transform: none !important;
  }
</style>