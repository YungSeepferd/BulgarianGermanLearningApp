/**
 * Vocabulary Manager Module
 * Handles creating, editing, importing, and exporting vocabulary entries
 * Stores custom entries in localStorage for offline access
 */

export class VocabularyManager {
  constructor(options = {}) {
    this.storageKey = 'bgde:custom_vocabulary';
    this.profileKey = 'bgde:active_profile';
    this.baseVocabulary = options.baseVocabulary || [];
    this.customVocabulary = this.loadCustomVocabulary();
  }

  /**
   * Load custom vocabulary from localStorage
   */
  loadCustomVocabulary() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[VocabularyManager] Error loading custom vocabulary:', error);
      return [];
    }
  }

  /**
   * Save custom vocabulary to localStorage
   */
  saveCustomVocabulary() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.customVocabulary));
      return true;
    } catch (error) {
      console.error('[VocabularyManager] Error saving vocabulary:', error);
      return false;
    }
  }

  /**
   * Validate vocabulary entry structure
   */
  validateEntry(entry) {
    const errors = [];

    if (!entry.bulgarian || entry.bulgarian.trim() === '') {
      errors.push('Bulgarian translation is required');
    }

    if (!entry.german || entry.german.trim() === '') {
      errors.push('German translation is required');
    }

    if (!entry.category || entry.category.trim() === '') {
      errors.push('Category is required');
    }

    if (!entry.level) {
      errors.push('CEFR level is required');
    } else if (!['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(entry.level)) {
      errors.push('CEFR level must be one of: A1, A2, B1, B2, C1, C2');
    }

    // Optional but should be valid if provided
    if (entry.examples && !Array.isArray(entry.examples)) {
      errors.push('Examples must be an array');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Create a new vocabulary entry with validation
   */
  createEntry(data) {
    const entry = {
      id: this.generateId(),
      bulgarian: data.bulgarian?.trim() || '',
      german: data.german?.trim() || '',
      category: data.category?.trim() || '',
      level: data.level || 'A1',
      cultural_note: data.cultural_note?.trim() || '',
      linguistic_note: data.linguistic_note?.trim() || '',
      examples: Array.isArray(data.examples) ? data.examples : [],
      source: 'manual',
      created_at: new Date().toISOString(),
      tags: data.tags ? (Array.isArray(data.tags) ? data.tags : [data.tags]) : []
    };

    const validation = this.validateEntry(entry);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
        entry: null
      };
    }

    this.customVocabulary.push(entry);
    this.saveCustomVocabulary();

    return {
      success: true,
      errors: [],
      entry
    };
  }

  /**
   * Update an existing custom entry
   */
  updateEntry(id, updates) {
    const index = this.customVocabulary.findIndex(e => e.id === id);
    if (index === -1) {
      return {
        success: false,
        error: 'Entry not found'
      };
    }

    const entry = {
      ...this.customVocabulary[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    const validation = this.validateEntry(entry);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors
      };
    }

    this.customVocabulary[index] = entry;
    this.saveCustomVocabulary();

    return {
      success: true,
      entry
    };
  }

  /**
   * Delete a custom entry
   */
  deleteEntry(id) {
    const index = this.customVocabulary.findIndex(e => e.id === id);
    if (index === -1) {
      return false;
    }

    this.customVocabulary.splice(index, 1);
    this.saveCustomVocabulary();
    return true;
  }

  /**
   * Get all custom entries
   */
  getCustomEntries() {
    return [...this.customVocabulary];
  }

  /**
   * Get merged vocabulary (base + custom)
   */
  getMergedVocabulary() {
    return [...this.baseVocabulary, ...this.customVocabulary];
  }

  /**
   * Generate unique ID for new entries
   */
  generateId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 9);
    return `custom_${timestamp}_${random}`;
  }

  /**
   * Export vocabulary as JSON
   */
  exportAsJSON(includeBase = true) {
    const vocabulary = includeBase ? this.getMergedVocabulary() : this.customVocabulary;
    return JSON.stringify(vocabulary, null, 2);
  }

  /**
   * Export vocabulary as CSV
   */
  exportAsCSV(includeBase = true) {
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
  escapeCsvValue(value) {
    if (typeof value !== 'string') {
      value = String(value);
    }
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replaceAll('"', '""')}"`;
    }
    return value;
  }

  /**
   * Import from CSV data (string)
   */
  importFromCSV(csvData) {
    const lines = csvData.trim().split('\n');
    if (lines.length < 2) {
      return {
        success: false,
        message: 'CSV must have headers and at least one data row',
        imported: []
      };
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const imported = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      const entry = {};

      for (const [index, header] of headers.entries()) {
        entry[header] = values[index]?.trim() || '';
      }

      // Skip empty rows
      if (!entry.bulgarian && !entry.german) {
        continue;
      }

      const result = this.createEntry(entry);
      if (result.success) {
        imported.push(result.entry);
      } else {
        errors.push({
          row: i + 1,
          errors: result.errors
        });
      }
    }

    return {
      success: errors.length === 0,
      message: `Imported ${imported.length} entries${errors.length > 0 ? `, ${errors.length} errors` : ''}`,
      imported,
      errors
    };
  }

  /**
   * Parse CSV line respecting quoted values
   */
  parseCSVLine(line) {
    const result = [];
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
   */
  getStatistics() {
    const all = this.getMergedVocabulary();
    const custom = this.customVocabulary;

    const levelCounts = {};
    const categoryCounts = {};

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
   */
  clearCustomVocabulary() {
    this.customVocabulary = [];
    this.saveCustomVocabulary();
    return true;
  }

  /**
   * Import JSON data
   */
  importFromJSON(jsonData) {
    try {
      const entries = JSON.parse(jsonData);
      if (!Array.isArray(entries)) {
        return {
          success: false,
          message: 'JSON must be an array of vocabulary entries',
          imported: []
        };
      }

      const imported = [];
      const errors = [];

      for (const [index, entry] of entries.entries()) {
        const result = this.createEntry(entry);
        if (result.success) {
          imported.push(result.entry);
        } else {
          errors.push({
            index,
            errors: result.errors
          });
        }
      }

      return {
        success: errors.length === 0,
        message: `Imported ${imported.length} entries${errors.length > 0 ? `, ${errors.length} errors` : ''}`,
        imported,
        errors
      };
    } catch (error) {
      return {
        success: false,
        message: `JSON parse error: ${error.message}`,
        imported: []
      };
    }
  }
}

export default VocabularyManager;
