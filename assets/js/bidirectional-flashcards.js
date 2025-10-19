/**
 * Bidirectional Flashcard System
 * Integrates with existing language toggle to provide direction-aware flashcards
 */

class BiDirectionalFlashcards {
    constructor() {
        this.currentDirection = this.readDirection();
        this.init();
    }

    init() {
        this.bindLanguageToggle();
        this.updateFlashcardDirection();
        this.observeFlashcards();
    }

    bindLanguageToggle() {
        const handleDirectionChange = (event) => {
            const detail = event?.detail;
            const nextDirection = this.normalizeDirection(detail?.direction);

            if (!nextDirection) {
                return;
            }

            this.currentDirection = nextDirection;
            this.updateFlashcardDirection();
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
                }
            } else if (event.key === 'bgde:learning_direction') {
                const migrated = this.normalizeDirection(event.newValue);
                if (migrated) {
                    localStorage.removeItem('bgde:learning_direction');
                    localStorage.setItem('bgde:language-direction', migrated);
                    this.currentDirection = migrated;
                    this.updateFlashcardDirection();
                }
            }
        });
    }

    updateFlashcardDirection() {
        const flashcards = document.querySelectorAll('.flashcard-item');
        const isReversed = this.currentDirection === 'de-bg';

        flashcards.forEach(flashcard => {
            this.updateSingleFlashcard(flashcard, isReversed);
        });

        // Update UI language indicators
        this.updateLanguageIndicators(isReversed);
    }

    updateSingleFlashcard(flashcard, isReversed) {
        const wordElement = flashcard.querySelector('.word');
        const translationElement = flashcard.querySelector('.translation');
        
        if (!wordElement || !translationElement) return;

        // Get original data
        const originalWord = wordElement.dataset.originalWord || wordElement.textContent;
        const originalTranslation = translationElement.dataset.originalTranslation || translationElement.textContent;

        // Store original data if not already stored
        if (!wordElement.dataset.originalWord) {
            wordElement.dataset.originalWord = originalWord;
            wordElement.dataset.originalLang = 'bg';
        }
        if (!translationElement.dataset.originalTranslation) {
            translationElement.dataset.originalTranslation = originalTranslation;
            translationElement.dataset.originalLang = 'de';
        }

        if (isReversed) {
            // DE → BG: Show German word, Bulgarian translation
            wordElement.textContent = originalTranslation;
            wordElement.dataset.lang = 'de';
            translationElement.textContent = originalWord;
            translationElement.dataset.lang = 'bg';
        } else {
            // BG → DE: Show Bulgarian word, German translation
            wordElement.textContent = originalWord;
            wordElement.dataset.lang = 'bg';
            translationElement.textContent = originalTranslation;
            translationElement.dataset.lang = 'de';
        }

        // Update flashcard class for styling
        flashcard.classList.toggle('reversed', isReversed);
    }

    updateLanguageIndicators(isReversed) {
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

    // Public method to manually trigger direction update
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
            const detail = { direction: normalized, source: 'bidirectional-flashcards' };
            document.dispatchEvent(new CustomEvent('language-direction-changed', { detail }));
            document.dispatchEvent(new CustomEvent('languageDirectionChanged', { detail }));
            window.dispatchEvent(new CustomEvent('learning-direction-changed', { detail }));
        }

        if (changed) {
            this.updateFlashcardDirection();
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.biDirectionalFlashcards = new BiDirectionalFlashcards();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BiDirectionalFlashcards;
}
