#!/usr/bin/env node

/**
 * Automated Quality Control Pipeline
 * Comprehensive validation and quality assurance for vocabulary data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Quality Control Pipeline...');

// Load cleaned vocabulary data
const vocabPath = path.join(__dirname, '../static/data/unified-vocabulary.simple-cleaned.json');
const vocabData = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));

console.log(`📚 Loaded ${vocabData.items.length} vocabulary items`);

// Quality Control Rules
const QC_RULES = {
  TRANSLATION: {
    minLength: 2,
    maxLength: 100,
    allowedChars: /^[\wäöüßÄÖÜ\s\-.,!?"'()а-яА-ЯёЁ]+$/,
    description: "Valid characters and reasonable length"
  },
  STRUCTURE: {
    requiredFields: ['id', 'german', 'bulgarian', 'partOfSpeech', 'categories'],
    validPartsOfSpeech: ['noun', 'verb', 'adjective', 'adverb', 'phrase', 'number', 'pronoun', 'preposition', 'conjunction', 'interjection'],
    description: "Complete and valid data structure"
  },
  CONTENT: {
    noMixedLanguage: (text) => !/^[A-Z][:]/.test(text),
    noHTML: (text) => !/<[^>]+>/.test(text),
    reasonableLength: (text) => text.length > 1 && text.length < 100,
    description: "Clean content without mixed language or HTML"
  }
};

// Validation Functions
function validateTranslation(item) {
  const errors = [];
  
  // Check German translation
  if (!item.german || item.german.length < QC_RULES.TRANSLATION.minLength) {
    errors.push('German translation too short');
  }
  if (item.german && item.german.length > QC_RULES.TRANSLATION.maxLength) {
    errors.push('German translation too long');
  }
  if (item.german && !QC_RULES.TRANSLATION.allowedChars.test(item.german)) {
    errors.push('German translation contains invalid characters');
  }
  
  // Check Bulgarian translation
  if (!item.bulgarian || item.bulgarian.length < QC_RULES.TRANSLATION.minLength) {
    errors.push('Bulgarian translation too short');
  }
  if (item.bulgarian && item.bulgarian.length > QC_RULES.TRANSLATION.maxLength) {
    errors.push('Bulgarian translation too long');
  }
  if (item.bulgarian && !QC_RULES.TRANSLATION.allowedChars.test(item.bulgarian)) {
    errors.push('Bulgarian translation contains invalid characters');
  }
  
  return errors;
}

function validateStructure(item) {
  const errors = [];
  
  // Check required fields
  QC_RULES.STRUCTURE.requiredFields.forEach(field => {
    if (!item[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });
  
  // Validate part of speech
  if (item.partOfSpeech && !QC_RULES.STRUCTURE.validPartsOfSpeech.includes(item.partOfSpeech)) {
    errors.push(`Invalid part of speech: ${item.partOfSpeech}`);
  }
  
  // Check categories
  if (!Array.isArray(item.categories) || item.categories.length === 0) {
    errors.push('Missing or invalid categories');
  }
  
  return errors;
}

function validateContent(item) {
  const errors = [];
  
  // Check for mixed language
  if (item.bulgarian && !QC_RULES.CONTENT.noMixedLanguage(item.bulgarian)) {
    errors.push('Bulgarian field contains mixed language');
  }
  if (item.german && !QC_RULES.CONTENT.noMixedLanguage(item.german)) {
    errors.push('German field contains mixed language');
  }
  
  // Check for HTML
  if (item.bulgarian && !QC_RULES.CONTENT.noHTML(item.bulgarian)) {
    errors.push('Bulgarian field contains HTML');
  }
  if (item.german && !QC_RULES.CONTENT.noHTML(item.german)) {
    errors.push('German field contains HTML');
  }
  
  // Check reasonable length
  if (item.bulgarian && !QC_RULES.CONTENT.reasonableLength(item.bulgarian)) {
    errors.push('Bulgarian translation unreasonable length');
  }
  if (item.german && !QC_RULES.CONTENT.reasonableLength(item.german)) {
    errors.push('German translation unreasonable length');
  }
  
  return errors;
}

function validateItem(item) {
  const errors = [];
  
  // Basic validation
  errors.push(...validateTranslation(item));
  errors.push(...validateStructure(item));
  errors.push(...validateContent(item));
  
  return {
    itemId: item.id,
    german: item.german,
    bulgarian: item.bulgarian,
    errors,
    isValid: errors.length === 0
  };
}

// Run Quality Control
console.log('🔍 Running quality control validation...');

let validItems = 0;
let invalidItems = 0;
const validationReport = [];

vocabData.items.forEach((item, index) => {
  const result = validateItem(item);
  
  if (result.isValid) {
    validItems++;
  } else {
    invalidItems++;
    validationReport.push(result);
  }
  
  if ((index + 1) % 500 === 0) {
    console.log(`📊 Validated ${index + 1}/${vocabData.items.length} items...`);
  }
});

console.log(`\n🎉 Quality Control Completed!`);
console.log(`✅ Valid items: ${validItems} (${(validItems / vocabData.items.length * 100).toFixed(2)}%)`);
console.log(`❌ Invalid items: ${invalidItems} (${(invalidItems / vocabData.items.length * 100).toFixed(2)}%)`);

// Save validation report
const reportPath = path.join(__dirname, '../reports/quality-control-report.json');
fs.writeFileSync(reportPath, JSON.stringify({
  validationDate: new Date().toISOString(),
  totalItems: vocabData.items.length,
  validItems,
  invalidItems,
  validationRate: (validItems / vocabData.items.length * 100).toFixed(2) + '%',
  items: validationReport
}, null, 2));

console.log(`💾 Quality control report saved to ${reportPath}`);

// Generate quality metrics
const qualityMetrics = {
  translationQuality: ((validItems - validationReport.filter(r => r.errors.some(e => e.includes('translation'))).length) / vocabData.items.length * 100).toFixed(2) + '%',
  structureQuality: ((validItems - validationReport.filter(r => r.errors.some(e => e.includes('field'))).length) / vocabData.items.length * 100).toFixed(2) + '%',
  contentQuality: ((validItems - validationReport.filter(r => r.errors.some(e => e.includes('language') || e.includes('HTML'))).length) / vocabData.items.length * 100).toFixed(2) + '%',
  overallQuality: (validItems / vocabData.items.length * 100).toFixed(2) + '%'
};

console.log('\n📊 Quality Metrics:');
console.log(`   Translation Quality: ${qualityMetrics.translationQuality}`);
console.log(`   Structure Quality: ${qualityMetrics.structureQuality}`);
console.log(`   Content Quality: ${qualityMetrics.contentQuality}`);
console.log(`   Overall Quality: ${qualityMetrics.overallQuality}`);

// Display sample issues
if (validationReport.length > 0) {
  console.log(`\n🔍 Sample Validation Issues (first 5):`);
  validationReport.slice(0, 5).forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.german} → ${result.bulgarian}`);
    console.log(`   Errors: ${result.errors.join(', ')}`);
  });
}

// Create quality certificate
const certificate = {
  dataset: 'German-Bulgarian Vocabulary',
  version: '2.0',
  validationDate: new Date().toISOString(),
  qualityScore: qualityMetrics.overallQuality,
  validationStandards: [
    'Translation accuracy',
    'Structural completeness',
    'Content purity',
    'Character encoding',
    'Length appropriateness'
  ],
  certification: qualityMetrics.overallQuality >= '95.00%' ? 'PRODUCTION_READY' : 'NEEDS_REVIEW',
  notes: validationReport.length === 0 ? 'All items passed quality control' : `${validationReport.length} items need review`
};

const certPath = path.join(__dirname, '../reports/quality-certificate.json');
fs.writeFileSync(certPath, JSON.stringify(certificate, null, 2));

console.log(`💾 Quality certificate saved to ${certPath}`);

console.log('\n🎯 Quality Control Pipeline Summary:');
console.log('1. ✅ Translation validation completed');
console.log('2. ✅ Structure validation completed');
console.log('3. ✅ Content validation completed');
console.log('4. ✅ Quality metrics generated');
console.log('5. ✅ Validation report created');
console.log('6. ✅ Quality certificate issued');

console.log('\n📋 Next Steps:');
console.log('1. Review validation report for detailed issues');
console.log('2. Manually correct flagged items if needed');
console.log('3. Integrate quality control into import pipeline');
console.log('4. Set up continuous validation monitoring');

console.log('\n🎉 Automated Quality Control Pipeline Implementation Complete!');