#!/usr/bin/env node

/**
 * Vocabulary Splitting Script
 * Splits the monolithic vocabulary.json file into modular chunks by level and category
 * for improved performance and lazy loading capabilities.
 * 
 * Output structure:
 * data/vocab/
 * ├── A1.json
 * ├── A2.json
 * ├── B1.json
 * ├── B2.json
 * ├── greeting.json
 * ├── travel.json
 * └── ...
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
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

interface SplitResult {
  file: string;
  entryCount: number;
  sizeKB: number;
  categories: string[];
}

class VocabularySplitter {
  private vocabulary: VocabularyEntry[] = [];
  private splitResults: SplitResult[] = [];
  private vocabDir: string;
  private maxFileSizeKB = 50; // Target maximum file size

  constructor() {
    this.vocabDir = join(process.cwd(), 'data', 'vocab');
  }

  async run() {
    console.log('🔧 Starting vocabulary splitting process...\n');
    
    try {
      await this.loadVocabulary();
      await this.createVocabDirectory();
      await this.splitByLevel();
      await this.splitByCategory();
      await this.generateIndex();
      await this.validateSplitFiles();
      this.printResults();
      
      console.log('✅ Vocabulary splitting completed successfully!');
    } catch (error) {
      console.error('❌ Error splitting vocabulary:', error);
      process.exit(1);
    }
  }

  private async loadVocabulary() {
    const vocabPath = join(process.cwd(), 'data', 'vocabulary.json');
    console.log(`📖 Loading vocabulary from: ${vocabPath}`);
    
    const content = await readFile(vocabPath, 'utf8');
    this.vocabulary = JSON.parse(content);
    
    console.log(`📊 Loaded ${this.vocabulary.length} vocabulary entries`);
  }

  private async createVocabDirectory() {
    if (!existsSync(this.vocabDir)) {
      console.log(`📁 Creating vocabulary directory: ${this.vocabDir}`);
      await mkdir(this.vocabDir, { recursive: true });
    }
  }

  private async splitByLevel() {
    console.log('\n📈 Splitting vocabulary by CEFR level...');
    
    const levels = ['A1', 'A2', 'B1', 'B2'];
    
    for (const level of levels) {
      const levelEntries = this.vocabulary.filter(entry => entry.level === level);
      
      if (levelEntries.length > 0) {
        const fileName = `${level}.json`;
        await this.saveSplitFile(fileName, levelEntries, `Level ${level}`);
      }
    }
    
    // Handle entries without level
    const noLevelEntries = this.vocabulary.filter(entry => !entry.level || entry.level === '');
    if (noLevelEntries.length > 0) {
      await this.saveSplitFile('unleveled.json', noLevelEntries, 'Unleveled entries');
    }
  }

  private async splitByCategory() {
    console.log('\n📂 Splitting vocabulary by category...');
    
    const categories = [...new Set(this.vocabulary.map(entry => entry.category).filter(Boolean))];
    
    for (const category of categories) {
      if (!category) continue;
      
      const categoryEntries = this.vocabulary.filter(entry => entry.category === category);
      
      // Only create category files if they contain a reasonable number of entries
      // and won't exceed the size limit
      if (categoryEntries.length >= 5) {
        const fileName = `${this.sanitizeFileName(category)}.json`;
        await this.saveSplitFile(fileName, categoryEntries, `Category "${category}"`);
      }
    }
  }

  private async saveSplitFile(fileName: string, entries: VocabularyEntry[], description: string) {
    const filePath = join(this.vocabDir, fileName);
    const content = JSON.stringify(entries, null, 2);
    const sizeKB = Math.round(Buffer.byteLength(content, 'utf8') / 1024);
    
    // Check if file would exceed size limit
    if (sizeKB > this.maxFileSizeKB) {
      console.log(`⚠️  ${description} would be ${sizeKB}KB (exceeds ${this.maxFileSizeKB}KB limit)`);
      
      // Try to split further by sub-categories or other criteria
      await this.splitLargeCategory(fileName, entries, description);
      return;
    }
    
    await writeFile(filePath, content);
    
    this.splitResults.push({
      file: fileName,
      entryCount: entries.length,
      sizeKB,
      categories: [...new Set(entries.map(e => e.category).filter(Boolean))] as string[]
    });
    
    console.log(`✅ ${description}: ${entries.length} entries, ${sizeKB}KB`);
  }

  private async splitLargeCategory(baseFileName: string, entries: VocabularyEntry[], description: string) {
    // Split large categories by level first
    const levels = ['A1', 'A2', 'B1', 'B2'];
    
    for (const level of levels) {
      const levelEntries = entries.filter(entry => entry.level === level);
      
      if (levelEntries.length > 0) {
        const fileName = `${baseFileName.replace('.json', '')}-${level}.json`;
        await this.saveSplitFileDirect(fileName, levelEntries, `${description} (${level})`);
      }
    }
    
    // Handle remaining entries
    const remainingEntries = entries.filter(entry => !entry.level || !levels.includes(entry.level));
    if (remainingEntries.length > 0) {
      const fileName = `${baseFileName.replace('.json', '')}-other.json`;
      await this.saveSplitFileDirect(fileName, remainingEntries, `${description} (other)`);
    }
  }

  private async saveSplitFileDirect(fileName: string, entries: VocabularyEntry[], description: string) {
    const filePath = join(this.vocabDir, fileName);
    const content = JSON.stringify(entries, null, 2);
    const sizeKB = Math.round(Buffer.byteLength(content, 'utf8') / 1024);
    
    await writeFile(filePath, content);
    
    this.splitResults.push({
      file: fileName,
      entryCount: entries.length,
      sizeKB,
      categories: [...new Set(entries.map(e => e.category).filter(Boolean))] as string[]
    });
    
    console.log(`✅ ${description}: ${entries.length} entries, ${sizeKB}KB`);
  }

  private sanitizeFileName(name: string): string {
    return name
      .toLowerCase()
      .replaceAll(/[^\da-zßäöü]/g, '-')
      .replaceAll(/-+/g, '-')
      .replaceAll(/^-|-$/g, '');
  }

  private async generateIndex() {
    console.log('\n📋 Generating vocabulary index...');
    
    const index = {
      generated: new Date().toISOString(),
      totalEntries: this.vocabulary.length,
      splitFiles: this.splitResults.map(result => ({
        file: result.file,
        entryCount: result.entryCount,
        sizeKB: result.sizeKB,
        categories: result.categories
      })),
      summary: {
        totalFiles: this.splitResults.length,
        totalSizeKB: (() => {
          let total = 0;
          for (const result of this.splitResults) {
            total += result.sizeKB;
          }
          return total;
        })(),
        averageSizeKB: Math.round((() => {
          let total = 0;
          for (const result of this.splitResults) {
            total += result.sizeKB;
          }
          return total;
        })() / this.splitResults.length),
        largestFile: this.splitResults.length > 0 ? (() => {
          let largest = this.splitResults[0]!;
          for (const result of this.splitResults) {
            if (result.sizeKB > largest.sizeKB) {
              largest = result;
            }
          }
          return largest;
        })() : null,
        smallestFile: this.splitResults.length > 0 ? (() => {
          let smallest = this.splitResults[0]!;
          for (const result of this.splitResults) {
            if (result.sizeKB < smallest.sizeKB) {
              smallest = result;
            }
          }
          return smallest;
        })() : null
      }
    };
    
    const indexPath = join(this.vocabDir, 'index.json');
    await writeFile(indexPath, JSON.stringify(index, null, 2));
    
    console.log('✅ Vocabulary index generated');
  }

  private async validateSplitFiles() {
    console.log('\n🔍 Validating split files...');
    
    let totalEntries = 0;
    
    for (const result of this.splitResults) {
      const filePath = join(this.vocabDir, result.file);
      const content = await readFile(filePath, 'utf8');
      const entries: VocabularyEntry[] = JSON.parse(content);
      
      totalEntries += entries.length;
      
      // Check for duplicate IDs within the same file
      const fileIds = new Set<string>();
      for (const entry of entries) {
        if (fileIds.has(entry.id)) {
          console.error(`❌ Duplicate ID found within file: ${entry.id} in ${result.file}`);
          throw new Error(`Duplicate vocabulary ID within file: ${entry.id}`);
        }
        fileIds.add(entry.id);
      }
      
      // Validate schema compliance
      for (const entry of entries) {
        if (!this.validateEntrySchema(entry)) {
          console.error(`❌ Invalid entry schema in ${result.file}: ${entry.id}`);
          throw new Error(`Invalid vocabulary entry schema: ${entry.id}`);
        }
      }
    }
    
    // Verify no data loss (note: entries can appear in multiple files, so we expect totalEntries >= vocabulary.length)
    if (totalEntries < this.vocabulary.length) {
      console.error(`❌ Data loss detected: expected at least ${this.vocabulary.length}, got ${totalEntries}`);
      throw new Error('Vocabulary data loss during splitting');
    }
    
    console.log('✅ All split files validated successfully');
    console.log(`📊 Total entries across all files: ${totalEntries} (entries can appear in multiple files)`);
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
    console.log('\n📊 Splitting Results Summary:');
    console.log('='.repeat(50));
    
    console.log(`Total vocabulary entries: ${this.vocabulary.length}`);
    console.log(`Number of split files: ${this.splitResults.length}`);
    console.log(`Total size of split files: ${(() => {
      let total = 0;
      for (const result of this.splitResults) {
        total += result.sizeKB;
      }
      return total;
    })()}KB`);
    console.log(`Average file size: ${Math.round((() => {
      let total = 0;
      for (const result of this.splitResults) {
        total += result.sizeKB;
      }
      return total;
    })() / this.splitResults.length)}KB`);
    
    console.log('\n📁 Generated files:');
    for (const result of this.splitResults) {
      console.log(`  ${result.file.padEnd(20)} ${result.entryCount.toString().padStart(3)} entries, ${result.sizeKB.toString().padStart(3)}KB`);
    }
    
    const oversizedFiles = this.splitResults.filter(r => r.sizeKB > this.maxFileSizeKB);
    if (oversizedFiles.length > 0) {
      console.log('\n⚠️  Files exceeding size limit:');
      for (const file of oversizedFiles) {
        console.log(`  ${file.file}: ${file.sizeKB}KB (limit: ${this.maxFileSizeKB}KB)`);
      }
    }
  }
}

// Run the splitter
if (require.main === module) {
  new VocabularySplitter().run();
}

export { VocabularySplitter, VocabularyEntry };