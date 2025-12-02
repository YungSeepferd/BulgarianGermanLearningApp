<script lang="ts">
  import TandemToggle from './TandemToggle.svelte';
  import SearchList from './SearchList.svelte';
  import { DataLoader } from '$lib/data/loader.js';
  import type { VocabularyItem } from '$lib/types/vocabulary.js';
  import { fade, fly } from 'svelte/transition';

  let dataLoader = DataLoader.getInstance();
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
  // Animation functions
  function feedbackAnimation(node: HTMLElement) {
    return fly(node, {
      y: -20,
      opacity: 1, // Fix: Opacity should be a number or an object with duration
      duration: 300,
      easing: t => t
    });
  }

  function statAnimation(node: HTMLElement) {
    return fade(node, {
      duration: 200,
      easing: t => t
    });
  }
  
  // Load initial item
  async function loadNewItem() {
    try {
      isLoading = true;
      error = null;
      const items = await dataLoader.getRandomItems(1);
      currentItem = items[0] || null;
      resetAnswer();
    } catch (err) {
      error = 'Failed to load vocabulary. Please try again.';
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
  }
  
  function checkAnswer() {
    if (!currentItem || !userAnswer.trim()) return;
  
    const startTime = performance.now();
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
  
    // Update global stats (placeholder for future Supabase integration)
    dataLoader.updateStats(currentItem.id, isCorrect, responseTime);
  
    // Trigger feedback animation
  }
  
  function nextItem() {
    loadNewItem();
  }
  
  function toggleExamples() {
    showExamples = !showExamples;
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
    currentItem = item;
    mode = 'practice';
    resetAnswer();
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
  
  // Load initial item on mount
  loadNewItem();
</script>

<div class="tandem-practice">
  <div class="header">
    <h2>Tandem Learning</h2>
    <TandemToggle 
      {direction} 
      {mode}
      onDirectionChange={handleDirectionChange}
      onModeChange={handleModeChange}
    />
  </div>
  
  <div class="stats-bar">
    <div class="stat">
      <span class="stat-label">Correct:</span>
      <span class="stat-value" in:statAnimation>{stats.correct}/{stats.total}</span>
    </div>
    <div class="stat">
      <span class="stat-label">Streak:</span>
      <span class="stat-value" in:statAnimation>{stats.streak}</span>
    </div>
    <div class="stat">
      <span class="stat-label">Accuracy:</span>
      <span class="stat-value" in:statAnimation>{stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%</span>
    </div>
  </div>
  
  {#if mode === 'practice'}
    {#if isLoading}
      <div class="loading" role="status" aria-live="polite">
        <div class="spinner" aria-hidden="true"></div>
        <p class="loading-text">Loading vocabulary...</p>
        <div class="progress-container">
          <div class="progress-bar" style="width: {Math.min(100, stats.total * 10)}%"></div>
        </div>
      </div>
    {:else if error}
      <div class="error" role="alert">
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
      <div class="practice-card">
        <div class="question-section">
          <div class="direction-indicator">
            {direction === 'DE->BG' ? '🇩🇪 German → 🇧🇬 Bulgarian' : '🇧🇬 Bulgarian → 🇩🇪 German'}
          </div>
          <h3 class="question-text">{getQuestionText()}</h3>
          <div class="item-meta">
            <span class="category">{currentItem.category}</span>
            {#if currentItem.difficulty}
              <span class="difficulty">Difficulty: {currentItem.difficulty}</span>
            {/if}
          </div>
        </div>
        
        <div class="answer-section">
          {#if !isAnswered}
            <div class="input-group">
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
              >
                Check Answer
              </button>
            </div>
          {:else}
            <div class="feedback-section" class:correct={isCorrect} class:incorrect={!isCorrect} in:feedbackAnimation>
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
              </div>
            </div>
            
            <div class="action-buttons">
              <button class="btn-secondary" onclick={nextItem}>
                Next Word
              </button>
              <button class="btn-tertiary" onclick={toggleExamples}>
                {showExamples ? 'Hide' : 'Show'} Examples
              </button>
            </div>
          {/if}
        </div>
        
        {#if showExamples && currentItem.example}
          <div class="examples-section">
            <h4>Example:</h4>
            <div class="example">
              <p class="example-sentence">{currentItem.example}</p>
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
</style>