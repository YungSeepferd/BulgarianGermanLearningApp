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
declare class VocabularySplitter {
    private vocabulary;
    private splitResults;
    private vocabDir;
    private maxFileSizeKB;
    constructor();
    run(): Promise<void>;
    private loadVocabulary;
    private createVocabDirectory;
    private splitByLevel;
    private splitByCategory;
    private saveSplitFile;
    private splitLargeCategory;
    private saveSplitFileDirect;
    private sanitizeFileName;
    private generateIndex;
    private validateSplitFiles;
    private validateEntrySchema;
    private printResults;
}
export { VocabularySplitter, VocabularyEntry };
//# sourceMappingURL=split-vocabulary.d.ts.map