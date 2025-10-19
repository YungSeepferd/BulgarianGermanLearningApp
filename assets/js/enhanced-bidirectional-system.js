/**
 * Enhanced Bidirectional Learning System
 * Complete implementation with vocabulary expansion and cultural context
 */

class EnhancedBidirectionalSystem {
    constructor() {
        this.currentDirection = this.readDirection();
        this.vocabularyData = [];
        this.culturalGrammarData = [];
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupLanguageToggle();
        this.updateFlashcardDirection();
        this.observeFlashcards();
        this.setupDirectionIndicator();
    }

    async loadData() {
        try {
            // Load enhanced vocabulary data
            const vocabResponse = await fetch('/BulgarianGermanLearningApp/data/vocabulary-enhanced.json');
            if (vocabResponse.ok) {
                this.vocabularyData = await vocabResponse.json();
                console.log('Enhanced vocabulary loaded:', this.vocabularyData.length, 'items');
            }

            // Load cultural grammar data
            const grammarResponse = await fetch('/BulgarianGermanLearningApp/data/cultural-grammar.json');
            if (grammarResponse.ok) {
                this.culturalGrammarData = await grammarResponse.json();
                console.log('Cultural grammar loaded:', this.culturalGrammarData.length, 'items');
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    setupLanguageToggle() {
        if (!window.languageToggle) {
            this.createLanguageToggle();
        } else {
            this.updateToggleState();
        }

        const handleDirectionChange = (event) => {
            const detail = event?.detail;
            const nextDirection = this.normalizeDirection(detail?.direction);

            if (!nextDirection) {
                return;
            }

            this.currentDirection = nextDirection;
            this.updateFlashcardDirection();
            this.updateDirectionIndicator();
            this.updateToggleState();
        };

        document.addEventListener('language-direction-changed', handleDirectionChange);
        document.addEventListener('languageDirectionChanged', handleDirectionChange);
        window.addEventListener('learning-direction-changed', handleDirectionChange);

        window.addEventListener('storage', (event) => {
            if (event.key === 'bgde:language-direction') {
                const nextDirection = this.normalizeDirection(event.newValue);
                if (nextDirection) {
                    this.currentDirection = nextDirection;
                    this.updateFlashcardDirection();
                    this.updateDirectionIndicator();
                    this.updateToggleState();
                }
            } else if (event.key === 'bgde:learning_direction') {
                const migrated = this.normalizeDirection(event.newValue);
                if (migrated) {
                    localStorage.removeItem('bgde:learning_direction');
                    localStorage.setItem('bgde:language-direction', migrated);
                    this.currentDirection = migrated;
                    this.updateFlashcardDirection();
                    this.updateDirectionIndicator();
                    this.updateToggleState();
                }
            }
        });
    }

    createLanguageToggle() {
        const toggle = document.createElement('div');
        toggle.className = 'language-toggle';
        toggle.innerHTML = `
            <button class="toggle-btn" data-direction="bg-de">
                <span class="flag">🇧🇬</span> → <span class="flag">🇩🇪</span>
                <span class="label">Български → Deutsch</span>
            </button>
            <button class="toggle-btn" data-direction="de-bg">
                <span class="flag">🇩🇪</span> → <span class="flag">🇧🇬</span>
                <span class="label">Deutsch → Български</span>
            </button>
        `;

        // Add to top of page
        document.body.insertBefore(toggle, document.body.firstChild);

        // Bind click events
        toggle.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const direction = btn.dataset.direction;
                this.setDirection(direction);
            });
        });

