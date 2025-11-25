#!/usr/bin/env node

/**
 * Validation Script for Split Vocabulary Files
 * Validates data integrity and schema compliance for modular vocabulary chunks
 */

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

interface VocabularyEntry {
  id: string;
  word: string;
  translation: string;
  source_lang: string;
  target_lang: string;
  category?: string;
  level?: string;
  notes?: string;
  notes_bg_to_de?: string;
  notes_de_to_bg?: string;
  etymology?: string;
  cultural_note?: string;
  linguistic_note?: string;
  difficulty?: number;
  frequency?: number;
  examples?: Array<{
    sentence: string;
    translation: string;
    context?: string;
    note?: string;
  }>;
}

interface ValidationResult {
  file: string;
  valid: boolean;
  errors: string[];
  entryCount: number;
  duplicateIds: string[];
  schemaErrors: number;
}

class VocabularyValidator {
  private vocabDir: string;
  private results: ValidationResult[] = [];
  // private allIds: Set<string> = new Set(); // Removed unused variable

  constructor() {
    this.vocabDir = join(process.cwd(), 'data', 'vocab');
  }

  async run() {
    console.log('🔍 Starting vocabulary validation...\n');
    
    try {
      await this.validateAllFiles();
      this.printResults();
      
      const hasErrors = this.results.some(result => !result.valid);
      if (hasErrors) {
        console.error('❌ Validation completed with errors');
        process.exit(1);
      } else {
        console.log('✅ All vocabulary files validated successfully!');
      }
    } catch (error) {
      console.error('❌ Error during validation:', error);
      process.exit(1);
    }
  }

  private async validateAllFiles() {
    const indexPath = join(this.vocabDir, 'index.json');
    
    if (!existsSync(indexPath)) {
      throw new Error('Vocabulary index not found. Run split-vocabulary.ts first.');
    }

    const indexContent = await readFile(indexPath, 'utf8');
    const index = JSON.parse(indexContent);

    for (const fileInfo of index.splitFiles) {
      await this.validateFile(fileInfo.file);
    }
  }

  private async validateFile(fileName: string) {
    const filePath = join(this.vocabDir, fileName);
    const result: ValidationResult = {
      file: fileName,
      valid: true,
      errors: [],
      entryCount: 0,
      duplicateIds: [],
      schemaErrors: 0
    };

    try {
      const content = await readFile(filePath, 'utf8');
      const entries: VocabularyEntry[] = JSON.parse(content);
      
      result.entryCount = entries.length;

      // Check for duplicate IDs within the file
      const fileIds = new Set<string>();
      for (const entry of entries) {
        if (fileIds.has(entry.id)) {
          result.duplicateIds.push(entry.id);
          result.valid = false;
        }
        fileIds.add(entry.id);
      }

      // Validate schema for each entry
      for (const entry of entries) {
        if (!this.validateEntrySchema(entry)) {
          result.schemaErrors++;
          result.valid = false;
        }
      }

      // Check file size (should be under 50KB for optimal performance)
      const sizeKB = Math.round(Buffer.byteLength(content, 'utf8') / 1024);
      if (sizeKB > 50) {
        result.errors.push(`File size ${sizeKB}KB exceeds 50KB limit`);
      }

      if (result.duplicateIds.length > 0) {
        result.errors.push(`Duplicate IDs found: ${result.duplicateIds.join(', ')}`);
      }

      if (result.schemaErrors > 0) {
        result.errors.push(`${result.schemaErrors} schema validation errors`);
      }

    } catch (error) {
      result.valid = false;
      result.errors.push(`Failed to read/parse file: ${(error as Error).message}`);
    }

    this.results.push(result);
  }

  private validateEntrySchema(entry: VocabularyEntry): boolean {
    // Basic required fields
    if (!entry.id || typeof entry.id !== 'string') return false;
    if (!entry.word || typeof entry.word !== 'string') return false;
    if (!entry.translation || typeof entry.translation !== 'string') return false;
    if (!entry.source_lang || typeof entry.source_lang !== 'string') return false;
    if (!entry.target_lang || typeof entry.target_lang !== 'string') return false;
    
    // Optional fields type checking
    if (entry.category && typeof entry.category !== 'string') return false;
    if (entry.level && typeof entry.level !== 'string') return false;
    if (entry.difficulty && (typeof entry.difficulty !== 'number' || entry.difficulty < 1 || entry.difficulty > 5)) return false;
    if (entry.frequency && (typeof entry.frequency !== 'number' || entry.frequency < 0 || entry.frequency > 100)) return false;
    
    // Examples validation
    if (entry.examples && !Array.isArray(entry.examples)) return false;
    if (entry.examples) {
      for (const example of entry.examples) {
        if (!example.sentence || typeof example.sentence !== 'string') return false;
        if (!example.translation || typeof example.translation !== 'string') return false;
      }
    }
    
    return true;
  }

  private printResults() {
    console.log('📊 Validation Results Summary:');
    console.log('='.repeat(60));
    
    const totalFiles = this.results.length;
    const validFiles = this.results.filter(r => r.valid).length;
    const totalEntries = this.results.reduce((sum, r) => sum + r.entryCount, 0);
    const totalErrors = this.results.reduce((sum, r) => sum + r.errors.length, 0);
    
    console.log(`Total files: ${totalFiles}`);
    console.log(`Valid files: ${validFiles}`);
    console.log(`Files with errors: ${totalFiles - validFiles}`);
    console.log(`Total vocabulary entries: ${totalEntries}`);
    console.log(`Total validation errors: ${totalErrors}`);
    
    console.log('\n📁 File Details:');
    for (const result of this.results) {
      const status = result.valid ? '✅' : '❌';
      console.log(`${status} ${result.file.padEnd(25)} ${result.entryCount.toString().padStart(3)} entries`);
      
      if (!result.valid) {
        for (const error of result.errors) {
          console.log(`   └─ ${error}`);
        }
      }
    }
    
    // Performance analysis
    const oversizedFiles = this.results.filter(r => 
      r.errors.some(e => e.includes('exceeds 50KB limit'))
    );
    
    if (oversizedFiles.length > 0) {
      console.log('\n⚠️  Performance Warnings:');
      for (const file of oversizedFiles) {
        const sizeError = file.errors.find(e => e.includes('KB limit'));
        console.log(`   ${file.file}: ${sizeError}`);
      }
    }
  }
}

// Run the validator
if (require.main === module) {
  new VocabularyValidator().run();
}

export { VocabularyValidator };