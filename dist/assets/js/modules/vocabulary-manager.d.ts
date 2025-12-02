/**
 * Vocabulary Manager Module
 * Handles creating, editing, importing, and exporting vocabulary entries
 * Stores custom entries in localStorage for offline access
 * Enhanced with structured error handling and recovery strategies
 * @since 1.0.0
 */
/**
 * Vocabulary entry interface for manager operations
 */
export interface VocabularyEntry {
    id: string;
    bulgarian: string;
    german: string;
    category: string;
    level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
    cultural_note: string;
    linguistic_note: string;
    examples: string[];
    source: string;
    created_at: string;
    updated_at?: string;
    tags: string[];
}
/**
 * Validation result interface
 */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}
/**
 * Entry creation result interface
 */
export interface EntryCreationResult {
    success: boolean;
    errors?: string[];
    entry?: VocabularyEntry | null;
    error?: string;
}
/**
 * Import result interface
 */
export interface ImportResult {
    success: boolean;
    message: string;
    imported: VocabularyEntry[];
    errors: ImportError[];
}
/**
 * Import error interface
 */
export interface ImportError {
    row?: number;
    index?: number;
    errors: string[];
}
/**
 * Vocabulary statistics interface
 */
export interface VocabularyStatistics {
    totalEntries: number;
    customEntries: number;
    baseEntries: number;
    levelDistribution: Record<string, number>;
    categoryDistribution: Record<string, number>;
}
/**
 * Vocabulary manager options interface
 */
export interface VocabularyManagerOptions {
    baseVocabulary?: VocabularyEntry[];
}
export declare class VocabularyManager {
    private storageKey;
    private baseVocabulary;
    private customVocabulary;
    private retryStrategy;
    private maxRetries;
    constructor(options?: VocabularyManagerOptions);
    /**
     * Load custom vocabulary from localStorage with enhanced error handling
     * @returns Array of vocabulary entries or empty array on failure
     */
    private loadCustomVocabulary;
    /**
     * Save custom vocabulary to localStorage with enhanced error handling
     * @returns Promise resolving to success status
     */
    private saveCustomVocabulary;
    /**
     * Validate vocabulary entry structure with enhanced error reporting
     * @param entry - Entry to validate
     * @returns Validation result with detailed error information
     */
    private validateEntry;
    /**
     * Validate vocabulary array structure
     * @param entries - Array of entries to validate
     * @returns Validation result
     */
    private validateVocabularyArray;
    /**
     * Create a new vocabulary entry with validation and error handling
     * @param data - Entry data
     * @returns Creation result with detailed error information
     */
    createEntry(data: Partial<VocabularyEntry>): Promise<EntryCreationResult>;
    /**
     * Sanitize entry data to prevent issues
     * @param data - Raw entry data
     * @returns Sanitized entry data
     */
    private sanitizeEntryData;
    /**
     * Update an existing custom entry with enhanced error handling
     * @param id - Entry ID to update
     * @param updates - Update data
     * @returns Update result with detailed error information
     */
    updateEntry(id: string, updates: Partial<VocabularyEntry>): Promise<EntryCreationResult>;
    /**
     * Delete a custom entry with enhanced error handling
     * @param id - Entry ID to delete
     * @returns Promise resolving to success status
     */
    deleteEntry(id: string): Promise<boolean>;
    /**
     * Get all custom entries
     */
    getCustomEntries(): VocabularyEntry[];
    /**
     * Get merged vocabulary (base + custom)
     */
    getMergedVocabulary(): VocabularyEntry[];
    /**
     * Generate unique ID for new entries
     */
    private generateId;
    /**
     * Export vocabulary as JSON
     */
    exportAsJSON(includeBase?: boolean): string;
    /**
     * Export vocabulary as CSV
     */
    exportAsCSV(includeBase?: boolean): string;
    /**
     * Escape CSV values with special characters
     */
    private escapeCsvValue;
    /**
     * Import from CSV data with enhanced error handling and validation
     * @param csvData - CSV data as string
     * @returns Import result with detailed error information
     */
    importFromCSV(csvData: string): Promise<ImportResult>;
    /**
     * Parse CSV line respecting quoted values
     */
    private parseCSVLine;
    /**
     * Get statistics about vocabulary
     * @public
     * @returns {VocabularyStatistics} Vocabulary statistics
     * @description Returns detailed statistics about vocabulary distribution
     * @example
     * ```typescript
     * const stats = vocabManager.getStatistics();
     * console.log(`Total entries: ${stats.totalEntries}`);
     * console.log(`Custom entries: ${stats.customEntries}`);
     * console.log('Level distribution:', stats.levelDistribution);
     * ```
     */
    getStatistics(): VocabularyStatistics;
    /**
     * Clear all custom vocabulary (with confirmation)
     * @public
     * @returns {boolean} True if successful
     * @description Removes all custom vocabulary entries and saves to localStorage
     * @example
     * ```typescript
     * const cleared = vocabManager.clearCustomVocabulary();
     * if (cleared) console.log('All custom vocabulary cleared');
     * ```
     */
    clearCustomVocabulary(): boolean;
    /**
     * Import JSON data with enhanced error handling and validation
     * @param jsonData - JSON data as string
     * @returns Promise resolving to import result with detailed error information
     * @description Imports vocabulary entries from JSON format with validation
     * @example
     * ```typescript
     * const jsonData = '[{"bulgarian":"здравей","german":"hallo","category":"greetings","level":"A1"}]';
     * const result = await vocabManager.importFromJSON(jsonData);
     * ```
     */
    importFromJSON(jsonData: string): Promise<ImportResult>;
    /**
     * Get detailed statistics about vocabulary operations
     * @returns Promise resolving to detailed statistics
     */
    getDetailedStatistics(): Promise<VocabularyStatistics & {
        memoryStats: any;
        connectivityStatus: any;
        lastOperationTime?: Date;
        operationCount: number;
    }>;
    /**
     * Perform health check on vocabulary manager
     * @returns Promise resolving to health check result
     */
    performHealthCheck(): Promise<{
        healthy: boolean;
        issues: string[];
        recommendations: string[];
    }>;
}
export default VocabularyManager;
//# sourceMappingURL=vocabulary-manager.d.ts.map