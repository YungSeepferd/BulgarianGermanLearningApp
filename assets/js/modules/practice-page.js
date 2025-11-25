/**
 * Practice Page Module - Lazy loaded only on practice pages
 * Handles practice sessions, spaced repetition, and session management
 */

class PracticePageModule {
  constructor(options = {}) {
    this.adapter = options.adapter;
    this.spacedRepetition = options.spacedRepetition;
    this.selectedItems = options.selectedItems || [];
    this.learningDirection = this.normalizeDirection(options.learningDirection) || this.getInitialDirection();
    this.enableAudio = options.enableAudio || false;
    this.sessionLength = options.sessionLength || 20;
        
    // Session state
    this.currentSession = null;
    this.sessionItems = [];
    this.currentIndex = 0;
    this.sessionStats = {
      correct: 0,
      total: 0,
      startTime: null,
      mistakes: []
    };
        
    // UI elements
    this.elements = {};
    this.isInitialized = false;
  }

  normalizeDirection(value) {
    if (!value) {
      return null;
    }

    const normalized = value.toString().toLowerCase();

    if (normalized === 'bg-de' || normalized === 'bg_to_de') {
      return 'bg-de';
    }

    if (normalized === 'de-bg' || normalized === 'de_to_bg') {
      return 'de-bg';
    }

    return normalized === 'bg-de' || normalized === 'de-bg' ? normalized : null;
  }

  getInitialDirection() {
    if (window.languageToggle && typeof window.languageToggle.getDirection === 'function') {
      return window.languageToggle.getDirection();
    }

    const stored =
            localStorage.getItem('bgde:language-direction') ||
            localStorage.getItem('bgde:learning_direction');

    return this.normalizeDirection(stored) || 'de-bg';
  }

  async init() {
    try {
      // Cache DOM elements
      this.cacheElements();
            
      // Initialize session
      await this.initializeSession();
            
      // Setup event listeners
      this.setupEventListeners();
            
      // Start session
      this.startSession();
            
      this.isInitialized = true;
      console.log('PracticePageModule initialized successfully');
    } catch (error) {
      console.error('Failed to initialize PracticePageModule:', error);
      this.showErrorState();
    }
  }

  cacheElements() {
    // Cache all DOM elements for better performance
    this.elements = {
      loadingState: document.querySelector('#loading-state'),
      noItemsState: document.querySelector('#no-items-state'),
      practiceSession: document.querySelector('#practice-session'),
      sessionComplete: document.querySelector('#session-complete'),
      settingsPanel: document.querySelector('#settings-panel'),
            
      // Session stats
      progress: document.querySelector('#progress'),
      accuracy: document.querySelector('#accuracy'),
      sessionTime: document.querySelector('#session-time'),
            
      // Flashcard elements
      flashcard: document.querySelector('#flashcard'),
      currentWord: document.querySelector('#current-word'),
      currentTranslation: document.querySelector('#current-translation'),
      currentNotes: document.querySelector('#current-notes'),
      wordLevel: document.querySelector('#word-level'),
      wordCategory: document.querySelector('#word-category'),
            
      // Controls
      showAnswer: document.querySelector('#show-answer'),
      responseButtons: document.querySelector('#response-buttons'),
      correctBtn: document.querySelector('#correct-btn'),
      incorrectBtn: document.querySelector('#incorrect-btn'),
      playAudio: document.querySelector('#play-audio'),
      showHint: document.querySelector('#show-hint'),
      hintContent: document.querySelector('#hint-content'),
            
      // Progress
      progressFill: document.querySelector('#progress-fill'),
            
      // Settings
      settingsToggle: document.querySelector('#settings-toggle'),
      sessionLength: document.querySelector('#session-length'),
      difficultyFilter: document.querySelector('#difficulty-filter'),
      audioEnabled: document.querySelector('#audio-enabled'),
            
      // Session controls
      endSession: document.querySelector('#end-session'),
      newSession: document.querySelector('#new-session'),
      reviewMistakes: document.querySelector('#review-mistakes'),
            
      // Final stats
      finalCorrect: document.querySelector('#final-correct'),
      finalTotal: document.querySelector('#final-total'),
      finalAccuracy: document.querySelector('#final-accuracy'),
      finalTime: document.querySelector('#final-time'),
      performanceFeedback: document.querySelector('#performance-feedback')
    };
  }

