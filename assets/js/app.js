// Main application JavaScript
class BulgarianGermanApp {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'light';
        this.searchIndex = null;
        this.init();
    }

    init() {
        this.initTheme();
        this.initSearch();
        this.initNavigation();
        this.initLanguageToggle();
        this.initServiceWorker();
    }

    initTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
            this.updateThemeIcon();
        }
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.theme);
        localStorage.setItem('theme', this.theme);
        this.updateThemeIcon();
    }

    updateThemeIcon() {
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = this.theme === 'light' ? '🌙' : '☀️';
        }
    }

    initSearch() {
        const searchToggle = document.getElementById('search-toggle');
        const searchOverlay = document.getElementById('search-overlay');
        const searchInput = document.getElementById('search-input');

        if (searchToggle && searchOverlay) {
            searchToggle.addEventListener('click', () => {
                searchOverlay.classList.toggle('hidden');
                if (!searchOverlay.classList.contains('hidden')) {
                    searchInput?.focus();
                }
            });

            // Close search on escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && !searchOverlay.classList.contains('hidden')) {
                    searchOverlay.classList.add('hidden');
                }
            });
        }
    }

    async initLanguageToggle() {
        try {
            // Language toggle is now inline in the header template
            console.log('Language toggle loaded inline in template');
        } catch (error) {
            console.warn('Language toggle not available:', error);
        }
    }

    initNavigation() {
        // Add active states and smooth scrolling
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(link.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });
    }

    initServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            return;
        }

        const host = window.location.hostname;
        const isDev = host === 'localhost' || host === '127.0.0.1';

        if (isDev) {
            console.log('Skipping SW registration in dev (app.js)');
            return;
        }

        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
}

// Spaced Repetition Algorithm (SM-2)
class SpacedRepetition {
    static calculateNextReview(quality, interval = 1, easeFactor = 2.5, repetitions = 0) {
        let newInterval = interval;
        let newEaseFactor = easeFactor;
        let newRepetitions = repetitions;

        if (quality >= 3) {
            if (repetitions === 0) {
                newInterval = 1;
            } else if (repetitions === 1) {
                newInterval = 6;
            } else {
                newInterval = Math.round(interval * easeFactor);
            }
            newRepetitions++;
        } else {
            newRepetitions = 0;
            newInterval = 1;
        }

        newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        if (newEaseFactor < 1.3) {
            newEaseFactor = 1.3;
        }

        const nextReviewDate = new Date();
        nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

        return {
            interval: newInterval,
            easeFactor: newEaseFactor,
            repetitions: newRepetitions,
            nextReview: nextReviewDate.toISOString()
        };
    }

    static isDue(nextReviewDate) {
        if (!nextReviewDate) return true;
        return new Date() >= new Date(nextReviewDate);
    }
}

// Progress tracking
class ProgressTracker {
    constructor() {
        this.storageKey = 'bulgarian-german-progress';
        this.data = this.loadProgress();
    }

    loadProgress() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : {
            vocabulary: {},
            grammar: {},
            sessions: [],
            streak: 0,
            lastStudyDate: null
        };
    }

    saveProgress() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }

    updateVocabularyItem(word, quality) {
        const current = this.data.vocabulary[word] || {
            interval: 1,
            easeFactor: 2.5,
            repetitions: 0,
            nextReview: null,
            totalReviews: 0,
            correctReviews: 0
        };

        const updated = SpacedRepetition.calculateNextReview(
            quality,
            current.interval,
            current.easeFactor,
            current.repetitions
        );

        this.data.vocabulary[word] = {
            ...current,
            ...updated,
            totalReviews: current.totalReviews + 1,
            correctReviews: current.correctReviews + (quality >= 3 ? 1 : 0),
            lastReview: new Date().toISOString()
        };

        this.saveProgress();
        return this.data.vocabulary[word];
    }

    getDueItems(vocabularyData) {
        return vocabularyData.filter(item => {
            const progress = this.data.vocabulary[item.word];
            return !progress || SpacedRepetition.isDue(progress.nextReview);
        });
    }

    getItemProgress(word) {
        return this.data.vocabulary[word] || null;
    }

    recordSession(sessionData) {
        this.data.sessions.push({
            ...sessionData,
            date: new Date().toISOString()
        });

        // Update streak
        this.updateStreak();
        this.saveProgress();
    }

    updateStreak() {
        const today = new Date().toDateString();
        const lastStudy = this.data.lastStudyDate ? new Date(this.data.lastStudyDate).toDateString() : null;

        if (lastStudy === today) {
            // Already studied today
            return;
        }

        if (lastStudy) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastStudy === yesterday.toDateString()) {
                this.data.streak++;
            } else {
                this.data.streak = 1;
            }
        } else {
            this.data.streak = 1;
        }

        this.data.lastStudyDate = new Date().toISOString();
    }

    getStats() {
        const totalItems = Object.keys(this.data.vocabulary).length;
        const masteredItems = Object.values(this.data.vocabulary)
            .filter(item => item.repetitions >= 3).length;
        
        return {
            totalItems,
            masteredItems,
            streak: this.data.streak,
            totalSessions: this.data.sessions.length,
            accuracy: this.calculateOverallAccuracy()
        };
    }

    calculateOverallAccuracy() {
        const items = Object.values(this.data.vocabulary);
        if (items.length === 0) return 0;

        const totalReviews = items.reduce((sum, item) => sum + item.totalReviews, 0);
        const correctReviews = items.reduce((sum, item) => sum + item.correctReviews, 0);

        return totalReviews > 0 ? Math.round((correctReviews / totalReviews) * 100) : 0;
    }
}

// Audio manager
class AudioManager {
    constructor() {
        this.enabled = localStorage.getItem('audio-enabled') !== 'false';
        this.synthesis = window.speechSynthesis;
        this.voices = [];
        this.loadVoices();
    }

    loadVoices() {
        this.voices = this.synthesis.getVoices();
        if (this.voices.length === 0) {
            this.synthesis.addEventListener('voiceschanged', () => {
                this.voices = this.synthesis.getVoices();
            });
        }
    }

    playWord(word, language = 'bg') {
        if (!this.enabled || !this.synthesis) return;

        const utterance = new SpeechSynthesisUtterance(word);
        
        // Try to find appropriate voice
        const voice = this.voices.find(v => 
            v.lang.startsWith(language === 'bg' ? 'bg' : 'de')
        );
        
        if (voice) {
            utterance.voice = voice;
        }
        
        utterance.rate = 0.8;
        utterance.pitch = 1;
        
        this.synthesis.speak(utterance);
    }

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('audio-enabled', this.enabled.toString());
        return this.enabled;
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    window.app = new BulgarianGermanApp();
    window.progressTracker = new ProgressTracker();
    window.audioManager = new AudioManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BulgarianGermanApp,
        SpacedRepetition,
        ProgressTracker,
        AudioManager
    };
}
