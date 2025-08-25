/**
 * Enhanced Vocabulary Cards with Bidirectional Learning Support
 * Integrates with VocabularyAdapter for direction-aware display
 */

class EnhancedVocabCards {
    constructor() {
        this.currentDirection = localStorage.getItem('bgde:learning_direction') || 'bg_to_de';
        this.showCulturalContext = localStorage.getItem('bgde:show_cultural') === 'true';
        this.vocabularyData = [];
        this.filteredData = [];
        
        this.init();
    }
    
    async init() {
        await this.loadVocabularyData();
        this.setupEventListeners();
        this.renderVocabularyCards();
        this.updateBodyClass();
    }
    
    async loadVocabularyData() {
        try {
            const response = await fetch('/search-index.json');
            const data = await response.json();
            
            // Filter for vocabulary items and adapt them
            const vocabItems = data.filter(item => item.type === 'vocabulary');
            this.vocabularyData = window.VocabularyAdapter 
                ? window.VocabularyAdapter.adaptVocabularyArray(vocabItems)
                : vocabItems;
                
        } catch (error) {
            console.error('Failed to load vocabulary data:', error);
            this.vocabularyData = [];
        }
    }
    
    setupEventListeners() {
        // Listen for direction changes
        window.addEventListener('learning-direction-changed', (event) => {
            this.currentDirection = event.detail.direction;
            this.updateBodyClass();
            this.renderVocabularyCards();
        });
        
        // Cultural context toggle
        const culturalToggle = document.getElementById('cultural-context-toggle');
        if (culturalToggle) {
            culturalToggle.addEventListener('change', (e) => {
                this.showCulturalContext = e.target.checked;
                localStorage.setItem('bgde:show_cultural', this.showCulturalContext);
                this.renderVocabularyCards();
            });
        }
    }
    
    updateBodyClass() {
        document.body.className = document.body.className.replace(/lang-\w+-\w+/g, '');
        document.body.classList.add(`lang-${this.currentDirection.replace('_', '-')}`);
    }
    
    renderVocabularyCards() {
        const container = document.getElementById('vocabulary-cards-container');
        if (!container) return;
        
        // Get vocabulary for current direction
        const directedVocab = window.VocabularyAdapter 
            ? window.VocabularyAdapter.getVocabularyByDirection(
                this.vocabularyData, 
                this.currentDirection
              )
            : this.vocabularyData;
        
        this.filteredData = directedVocab;
        
        container.innerHTML = directedVocab.map(item => this.createVocabCard(item)).join('');
        
        // Add click handlers for cards
        this.attachCardHandlers();
    }
    
    createVocabCard(item) {
        const isReverse = this.currentDirection === 'de_to_bg';
        const frontText = isReverse ? item.translation : item.word;
        const backText = isReverse ? item.word : item.translation;
        const frontLang = isReverse ? 'german-text' : 'bulgarian-text';
        const backLang = isReverse ? 'bulgarian-text' : 'german-text';
        
        return `
            <div class="vocab-card" data-item-id="${item.id || ''}" data-level="${item.level || 'A1'}">
                <div class="vocab-card-inner">
                    <div class="vocab-card-front">
                        <div class="vocab-word ${frontLang}">${frontText}</div>
                        <div class="vocab-category">${item.category || ''}</div>
                        <div class="vocab-level">${item.level || 'A1'}</div>
                        ${this.renderDifficultyIndicator(item.difficulty)}
                    </div>
                    
                    <div class="vocab-card-back">
                        <div class="vocab-translation ${backLang}">${backText}</div>
                        ${this.renderCulturalContext(item)}
                        ${this.renderExamples(item)}
                        ${this.renderActions(item)}
                    </div>
                </div>
            </div>
        `;
    }
    
    renderDifficultyIndicator(difficulty) {
        if (!difficulty) return '';
        
        const stars = '★'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
        return `<div class="difficulty-indicator" title="Difficulty: ${difficulty}/5">${stars}</div>`;
    }
    
    renderCulturalContext(item) {
        if (!this.showCulturalContext) return '';
        
        let contextHtml = '';
        
        if (item.etymology) {
            contextHtml += `<div class="etymology"><strong>Etymology:</strong> ${item.etymology}</div>`;
        }
        
        if (item.cultural_note) {
            contextHtml += `<div class="cultural-note"><strong>Cultural Note:</strong> ${item.cultural_note}</div>`;
        }
        
        if (item.linguistic_note) {
            contextHtml += `<div class="linguistic-note"><strong>Pronunciation:</strong> ${item.linguistic_note}</div>`;
        }
        
        return contextHtml ? `<div class="cultural-context">${contextHtml}</div>` : '';
    }
    