  async initializeSession() {
    this.showLoadingState();
        
    try {
      // Get session items based on spaced repetition
      this.sessionItems = await this.getSessionItems();
            
      if (this.sessionItems.length === 0) {
        this.showNoItemsState();
        return;
      }
            
      // Initialize session stats
      this.sessionStats = {
        correct: 0,
        total: 0,
        startTime: Date.now(),
        mistakes: [],
        sessionId: this.generateSessionId()
      };
            
      // Save session to localStorage for recovery
      this.saveSessionState();
            
    } catch (error) {
      console.error('Failed to initialize session:', error);
      this.showErrorState();
    }
  }

  async getSessionItems() {
    if (!this.adapter || !this.spacedRepetition) {
      throw new Error('Missing required dependencies');
    }

    // Get due items from spaced repetition
    const reviewStates = this.spacedRepetition.getAllReviewStates();
    const dueItems = this.spacedRepetition.getDueItems(reviewStates);
        
    // Get vocabulary items for current direction
    const availableItems = this.adapter.getItemsForDirection(this.learningDirection);
        
    // If we have selected items, prioritize those
    let sessionItems = [];
        
    sessionItems = this.selectedItems.length > 0
      ? availableItems.filter(item =>
        this.selectedItems.includes(item.word) || this.selectedItems.includes(item.id)
      )
      : this.selectOptimalItems(availableItems, dueItems);
        
    // Shuffle items for better learning
    return this.shuffleArray(sessionItems.slice(0, this.sessionLength));
  }

