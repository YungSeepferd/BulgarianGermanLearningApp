#!/usr/bin/env node

/**
 * Vocabulary Validation Script
 * Validates grammatical accuracy of enriched vocabulary items
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load enriched vocabulary data
const vocabularyPath = path.join(__dirname, '../data/unified-vocabulary.enriched.json');
const vocabularyData = JSON.parse(fs.readFileSync(vocabularyPath, 'utf8'));

console.log('🔍 Starting vocabulary validation...');
console.log(`📚 Validating ${vocabularyData.length} vocabulary items`);

// Validation rules
const validationRules = {
  nouns: {
    requiredFields: ['gender', 'article', 'plural', 'declension'],
    validGenders: ['masculine', 'feminine', 'neuter'],
    validArticles: ['der', 'die', 'das'],
    declensionCases: ['Nominative', 'Accusative', 'Dative', 'Genitive']
  },
  verbs: {
    requiredFields: ['type', 'auxiliary', 'present'],
    validAuxiliaries: ['haben', 'sein'],
    presentPersons: ['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie']
  }
};

// Grammar reference for validation
const grammarReference = {
  // Common German noun plural patterns
  nounPlurals: {
    feminine: {
      'in': 'nen',
      'ung': 'en',
      'heit': 'en',
      'keit': 'en',
      default: 'n'
    },
    masculine: {
      'er': '',
      'el': 'n',
      'en': '',
      default: 'e'
    },
    neuter: {
      'chen': 'er',
      'lein': 'er',
      'um': 'en',
      default: 'er'
    }
  },
  
  // German verb conjugation patterns
  verbConjugation: {
    regular: {
      ich: 'e',
      du: 'st',
      'er/sie/es': 't',
      wir: 'en',
      ihr: 't',
      'sie/Sie': 'en'
    }
  }
};

// Validation functions
function validateNoun(nounItem) {
  const errors = [];
  const grammar = nounItem.grammar?.de;
  
  if (!grammar) {
    errors.push('Missing German grammar information');
    return errors;
  }
  
  // Check required fields
  validationRules.nouns.requiredFields.forEach(field => {
    if (!grammar[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });
  
  // Validate gender
  if (grammar.gender && !validationRules.nouns.validGenders.includes(grammar.gender)) {
    errors.push(`Invalid gender: ${grammar.gender}`);
  }
  
  // Validate article
  if (grammar.article && !validationRules.nouns.validArticles.includes(grammar.article)) {
    errors.push(`Invalid article: ${grammar.article}`);
  }
  
  // Validate article-gender consistency
  if (grammar.gender && grammar.article) {
    const expectedArticle = {
      masculine: 'der',
      feminine: 'die',
      neuter: 'das'
    }[grammar.gender];
    
    if (grammar.article !== expectedArticle) {
      errors.push(`Article ${grammar.article} doesn't match gender ${grammar.gender} (expected ${expectedArticle})`);
    }
  }
  
  // Validate declension structure
  if (grammar.declension) {
    validationRules.nouns.declensionCases.forEach(caseName => {
      if (!grammar.declension[caseName]) {
        errors.push(`Missing declension case: ${caseName}`);
      } else {
        const caseData = grammar.declension[caseName];
        if (!caseData.singular || !caseData.plural) {
          errors.push(`Declension case ${caseName} missing singular/plural forms`);
        }
      }
    });
  }
  
  // Validate plural form consistency
  if (grammar.plural && grammar.declension?.Nominative?.plural) {
    const expectedPlural = `die ${grammar.plural}`;
    const actualPlural = grammar.declension.Nominative.plural;
    
    if (actualPlural !== expectedPlural) {
      errors.push(`Plural inconsistency: grammar.plural=${grammar.plural} but declension.Nominative.plural=${actualPlural}`);
    }
  }
  
  return errors;
}

function validateVerb(verbItem) {
  const errors = [];
  const grammar = verbItem.grammar?.de;
  
  if (!grammar) {
    errors.push('Missing German grammar information');
    return errors;
  }
  
  // Check required fields
  validationRules.verbs.requiredFields.forEach(field => {
    if (!grammar[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });
  
  // Validate auxiliary
  if (grammar.auxiliary && !validationRules.verbs.validAuxiliaries.includes(grammar.auxiliary)) {
    errors.push(`Invalid auxiliary: ${grammar.auxiliary}`);
  }
  
  // Validate present tense conjugation
  if (grammar.present) {
    validationRules.verbs.presentPersons.forEach(person => {
      if (!grammar.present[person]) {
        errors.push(`Missing present tense conjugation for: ${person}`);
      }
    });
  }
  
  return errors;
}

function validateItem(item) {
  const errors = [];
  
  // Basic validation
  if (!item.german || !item.bulgarian) {
    errors.push('Missing German or Bulgarian translation');
  }
  
  if (!item.partOfSpeech) {
    errors.push('Missing part of speech');
  }
  
  if (!item.cefr) {
    errors.push('Missing CEFR level');
  }
  
  // Part-of-speech specific validation
  switch (item.partOfSpeech) {
    case 'noun':
      return validateNoun(item);
    case 'verb':
      return validateVerb(item);
    case 'adjective':
      // TODO: Add adjective validation
      return errors;
    case 'phrase':
    case 'interjection':
    case 'pronoun':
    case 'preposition':
    case 'conjunction':
    case 'numeral':
      // These don't require complex grammar validation
      return errors;
    default:
      errors.push(`Unknown part of speech: ${item.partOfSpeech}`);
      return errors;
  }
}

// Validate all items
let totalErrors = 0;
let itemsWithErrors = 0;
const validationReport = [];

vocabularyData.forEach((item, index) => {
  const errors = validateItem(item);
  
  if (errors.length > 0) {
    totalErrors += errors.length;
    itemsWithErrors++;
    validationReport.push({
      id: item.id,
      german: item.german,
      partOfSpeech: item.partOfSpeech,
      errors
    });
  }
  
  // Progress update
  if ((index + 1) % 100 === 0) {
    console.log(`📊 Validated ${index + 1}/${vocabularyData.length} items...`);
  }
});

console.log(`\n🎉 Validation completed!`);
console.log(`📊 Validated ${vocabularyData.length} items`);
console.log(`✅ ${vocabularyData.length - itemsWithErrors} items passed validation`);
console.log(`❌ ${itemsWithErrors} items have validation errors`);
console.log(`📝 Total validation errors: ${totalErrors}`);

// Save validation report
const reportPath = path.join(__dirname, '../reports/validation-report.json');
fs.writeFileSync(reportPath, JSON.stringify(validationReport, null, 2));
console.log(`💾 Validation report saved to ${reportPath}`);

// Display summary of common errors
if (validationReport.length > 0) {
  console.log('\n🔍 Common validation issues:');
  
  const errorTypes = {};
  validationReport.forEach(item => {
    item.errors.forEach(error => {
      errorTypes[error] = (errorTypes[error] || 0) + 1;
    });
  });
  
  const sortedErrors = Object.entries(errorTypes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  sortedErrors.forEach(([error, count]) => {
    console.log(`  • ${error}: ${count} occurrences`);
  });
  
  console.log('\n🎯 Sample items with errors:');
  validationReport.slice(0, 3).forEach(item => {
    console.log(`  • ${item.german} (${item.partOfSpeech}): ${item.errors.join(', ')}`);
  });
}

console.log('\n📋 Next steps:');
console.log('1. Review validation report for detailed errors');
console.log('2. Manually correct validation errors');
console.log('3. Add more comprehensive validation rules');
console.log('4. Test enriched vocabulary in application');