    renderExamples(item) {
        if (!item.examples || !Array.isArray(item.examples) || item.examples.length === 0) {
            return '';
        }
        
        const examplesHtml = item.examples.map(example => `
            <div class="example">
                <div class="example-sentence">${example.sentence}</div>
                <div class="example-translation">${example.translation}</div>
                ${example.context ? `<div class="example-context">(${example.context})</div>` : ''}
            </div>
        `).join('');
        
        return `<div class="examples"><strong>Examples:</strong>${examplesHtml}</div>`;
    }
    
    renderActions(item) {
        return `
            <div class="vocab-actions">
                <button class="action-btn practice-btn" data-action="practice" data-item-id="${item.id || ''}">
                    Practice
                </button>
                <button class="action-btn audio-btn" data-action="audio" data-item-id="${item.id || ''}" ${!item.audio ? 'disabled' : ''}>
                    🔊
                </button>
                <button class="action-btn favorite-btn" data-action="favorite" data-item-id="${item.id || ''}">
                    ♡
                </button>
            </div>
        `;
    }
    
    attachCardHandlers() {
        // Card flip on click
        document.querySelectorAll('.vocab-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.vocab-actions')) {
                    card.classList.toggle('flipped');
                }
            });
        });
        
        // Action button handlers
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                const itemId = btn.dataset.itemId;
                this.handleAction(action, itemId);
            });
        });
    }
    
    handleAction(action, itemId) {
        const item = this.filteredData.find(item => (item.id || '') === itemId);
        if (!item) return;
        
        switch (action) {
            case 'practice':
                this.startPracticeSession(item);
                break;
            case 'audio':
                this.playAudio(item);
                break;
            case 'favorite':
                this.toggleFavorite(item);
                break;
        }
    }
    
    startPracticeSession(item) {
        // Navigate to practice page with specific item
        const practiceUrl = `/practice/?item=${item.id || ''}&direction=${this.currentDirection}`;
        window.location.href = practiceUrl;
    }
    
    playAudio(item) {
        if (!item.audio) return;
        
        const audio = new Audio(item.audio);
        audio.play().catch(error => {
            console.warn('Audio playback failed:', error);
        });
    }
    
    toggleFavorite(item) {
        const favorites = JSON.parse(localStorage.getItem('bgde:favorites') || '[]');
        const itemId = item.id || '';
        const index = favorites.indexOf(itemId);
        
        if (index === -1) {
            favorites.push(itemId);
        } else {
            favorites.splice(index, 1);
        }
        
        localStorage.setItem('bgde:favorites', JSON.stringify(favorites));
        
        // Update UI
        const btn = document.querySelector(`[data-item-id="${itemId}"][data-action="favorite"]`);
        if (btn) {
            btn.textContent = index === -1 ? '♥' : '♡';
            btn.classList.toggle('favorited', index === -1);
        }
    }
    
    // Filter methods
    filterByLevel(level) {
        const filtered = this.filteredData.filter(item => 
            !level || item.level === level
        );
        this.renderFilteredCards(filtered);
    }
    
    filterByCategory(category) {
        const filtered = this.filteredData.filter(item => 
            !category || item.category === category
        );
        this.renderFilteredCards(filtered);
    }
    
    searchVocabulary(query) {
        if (!query) {
            this.renderVocabularyCards();
            return;
        }
        
        const lowerQuery = query.toLowerCase();
        const filtered = this.filteredData.filter(item => 
            item.word.toLowerCase().includes(lowerQuery) ||
            item.translation.toLowerCase().includes(lowerQuery) ||
            (item.notes && item.notes.toLowerCase().includes(lowerQuery))
        );
        
        this.renderFilteredCards(filtered);
    }
    
    renderFilteredCards(items) {
        const container = document.getElementById('vocabulary-cards-container');
        if (!container) return;
        
        container.innerHTML = items.map(item => this.createVocabCard(item)).join('');
        this.attachCardHandlers();
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.enhancedVocabCards = new EnhancedVocabCards();
    });
} else {
    window.enhancedVocabCards = new EnhancedVocabCards();
}