  selectOptimalItems(availableItems, dueItems) {
    const dueItemIds = new Set(dueItems.map(item => item.itemId));
        
    // Prioritize due items
    const dueVocabItems = availableItems.filter(item => 
      dueItemIds.has(item.id)
    );
        
    // Fill remaining slots with new items
    const newItems = availableItems.filter(item => 
      !dueItemIds.has(item.id)
    ).sort((a, b) => {
      // Sort by difficulty and frequency
      if (a.difficulty !== b.difficulty) {
        return a.difficulty - b.difficulty; // Easier first
      }
      return (b.frequency || 0) - (a.frequency || 0); // Higher frequency first
    });
        
    const combined = [...dueVocabItems, ...newItems];
    return combined.slice(0, this.sessionLength);
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  setupEventListeners() {
    // Flashcard controls
    if (this.elements.showAnswer) {
      this.elements.showAnswer.addEventListener('click', () => this.showAnswer());
    }
        
    if (this.elements.correctBtn) {
      this.elements.correctBtn.addEventListener('click', () => this.handleResponse(true));
    }
        
    if (this.elements.incorrectBtn) {
      this.elements.incorrectBtn.addEventListener('click', () => this.handleResponse(false));
    }
        
    // Audio playback
    if (this.elements.playAudio && this.enableAudio) {
      this.elements.playAudio.addEventListener('click', () => this.playAudio());
    }
        
    // Hint system
    if (this.elements.showHint) {
      this.elements.showHint.addEventListener('click', () => this.toggleHint());
    }

    document.addEventListener('language-direction-changed', (event) => {
      const nextDirection = this.normalizeDirection(event?.detail?.direction);
      if (!nextDirection || nextDirection === this.learningDirection) {
        return;
      }

      this.learningDirection = nextDirection;
      this.displayCurrentItem();
    });
        
    // Settings
    if (this.elements.settingsToggle) {
      this.elements.settingsToggle.addEventListener('click', () => this.toggleSettings());
    }
        
    // Session controls
    if (this.elements.endSession) {
      this.elements.endSession.addEventListener('click', () => this.endSession());
    }
        
    if (this.elements.newSession) {
      this.elements.newSession.addEventListener('click', () => this.startNewSession());
    }
        
    if (this.elements.reviewMistakes) {
      this.elements.reviewMistakes.addEventListener('click', () => this.reviewMistakes());
    }
        
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
    // Settings changes
    if (this.elements.sessionLength) {
      this.elements.sessionLength.addEventListener('change', (e) => {
        this.sessionLength = Number.parseInt(e.target.value);
      });
    }
        
    if (this.elements.audioEnabled) {
      this.elements.audioEnabled.addEventListener('change', (e) => {
        this.enableAudio = e.target.checked;
      });
    }
  }

  startSession() {
    if (this.sessionItems.length === 0) {
      this.showNoItemsState();
      return;
    }
        
    this.hideLoadingState();
    this.showPracticeSession();
    this.currentIndex = 0;
    this.displayCurrentItem();
    this.startSessionTimer();
  }

  displayCurrentItem() {
    if (this.currentIndex >= this.sessionItems.length) {
      this.completeSession();
      return;
    }
        
    const item = this.sessionItems[this.currentIndex];

    const isReverse = this.learningDirection === 'de-bg';
    const frontText = isReverse ? item.translation : item.word;
    const backText = isReverse ? item.word : item.translation;

    // Update flashcard content
    if (this.elements.currentWord) {
      this.elements.currentWord.textContent = frontText;
    }

    if (this.elements.currentTranslation) {
      this.elements.currentTranslation.textContent = backText;
    }
        
    if (this.elements.currentNotes) {
      this.elements.currentNotes.textContent = item.notes || '';
    }
        
    if (this.elements.wordLevel) {
      this.elements.wordLevel.textContent = item.level;
      this.elements.wordLevel.className = `level-badge level-${item.level.toLowerCase()}`;
    }
        
    if (this.elements.wordCategory) {
      this.elements.wordCategory.textContent = item.category;
    }
        
    // Reset flashcard state
    this.resetFlashcardState();
        
    // Update progress
    this.updateProgress();
        
    // Preload audio if available
    if (this.enableAudio && item.audio) {
      this.preloadAudio(item.audio);
    }
  }

  resetFlashcardState() {
    // Reset flashcard to front side
    if (this.elements.flashcard) {
      this.elements.flashcard.classList.remove('flipped');
    }
        
    // Show answer button, hide response buttons
    if (this.elements.showAnswer) {
      this.elements.showAnswer.classList.remove('hidden');
    }
        
    if (this.elements.responseButtons) {
      this.elements.responseButtons.classList.add('hidden');
    }
        
    // Hide hint
    if (this.elements.hintContent) {
      this.elements.hintContent.classList.add('hidden');
    }
  }

  showAnswer() {
    // Flip flashcard
    if (this.elements.flashcard) {
      this.elements.flashcard.classList.add('flipped');
    }
        
    // Hide answer button, show response buttons
    if (this.elements.showAnswer) {
      this.elements.showAnswer.classList.add('hidden');
    }
        
    if (this.elements.responseButtons) {
      this.elements.responseButtons.classList.remove('hidden');
    }
        
    // Auto-play audio if enabled
    if (this.enableAudio) {
      setTimeout(() => this.playAudio(), 300);
    }
  }

  handleResponse(correct) {
    const currentItem = this.sessionItems[this.currentIndex];
        
    // Update session stats
    this.sessionStats.total++;
    if (correct) {
      this.sessionStats.correct++;
    } else {
      this.sessionStats.mistakes.push({
        item: currentItem,
        timestamp: Date.now()
      });
    }
        
    // Update spaced repetition
    if (this.spacedRepetition) {
      this.spacedRepetition.updateReviewState(currentItem.id, correct, {
        learningDirection: this.learningDirection,
        difficulty: currentItem.difficulty || 3
      });
    }
        
    // Update UI
    this.updateSessionStats();
        
    // Move to next item
    setTimeout(() => {
      this.currentIndex++;
      this.displayCurrentItem();
    }, 1000);
  }

  updateProgress() {
    const progress = `${this.currentIndex + 1}/${this.sessionItems.length}`;
    if (this.elements.progress) {
      this.elements.progress.textContent = progress;
    }
        
    // Update progress bar
    const percentage = ((this.currentIndex + 1) / this.sessionItems.length) * 100;
    if (this.elements.progressFill) {
      this.elements.progressFill.style.width = `${percentage}%`;
    }
  }

  updateSessionStats() {
    // Update accuracy
    const accuracy = this.sessionStats.total > 0 
      ? Math.round((this.sessionStats.correct / this.sessionStats.total) * 100)
      : 0;
        
    if (this.elements.accuracy) {
      this.elements.accuracy.textContent = `${accuracy}%`;
    }
  }

  startSessionTimer() {
    this.sessionTimer = setInterval(() => {
      const elapsed = Date.now() - this.sessionStats.startTime;
      const minutes = Math.floor(elapsed / 60_000);
      const seconds = Math.floor((elapsed % 60_000) / 1000);
      const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
      if (this.elements.sessionTime) {
        this.elements.sessionTime.textContent = timeString;
      }
    }, 1000);
  }

  completeSession() {
    clearInterval(this.sessionTimer);
        
    // Calculate final stats
    const totalTime = Date.now() - this.sessionStats.startTime;
    const accuracy = this.sessionStats.total > 0 
      ? Math.round((this.sessionStats.correct / this.sessionStats.total) * 100)
      : 0;
        
    // Update final stats display
    this.displayFinalStats(totalTime, accuracy);
        
    // Save session results
    this.saveSessionResults();
        
    // Show completion screen
    this.showSessionComplete();
  }

  displayFinalStats(totalTime, accuracy) {
    if (this.elements.finalCorrect) {
      this.elements.finalCorrect.textContent = this.sessionStats.correct;
    }
        
    if (this.elements.finalTotal) {
      this.elements.finalTotal.textContent = this.sessionStats.total;
    }
        
    if (this.elements.finalAccuracy) {
      this.elements.finalAccuracy.textContent = `${accuracy}%`;
    }
        
    if (this.elements.finalTime) {
      const minutes = Math.floor(totalTime / 60_000);
      const seconds = Math.floor((totalTime % 60_000) / 1000);
      this.elements.finalTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
        
    // Generate performance feedback
    this.generatePerformanceFeedback(accuracy);
  }

  generatePerformanceFeedback(accuracy) {
    let feedback = '';
        
    if (accuracy >= 90) {
      feedback = '🌟 Ausgezeichnet! Hervorragende Leistung! / Отлично! Превъзходно представяне!';
    } else if (accuracy >= 75) {
      feedback = '👍 Gut gemacht! Weiter so! / Добра работа! Продължавайте така!';
    } else if (accuracy >= 60) {
      feedback = '📚 Nicht schlecht! Mehr Übung wird helfen. / Неплохо! Повече практика ще помогне.';
    } else {
      feedback = '💪 Übung macht den Meister! Versuchen Sie es noch einmal. / Практиката прави съвършенство! Опитайте отново.';
    }
        
    if (this.elements.performanceFeedback) {
      this.elements.performanceFeedback.innerHTML = `<p>${feedback}</p>`;
    }
  }

  playAudio() {
    const currentItem = this.sessionItems[this.currentIndex];
    if (!currentItem || !currentItem.word) {
      return;
    }

    // Use enhanced TextToSpeech if available
    if (window.audioManager && window.audioManager.useEnhancedTTS && window.audioManager.tts) {
      const lang = this.learningDirection === 'de-bg' ? 'bg-BG' : 'de-DE';
      window.audioManager.tts.speak(currentItem.word, lang);
      return;
    }

    // Fallback to basic Web Speech API
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentItem.word);
      utterance.lang = this.learningDirection === 'de-bg' ? 'bg-BG' : 'de-DE';
      utterance.rate = 0.85;
      utterance.pitch = 1;
      utterance.volume = 1;
      speechSynthesis.speak(utterance);
    }
  }

