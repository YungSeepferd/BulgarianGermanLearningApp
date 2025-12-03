<script lang="ts">
  import TandemToggle from './TandemToggle.svelte';
  import SearchList from './SearchList.svelte';
  import { DataLoader } from '$lib/data/loader.js';
  import { appState } from '$lib/state/app.svelte.js';
  import type { VocabularyItem } from '$lib/types/vocabulary.js';
  import { fade, fly, slide, scale } from 'svelte/transition';
  import { browser } from '$app/environment';

  let dataLoader = DataLoader.getInstance();
  
  // Set the appropriate fetch function based on environment
  if (!browser) {
    // In server/SSR context, we need to use a compatible fetch
    // For E2E tests, we'll use global fetch which should work in test environment
    dataLoader.setFetchFunction(fetch);
  }
  
  // Track if component is mounted to prevent SSR fetch calls
  let isMounted = $state(false);
  let currentItem = $state<VocabularyItem | null>(null);
  let userAnswer = $state('');
  let isAnswered = $state(false);
  let isCorrect = $state(false);
  let showExamples = $state(false);
  let searchQuery = $state('');
  let searchResults = $state<VocabularyItem[]>([]);
  let isLoading = $state(true);
  let error = $state<string | null>(null);
  let direction = $state<'DE->BG' | 'BG->DE'>('DE->BG');
  let mode = $state<'practice' | 'search'>('practice');
  let stats = $state({
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
  async function loadNewItem() {
    try {
      isLoading = true;
      error = null;
      
      // Simulate loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const items = await dataLoader.getRandomItems(1);
      currentItem = items[0] || null;
      resetAnswer();
    } catch (err) {
      error = 'Failed to load vocabulary. Please try again.';
      // eslint-disable-next-line no-console
      console.error('Error loading vocabulary:', err);
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
  
  async function checkAnswer() {
    if (!currentItem || !userAnswer.trim()) return;
  
    isAnswered = true;
    const correctAnswer = direction === 'DE->BG' ? currentItem.bulgarian : currentItem.german;
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
    await dataLoader.updateStats(currentItem.id, isCorrect, responseTime);
    await appState.recordPracticeResult(currentItem.id, isCorrect, responseTime);
  }
  
  async function nextItem() {
    await loadNewItem();
  }
  
  function toggleExamples() {
    showExamples = !showExamples;
  }

  // Enhanced practice features
  function toggleFavorite() {
    if (currentItem) {
      appState.toggleFavorite(currentItem.id);
    }
  }

  function practiceThisItem(item: VocabularyItem) {
    currentItem = item;
    mode = 'practice';
    resetAnswer();
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
  
  async function handleSearch(query: string) {
    searchQuery = query;
    if (query.trim()) {
      searchResults = await dataLoader.search(query, direction);
    } else {
      searchResults = [];
    }
  }
  
  function handleDirectionChange(newDirection: 'DE->BG' | 'BG->DE') {
    direction = newDirection;
    resetAnswer();
  }
  
  function handleModeChange(newMode: 'practice' | 'search') {
    mode = newMode;
    if (newMode === 'practice') {
      searchQuery = '';
      searchResults = [];
    }
  }
  
  function handleSelectItem(item: VocabularyItem) {
    // Set the item first, then change mode to ensure proper rendering
    currentItem = item;
    // Use a small timeout to ensure the mode change triggers re-render
    setTimeout(() => {
      mode = 'practice';
      resetAnswer();
    }, 10);
  }
  
  function getQuestionText(): string {
    if (!currentItem) return '';
    return direction === 'DE->BG' ? currentItem.german : currentItem.bulgarian;
  }
  
  function getCorrectAnswer(): string {
    if (!currentItem) return '';
    return direction === 'DE->BG' ? currentItem.bulgarian : currentItem.german;
  }
  
  // Removed getAnswerOptions as it was unused and causing errors
  
  // Load initial item only when component is mounted (client-side)
  $effect(() => {
    if (browser && !isMounted) {
      isMounted = true;
      loadNewItem();
    }
  });
</script>

<div class="tandem-practice" class:ci-mode={typeof process !== 'undefined' && process.env['PLAYWRIGHT_TEST_MODE'] === 'ci'}>
  <div class="header">
    <h2 class="app-title">
      <span class="title-icon">🔄</span>
      Tandem Learning
    </h2>
    <TandemToggle
      {direction}
      {mode}
      onDirectionChange={handleDirectionChange}
      onModeChange={handleModeChange}
    />
  </div>

  <div class="stats-bar" in:cardSlideAnimation>
    <div class="stat" in:statAnimation>
      <span class="stat-label">Correct:</span>
      <span class="stat-value">{stats.correct}/{stats.total}</span>
    </div>
    <div class="stat" in:statAnimation>
      <span class="stat-label">Streak:</span>
      <span class="stat-value">
        {stats.streak} {getStreakEmoji(stats.streak)}
      </span>
    </div>
    <div class="stat" in:statAnimation>
      <span class="stat-label">Accuracy:</span>
      <span class="stat-value">{stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%</span>
    </div>
    {#if stats.averageResponseTime > 0}
      <div class="stat" in:statAnimation>
        <span class="stat-label">Avg Time:</span>
        <span class="stat-value">{stats.averageResponseTime}ms</span>
      </div>
    {/if}
  </div>

  {#if mode === 'practice'}
    {#if isLoading}
      <div class="loading" role="status" aria-live="polite" in:cardSlideAnimation>
        <div class="spinner" aria-hidden="true"></div>
        <p class="loading-text">Loading vocabulary...</p>
        <div class="progress-container">
          <div class="progress-bar" style="width: {Math.min(100, stats.total * 10)}%"></div>
        </div>
      </div>
    {:else if error}
      <div class="error" role="alert" in:shakeAnimation>
        <div class="error-icon">⚠️</div>
        <h3 class="error-title">Loading Failed</h3>
        <p class="error-message">{error}</p>
        <div class="error-actions">
          <button class="btn-primary" onclick={loadNewItem} aria-label="Retry loading vocabulary">
            Retry
          </button>
          <button class="btn-secondary" onclick={() => mode = 'search'} aria-label="Switch to search mode">
            Search Vocabulary
          </button>
        </div>
      </div>
    {:else if currentItem}
      <div class="practice-card" in:cardSlideAnimation>
        <div class="question-section">
          <div class="direction-indicator" in:fade>
            {direction === 'DE->BG' ? '🇩🇪 German → 🇧🇬 Bulgarian' : '🇧🇬 Bulgarian → 🇩🇪 German'}
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
                placeholder="Type your answer here..."
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
                Check Answer
              </button>
            </div>
          {:else}
            <div
              class="feedback-section"
              class:correct={isCorrect}
              class:incorrect={!isCorrect}
              in:feedbackAnimation
            >
              <div class="feedback-icon">
                {isCorrect ? '✅' : '❌'}
              </div>
              <div class="feedback-text">
                <p class="feedback-message">
                  {isCorrect ? 'Correct!' : `Incorrect. The correct answer is: ${getCorrectAnswer()}`}
                  {#if isCorrect && stats.lastResponseTime}
                    <span class="response-time"> (Response time: {stats.lastResponseTime}ms)</span>
                  {/if}
                </p>
                {#if !isCorrect}
                  <p class="hint-text">Your answer: "{userAnswer}"</p>
                {/if}
              </div>
            </div>

            <div class="action-buttons" in:fade>
              <button class="btn-secondary" onclick={nextItem} in:pulseAnimation>
                Next Word
              </button>
              <button class="btn-tertiary" onclick={toggleExamples}>
                {showExamples ? 'Hide' : 'Show'} Examples
              </button>
              <button
                class="btn-favorite"
                onclick={toggleFavorite}
                class:favorited={appState.isFavorite(currentItem.id)}
              >
                {appState.isFavorite(currentItem.id) ? '❤️ Favorited' : '🤍 Favorite'}
              </button>
            </div>
          {/if}
        </div>

        {#if showExamples && currentItem.examples && currentItem.examples.length > 0 && currentItem.examples[0]}
          <div class="examples-section" in:slide>
            <h4>Example:</h4>
            <div class="example">
              <p class="example-sentence">{currentItem.examples[0].sentence}</p>
              <p class="example-translation">{currentItem.examples[0].translation}</p>
            </div>
          </div>
        {/if}

        <!-- Practice recommendations -->
        {#if appState.practiceRecommendations.length > 0}
          <div class="recommendations-section" in:fade>
            <h4>Recommended for Practice:</h4>
            <div class="recommendation-list">
              {#each appState.practiceRecommendations.slice(0, 3) as item}
                <div
                  class="recommendation-item"
                  onclick={() => practiceThisItem(item)}
                  role="button"
                  tabindex="0"
                  onkeydown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      practiceThisItem(item);
                    }
                  }}
                >
                  <span class="rec-text">
                    {direction === 'DE->BG' ? item.german : item.bulgarian}
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
        <h3>Search Vocabulary</h3>
        <div class="search-direction">
          {direction === 'DE->BG' ? '🇩🇪 German → 🇧🇬 Bulgarian' : '🇧🇬 Bulgarian → 🇩🇪 German'}
        </div>
      </div>

      <div class="search-input-group">
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search for words..."
          oninput={(e) => handleSearch((e.target as HTMLInputElement).value)}
          class="search-input"
        />
        <div class="search-direction">
          {direction === 'DE->BG' ? 'German' : 'Bulgarian'} → {direction === 'DE->BG' ? 'Bulgarian' : 'German'}
        </div>
      </div>

      <SearchList
        items={searchResults}
        {direction}
        onSelectItem={handleSelectItem}
      />
    </div>
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

  .tandem-practice.ci-mode .direction-toggle,
  .tandem-practice.ci-mode .mode-toggle {
    animation: none !important;
  }

  .tandem-practice.ci-mode .stat-value:hover {
    transform: none !important;
  }
</style>