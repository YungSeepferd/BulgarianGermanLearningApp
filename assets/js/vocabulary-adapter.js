/**
 * Vocabulary Data Adapter - Backward Compatibility Layer
 * Converts existing vocabulary format to enhanced bidirectional format
 */

class VocabularyAdapter {
    /**
     * Adapt vocabulary item to enhanced format with backward compatibility
     * @param {Object} item - Original vocabulary item
     * @returns {Object} Enhanced vocabulary item
     */
    static adaptVocabularyItem(item) {
        return {
            // Preserve existing fields
            ...item,
            
            // Add enhanced fields with sensible defaults
            id: item.id || this.generateId(item.word),
            source_lang: item.source_lang || "bg",
            target_lang: item.target_lang || "de",
            
            // Cultural and linguistic context
            etymology: item.etymology || "",
            cultural_note: item.cultural_note || "",
            linguistic_note: item.linguistic_note || "",
            
            // Learning metadata
            difficulty: item.difficulty || this.calculateDifficulty(item),
            frequency: item.frequency || this.estimateFrequency(item),
            
            // Bidirectional support
            reverse_translation: item.reverse_translation || item.word,
            cognates: item.cognates || [],
            false_friends: item.false_friends || [],
            
            // Examples
            examples: item.examples || []
        };
    }
    
    /**
     * Generate unique ID for vocabulary item
     * @param {string} word - Bulgarian word
     * @returns {string} Unique identifier
     */
    static generateId(word) {
        // Convert Cyrillic to Latin for ID, add timestamp for uniqueness
        const latinized = this.cyrillicToLatin(word);
        const timestamp = Date.now().toString(36);
        return `${latinized}_${timestamp}`.toLowerCase().replace(/[^a-z0-9_]/g, '');
    }
    
    /**
     * Convert Cyrillic to Latin characters for ID generation
     * @param {string} text - Cyrillic text
     * @returns {string} Latinized text
     */
    static cyrillicToLatin(text) {
        const cyrillicToLatinMap = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ж': 'zh',
            'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
            'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f',
            'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sht', 'ъ': 'a', 'ь': 'y',
            'ю': 'yu', 'я': 'ya',
            'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ж': 'Zh',
            'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N',
            'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F',
            'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sht', 'Ъ': 'A', 'Ь': 'Y',
            'Ю': 'Yu', 'Я': 'Ya'
        };
        
        return text.split('').map(char => cyrillicToLatinMap[char] || char).join('');
    }
    
    /**
     * Calculate difficulty based on existing item data
     * @param {Object} item - Vocabulary item
     * @returns {number} Difficulty level (1-5)
     */
    static calculateDifficulty(item) {
        let difficulty = 2; // Default medium difficulty
        
        // A1 items are generally easier
        if (item.level === 'A1') {
            difficulty = Math.max(1, difficulty - 1);
        }
        
        // A2 items are slightly harder
        if (item.level === 'A2') {
            difficulty = Math.min(3, difficulty + 1);
        }
        
        // Longer words tend to be more difficult
        if (item.word && item.word.length > 8) {
            difficulty = Math.min(5, difficulty + 1);
        }
        
        // Complex categories might be harder
        const complexCategories = ['Substantiv', 'Verb', 'Adjektiv'];
        if (complexCategories.includes(item.category)) {
            difficulty = Math.min(5, difficulty + 1);
        }
        
        return difficulty;
    }
    
    /**
     * Estimate frequency based on category and level
     * @param {Object} item - Vocabulary item
     * @returns {number} Frequency score (1-100)
     */
    static estimateFrequency(item) {
        let frequency = 50; // Default medium frequency
        
        // Basic categories are more frequent
        const basicCategories = ['Begrüßung', 'Ausdruck'];
        if (basicCategories.includes(item.category)) {
            frequency = Math.min(95, frequency + 30);
        }
        
        // A1 words are generally more frequent
        if (item.level === 'A1') {
            frequency = Math.min(90, frequency + 20);
        }
        
        // A2 words are moderately frequent
        if (item.level === 'A2') {
            frequency = Math.min(70, frequency + 10);
        }
        
        return frequency;
    }
    
    /**
     * Adapt array of vocabulary items
     * @param {Array} items - Array of vocabulary items
     * @returns {Array} Array of enhanced vocabulary items
     */
    static adaptVocabularyArray(items) {
        if (!Array.isArray(items)) {
            console.warn('VocabularyAdapter: Expected array, got:', typeof items);
            return [];
        }
        
        return items.map(item => this.adaptVocabularyItem(item));
    }
    
    /**
     * Create reverse vocabulary item for bidirectional learning
     * @param {Object} item - Enhanced vocabulary item
     * @returns {Object} Reverse vocabulary item
     */
    static createReverseItem(item) {
        const reverseItem = {
            ...item,
            id: item.id + '_reverse',
            word: item.translation,
            translation: item.word,
            source_lang: item.target_lang,
            target_lang: item.source_lang,
            reverse_translation: item.word
        };
        
        return reverseItem;
    }
    
    /**
     * Get vocabulary items for specific learning direction
     * @param {Array} items - Array of vocabulary items
     * @param {string} direction - Learning direction ('bg_to_de', 'de_to_bg', 'both')
     * @param {string} level - Optional level filter
     * @returns {Array} Filtered vocabulary items
     */
    static getVocabularyByDirection(items, direction = 'bg_to_de', level = '') {
        const adaptedItems = this.adaptVocabularyArray(items);
        let filtered = [];
        
        switch (direction) {
            case 'bg_to_de':
                filtered = adaptedItems.filter(item => 
                    item.source_lang === 'bg' && item.target_lang === 'de'
                );
                break;
                
            case 'de_to_bg':
                // Create reverse items for German to Bulgarian learning
                filtered = adaptedItems.map(item => this.createReverseItem(item));
                break;
                
            case 'both':
                // Include both directions
                const bgToDe = adaptedItems.filter(item => 
                    item.source_lang === 'bg' && item.target_lang === 'de'
                );
                const deToBg = adaptedItems.map(item => this.createReverseItem(item));
                filtered = [...bgToDe, ...deToBg];
                break;
                
            default:
                filtered = adaptedItems;
        }
        
        // Apply level filter if specified
        if (level) {
            filtered = filtered.filter(item => item.level === level);
        }
        
        return filtered;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VocabularyAdapter;
}

// Global availability for browser
if (typeof window !== 'undefined') {
    window.VocabularyAdapter = VocabularyAdapter;
}