  toggleHint() {
    if (this.elements.hintContent) {
      const isHidden = this.elements.hintContent.classList.contains('hidden');
            
      if (isHidden) {
        const currentItem = this.sessionItems[this.currentIndex];
        const hints = this.generateHints(currentItem);
        this.elements.hintContent.innerHTML = hints;
        this.elements.hintContent.classList.remove('hidden');
      } else {
        this.elements.hintContent.classList.add('hidden');
      }
    }
  }

  generateHints(item) {
    const hints = [];
        
    if (item.etymology) {
      hints.push(`<strong>Etymology:</strong> ${item.etymology}`);
    }
        
    if (item.cultural_note) {
      hints.push(`<strong>Cultural Note:</strong> ${item.cultural_note}`);
    }
        
    if (item.linguistic_note) {
      hints.push(`<strong>Linguistic Note:</strong> ${item.linguistic_note}`);
    }
        
    if (item.examples && item.examples.length > 0) {
      const example = item.examples[0];
      hints.push(`<strong>Example:</strong> ${example.sentence} - ${example.translation}`);
    }
        
    return hints.length > 0 ? hints.join('<br><br>') : 'No additional hints available.';
  }

  handleKeyboard(event) {
    if (!this.isInitialized) {
      return;
    }
        
    switch (event.key) {
    case ' ':
    case 'Enter': {
      event.preventDefault();
      if (!this.elements.showAnswer.classList.contains('hidden')) {
        this.showAnswer();
      }
      break;
    }
    case '1': {
      if (!this.elements.responseButtons.classList.contains('hidden')) {
        this.handleResponse(false);
      }
      break;
    }
    case '2': {
      if (!this.elements.responseButtons.classList.contains('hidden')) {
        this.handleResponse(true);
      }
      break;
    }
    case 'h': {
      this.toggleHint();
      break;
    }
    case 'Escape': {
      this.toggleSettings();
      break;
    }
    }
  }

