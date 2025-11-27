/**
 * Vocabulary Manager Module
 * Handles creating, editing, importing, and exporting vocabulary entries
 * Stores custom entries in localStorage for offline access
 * Enhanced with structured error handling and recovery strategies
 * @since 1.0.0
 */

import {
  ErrorFactory,
  ValidationError,
  StorageError,
  ParsingError,
  RetryStrategy
} from './error-types.js';
import { memoryManager } from './memory-manager.js';
import { connectivityManager } from './connectivity-manager.js';
import { errorLogger } from './error-logger.js';

// import type { CustomVocabularyEntry } from '../types.js'; // Not used

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

export class VocabularyManager {
  private storageKey: string;
  // private profileKey: string; // Not used
  private baseVocabulary: VocabularyEntry[];
  private customVocabulary: VocabularyEntry[];
  private retryStrategy: RetryStrategy;
  private maxRetries = 3;

  constructor(options: VocabularyManagerOptions = {}) {
    this.storageKey = 'bgde:custom_vocabulary';
    // this.profileKey = 'bgde:active_profile'; // Not used
    this.baseVocabulary = options.baseVocabulary || [];
    this.customVocabulary = [];
    this.retryStrategy = new RetryStrategy(this.maxRetries, 1000, 10_000);
    
    // Initialize logging
    errorLogger.info('VocabularyManager initialized', { component: 'vocabulary-manager' });
    
    // Load custom vocabulary asynchronously
    this.loadCustomVocabulary().then(vocabulary => {
      this.customVocabulary = vocabulary;
    }).catch(error => {
      errorLogger.error('Failed to load custom vocabulary in constructor', ErrorFactory.fromError(error), {
        storageKey: this.storageKey
      }, 'vocabulary-manager');
    });
  }

  /**
   * Load custom vocabulary from localStorage with enhanced error handling
   * @returns Promise resolving to array of vocabulary entries or empty array on failure
   */
  private async loadCustomVocabulary(): Promise<VocabularyEntry[]> {
    errorLogger.debug('Loading custom vocabulary from storage', {
      storageKey: this.storageKey
    }, 'vocabulary-manager');
    
    return await (this.retryStrategy.recover(
      new StorageError('Loading custom vocabulary', 'read', this.storageKey),
      { retryFunction: async (): Promise<VocabularyEntry[]> => {
        try {
          const data = localStorage.getItem(this.storageKey);
          if (!data) {
            errorLogger.debug('No custom vocabulary found in storage', {}, 'vocabulary-manager');
            return [];
          }

          // Validate JSON structure
          const parsed = JSON.parse(data);
          if (!Array.isArray(parsed)) {
            throw new ParsingError(
              'Custom vocabulary data is not an array',
              'JSON',
              data,
              'array of vocabulary entries'
            );
          }

          // Validate each entry
          const validatedEntries: VocabularyEntry[] = [];
          for (const [index, entry] of parsed.entries()) {
            try {
              const validation = this.validateEntry(entry);
              if (!validation.isValid) {
                errorLogger.warn('Skipping invalid entry during load', {
                  entryIndex: index,
                  errors: validation.errors
                }, 'vocabulary-manager');
                continue;
              }
              validatedEntries.push(entry as VocabularyEntry);
            } catch (entryError) {
              errorLogger.warn('Error validating entry during load', {
                entryIndex: index,
                error: entryError instanceof Error ? entryError.message : 'Unknown error'
              }, 'vocabulary-manager');
              continue;
            }
          }

          errorLogger.info('Custom vocabulary loaded successfully', {
            entryCount: validatedEntries.length
          }, 'vocabulary-manager');
          
          return validatedEntries;
        } catch (error) {
          const vocabError = ErrorFactory.fromError(error, {
            operation: 'loadCustomVocabulary',
            storageKey: this.storageKey
          });
          
          errorLogger.logVocabularyError(vocabError, 'loadCustomVocabulary', {
            storageKey: this.storageKey
          });
          
          throw vocabError;
        }
      } }
    ) as Promise<VocabularyEntry[]>).catch((error) => {
      errorLogger.error('Failed to load custom vocabulary after retries', ErrorFactory.fromError(error), {
        storageKey: this.storageKey
      }, 'vocabulary-manager');
      
      return [];
    });
  }

