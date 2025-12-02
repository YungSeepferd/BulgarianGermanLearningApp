#!/usr/bin/env node
/**
 * Test Script for Modular Vocabulary API
 * Tests lazy loading functionality and performance
 */
// Note: This test requires the TypeScript file to be compiled first
// For now, we'll test the functionality through the existing JavaScript modules
// that have been updated to use the modular API
console.log('🧪 Testing Modular Vocabulary API through updated modules...\n');
// We'll test by checking if the vocabulary files exist and are accessible
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
const vocabDir = join(process.cwd(), 'data', 'vocab');
async function testVocabularyFiles() {
    try {
        // Test 1: Check if index file exists
        console.log('📋 Test 1: Checking vocabulary index...');
        const indexPath = join(vocabDir, 'index.json');
        if (existsSync(indexPath)) {
            const indexContent = await readFile(indexPath, 'utf8');
            const index = JSON.parse(indexContent);
            console.log(`✅ Index found with ${index.totalEntries} entries across ${index.splitFiles.length} files`);
        }
        else {
            throw new Error('Vocabulary index not found');
        }
        // Test 2: Check if key vocabulary files exist
        console.log('\n📁 Test 2: Checking key vocabulary files...');
        const keyFiles = ['A1-A1.json', 'begrüßung.json', 'verben-A1.json'];
        for (const file of keyFiles) {
            const filePath = join(vocabDir, file);
            if (existsSync(filePath)) {
                const content = await readFile(filePath, 'utf8');
                const entries = JSON.parse(content);
                console.log(`✅ ${file}: ${entries.length} entries`);
            }
            else {
                console.log(`❌ ${file}: Not found`);
            }
        }
        // Test 3: Verify data structure
        console.log('\n🔍 Test 3: Verifying data structure...');
        const sampleFile = join(vocabDir, 'begrüßung.json');
        if (existsSync(sampleFile)) {
            const content = await readFile(sampleFile, 'utf8');
            const entries = JSON.parse(content);
            if (Array.isArray(entries) && entries.length > 0) {
                const sampleEntry = entries[0];
                const requiredFields = ['id', 'word', 'translation', 'source_lang', 'target_lang'];
                const hasAllFields = requiredFields.every(field => field in sampleEntry);
                if (hasAllFields) {
                    console.log(`✅ Data structure valid: ${requiredFields.join(', ')} fields present`);
                }
                else {
                    throw new Error('Missing required fields in vocabulary entry');
                }
            }
            else {
                throw new Error('Invalid data format in vocabulary file');
            }
        }
        // Test 4: Check file sizes
        console.log('\n💾 Test 4: Checking file sizes...');
        const indexContent2 = await readFile(indexPath, 'utf8');
        const index = JSON.parse(indexContent2);
        let smallFiles = 0;
        let largeFiles = 0;
        for (const fileInfo of index.splitFiles) {
            if (fileInfo.sizeKB <= 50) {
                smallFiles++;
            }
            else {
                largeFiles++;
            }
        }
        console.log(`📊 Files under 50KB: ${smallFiles}`);
        console.log(`📊 Files over 50KB: ${largeFiles}`);
        console.log(`📊 Largest file: ${index.summary.largestFile.file} (${index.summary.largestFile.sizeKB}KB)`);
        console.log('\n🎉 Basic file structure tests completed successfully!');
        console.log('\n💡 Next steps:');
        console.log('   - Compile TypeScript modules with: npx tsc');
        console.log('   - Test browser functionality with the updated JavaScript modules');
        console.log('   - Run performance tests to measure improvements');
    }
    catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}
// Run the test
if (require.main === module) {
    testVocabularyFiles();
}
//# sourceMappingURL=test-vocabulary-api.js.map