  // UI State Management
  showLoadingState() {
    this.hideAllStates();
    if (this.elements.loadingState) {
      this.elements.loadingState.classList.remove('hidden');
    }
  }

  showNoItemsState() {
    this.hideAllStates();
    if (this.elements.noItemsState) {
      this.elements.noItemsState.classList.remove('hidden');
    }
  }

  showPracticeSession() {
    this.hideAllStates();
    if (this.elements.practiceSession) {
      this.elements.practiceSession.classList.remove('hidden');
    }
  }

  showSessionComplete() {
    this.hideAllStates();
    if (this.elements.sessionComplete) {
      this.elements.sessionComplete.classList.remove('hidden');
    }
  }

  hideAllStates() {
    const states = [
      this.elements.loadingState,
      this.elements.noItemsState,
      this.elements.practiceSession,
      this.elements.sessionComplete
    ];
        
    for (const element of states) {
      if (element) {
        element.classList.add('hidden');
      }
    }
  }

  toggleSettings() {
    if (this.elements.settingsPanel) {
      this.elements.settingsPanel.classList.toggle('hidden');
    }
  }

  // Session Management
  saveSessionState() {
    const sessionState = {
      sessionId: this.sessionStats.sessionId,
      items: this.sessionItems,
      currentIndex: this.currentIndex,
      stats: this.sessionStats,
      timestamp: Date.now()
    };
        
    localStorage.setItem('bgde:current_session', JSON.stringify(sessionState));
  }

  saveSessionResults() {
    const results = {
      sessionId: this.sessionStats.sessionId,
      correct: this.sessionStats.correct,
      total: this.sessionStats.total,
      accuracy: Math.round((this.sessionStats.correct / this.sessionStats.total) * 100),
      duration: Date.now() - this.sessionStats.startTime,
      mistakes: this.sessionStats.mistakes,
      learningDirection: this.learningDirection,
      timestamp: Date.now()
    };
        
    // Save to session history
    const history = JSON.parse(localStorage.getItem('bgde:session_history') || '[]');
    history.unshift(results);
    history.splice(50); // Keep only last 50 sessions
    localStorage.setItem('bgde:session_history', JSON.stringify(history));
  }

  generateSessionId() {
    // Use crypto.getRandomValues for secure random ID
    const array = new Uint8Array(9);
    window.crypto.getRandomValues(array);
    const randomString = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
    return `session_${Date.now()}_${randomString}`;
  }

  endSession() {
    if (confirm('Are you sure you want to end this session?')) {
      this.completeSession();
    }
  }

  startNewSession() {
    // Clear current session
    localStorage.removeItem('bgde:current_session');
    localStorage.removeItem('bgde:practice_selection');
        
    // Reload page to start fresh
    window.location.reload();
  }

  reviewMistakes() {
    if (this.sessionStats.mistakes.length === 0) {
      alert('No mistakes to review in this session!');
      return;
    }
        
    // Create new session with only mistakes
    const mistakeWords = this.sessionStats.mistakes.map(mistake => mistake.item.word);
    localStorage.setItem('bgde:practice_selection', JSON.stringify(mistakeWords));
    window.location.reload();
  }

  showErrorState() {
    this.hideAllStates();
        
    const errorHtml = `
            <div class="error-state">
                <h3>⚠️ Session Error</h3>
                <p>Failed to initialize practice session. Please try again.</p>
                <button onclick="location.reload()" class="btn-primary">Retry</button>
                <a href="/vocabulary/" class="btn-secondary">Back to Vocabulary</a>
            </div>
        `;
        
    if (this.elements.practiceSession) {
      this.elements.practiceSession.innerHTML = errorHtml;
      this.elements.practiceSession.classList.remove('hidden');
    }
  }

  // Cleanup
  destroy() {
    clearInterval(this.sessionTimer);
        
    // Remove event listeners
    document.removeEventListener('keydown', this.handleKeyboard);
        
    // Clear session state
    localStorage.removeItem('bgde:current_session');
  }
}

export default PracticePageModule;