  /**
   * Save custom vocabulary to localStorage with enhanced error handling
   * @returns Promise resolving to success status
   */
  private async saveCustomVocabulary(): Promise<boolean> {
    try {
      errorLogger.debug('Saving custom vocabulary to storage', {
        entryCount: this.customVocabulary.length
      }, 'vocabulary-manager');
      
      // Check memory pressure before saving
      const memoryStats = memoryManager.getStatistics();
      if (memoryStats.pressure === 'critical') {
        errorLogger.warn('High memory pressure detected, forcing cleanup before save', {
          pressure: memoryStats.pressure
        }, 'vocabulary-manager');
        
        await memoryManager.forceCleanup('high');
      }

      // Validate data before saving
      const validation = this.validateVocabularyArray(this.customVocabulary);
      if (!validation.isValid) {
        throw new ValidationError(
          'Cannot save invalid vocabulary data',
          undefined,
          this.customVocabulary,
          'valid vocabulary array',
          validation.errors.join(', ')
        );
      }

      const serialized = JSON.stringify(this.customVocabulary);
      
      // Check if data fits in localStorage
      const size = new Blob([serialized]).size;
      const availableSpace = 5 * 1024 * 1024; // 5MB estimated localStorage limit
      
      if (size > availableSpace) {
        throw new StorageError(
          'Vocabulary data too large for localStorage',
          'write',
          this.storageKey,
          availableSpace,
          size
        );
      }

      // Attempt to save with retry logic
      return await (this.retryStrategy.recover(
        new StorageError('Saving custom vocabulary', 'write', this.storageKey),
        { retryFunction: async (): Promise<boolean> => {
          try {
            localStorage.setItem(this.storageKey, serialized);
            return true;
          } catch (error) {
            if (error.name === 'QuotaExceededError') {
              // Try to free up space and retry
              await memoryManager.forceCleanup('medium');
              localStorage.setItem(this.storageKey, serialized);
              return true;
            }
            throw error;
          }
        } }
      ) as Promise<boolean>) as boolean;

    } catch (error) {
      const vocabError = ErrorFactory.fromError(error, {
        operation: 'saveCustomVocabulary',
        storageKey: this.storageKey,
        entryCount: this.customVocabulary.length
      });
      
      errorLogger.logVocabularyError(vocabError, 'saveCustomVocabulary', {
        entryCount: this.customVocabulary.length,
        storageKey: this.storageKey
      });
      
      throw vocabError;
    }
  }

  /**
   * Validate vocabulary entry structure with enhanced error reporting
   * @param entry - Entry to validate
   * @returns Validation result with detailed error information
   */
  private validateEntry(entry: Partial<VocabularyEntry>): ValidationResult {
    const errors: string[] = [];

    // Required field validation
    const requiredFields = [
      { field: 'bulgarian', name: 'Bulgarian translation' },
      { field: 'german', name: 'German translation' },
      { field: 'category', name: 'Category' },
      { field: 'level', name: 'CEFR level' }
    ];

    for (const { field, name } of requiredFields) {
      const value = entry[field as keyof VocabularyEntry];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        errors.push(`${name} is required`);
      }
    }

