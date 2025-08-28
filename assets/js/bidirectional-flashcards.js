/**
 * Bidirectional Flashcard System
 * Integrates with existing language toggle to provide direction-aware flashcards
 */

class BiDirectionalFlashcards {
    constructor() {
        this.currentDirection = localStorage.getItem('bgde:learning_direction') || 'bg_to_de';
        this.init();
    }

    init() {
        this.bindLanguageToggle();
        this.updateFlashcardDirection();
        this.observeFlashcards();
    }

    bindLanguageToggle() {
        // Listen for language direction changes
        document.addEventListener('languageDirectionChanged', (event) => {
            this.currentDirection = event.detail.direction;
            this.updateFlashcardDirection();
        });

        // Also listen for direct localStorage changes
        window.addEventListener('storage', (event) => {
            if (event.key === 'bgde:learning_direction') {
                this.currentDirection = event.newValue || 'bg_to_de';
                this.updateFlashcardDirection();
            }
        });
    }

    updateFlashcardDirection() {
        const flashcards = document.querySelectorAll('.flashcard-item');
        const isReversed = this.currentDirection === 'de_to_bg';

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
                            this.updateSingleFlashcard(flashcard, this.currentDirection === 'de_to_bg');
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

    // Public method to manually trigger direction update
    setDirection(direction) {
        this.currentDirection = direction;
        localStorage.setItem('bgde:learning_direction', direction);
        this.updateFlashcardDirection();
        
        // Dispatch event for other components
        document.dispatchEvent(new CustomEvent('languageDirectionChanged', {
            detail: { direction }
        }));
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
