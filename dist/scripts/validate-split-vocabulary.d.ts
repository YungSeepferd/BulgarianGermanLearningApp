#!/usr/bin/env node
/**
 * Validation Script for Split Vocabulary Files
 * Validates data integrity and schema compliance for modular vocabulary chunks
 */
declare class VocabularyValidator {
    private vocabDir;
    private results;
    constructor();
    run(): Promise<void>;
    private validateAllFiles;
    private validateFile;
    private validateEntrySchema;
    private printResults;
}
export { VocabularyValidator };
//# sourceMappingURL=validate-split-vocabulary.d.ts.map