        this.updateToggleState();
    }

    updateToggleState() {
        const buttons = document.querySelectorAll('.language-toggle .toggle-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.direction === this.currentDirection);
        });
    }

    setupDirectionIndicator() {
        let indicator = document.getElementById('direction-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'direction-indicator';
            indicator.className = 'language-direction-indicator';
            document.body.appendChild(indicator);
        }
        this.updateDirectionIndicator();
    }

    updateDirectionIndicator() {
        const indicator = document.getElementById('direction-indicator');
        if (!indicator) return;

        const isReversed = this.currentDirection === 'de-bg';
        indicator.className = `language-direction-indicator ${isReversed ? 'de-to-bg' : 'bg-to-de'}`;
        indicator.textContent = isReversed ? 'Deutsch → Български' : 'Български → Deutsch';
    }

    updateFlashcardDirection() {
        const flashcards = document.querySelectorAll('.flashcard-item');
        const isReversed = this.currentDirection === 'de-bg';

        flashcards.forEach(flashcard => {
            this.updateSingleFlashcard(flashcard, isReversed);
        });

        this.updateUILanguage(isReversed);
    }

    updateSingleFlashcard(flashcard, isReversed) {
        const wordElement = flashcard.querySelector('.word, [data-lang]');
        const translationElement = flashcard.querySelector('.translation');
        
        if (!wordElement || !translationElement) return;

        // Get vocabulary data for this flashcard
        const flashcardId = flashcard.id || flashcard.dataset.id;
        const vocabItem = this.vocabularyData.find(item => 
            item.id === flashcardId || 
            item.word === wordElement.textContent.trim() ||
            item.translation === wordElement.textContent.trim()
        );

        if (vocabItem) {
            // Use enhanced vocabulary data
            if (isReversed) {
                // DE → BG: Show German word, Bulgarian translation
                wordElement.textContent = vocabItem.translation;
                wordElement.dataset.lang = 'de';
                translationElement.textContent = vocabItem.word;
                translationElement.dataset.lang = 'bg';
            } else {
                // BG → DE: Show Bulgarian word, German translation
                wordElement.textContent = vocabItem.word;
                wordElement.dataset.lang = 'bg';
                translationElement.textContent = vocabItem.translation;
                translationElement.dataset.lang = 'de';
            }

            // Add cultural context if available
            this.addCulturalContext(flashcard, vocabItem, isReversed);
        } else {
            // Fallback to original logic
            const originalWord = wordElement.dataset.originalWord || wordElement.textContent;
            const originalTranslation = translationElement.dataset.originalTranslation || translationElement.textContent;

            if (!wordElement.dataset.originalWord) {
                wordElement.dataset.originalWord = originalWord;
                translationElement.dataset.originalTranslation = originalTranslation;
            }

            if (isReversed) {
                wordElement.textContent = originalTranslation;
                wordElement.dataset.lang = 'de';
                translationElement.textContent = originalWord;
                translationElement.dataset.lang = 'bg';
            } else {
                wordElement.textContent = originalWord;
                wordElement.dataset.lang = 'bg';
                translationElement.textContent = originalTranslation;
                translationElement.dataset.lang = 'de';
            }
        }

        // Update flashcard class for styling
        flashcard.classList.toggle('reversed', isReversed);
    }

    addCulturalContext(flashcard, vocabItem, isReversed) {
        // Remove existing cultural context
        const existingContext = flashcard.querySelector('.cultural-context');
        if (existingContext) {
            existingContext.remove();
        }

        // Add cultural note if available
        if (vocabItem.cultural_note) {
            const contextDiv = document.createElement('div');
            contextDiv.className = `cultural-context ${isReversed ? 'de-context' : 'bg-context'}`;
            contextDiv.innerHTML = `
                <strong>💡 Kultureller Hinweis:</strong> ${vocabItem.cultural_note}
                ${vocabItem.linguistic_note ? `<br><strong>📝 Sprachnotiz:</strong> ${vocabItem.linguistic_note}` : ''}
            `;
            
            const cardContent = flashcard.querySelector('.card-content, .flashcard-back');
            if (cardContent) {
                cardContent.appendChild(contextDiv);
            }
        }
    }

    updateUILanguage(isReversed) {
        // Update button text based on direction
        const flipButtons = document.querySelectorAll('.flip-button');
        flipButtons.forEach(button => {
            const bgText = button.querySelector('.btn-text-bg');
            const deText = button.querySelector('.btn-text-de');
            
            if (bgText && deText) {
                if (isReversed) {
                    bgText.style.display = 'none';
                    deText.style.display = 'inline';
                } else {
                    bgText.style.display = 'inline';
                    deText.style.display = 'none';
                }
            } else {
                // Fallback: update button text directly
                button.textContent = isReversed ? 'Antwort zeigen' : 'Покажи отговора';
            }
        });

        // Update response buttons
        const responseButtons = document.querySelectorAll('.response-buttons button');
        responseButtons.forEach(button => {
            const text = button.textContent;
            if (text.includes('Falsch') && text.includes('Грешно')) {
                button.innerHTML = isReversed ? 
                    '✗ Грешно / Falsch' : 
                    '✗ Falsch / Грешно';
            } else if (text.includes('Richtig') && text.includes('Правилно')) {
                button.innerHTML = isReversed ? 
                    '✓ Правилно / Richtig' : 
                    '✓ Richtig / Правилно';
            }
        });

        // Update section headers
        const headers = document.querySelectorAll('h1, h2, h3');
        headers.forEach(header => {
            if (header.textContent.includes('/')) {
                const parts = header.textContent.split('/').map(p => p.trim());
                if (parts.length === 2) {
                    header.textContent = isReversed ? 
                        `${parts[1]} / ${parts[0]}` : 
                        `${parts[0]} / ${parts[1]}`;
                }
            }
        });
    }

    readDirection() {
        if (window.languageToggle && typeof window.languageToggle.getDirection === 'function') {
            return window.languageToggle.getDirection();
        }

        const stored =
            localStorage.getItem('bgde:language-direction') ||
            localStorage.getItem('bgde:learning_direction');

        return this.normalizeDirection(stored) || 'de-bg';
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

    observeFlashcards() {
        // Watch for dynamically added flashcards
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const flashcards = node.querySelectorAll ? 
                            node.querySelectorAll('.flashcard-item') : 
                            (node.classList?.contains('flashcard-item') ? [node] : []);
                        
                        flashcards.forEach(flashcard => {
                            this.updateSingleFlashcard(flashcard, this.currentDirection === 'de-bg');
                        });
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    setDirection(direction) {
        const normalized = this.normalizeDirection(direction);
        if (!normalized) {
            return;
        }

        const changed = normalized !== this.currentDirection;
        this.currentDirection = normalized;

        if (window.languageToggle && typeof window.languageToggle.setDirection === 'function') {
            window.languageToggle.setDirection(normalized, { announce: true });
        } else {
            localStorage.setItem('bgde:language-direction', normalized);
            const detail = { direction: normalized, source: 'enhanced-bidirectional-system' };
            document.dispatchEvent(new CustomEvent('language-direction-changed', { detail }));
            document.dispatchEvent(new CustomEvent('languageDirectionChanged', { detail }));
            window.dispatchEvent(new CustomEvent('learning-direction-changed', { detail }));
        }

        if (changed) {
            this.updateFlashcardDirection();
            this.updateDirectionIndicator();
            this.updateToggleState();
            console.log('Language direction changed to:', normalized);
        }
    }

    // Public API methods
    getCurrentDirection() {
        return this.currentDirection;
    }

    getVocabularyData() {
        return this.vocabularyData;
    }

    getCulturalGrammarData() {
        return this.culturalGrammarData;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.enhancedBidirectionalSystem = new EnhancedBidirectionalSystem();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedBidirectionalSystem;
}
