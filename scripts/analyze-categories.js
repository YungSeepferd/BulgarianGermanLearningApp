#!/usr/bin/env node
/**
 * Script to analyze category distribution in the unified vocabulary file
 *
 * This script:
 * 1. Analyzes the current category distribution
 * 2. Identifies items with "uncategorized" category
 * 3. Identifies items with more than 2 categories (over-categorization)
 * 4. Identifies items with invalid categories (not in the official list)
 * 5. Generates a comprehensive report for manual remediation
 */

const fs = require('fs');
const path = require('path');

// Paths
const VOCABULARY_PATH = path.join(__dirname, '../data/unified-vocabulary.json');
const REPORT_PATH = path.join(__dirname, '../reports/category-fix-report.json');
const WHITELIST_PATH = path.join(__dirname, '../data/category-whitelist.json');

// Load vocabulary data
function loadVocabulary() {
    const rawData = fs.readFileSync(VOCABULARY_PATH, 'utf-8');
    return JSON.parse(rawData);
}

// Load existing report if available
function loadExistingReport() {
    if (fs.existsSync(REPORT_PATH)) {
        const rawData = fs.readFileSync(REPORT_PATH, 'utf-8');
        return JSON.parse(rawData);
    }
    return null;
}

// Load or create category whitelist
function loadCategoryWhitelist() {
    if (fs.existsSync(WHITELIST_PATH)) {
        const rawData = fs.readFileSync(WHITELIST_PATH, 'utf-8');
        return JSON.parse(rawData);
    }

    // Default whitelist based on the categories in the vocabulary file
    const vocabulary = loadVocabulary();
    const whitelist = {
        categories: vocabulary.categories || [],
        descriptions: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    // Save the default whitelist
    fs.writeFileSync(WHITELIST_PATH, JSON.stringify(whitelist, null, 2), 'utf-8');
    return whitelist;
}

// Analyze category distribution
function analyzeCategories() {
    const vocabulary = loadVocabulary();
    const whitelist = loadCategoryWhitelist();
    const validCategories = new Set(whitelist.categories);

    const report = {
        timestamp: new Date().toISOString(),
        totalItems: vocabulary.items.length,
        fixedItems: 0,
        percentFixed: 0,
        categoryDistribution: {},
        uncategorizedItems: [],
        overCategorizedItems: [],
        invalidCategoryItems: [],
        itemsWithAmbiguousCategories: [],
        fixes: []
    };

    // Initialize category distribution
    whitelist.categories.forEach(category => {
        report.categoryDistribution[category] = 0;
    });

    // Analyze each item
    vocabulary.items.forEach(item => {
        const categories = item.categories || [];

        // Count category distribution
        categories.forEach(category => {
            if (validCategories.has(category)) {
                report.categoryDistribution[category] = (report.categoryDistribution[category] || 0) + 1;
            }
        });

        // Check for uncategorized items
        if (categories.length === 0 || categories.includes('uncategorized')) {
            report.uncategorizedItems.push({
                id: item.id,
                german: item.german,
                bulgarian: item.bulgarian,
                partOfSpeech: item.partOfSpeech,
                currentCategories: categories,
                reason: categories.length === 0 ? 'No categories assigned' : 'Contains "uncategorized"'
            });
        }

        // Check for over-categorization (more than 2 categories)
        if (categories.length > 2) {
            report.overCategorizedItems.push({
                id: item.id,
                german: item.german,
                bulgarian: item.bulgarian,
                partOfSpeech: item.partOfSpeech,
                currentCategories: categories,
                count: categories.length,
                reason: `Has ${categories.length} categories (max 2 allowed)`
            });
        }

        // Check for invalid categories
        const invalidCategories = categories.filter(category => !validCategories.has(category));
        if (invalidCategories.length > 0) {
            report.invalidCategoryItems.push({
                id: item.id,
                german: item.german,
                bulgarian: item.bulgarian,
                partOfSpeech: item.partOfSpeech,
                currentCategories: categories,
                invalidCategories: invalidCategories,
                reason: `Contains invalid categories: ${invalidCategories.join(', ')}`
            });
        }
    });

    // Calculate statistics
    const existingReport = loadExistingReport();
    if (existingReport) {
        report.fixedItems = existingReport.fixedItems || 0;
        report.fixes = existingReport.fixes || [];
    }

    report.percentFixed = Math.round((report.fixedItems / report.totalItems) * 100);

    return report;
}

// Generate a CSV sample for manual review
function generateSampleCSV(report, sampleSize = 100) {
    const allItems = [
        ...report.uncategorizedItems,
        ...report.overCategorizedItems,
        ...report.invalidCategoryItems
    ];

    // Shuffle and take a sample
    const shuffled = allItems.sort(() => 0.5 - Math.random());
    const sample = shuffled.slice(0, sampleSize);

    // CSV header
    let csv = 'item.id,german,bulgarian,partOfSpeech,currentCategories,proposedCategories,ambiguityFlag,notes,reviewer,reviewStatus,batchId\n';

    // CSV rows
    sample.forEach(item => {
        const currentCategories = item.currentCategories ? `"${item.currentCategories.join(',')}"` : '';
        csv += `"${item.id}","${item.german}","${item.bulgarian}","${item.partOfSpeech}",${currentCategories},,,,,,\n`;
    });

    return csv;
}

// Save report
function saveReport(report) {
    // Save full report
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf-8');

    // Save CSV sample
    const csv = generateSampleCSV(report);
    const csvPath = path.join(__dirname, '../reports/category-sample-review.csv');
    fs.writeFileSync(csvPath, csv, 'utf-8');

    console.log(`Analysis complete. Report saved to ${REPORT_PATH}`);
    console.log(`CSV sample for review saved to ${csvPath}`);
    console.log(`\nSummary:`);
    console.log(`- Total items: ${report.totalItems}`);
    console.log(`- Uncategorized items: ${report.uncategorizedItems.length}`);
    console.log(`- Over-categorized items: ${report.overCategorizedItems.length}`);
    console.log(`- Items with invalid categories: ${report.invalidCategoryItems.length}`);
    console.log(`- Percent fixed: ${report.percentFixed}%`);
}

// Main execution
function main() {
    try {
        const report = analyzeCategories();
        saveReport(report);
    } catch (error) {
        console.error('Error analyzing categories:', error);
        process.exit(1);
    }
}

main();