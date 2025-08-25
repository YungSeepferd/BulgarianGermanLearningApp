// Practice session management
class PracticeSession {
    constructor(options) {
        this.vocabulary = options.vocabulary || [];
        this.enableAudio = options.enableAudio || false;
        this.sessionLength = options.sessionLength || 20;
        
        this.currentSession = null;
        this.currentIndex = 0;
        this.sessionStats = {
            correct: 0,
            total: 0,
            startTime: null,
            mistakes: []
        };
        
        this.isAnswerShown = false;
        this.sessionTimer = null;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSessionData();
        this.startSession();
    }

    bindEvents() {
        // Session controls
        const endSessionBtn = document.getElementById('end-session');
        const settingsToggle = document.getElementById('settings-toggle');
        const settingsPanel = document.getElementById('settings-panel');
        const newSessionBtn = document.getElementById('new-session');
        const reviewMistakesBtn = document.getElementById('review-mistakes');

        if (endSessionBtn) {
            endSessionBtn.addEventListener('click', () => this.endSession());
        }

        if (settingsToggle && settingsPanel) {
            settingsToggle.addEventListener('click', () => {
                settingsPanel.classList.toggle('hidden');
            });
        }

        if (newSessionBtn) {
            newSessionBtn.addEventListener('click', () => this.startNewSession());
        }

        if (reviewMistakesBtn) {
            reviewMistakesBtn.addEventListener('click', () => this.reviewMistakes());
        }

        // Practice controls
        const showAnswerBtn = document.getElementById('show-answer');
        const correctBtn = document.getElementById('correct-btn');
        const incorrectBtn = document.getElementById('incorrect-btn');
        const playAudioBtn = document.getElementById('play-audio');
        const showHintBtn = document.getElementById('show-hint');

        if (showAnswerBtn) {
            showAnswerBtn.addEventListener('click', () => this.showAnswer());
        }

        if (correctBtn) {
            correctBtn.addEventListener('click', () => this.recordResponse(true));
        }

        if (incorrectBtn) {
            incorrectBtn.addEventListener('click', () => this.recordResponse(false));
        }

        if (playAudioBtn) {
            playAudioBtn.addEventListener('click', () => this.playCurrentAudio());
        }

        if (showHintBtn) {
            showHintBtn.addEventListener('click', () => this.showHint());
        }

        // Settings
        const sessionLengthSelect = document.getElementById('session-length');
        const difficultyFilter = document.getElementById('difficulty-filter');
        const audioEnabled = document.getElementById('audio-enabled');

        if (sessionLengthSelect) {
            sessionLengthSelect.addEventListener('change', (e) => {
                this.sessionLength = parseInt(e.target.value);
            });
        }

        if (audioEnabled) {
            audioEnabled.addEventListener('change', (e) => {
                this.enableAudio = e.target.checked;
                window.audioManager?.toggle();
            });
        }
    }

    loadSessionData() {
        // Check for stored session data from vocabulary/grammar pages
        const storedSession = sessionStorage.getItem('practice-session');
        if (storedSession) {
            const sessionData = JSON.parse(storedSession);
            this.currentSession = sessionData.items;
            sessionStorage.removeItem('practice-session');
            return;
        }

        // Generate new session from due items
        this.generateSession();
    }

    generateSession() {
        const dueItems = window.progressTracker?.getDueItems(this.vocabulary) || this.vocabulary;
        
        if (dueItems.length === 0) {
            this.showNoItemsState();
            return;
        }

        // Shuffle and limit to session length
        const shuffled = this.shuffleArray([...dueItems]);
        this.currentSession = shuffled.slice(0, this.sessionLength);
    }

    startSession() {
        if (!this.currentSession || this.currentSession.length === 0) {
            this.showNoItemsState();
            return;
        }

        this.sessionStats = {
            correct: 0,
            total: 0,
            startTime: Date.now(),
            mistakes: []
        };

        this.currentIndex = 0;
        this.hideLoadingState();
        this.showPracticeSession();
        this.startTimer();
        this.showCurrentItem();
    }

