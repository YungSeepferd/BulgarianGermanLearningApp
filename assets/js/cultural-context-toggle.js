/**
 * Cultural Context Toggle Component
 * Manages display of cultural and linguistic context information
 */

class CulturalContextToggle {
    constructor(options = {}) {
        this.container = options.container || document.body;
        this.storageKey = 'bgde:cultural_context_settings';
        this.settings = this.loadSettings();
        
        // Default settings
        this.defaultSettings = {
            showEtymology: true,
            showCulturalNotes: true,
            showLinguisticNotes: true,
            showExamples: true,
            contextLevel: 'adaptive' // 'minimal', 'standard', 'detailed', 'adaptive'
        };
        
        this.settings = { ...this.defaultSettings, ...this.settings };
        this.initialized = false;
    }
    
    /**
     * Initialize the cultural context toggle
     */
    init() {
        if (this.initialized) return;
        
        this.createToggleUI();
        this.bindEvents();
        this.applySettings();
        this.initialized = true;
        
        // Dispatch initialization event
        this.dispatchEvent('cultural-context-initialized', {
            settings: this.settings
        });
    }
    
    /**
     * Create the toggle UI elements
     */
    createToggleUI() {
        // Create main toggle container
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'cultural-context-toggle';
        toggleContainer.innerHTML = `
            <div class="context-toggle-header">
                <button class="context-toggle-btn" id="context-toggle-btn" aria-expanded="false">
                    <span class="toggle-icon">🌍</span>
                    <span class="toggle-text">Cultural Context</span>
                    <span class="toggle-arrow">▼</span>
                </button>
            </div>
            
            <div class="context-settings-panel" id="context-settings-panel" hidden>
                <div class="context-setting-group">
                    <h4>Context Level</h4>
                    <div class="context-level-options">
                        <label class="context-option">
                            <input type="radio" name="contextLevel" value="minimal">
                            <span>Minimal</span>
                            <small>Essential info only</small>
                        </label>
                        <label class="context-option">
                            <input type="radio" name="contextLevel" value="standard">
                            <span>Standard</span>
                            <small>Balanced context</small>
                        </label>
                        <label class="context-option">
                            <input type="radio" name="contextLevel" value="detailed">
                            <span>Detailed</span>
                            <small>Full cultural context</small>
                        </label>
                        <label class="context-option">
                            <input type="radio" name="contextLevel" value="adaptive">
                            <span>Adaptive</span>
                            <small>Based on your level</small>
                        </label>
                    </div>
                </div>
                
                <div class="context-setting-group">
                    <h4>Show Context Types</h4>
                    <div class="context-type-toggles">
                        <label class="context-checkbox">
                            <input type="checkbox" id="show-etymology" ${this.settings.showEtymology ? 'checked' : ''}>
                            <span>Etymology</span>
                            <small>Word origins and history</small>
                        </label>
                        <label class="context-checkbox">
                            <input type="checkbox" id="show-cultural-notes" ${this.settings.showCulturalNotes ? 'checked' : ''}>
                            <span>Cultural Notes</span>
                            <small>Cultural usage and context</small>
                        </label>
                        <label class="context-checkbox">
                            <input type="checkbox" id="show-linguistic-notes" ${this.settings.showLinguisticNotes ? 'checked' : ''}>
                            <span>Linguistic Notes</span>
                            <small>Grammar and usage tips</small>
                        </label>
                        <label class="context-checkbox">
                            <input type="checkbox" id="show-examples" ${this.settings.showExamples ? 'checked' : ''}>
                            <span>Examples</span>
                            <small>Usage examples in context</small>
                        </label>
                    </div>
                </div>
                
                <div class="context-actions">
                    <button class="btn-secondary" id="reset-context-settings">Reset to Default</button>
                    <button class="btn-primary" id="apply-context-settings">Apply Settings</button>
                </div>
            </div>
        `;
        
        // Insert at the beginning of the container
        if (this.container.firstChild) {
            this.container.insertBefore(toggleContainer, this.container.firstChild);
        } else {
            this.container.appendChild(toggleContainer);
        }
        
        // Set initial radio button state
        const levelRadio = toggleContainer.querySelector(`input[name="contextLevel"][value="${this.settings.contextLevel}"]`);
        if (levelRadio) {
            levelRadio.checked = true;
        }
    }
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        const toggleBtn = document.getElementById('context-toggle-btn');
        const settingsPanel = document.getElementById('context-settings-panel');
        const applyBtn = document.getElementById('apply-context-settings');
        const resetBtn = document.getElementById('reset-context-settings');
        
