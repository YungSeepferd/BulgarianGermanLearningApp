/**
 * Enhanced Practice Session with Bidirectional Learning Support
 * Integrates with enhanced spaced repetition and vocabulary adapter
 */

class EnhancedPracticeSession {
    constructor(options = {}) {
        this.adapter = options.adapter;
        this.spacedRepetition = options.spacedRepetition;
        this.selectedItems = options.selectedItems || [];
        this.learningDirection = options.learningDirection || 'bg_to_de';
        this.enableAudio = options.enableAudio || false;
        this.sessionLength = options.sessionLength || 20;
        
        // Session state
        this.currentSession = null;
        this.currentItemIndex = 0;
        this.sessionStats = {
            correct: 0,
            total: 0,
            startTime: null,
            responses: []
        };
        
        // Session recovery
        this.sessionId = null;
        this.autoSaveInterval = null;
        
        // UI elements
        this.elements = {};
        this.initialized = false;
    }
    
    /**
     * Initialize the practice session
     */
    init() {
        if (this.initialized) return;
        
        this.cacheElements();
        this.bindEvents();
        
        // Check for existing session to recover
        if (this.checkForRecoverableSession()) {
            this.showSessionRecoveryDialog();
        } else {
            this.setupSession();
        }
        
        this.initialized = true;
    }
    
    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements = {
            // States
            loadingState: document.getElementById('loading-state'),
            noItemsState: document.getElementById('no-items-state'),
            practiceSession: document.getElementById('practice-session'),
            sessionComplete: document.getElementById('session-complete'),
            
            // Session stats
            progress: document.getElementById('progress'),
            accuracy: document.getElementById('accuracy'),
            sessionTime: document.getElementById('session-time'),
            
            // Flashcard
            flashcard: document.getElementById('flashcard'),
            currentWord: document.getElementById('current-word'),
            currentTranslation: document.getElementById('current-translation'),
            currentNotes: document.getElementById('current-notes'),
            wordLevel: document.getElementById('word-level'),
            wordCategory: document.getElementById('word-category'),
            
            // Controls
            showAnswer: document.getElementById('show-answer'),
            responseButtons: document.getElementById('response-buttons'),
            correctBtn: document.getElementById('correct-btn'),
            incorrectBtn: document.getElementById('incorrect-btn'),
            playAudio: document.getElementById('play-audio'),
            
            // Hint system
            showHint: document.getElementById('show-hint'),
            hintContent: document.getElementById('hint-content'),
            
            // Progress
            progressFill: document.getElementById('progress-fill'),
            
            // Session controls
            endSession: document.getElementById('end-session'),
            settingsToggle: document.getElementById('settings-toggle'),
            settingsPanel: document.getElementById('settings-panel'),
            
            // Final stats
            finalCorrect: document.getElementById('final-correct'),
            finalTotal: document.getElementById('final-total'),
            finalAccuracy: document.getElementById('final-accuracy'),
            finalTime: document.getElementById('final-time'),
            performanceFeedback: document.getElementById('performance-feedback'),
            
            // Actions
            newSession: document.getElementById('new-session'),
            reviewMistakes: document.getElementById('review-mistakes')
        };
    }
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Flashcard controls
        this.elements.showAnswer?.addEventListener('click', () => this.showAnswer());
        this.elements.correctBtn?.addEventListener('click', () => this.recordResponse(true));
        this.elements.incorrectBtn?.addEventListener('click', () => this.recordResponse(false));
        
        // Audio playback
        this.elements.playAudio?.addEventListener('click', () => this.playAudio());
        
        // Hint system
        this.elements.showHint?.addEventListener('click', () => this.toggleHint());
        
        // Session controls
        this.elements.endSession?.addEventListener('click', () => this.endSession());
        this.elements.settingsToggle?.addEventListener('click', () => this.toggleSettings());
        
        // Final actions
        this.elements.newSession?.addEventListener('click', () => this.startNewSession());
        this.elements.reviewMistakes?.addEventListener('click', () => this.reviewMistakes());
        
        // Listen for language direction changes
        document.addEventListener('learning-direction-changed', (event) => {
            this.learningDirection = event.detail.direction;
            this.setupSession(); // Restart with new direction
        });
        
        // Listen for keyboard events
        document.addEventListener('keydown', (event) => this.handleKeyboard(event));
    }
    
    /**
     * Handle keyboard events
     */
    handleKeyboard(event) {
        // Prevent handling if user is typing in an input
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        // Ensure focus is visible for keyboard navigation
        if (event.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
            return;
        }
        
        switch(event.key) {
            case ' ':
            case 'Enter':
                event.preventDefault();
                if (this.elements.showAnswer && !this.elements.showAnswer.classList.contains('hidden')) {
                    this.showAnswer();
                } else if (this.elements.flipCard && !this.elements.flipCard.classList.contains('hidden')) {
                    this.flipCard();
                }
                break;
            case '1':
                event.preventDefault();
                if (!this.elements.responseButtons.classList.contains('hidden')) {
                    this.recordResponse(false);
                }
                break;
            case '2':
                event.preventDefault();
                if (!this.elements.responseButtons.classList.contains('hidden')) {
                    this.recordResponse(true);
                }
                break;
            case 'h':
            case 'H':
                event.preventDefault();
                if (this.elements.showHint && !this.elements.showHint.classList.contains('hidden')) {
                    this.toggleHint();
                }
                break;
            case 'Escape':
                event.preventDefault();
                if (this.elements.endSession) {
                    this.endSession();
                }
                break;
            case 'ArrowLeft':
            case 'ArrowRight':
                event.preventDefault();
                // Allow navigation between response buttons
                if (!this.elements.responseButtons.classList.contains('hidden')) {
                    const buttons = this.elements.responseButtons.querySelectorAll('.btn');
                    const focused = document.activeElement;
                    const currentIndex = Array.from(buttons).indexOf(focused);
                    
                    if (currentIndex !== -1) {
                        const nextIndex = event.key === 'ArrowRight' 
                            ? (currentIndex + 1) % buttons.length
                            : (currentIndex - 1 + buttons.length) % buttons.length;
                        buttons[nextIndex].focus();
                    } else if (buttons.length > 0) {
                        buttons[0].focus();
                    }
                }
                break;
        }
    }
    
    /**
     * Setup practice session
     */
    async setupSession() {
        this.showLoadingState();
        
        try {
            // Create practice session based on selected items or spaced repetition
            if (this.selectedItems.length > 0) {
                this.currentSession = await this.createSelectedItemsSession();
            } else {
                this.currentSession = await this.createSpacedRepetitionSession();
            }
            
            if (this.currentSession.items.length === 0) {
                this.showNoItemsState();
                return;
            }
            
            // Initialize session stats
            this.sessionStats = {
                correct: 0,
                total: 0,
                startTime: new Date(),
                responses: []
            };
            
            // Initialize session recovery
            this.sessionId = this.generateSessionId();
            this.currentItemIndex = 0;
            
            // Start auto-save
            this.startAutoSave();
            
            this.showPracticeSession();
            this.displayCurrentItem();
            this.startTimer();
            
        } catch (error) {
            console.error('Failed to setup practice session:', error);
            this.showNoItemsState();
        }
    }
    
    /**
     * Create session from selected vocabulary items
     */
    async createSelectedItemsSession() {
        const allItems = this.adapter.getItemsForDirection(this.learningDirection);
        const selectedVocab = allItems.filter(item => 
            this.selectedItems.includes(item.word) || this.selectedItems.includes(item.id)
        );
        
        // Shuffle selected items
        const shuffled = this.shuffleArray([...selectedVocab]);
        
        return {
            sessionId: this.generateSessionId(),
            learningMode: this.learningDirection,
            items: shuffled.slice(0, this.sessionLength),
            startTime: new Date(),
            type: 'selected'
        };
    }
    
    /**
     * Create session using spaced repetition algorithm
     */
    async createSpacedRepetitionSession() {
        const allItems = this.adapter.getItemsForDirection(this.learningDirection);
        
        return this.spacedRepetition.createPracticeSession(allItems, {
            maxItems: this.sessionLength,
            learningMode: this.learningDirection,
            includeNew: true
        });
    }
    
    /**
     * Display current vocabulary item
     */
    displayCurrentItem() {
        if (!this.currentSession || this.currentItemIndex >= this.currentSession.items.length) {
            this.completeSession();
            return;
        }
        
        const currentItem = this.getCurrentItem();
        const vocabItem = this.getVocabularyItem(currentItem);
        
        if (!vocabItem) {
            this.nextItem();
            return;
        }
        
        // Reset flashcard state
        this.resetFlashcard();
        
        // Display word based on learning direction
        const { word, translation } = this.getDisplayContent(vocabItem);
        
        this.elements.currentWord.textContent = word;
        this.elements.currentTranslation.textContent = translation;
        this.elements.currentNotes.textContent = vocabItem.notes || '';
        
        // Display metadata
        this.elements.wordLevel.textContent = vocabItem.level || 'A1';
        this.elements.wordLevel.className = `level-badge level-${(vocabItem.level || 'A1').toLowerCase()}`;
        this.elements.wordCategory.textContent = vocabItem.category || '';
        
        // Setup audio if available
        this.setupAudio(vocabItem);
        
        // Setup hint content
        this.setupHint(vocabItem);
        
        // Update progress and start timing for this item
        this.updateProgress();
        this.currentItemStartTime = Date.now();
    }
    
    /**
     * Get current item from session
     */
    getCurrentItem() {
        if (this.currentSession.type === 'selected') {
            return this.currentSession.items[this.currentItemIndex];
        } else {
            // Spaced repetition session item
            return this.currentSession.items[this.currentItemIndex];
        }
    }
    
    /**
     * Get vocabulary item data
     */
    getVocabularyItem(sessionItem) {
        if (sessionItem.itemId) {
            // Spaced repetition item - find by ID
            const allItems = this.adapter.getItemsForDirection(this.learningDirection);
            return allItems.find(item => item.id === sessionItem.itemId);
        } else {
            // Direct vocabulary item
            return sessionItem;
        }
    }
    
    /**
     * Get display content based on learning direction
     */
    getDisplayContent(vocabItem) {
        if (this.learningDirection === 'de_to_bg') {
            return {
                word: vocabItem.translation, // Show German word
                translation: vocabItem.word  // Answer with Bulgarian
            };
        } else {
            return {
                word: vocabItem.word,        // Show Bulgarian word
                translation: vocabItem.translation // Answer with German
            };
        }
    }
    
    /**
     * Setup audio playback
     */
    setupAudio(vocabItem) {
        if (!this.enableAudio || !this.elements.playAudio) return;
        
        if (vocabItem.audio) {
            this.elements.playAudio.style.display = 'block';
            this.elements.playAudio.dataset.audio = vocabItem.audio;
        } else {
            this.elements.playAudio.style.display = 'none';
        }
    }
    
    /**
     * Setup hint content
     */
    setupHint(vocabItem) {
        if (!this.elements.showHint || !this.elements.hintContent) return;
        
        let hints = [];
        
        // Add etymology as hint if available
        if (vocabItem.etymology) {
            hints.push(`Etymology: ${vocabItem.etymology}`);
        }
        
        // Add linguistic notes as hint
        if (vocabItem.linguistic_note) {
            hints.push(`Grammar: ${vocabItem.linguistic_note}`);
        }
        
        // Add cultural context as hint
        if (vocabItem.cultural_note) {
            hints.push(`Cultural: ${vocabItem.cultural_note}`);
        }
        
        // Add examples as hints
        if (vocabItem.examples && vocabItem.examples.length > 0) {
            const example = vocabItem.examples[0];
            hints.push(`Example: ${example.text} → ${example.translation}`);
        }
        
        if (hints.length > 0) {
            this.elements.hintContent.innerHTML = hints.map(hint => `<p>${hint}</p>`).join('');
            this.elements.showHint.style.display = 'block';
        } else {
            this.elements.showHint.style.display = 'none';
        }
    }
    
    /**
     * Show answer (flip flashcard)
     */
    showAnswer() {
        this.elements.flashcard.classList.add('flipped');
        this.elements.showAnswer.classList.add('hidden');
        this.elements.responseButtons.classList.remove('hidden');
        
        // Play audio automatically if enabled
        if (this.enableAudio) {
            setTimeout(() => this.playAudio(), 300);
        }
    }
    
    /**
     * Play audio pronunciation
     */
    playAudio() {
        const audioFile = this.elements.playAudio?.dataset.audio;
        if (!audioFile) return;
        
        const audio = new Audio(`/audio/${audioFile}`);
        audio.play().catch(error => {
            console.warn('Failed to play audio:', error);
        });
    }
    
    /**
     * Toggle hint visibility
     */
    toggleHint() {
        const isVisible = !this.elements.hintContent.classList.contains('hidden');
        
        if (isVisible) {
            this.elements.hintContent.classList.add('hidden');
            this.elements.showHint.textContent = '💡 Hint';
        } else {
            this.elements.hintContent.classList.remove('hidden');
            this.elements.showHint.textContent = '🔼 Hide Hint';
        }
    }
    
    /**
     * Record user response
     */
    recordResponse(correct) {
        const currentItem = this.getCurrentItem();
        const vocabItem = this.getVocabularyItem(currentItem);
        const responseTime = this.currentItemStartTime ? Date.now() - this.currentItemStartTime : 0;
        
        // Record in session stats
        this.sessionStats.total++;
        if (correct) {
            this.sessionStats.correct++;
        }
        
        this.sessionStats.responses.push({
            itemId: vocabItem.id,
            word: vocabItem.word,
            correct: correct,
            responseTime: responseTime,
            timestamp: new Date()
        });
        
        // Update spaced repetition state
        if (this.spacedRepetition) {
            this.spacedRepetition.recordReview(
                vocabItem.id, 
                correct, 
                vocabItem, 
                responseTime
            );
        }
        
        // Update UI immediately
        this.updateSessionStats();
        this.updateProgress();
        
        // Move to next item after delay
        setTimeout(() => {
            this.nextItem();
        }, 1000);
    }
    
    /**
     * Move to next item
     */
    nextItem() {
        this.currentItemIndex++;
        
        if (this.currentItemIndex >= this.currentSession.items.length) {
            this.completeSession();
        } else {
            this.displayCurrentItem();
        }
    }
    
    /**
     * Reset flashcard to front side
     */
    resetFlashcard() {
        this.elements.flashcard.classList.remove('flipped');
        this.elements.showAnswer.classList.remove('hidden');
        this.elements.responseButtons.classList.add('hidden');
        this.elements.hintContent.classList.add('hidden');
        this.elements.showHint.textContent = '💡 Hint';
    }
    
    /**
     * Update progress display
     */
    updateProgress() {
        if (!this.currentSession || !this.elements.progress) return;
        
        // Use completed items count for more accurate progress
        const completedItems = this.sessionStats.total;
        const totalItems = this.currentSession.items.length;
        const currentItem = Math.min(this.currentItemIndex + 1, totalItems);
        
        const progress = `${currentItem}/${totalItems}`;
        this.elements.progress.textContent = progress;
        
        // Progress bar shows actual completion, not just current position
        const percentage = (completedItems / totalItems) * 100;
        if (this.elements.progressFill) {
            this.elements.progressFill.style.width = `${Math.min(percentage, 100)}%`;
        }
    }
    
    /**
     * Update session statistics
     */
    updateSessionStats() {
        const accuracy = this.sessionStats.total > 0 
            ? Math.round((this.sessionStats.correct / this.sessionStats.total) * 100)
            : 0;
        
        this.elements.accuracy.textContent = `${accuracy}%`;
    }
    
    /**
     * Start session timer
     */
    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.sessionStats.startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            
            this.elements.sessionTime.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }
    
    /**
     * Complete the session
     */
    completeSession() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        // Calculate final stats
        const totalTime = Date.now() - this.sessionStats.startTime;
        const accuracy = this.sessionStats.total > 0 
            ? Math.round((this.sessionStats.correct / this.sessionStats.total) * 100)
            : 0;
        
        // Display final stats
        this.elements.finalCorrect.textContent = this.sessionStats.correct;
        this.elements.finalTotal.textContent = this.sessionStats.total;
        this.elements.finalAccuracy.textContent = `${accuracy}%`;
        
        const minutes = Math.floor(totalTime / 60000);
        const seconds = Math.floor((totalTime % 60000) / 1000);
        this.elements.finalTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Generate performance feedback
        this.generatePerformanceFeedback(accuracy);
        
        // Clear selected items from localStorage
        localStorage.removeItem('bgde:practice_selection');
        
        // Stop auto-save and clear saved session
        this.stopAutoSave();
        this.clearSavedSession();
        
        // Show completion screen
        this.showSessionComplete();
    }
    
    /**
     * Generate performance feedback
     */
    generatePerformanceFeedback(accuracy) {
        let feedback = '';
        
        if (accuracy >= 90) {
            feedback = '🌟 Ausgezeichnete Arbeit! Sie haben diese Wörter gemeistert. / Отлична работа! Овладяхте тези думи.';
        } else if (accuracy >= 75) {
            feedback = '👍 Gute Arbeit! Üben Sie weiter, um sich zu verbessern. / Добра работа! Продължете да упражнявате, за да се подобрите.';
        } else if (accuracy >= 60) {
            feedback = '📚 Nicht schlecht! Wiederholen Sie diese Wörter und versuchen Sie es erneut. / Неплохо! Прегледайте тези думи и опитайте отново.';
        } else {
            feedback = '💪 Üben Sie weiter! Diese Wörter brauchen mehr Aufmerksamkeit. / Продължете да упражнявате! Тези думи се нуждаят от повече внимание.';
        }
        
        this.elements.performanceFeedback.innerHTML = `<p>${feedback}</p>`;
    }
    
    /**
     * End session early
     */
    endSession() {
        if (confirm('Sind Sie sicher, dass Sie diese Sitzung beenden möchten? / Сигурни ли сте, че искате да приключите тази сесия?')) {
            // Stop auto-save and clear saved session
            this.stopAutoSave();
            this.clearSavedSession();
            this.completeSession();
        }
    }
    
    /**
     * Toggle settings panel
     */
    toggleSettings() {
        this.elements.settingsPanel.classList.toggle('hidden');
    }
    
    /**
     * Start new session
     */
    startNewSession() {
        this.currentItemIndex = 0;
        this.setupSession();
    }
    
    /**
     * Review mistakes from current session
     */
    reviewMistakes() {
        const mistakes = this.sessionStats.responses.filter(r => !r.correct);
        
        if (mistakes.length === 0) {
            alert('Keine Fehler zu überprüfen - großartige Arbeit! / Няма грешки за преглед - отлична работа!');
            return;
        }
        
        // Store mistakes for review
        const mistakeWords = mistakes.map(m => m.word);
        localStorage.setItem('bgde:practice_selection', JSON.stringify(mistakeWords));
        
        // Restart session with mistakes
        this.selectedItems = mistakeWords;
        this.setupSession();
    }
    
    /**
     * Show loading state
     */
    showLoadingState() {
        this.hideAllStates();
        this.elements.loadingState.classList.remove('hidden');
    }
    
    /**
     * Show no items state
     */
    showNoItemsState() {
        this.hideAllStates();
        this.elements.noItemsState.classList.remove('hidden');
    }
    
    /**
     * Show practice session
     */
    showPracticeSession() {
        this.hideAllStates();
        this.elements.practiceSession.classList.remove('hidden');
    }
    
    /**
     * Show session complete
     */
    showSessionComplete() {
        this.hideAllStates();
        this.elements.sessionComplete.classList.remove('hidden');
    }
    
    /**
     * Hide all state containers
     */
    hideAllStates() {
        this.elements.loadingState.classList.add('hidden');
        this.elements.noItemsState.classList.add('hidden');
        this.elements.practiceSession.classList.add('hidden');
        this.elements.sessionComplete.classList.add('hidden');
    }
    
    /**
     * Check if there's a recoverable session in localStorage
     */
    checkForRecoverableSession() {
        try {
            const savedSession = localStorage.getItem('bgde:current_session');
            if (!savedSession) return false;
            
            const sessionData = JSON.parse(savedSession);
            const now = Date.now();
            const sessionAge = now - sessionData.lastSaved;
            
            // Only recover sessions less than 1 hour old
            return sessionAge < 3600000 && sessionData.currentItemIndex < sessionData.items.length;
        } catch (error) {
            console.warn('Error checking for recoverable session:', error);
            return false;
        }
    }
    
    /**
     * Show session recovery dialog
     */
    showSessionRecoveryDialog() {
        const savedSession = JSON.parse(localStorage.getItem('bgde:current_session'));
        const progress = `${savedSession.currentItemIndex}/${savedSession.items.length}`;
        
        const message = `Eine unvollständige Übungssitzung gefunden (${progress} abgeschlossen). Möchten Sie dort weitermachen, wo Sie aufgehört haben? / Намерена е незавършена сесия за упражнения (${progress} завършени). Искате ли да продължите от там, където спряхте?`;
        
        if (confirm(message)) {
            this.recoverSession(savedSession);
        } else {
            this.clearSavedSession();
            this.setupSession();
        }
    }
    
    /**
     * Recover session from saved data
     */
    recoverSession(savedData) {
        this.sessionId = savedData.sessionId;
        this.currentSession = savedData;
        this.currentItemIndex = savedData.currentItemIndex;
        this.sessionStats = savedData.sessionStats;
        this.learningDirection = savedData.learningDirection;
        
        // Start auto-save
        this.startAutoSave();
        
        // Show current item
        this.showCurrentItem();
        this.showPracticeSession();
        
        console.log('Session recovered successfully');
    }
    
    /**
     * Save current session state to localStorage
     */
    saveSession() {
        if (!this.currentSession || !this.sessionId) return;
        
        try {
            const sessionData = {
                sessionId: this.sessionId,
                items: this.currentSession.items,
                currentItemIndex: this.currentItemIndex,
                sessionStats: this.sessionStats,
                learningDirection: this.learningDirection,
                lastSaved: Date.now()
            };
            
            localStorage.setItem('bgde:current_session', JSON.stringify(sessionData));
        } catch (error) {
            console.warn('Error saving session:', error);
        }
    }
    
    /**
     * Clear saved session from localStorage
     */
    clearSavedSession() {
        try {
            localStorage.removeItem('bgde:current_session');
        } catch (error) {
            console.warn('Error clearing saved session:', error);
        }
    }
    
    /**
     * Start auto-save interval
     */
    startAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        // Auto-save every 10 seconds
        this.autoSaveInterval = setInterval(() => {
            this.saveSession();
        }, 10000);
    }
    
    /**
     * Stop auto-save interval
     */
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }
    
    /**
     * Shuffle array utility
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    /**
     * Generate session ID
     */
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedPracticeSession;
}

// Global availability for browser
if (typeof window !== 'undefined') {
    window.EnhancedPracticeSession = EnhancedPracticeSession;
}