    // CEFR level validation
    if (entry.level && !['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(entry.level)) {
      errors.push('CEFR level must be one of: A1, A2, B1, B2, C1, C2');
    }

    // Array field validation
    if (entry.examples && !Array.isArray(entry.examples)) {
      errors.push('Examples must be an array');
    }

    if (entry.tags && !Array.isArray(entry.tags)) {
      errors.push('Tags must be an array');
    }

    // String length validation
    const stringFields = ['bulgarian', 'german', 'category', 'cultural_note', 'linguistic_note'];
    for (const field of stringFields) {
      const value = entry[field as keyof VocabularyEntry] as string;
      if (value && value.length > 1000) {
        errors.push(`${field} must be less than 1000 characters`);
      }
    }

    // ID format validation
    if (entry.id && !/^[\w-]+$/.test(entry.id)) {
      errors.push('ID must contain only alphanumeric characters, hyphens, and underscores');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate vocabulary array structure
   * @param entries - Array of entries to validate
   * @returns Validation result
   */
  private validateVocabularyArray(entries: unknown[]): ValidationResult {
    const errors: string[] = [];

    if (!Array.isArray(entries)) {
      errors.push('Vocabulary data must be an array');
      return { isValid: false, errors };
    }

    if (entries.length > 10_000) {
      errors.push('Vocabulary array too large (maximum 10,000 entries)');
    }

    // Check for duplicate IDs
    const ids = new Set<string>();
    for (const [index, entry] of entries.entries()) {
      if (typeof entry === 'object' && entry !== null && 'id' in entry) {
        const id = (entry as VocabularyEntry).id;
        if (ids.has(id)) {
          errors.push(`Duplicate ID found: ${id} at index ${index}`);
        } else {
          ids.add(id);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Create a new vocabulary entry with validation and error handling
   * @param data - Entry data
   * @returns Creation result with detailed error information
   */
  async createEntry(data: Partial<VocabularyEntry>): Promise<EntryCreationResult> {
    try {
      errorLogger.debug('Creating new vocabulary entry', {
        bulgarian: data.bulgarian,
        german: data.german,
        category: data.category
      }, 'vocabulary-manager');
      
      // Sanitize input data
      const sanitizedData = this.sanitizeEntryData(data);
      
      const entry: VocabularyEntry = {
        id: this.generateId(),
        bulgarian: sanitizedData.bulgarian?.trim() || '',
        german: sanitizedData.german?.trim() || '',
        category: sanitizedData.category?.trim() || '',
        level: (sanitizedData.level as 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2') || 'A1',
        cultural_note: sanitizedData.cultural_note?.trim() || '',
        linguistic_note: sanitizedData.linguistic_note?.trim() || '',
        examples: Array.isArray(sanitizedData.examples) ? sanitizedData.examples : [],
        source: 'manual',
        created_at: new Date().toISOString(),
        tags: sanitizedData.tags ? (Array.isArray(sanitizedData.tags) ? sanitizedData.tags : [sanitizedData.tags]) : []
      };

      const validation = this.validateEntry(entry);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
          entry: null,
          error: `Validation failed: ${validation.errors.join(', ')}`
        };
      }

      // Check for duplicates
      const isDuplicate = this.customVocabulary.some(existing =>
        existing.bulgarian.toLowerCase() === entry.bulgarian.toLowerCase() &&
        existing.german.toLowerCase() === entry.german.toLowerCase()
      );

      if (isDuplicate) {
        return {
          success: false,
          errors: ['Duplicate entry: Bulgarian and German combination already exists'],
          entry: null,
          error: 'Duplicate entry detected'
        };
      }

      this.customVocabulary.push(entry);
      
      // Save with error handling
      try {
        await this.saveCustomVocabulary();
      } catch (saveError) {
        // Rollback on save failure
        this.customVocabulary.pop();
        throw saveError;
      }

      errorLogger.info('Vocabulary entry created successfully', {
        entryId: entry.id,
        bulgarian: entry.bulgarian,
        german: entry.german
      }, 'vocabulary-manager');
      
      return {
        success: true,
        errors: [],
        entry
      };

    } catch (error) {
      const vocabError = ErrorFactory.fromError(error, {
        operation: 'createEntry',
        entryData: data
      });

      errorLogger.logVocabularyError(vocabError, 'createEntry', {
        entryData: data
      });

      return {
        success: false,
        errors: [vocabError.userMessage],
        entry: null,
        error: vocabError.message
      };
    }
  }

  /**
   * Sanitize entry data to prevent issues
   * @param data - Raw entry data
   * @returns Sanitized entry data
   */
  private sanitizeEntryData(data: Partial<VocabularyEntry>): Partial<VocabularyEntry> {
    const sanitized: Partial<VocabularyEntry> = {};

    // Sanitize string fields
    const stringFields = ['bulgarian', 'german', 'category', 'cultural_note', 'linguistic_note'];
    for (const field of stringFields) {
      const value = data[field as keyof VocabularyEntry] as string;
      if (value) {
        // Remove potentially harmful characters and normalize whitespace
        // eslint-disable-next-line no-control-regex, unicorn/no-hex-escape
        sanitized[field as keyof VocabularyEntry] = value
          .trim()
          .replaceAll(/\s+/g, ' ')
          .replaceAll(/[\x00-\x1F\x7F]/g, '') as any;
      }
    }

    // Sanitize arrays
    if (data.examples) {
      sanitized.examples = data.examples
        .filter(example => typeof example === 'string' && example.trim().length > 0)
        .map(example => example.trim().replaceAll(/\s+/g, ''));
    }

    if (data.tags) {
      sanitized.tags = data.tags
        .filter(tag => typeof tag === 'string' && tag.trim().length > 0)
        .map(tag => tag.trim().replaceAll(/\s+/g, ''));
    }

    // Copy safe fields
    if (data.level) sanitized.level = data.level;
    if (data.source) sanitized.source = data.source;
    if (data.created_at) sanitized.created_at = data.created_at;
    if (data.updated_at) sanitized.updated_at = data.updated_at;

    return sanitized;
  }

  /**
   * Update an existing custom entry with enhanced error handling
   * @param id - Entry ID to update
   * @param updates - Update data
   * @returns Update result with detailed error information
   */
  async updateEntry(id: string, updates: Partial<VocabularyEntry>): Promise<EntryCreationResult> {
    try {
      errorLogger.debug('Updating vocabulary entry', {
        entryId: id,
        updateFields: Object.keys(updates)
      }, 'vocabulary-manager');
      
      const index = this.customVocabulary.findIndex(e => e.id === id);
      if (index === -1) {
        errorLogger.warn('Entry not found for update', { entryId: id }, 'vocabulary-manager');
        
        return {
          success: false,
          error: 'Entry not found',
          errors: ['Entry with specified ID not found']
        };
      }

      // Store original for rollback
      const originalEntry = { ...this.customVocabulary[index] };

      // Sanitize update data
      const sanitizedUpdates = this.sanitizeEntryData(updates);

      const entry: VocabularyEntry = {
        ...this.customVocabulary[index],
        ...sanitizedUpdates,
        updated_at: new Date().toISOString()
      };

      const validation = this.validateEntry(entry);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
          error: `Validation failed: ${validation.errors.join(', ')}`
        };
      }

      // Check for duplicates (excluding current entry)
      const isDuplicate = this.customVocabulary.some((existing, existingIndex) =>
        existingIndex !== index &&
        existing.bulgarian.toLowerCase() === entry.bulgarian.toLowerCase() &&
        existing.german.toLowerCase() === entry.german.toLowerCase()
      );

      if (isDuplicate) {
        return {
          success: false,
          errors: ['Duplicate entry: Bulgarian and German combination already exists'],
          error: 'Duplicate entry detected'
        };
      }

      this.customVocabulary[index] = entry;

      // Save with error handling and rollback
      try {
        await this.saveCustomVocabulary();
      } catch (saveError) {
        // Rollback on save failure
        this.customVocabulary[index] = originalEntry;
        throw saveError;
      }

      errorLogger.info('Vocabulary entry updated successfully', {
        entryId: id,
        updateFields: Object.keys(updates)
      }, 'vocabulary-manager');
      
      return {
        success: true,
        errors: [],
        entry
      };

    } catch (error) {
      const vocabError = ErrorFactory.fromError(error, {
        operation: 'updateEntry',
        entryId: id,
        updateData: updates
      });

      errorLogger.logVocabularyError(vocabError, 'updateEntry', {
        entryId: id,
        updateData: updates
      });

      return {
        success: false,
        errors: [vocabError.userMessage],
        error: vocabError.message
      };
    }
  }

  /**
   * Delete a custom entry with enhanced error handling
   * @param id - Entry ID to delete
   * @returns Promise resolving to success status
   */
  async deleteEntry(id: string): Promise<boolean> {
    try {
      errorLogger.debug('Deleting vocabulary entry', { entryId: id }, 'vocabulary-manager');
      
      const index = this.customVocabulary.findIndex(e => e.id === id);
      if (index === -1) {
        errorLogger.warn('Entry not found for deletion', { entryId: id }, 'vocabulary-manager');
        return false;
      }

      // Store original for rollback
      const deletedEntry = this.customVocabulary[index];
      this.customVocabulary.splice(index, 1);

      // Save with error handling and rollback
      try {
        await this.saveCustomVocabulary();
        
        errorLogger.info('Vocabulary entry deleted successfully', { entryId: id }, 'vocabulary-manager');
        return true;
      } catch (saveError) {
        // Rollback on save failure
        this.customVocabulary.splice(index, 0, deletedEntry);
        throw saveError;
      }

    } catch (error) {
      const vocabError = ErrorFactory.fromError(error, {
        operation: 'deleteEntry',
        entryId: id
      });
      
      errorLogger.logVocabularyError(vocabError, 'deleteEntry', {
        entryId: id
      });
      
      return false;
    }
  }

  /**
   * Get all custom entries
   */
  getCustomEntries(): VocabularyEntry[] {
    return [...this.customVocabulary];
  }

  /**
   * Get merged vocabulary (base + custom)
   */
  getMergedVocabulary(): VocabularyEntry[] {
    return [...this.baseVocabulary, ...this.customVocabulary];
  }

  /**
   * Generate unique ID for new entries
   */
  private generateId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 9);
    return `custom_${timestamp}_${random}`;
  }

  /**
   * Export vocabulary as JSON
   */
  exportAsJSON(includeBase: boolean = true): string {
    const vocabulary = includeBase ? this.getMergedVocabulary() : this.customVocabulary;
    return JSON.stringify(vocabulary, null, 2);
  }

  /**
   * Export vocabulary as CSV
   */
  exportAsCSV(includeBase: boolean = true): string {
    const vocabulary = includeBase ? this.getMergedVocabulary() : this.customVocabulary;

    const headers = [
      'id',
      'bulgarian',
      'german',
      'category',
      'level',
      'cultural_note',
      'linguistic_note',
      'examples',
      'source'
    ];

    const rows = vocabulary.map(item => [
      item.id || '',
      this.escapeCsvValue(item.bulgarian),
      this.escapeCsvValue(item.german),
      item.category || '',
      item.level || '',
      this.escapeCsvValue(item.cultural_note || ''),
      this.escapeCsvValue(item.linguistic_note || ''),
      this.escapeCsvValue(JSON.stringify(item.examples || [])),
      item.source || 'base'
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csv;
  }

  /**
   * Escape CSV values with special characters
   */
  private escapeCsvValue(value: string | number | boolean): string {
    const stringValue = typeof value === 'string' ? value : String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replaceAll('"', '""')}"`;
    }
    return stringValue;
  }

  /**
   * Import from CSV data with enhanced error handling and validation
   * @param csvData - CSV data as string
   * @returns Import result with detailed error information
   */
  async importFromCSV(csvData: string): Promise<ImportResult> {
    try {
      errorLogger.info('Starting CSV import', {
        dataSize: csvData.length,
        estimatedRows: csvData.split('\n').length
      }, 'vocabulary-manager');
      
      // Validate input
      if (!csvData || typeof csvData !== 'string') {
        return {
          success: false,
          message: 'Invalid CSV data provided',
          imported: [],
          errors: [{ errors: ['Invalid input data'] }]
        };
      }

      const lines = csvData.trim().split('\n');
      if (lines.length < 2) {
        return {
          success: false,
          message: 'CSV must have headers and at least one data row',
          imported: [],
          errors: []
        };
      }

      // Check for reasonable size
      if (lines.length > 10_000) {
        return {
          success: false,
          message: 'CSV file too large (maximum 10,000 rows)',
          imported: [],
          errors: []
        };
      }

      const headers = lines[0]?.split(',').map(h => h.trim().toLowerCase()) || [];
      const imported: VocabularyEntry[] = [];
      const errors: ImportError[] = [];

      // Validate required headers
      const requiredHeaders = ['bulgarian', 'german'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        return {
          success: false,
          message: `Missing required headers: ${missingHeaders.join(', ')}`,
          imported: [],
          errors: []
        };
      }

      // Process each row
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = this.parseCSVLine(lines[i] || '');
          const entry: Record<string, string> = {};

          for (const [index, header] of headers.entries()) {
            entry[header] = values[index]?.trim() || '';
          }

          // Skip empty rows
          if (!entry.bulgarian && !entry.german) {
            continue;
          }

          const result = await this.createEntry(entry);
          if (result.success && result.entry) {
            imported.push(result.entry);
          } else {
            errors.push({
              row: i + 1,
              errors: result.errors || ['Unknown error']
            });
          }
        } catch (rowError) {
          errors.push({
            row: i + 1,
            errors: [`Row processing error: ${rowError instanceof Error ? rowError.message : 'Unknown error'}`]
          });
        }
      }

      errorLogger.info('CSV import completed', {
        importedCount: imported.length,
        errorCount: errors.length,
        success: errors.length === 0
      }, 'vocabulary-manager');
      
      return {
        success: errors.length === 0,
        message: `Imported ${imported.length} entries${errors.length > 0 ? `, ${errors.length} errors` : ''}`,
        imported,
        errors
      };

    } catch (error) {
      const vocabError = ErrorFactory.fromError(error, {
        operation: 'importFromCSV',
        dataSize: csvData.length
      });

      errorLogger.logVocabularyError(vocabError, 'importFromCSV', {
        dataSize: csvData.length
      });

      return {
        success: false,
        message: `Import failed: ${vocabError.userMessage}`,
        imported: [],
        errors: [{ errors: [vocabError.userMessage] }]
      };
    }
  }

  /**
   * Parse CSV line respecting quoted values
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current);
    return result;
  }

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
  getStatistics(): VocabularyStatistics {
    const all = this.getMergedVocabulary();
    const custom = this.customVocabulary;

    const levelCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};

    for (const item of all) {
      levelCounts[item.level] = (levelCounts[item.level] || 0) + 1;
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    }

    return {
      totalEntries: all.length,
      customEntries: custom.length,
      baseEntries: all.length - custom.length,
      levelDistribution: levelCounts,
      categoryDistribution: categoryCounts
    };
  }

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
  clearCustomVocabulary(): boolean {
    this.customVocabulary = [];
    this.saveCustomVocabulary();
    return true;
  }

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
  async importFromJSON(jsonData: string): Promise<ImportResult> {
    try {
      errorLogger.info('Starting JSON import', {
        dataSize: jsonData.length
      }, 'vocabulary-manager');
      
      // Validate input
      if (!jsonData || typeof jsonData !== 'string') {
        return {
          success: false,
          message: 'Invalid JSON data provided',
          imported: [],
          errors: [{ errors: ['Invalid input data'] }]
        };
      }

      // Check for reasonable size
      if (jsonData.length > 10 * 1024 * 1024) { // 10MB
        return {
          success: false,
          message: 'JSON data too large (maximum 10MB)',
          imported: [],
          errors: []
        };
      }

      let entries: unknown[];
      try {
        entries = JSON.parse(jsonData);
      } catch (parseError) {
        throw new ParsingError(
          `JSON parse error: ${(parseError as Error).message}`,
          'JSON',
          jsonData.slice(0, 500),
          'array of vocabulary entries'
        );
      }

      if (!Array.isArray(entries)) {
        return {
          success: false,
          message: 'JSON must be an array of vocabulary entries',
          imported: [],
          errors: []
        };
      }

      // Check for reasonable number of entries
      if (entries.length > 10_000) {
        return {
          success: false,
          message: 'JSON array too large (maximum 10,000 entries)',
          imported: [],
          errors: []
        };
      }

      const imported: VocabularyEntry[] = [];
      const errors: ImportError[] = [];

      // Process each entry
      for (const [index, entry] of entries.entries()) {
        try {
          const result = await this.createEntry(entry as Partial<VocabularyEntry>);
          if (result.success && result.entry) {
            imported.push(result.entry);
          } else {
            errors.push({
              index,
              errors: result.errors || ['Unknown error']
            });
          }
        } catch (entryError) {
          errors.push({
            index,
            errors: [`Entry processing error: ${entryError instanceof Error ? entryError.message : 'Unknown error'}`]
          });
        }
      }

      errorLogger.info('JSON import completed', {
        importedCount: imported.length,
        errorCount: errors.length,
        success: errors.length === 0
      }, 'vocabulary-manager');
      
      return {
        success: errors.length === 0,
        message: `Imported ${imported.length} entries${errors.length > 0 ? `, ${errors.length} errors` : ''}`,
        imported,
        errors
      };

    } catch (error) {
      const vocabError = ErrorFactory.fromError(error, {
        operation: 'importFromJSON',
        dataSize: jsonData?.length || 0
      });

      errorLogger.logVocabularyError(vocabError, 'importFromJSON', {
        dataSize: jsonData?.length || 0
      });

      return {
        success: false,
        message: `Import failed: ${vocabError.userMessage}`,
        imported: [],
        errors: [{ errors: [vocabError.userMessage] }]
      };
    }
  }

  /**
   * Get detailed statistics about vocabulary operations
   * @returns Promise resolving to detailed statistics
   */
  async getDetailedStatistics(): Promise<VocabularyStatistics & {
    memoryStats: any;
    connectivityStatus: any;
    lastOperationTime?: Date;
    operationCount: number;
  }> {
    const baseStats = this.getStatistics();
    const memoryStats = memoryManager.getStatistics();
    const connectivityStatus = connectivityManager.getStatus();

    return {
      ...baseStats,
      memoryStats,
      connectivityStatus,
      operationCount: this.customVocabulary.length + this.baseVocabulary.length
    };
  }

  /**
   * Perform health check on vocabulary manager
   * @returns Promise resolving to health check result
   */
  async performHealthCheck(): Promise<{
    healthy: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    errorLogger.info('Starting vocabulary manager health check', {}, 'vocabulary-manager');
    
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Check localStorage access
      const testKey = 'health-check-test';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
    } catch {
      issues.push('localStorage access failed');
      recommendations.push('Check browser storage permissions');
    }

    // Check memory pressure
    const memoryStats = memoryManager.getStatistics();
    if (memoryStats.pressure === 'high' || memoryStats.pressure === 'critical') {
      issues.push(`High memory pressure: ${memoryStats.pressure}`);
      recommendations.push('Consider clearing old vocabulary data');
    }

    // Check connectivity
    const connectivityStatus = connectivityManager.getStatus();
    if (!connectivityStatus.online) {
      issues.push('Currently offline');
      recommendations.push('Some features may be limited until connection is restored');
    }

    // Check data integrity
    try {
      const validation = this.validateVocabularyArray(this.customVocabulary);
      if (!validation.isValid) {
        issues.push('Data integrity issues found');
        recommendations.push('Consider re-importing vocabulary data');
      }
    } catch {
      issues.push('Data validation failed');
      recommendations.push('Vocabulary data may be corrupted');
    }

    const healthResult = {
      healthy: issues.length === 0,
      issues,
      recommendations
    };
    
    errorLogger.info('Vocabulary manager health check completed', {
      healthy: healthResult.healthy,
      issueCount: issues.length,
      recommendationCount: recommendations.length
    }, 'vocabulary-manager');
    
    return healthResult;
  }
}

export default VocabularyManager;