        // Toggle panel visibility
        toggleBtn.addEventListener('click', () => {
            const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
            const newState = !isExpanded;
            
            toggleBtn.setAttribute('aria-expanded', newState);
            settingsPanel.hidden = !newState;
            
            const arrow = toggleBtn.querySelector('.toggle-arrow');
            arrow.textContent = newState ? '▲' : '▼';
        });
        
        // Apply settings
        applyBtn.addEventListener('click', () => {
            this.updateSettingsFromUI();
            this.applySettings();
            this.saveSettings();
            
            // Close panel
            toggleBtn.click();
            
            this.dispatchEvent('cultural-context-changed', {
                settings: this.settings
            });
        });
        
        // Reset settings
        resetBtn.addEventListener('click', () => {
            this.settings = { ...this.defaultSettings };
            this.updateUIFromSettings();
            this.applySettings();
            this.saveSettings();
            
            this.dispatchEvent('cultural-context-reset', {
                settings: this.settings
            });
        });
        
        // Close panel when clicking outside
        document.addEventListener('click', (event) => {
            const toggle = document.querySelector('.cultural-context-toggle');
            if (toggle && !toggle.contains(event.target)) {
                if (!settingsPanel.hidden) {
                    toggleBtn.click();
                }
            }
        });
        
        // Listen for vocabulary card updates
        document.addEventListener('vocab-cards-rendered', () => {
            this.applySettings();
        });
    }
    
    /**
     * Update settings from UI controls
     */
    updateSettingsFromUI() {
        const contextLevel = document.querySelector('input[name="contextLevel"]:checked');
        if (contextLevel) {
            this.settings.contextLevel = contextLevel.value;
        }
        
        this.settings.showEtymology = document.getElementById('show-etymology').checked;
        this.settings.showCulturalNotes = document.getElementById('show-cultural-notes').checked;
        this.settings.showLinguisticNotes = document.getElementById('show-linguistic-notes').checked;
        this.settings.showExamples = document.getElementById('show-examples').checked;
    }
    
    /**
     * Update UI controls from settings
     */
    updateUIFromSettings() {
        const levelRadio = document.querySelector(`input[name="contextLevel"][value="${this.settings.contextLevel}"]`);
        if (levelRadio) {
            levelRadio.checked = true;
        }
        
        document.getElementById('show-etymology').checked = this.settings.showEtymology;
        document.getElementById('show-cultural-notes').checked = this.settings.showCulturalNotes;
        document.getElementById('show-linguistic-notes').checked = this.settings.showLinguisticNotes;
        document.getElementById('show-examples').checked = this.settings.showExamples;
    }
    
    /**
     * Apply current settings to vocabulary cards
     */
    applySettings() {
        const cards = document.querySelectorAll('.enhanced-vocab-card');
        
        cards.forEach(card => {
            this.applySettingsToCard(card);
        });
        
        // Update CSS custom properties for styling
        document.documentElement.style.setProperty(
            '--context-level', 
            this.getContextLevelValue()
        );
    }
    
    /**
     * Apply settings to a specific vocabulary card
     * @param {HTMLElement} card - Vocabulary card element
     */
    applySettingsToCard(card) {
        // Get user's learning level for adaptive context
        const userLevel = localStorage.getItem('bgde:user_level') || 'A1';
        const cardLevel = card.dataset.level || 'A1';
        
        // Determine if context should be shown based on level
        const shouldShowContext = this.shouldShowContextForLevel(userLevel, cardLevel);
        
        // Toggle context sections
        this.toggleCardSection(card, '.etymology-section', 
            this.settings.showEtymology && shouldShowContext);
        this.toggleCardSection(card, '.cultural-note-section', 
            this.settings.showCulturalNotes && shouldShowContext);
        this.toggleCardSection(card, '.linguistic-note-section', 
            this.settings.showLinguisticNotes && shouldShowContext);
        this.toggleCardSection(card, '.examples-section', 
            this.settings.showExamples && shouldShowContext);
        
        // Apply context level class
        card.classList.remove('context-minimal', 'context-standard', 'context-detailed', 'context-adaptive');
        card.classList.add(`context-${this.settings.contextLevel}`);
    }
    
    /**
     * Toggle visibility of a card section
     * @param {HTMLElement} card - Card element
     * @param {string} selector - Section selector
     * @param {boolean} show - Whether to show the section
     */
    toggleCardSection(card, selector, show) {
        const section = card.querySelector(selector);
        if (section) {
            section.style.display = show ? '' : 'none';
            section.setAttribute('aria-hidden', !show);
        }
    }
    
    /**
     * Determine if context should be shown based on adaptive level logic
     * @param {string} userLevel - User's current level
     * @param {string} cardLevel - Card's difficulty level
     * @returns {boolean} Whether to show context
     */
    shouldShowContextForLevel(userLevel, cardLevel) {
        if (this.settings.contextLevel !== 'adaptive') {
            return this.settings.contextLevel !== 'minimal';
        }
        
        const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const userLevelIndex = levels.indexOf(userLevel);
        const cardLevelIndex = levels.indexOf(cardLevel);
        
        // Show more context for cards above user's level
        if (cardLevelIndex > userLevelIndex) {
            return true;
        }
        
        // Show standard context for cards at user's level
        if (cardLevelIndex === userLevelIndex) {
            return this.settings.contextLevel !== 'minimal';
        }
        
        // Show minimal context for cards below user's level
        return false;
    }
    
    /**
     * Get numeric value for context level (for CSS)
     * @returns {number} Context level value
     */
    getContextLevelValue() {
        const levels = {
            'minimal': 1,
            'standard': 2,
            'detailed': 3,
            'adaptive': 2 // Default to standard for CSS
        };
        
        return levels[this.settings.contextLevel] || 2;
    }
    
    /**
     * Load settings from localStorage
     * @returns {Object} Saved settings
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.warn('Failed to load cultural context settings:', error);
            return {};
        }
    }
    
    /**
     * Save settings to localStorage
     */
    saveSettings() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Failed to save cultural context settings:', error);
        }
    }
    
    /**
     * Get current settings
     * @returns {Object} Current settings
     */
    getSettings() {
        return { ...this.settings };
    }
    
    /**
     * Update settings programmatically
     * @param {Object} newSettings - Settings to update
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.updateUIFromSettings();
        this.applySettings();
        this.saveSettings();
        
        this.dispatchEvent('cultural-context-changed', {
            settings: this.settings
        });
    }
    
    /**
     * Dispatch custom event
     * @param {string} eventName - Event name
     * @param {Object} detail - Event detail data
     */
    dispatchEvent(eventName, detail) {
        const event = new CustomEvent(eventName, {
            detail,
            bubbles: true
        });
        document.dispatchEvent(event);
    }
    
    /**
     * Destroy the toggle component
     */
    destroy() {
        const toggle = document.querySelector('.cultural-context-toggle');
        if (toggle) {
            toggle.remove();
        }
        this.initialized = false;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CulturalContextToggle;
}

// Global availability for browser
if (typeof window !== 'undefined') {
    window.CulturalContextToggle = CulturalContextToggle;
}