    showCurrentItem() {
        if (this.currentIndex >= this.currentSession.length) {
            this.completeSession();
            return;
        }

        const item = this.currentSession[this.currentIndex];
        this.isAnswerShown = false;

        // Update UI elements
        const currentWord = document.getElementById('current-word');
        const currentTranslation = document.getElementById('current-translation');
        const currentNotes = document.getElementById('current-notes');
        const wordLevel = document.getElementById('word-level');
        const wordCategory = document.getElementById('word-category');

        if (currentWord) currentWord.textContent = item.word;
        if (currentTranslation) currentTranslation.textContent = item.translation;
        if (currentNotes) currentNotes.textContent = item.notes || '';
        if (wordLevel) {
            wordLevel.textContent = item.level;
            wordLevel.className = `level-badge level-${item.level.toLowerCase()}`;
        }
        if (wordCategory) wordCategory.textContent = item.category;

        // Reset card state
        const flashcard = document.getElementById('flashcard');
        const showAnswerBtn = document.getElementById('show-answer');
        const responseButtons = document.getElementById('response-buttons');

        if (flashcard) flashcard.classList.remove('flipped');
        if (showAnswerBtn) showAnswerBtn.classList.remove('hidden');
        if (responseButtons) responseButtons.classList.add('hidden');

        this.updateProgress();
        this.updateHint(item);
    }

    showAnswer() {
        this.isAnswerShown = true;
        
        const flashcard = document.getElementById('flashcard');
        const showAnswerBtn = document.getElementById('show-answer');
        const responseButtons = document.getElementById('response-buttons');

        if (flashcard) flashcard.classList.add('flipped');
        if (showAnswerBtn) showAnswerBtn.classList.add('hidden');
        if (responseButtons) responseButtons.classList.remove('hidden');

        // Auto-play audio if enabled
        if (this.enableAudio) {
            this.playCurrentAudio();
        }
    }

    recordResponse(isCorrect) {
        if (!this.isAnswerShown) return;

        const item = this.currentSession[this.currentIndex];
        this.sessionStats.total++;

        if (isCorrect) {
            this.sessionStats.correct++;
            // Update progress with quality 4 (good)
            window.progressTracker?.updateVocabularyItem(item.word, 4);
        } else {
            this.sessionStats.mistakes.push(item);
            // Update progress with quality 2 (hard)
            window.progressTracker?.updateVocabularyItem(item.word, 2);
        }

        this.updateSessionStats();
        this.currentIndex++;
        
        // Small delay before showing next item
        setTimeout(() => this.showCurrentItem(), 500);
    }

    playCurrentAudio() {
        if (!this.enableAudio || this.currentIndex >= this.currentSession.length) return;
        
        const item = this.currentSession[this.currentIndex];
        window.audioManager?.playWord(item.word, 'bg');
    }

    showHint() {
        const item = this.currentSession[this.currentIndex];
        const hintContent = document.getElementById('hint-content');
        
        if (hintContent && item.notes) {
            hintContent.textContent = item.notes;
            hintContent.classList.remove('hidden');
        }
    }

    updateHint(item) {
        const showHintBtn = document.getElementById('show-hint');
        const hintContent = document.getElementById('hint-content');
        
        if (showHintBtn && hintContent) {
            if (item.notes) {
                showHintBtn.classList.remove('hidden');
                hintContent.classList.add('hidden');
            } else {
                showHintBtn.classList.add('hidden');
                hintContent.classList.add('hidden');
            }
        }
    }

    updateProgress() {
        const progress = document.getElementById('progress');
        const progressFill = document.getElementById('progress-fill');
        
        if (progress) {
            progress.textContent = `${this.currentIndex + 1}/${this.currentSession.length}`;
        }
        
        if (progressFill) {
            const percentage = ((this.currentIndex + 1) / this.currentSession.length) * 100;
            progressFill.style.width = `${percentage}%`;
        }
    }

    updateSessionStats() {
        const accuracy = document.getElementById('accuracy');
        
        if (accuracy && this.sessionStats.total > 0) {
            const accuracyPercent = Math.round((this.sessionStats.correct / this.sessionStats.total) * 100);
            accuracy.textContent = `${accuracyPercent}%`;
        }
    }

    startTimer() {
        const sessionTime = document.getElementById('session-time');
        if (!sessionTime) return;

        this.sessionTimer = setInterval(() => {
            const elapsed = Date.now() - this.sessionStats.startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            sessionTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    completeSession() {
        this.stopTimer();
        
        const sessionData = {
            correct: this.sessionStats.correct,
            total: this.sessionStats.total,
            accuracy: Math.round((this.sessionStats.correct / this.sessionStats.total) * 100),
            duration: Date.now() - this.sessionStats.startTime,
            mistakes: this.sessionStats.mistakes
        };

        // Record session in progress tracker
        window.progressTracker?.recordSession(sessionData);

        this.showSessionComplete(sessionData);
    }

    showSessionComplete(sessionData) {
        const practiceSession = document.getElementById('practice-session');
        const sessionComplete = document.getElementById('session-complete');

        if (practiceSession) practiceSession.classList.add('hidden');
        if (sessionComplete) sessionComplete.classList.remove('hidden');

        // Update completion stats
        const finalCorrect = document.getElementById('final-correct');
        const finalTotal = document.getElementById('final-total');
        const finalAccuracy = document.getElementById('final-accuracy');
        const finalTime = document.getElementById('final-time');

        if (finalCorrect) finalCorrect.textContent = sessionData.correct;
        if (finalTotal) finalTotal.textContent = sessionData.total;
        if (finalAccuracy) finalAccuracy.textContent = `${sessionData.accuracy}%`;
        if (finalTime) {
            const minutes = Math.floor(sessionData.duration / 60000);
            const seconds = Math.floor((sessionData.duration % 60000) / 1000);
            finalTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }

        this.showPerformanceFeedback(sessionData);
    }

    showPerformanceFeedback(sessionData) {
        const feedbackElement = document.getElementById('performance-feedback');
        if (!feedbackElement) return;

        let feedback = '';
        const accuracy = sessionData.accuracy;

        if (accuracy >= 90) {
            feedback = '🎉 Excellent work! You\'re mastering this vocabulary.';
        } else if (accuracy >= 75) {
            feedback = '👍 Good job! Keep practicing to improve further.';
        } else if (accuracy >= 60) {
            feedback = '📚 Not bad! Review the missed items and try again.';
        } else {
            feedback = '💪 Keep going! Practice makes perfect.';
        }

        if (sessionData.mistakes.length > 0) {
            feedback += ` You missed ${sessionData.mistakes.length} items - consider reviewing them.`;
        }

        feedbackElement.textContent = feedback;
    }

    endSession() {
        if (confirm('Are you sure you want to end this session?')) {
            this.stopTimer();
            window.location.href = '/';
        }
    }

    startNewSession() {
        this.generateSession();
        this.startSession();
    }

    reviewMistakes() {
        if (this.sessionStats.mistakes.length === 0) return;
        
        this.currentSession = [...this.sessionStats.mistakes];
        this.startSession();
    }

    stopTimer() {
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
            this.sessionTimer = null;
        }
    }

    hideLoadingState() {
        const loadingState = document.getElementById('loading-state');
        if (loadingState) loadingState.classList.add('hidden');
    }

    showPracticeSession() {
        const practiceSession = document.getElementById('practice-session');
        if (practiceSession) practiceSession.classList.remove('hidden');
    }

    showNoItemsState() {
        const loadingState = document.getElementById('loading-state');
        const noItemsState = document.getElementById('no-items-state');
        
        if (loadingState) loadingState.classList.add('hidden');
        if (noItemsState) noItemsState.classList.remove('hidden');
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

// Export for use in templates
window.PracticeSession = PracticeSession;
