#!/usr/bin/env node
/**
 * Test script for bilingual support functionality
 *
 * This script tests the core bilingual support features:
 * 1. Language state management
 * 2. Localization system
 * 3. Language persistence
 * 4. Template language adaptation
 */

import { LocalizationService } from '../src/lib/services/localization';
import { appState } from '../src/lib/state/app-ui.svelte';
import {
  getSourceText,
  getTargetText,
  getSourceLanguage,
  getTargetLanguage,
  getSourceLanguageName,
  getTargetLanguageName,
  getDirectionArrow,
  getDirectionText,
  getOppositeDirectionText,
  getLanguageProperty,
  getOppositeLanguageProperty,
  formatBilingualExample,
  getDirectionalTemplate
} from '../src/lib/services/lesson-generation/template-language-adapter';

// Mock browser environment for testing
const mockBrowserEnvironment = () => {
  global.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  } as any;

  global.console = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  } as any;
};

/**
 * Test Language State Management
 */
async function testLanguageStateManagement() {
  console.log('=== Testing Language State Management ===');

  // Test 1: Default language setting
  console.log('\nTest 1.1: Default language setting');
  mockBrowserEnvironment();

  // Clear any existing state
  appState.init();
  console.log(`Default language mode: ${appState.languageMode}`);
  console.assert(appState.languageMode === 'DE_BG', 'Default language should be DE_BG');

  // Test 2: Language toggle functionality
  console.log('\nTest 1.2: Language toggle functionality');
  appState.toggleLanguageMode();
  console.log(`Toggled language mode: ${appState.languageMode}`);
  console.assert(appState.languageMode === 'BG_DE', 'Toggled language should be BG_DE');

  appState.toggleLanguageMode();
  console.log(`Toggled back: ${appState.languageMode}`);
  console.assert(appState.languageMode === 'DE_BG', 'Toggled back should be DE_BG');

  // Test 3: Migration from legacy format
  console.log('\nTest 1.3: Migration from legacy format');
  mockBrowserEnvironment();

  // Mock localStorage with legacy format
  (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
    if (key === 'tandem-direction') return 'DE->BG';
    return null;
  });

  appState.init();
  console.log(`Migrated from DE->BG: ${appState.languageMode}`);
  console.assert(appState.languageMode === 'DE_BG', 'Should migrate from DE->BG to DE_BG');
  console.assert(localStorage.removeItem === jest.fn().mock.calls.some(call => call[0] === 'tandem-direction'),
    'Should remove legacy tandem-direction key');

  // Test migration from BG->DE
  mockBrowserEnvironment();
  (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
    if (key === 'tandem-direction') return 'BG->DE';
    return null;
  });

  appState.init();
  console.log(`Migrated from BG->DE: ${appState.languageMode}`);
  console.assert(appState.languageMode === 'BG_DE', 'Should migrate from BG->DE to BG_DE');

  console.log('\n✅ Language State Management tests completed');
}

/**
 * Test Localization System
 */
async function testLocalizationSystem() {
  console.log('\n=== Testing Localization System ===');

  // Initialize localization service
  LocalizationService.init();

  // Test 1: Basic translation
  console.log('\nTest 2.1: Basic translation');
  const dashboardText = LocalizationService.t('navigation.dashboard');
  console.log(`Dashboard translation: ${dashboardText}`);
  console.assert(dashboardText !== 'navigation.dashboard', 'Should translate navigation.dashboard');

  // Test 2: Translation in different languages
  console.log('\nTest 2.2: Translation in different languages');

  // Test DE translations
  LocalizationService.setLanguage('de');
  const deDashboard = LocalizationService.t('navigation.dashboard');
  console.log(`DE Dashboard: ${deDashboard}`);

  // Test BG translations
  LocalizationService.setLanguage('bg');
  const bgDashboard = LocalizationService.t('navigation.dashboard');
  console.log(`BG Dashboard: ${bgDashboard}`);

  console.assert(deDashboard !== bgDashboard, 'DE and BG translations should be different');

  // Test 3: Translation fallback
  console.log('\nTest 2.3: Translation fallback');
  const missingTranslation = LocalizationService.t('nonexistent.key');
  console.log(`Missing translation: ${missingTranslation}`);
  console.assert(missingTranslation === 'nonexistent.key', 'Should return key for missing translations');

  // Reset to default language
  LocalizationService.setLanguage('en');

  console.log('\n✅ Localization System tests completed');
}

/**
 * Test Language Adapter Functions
 */
async function testLanguageAdapterFunctions() {
  console.log('\n=== Testing Language Adapter Functions ===');

  // Test with DE_BG mode
  appState.languageMode = 'DE_BG';

  // Test 1: Source and target text extraction
  console.log('\nTest 4.1: Source and target text extraction');
  const vocabItem = { german: 'Hallo', bulgarian: 'Здравей' };

  const sourceText = getSourceText(vocabItem);
  const targetText = getTargetText(vocabItem);
  console.log(`DE_BG - Source: ${sourceText}, Target: ${targetText}`);
  console.assert(sourceText === 'Hallo', 'DE_BG source should be German');
  console.assert(targetText === 'Здравей', 'DE_BG target should be Bulgarian');

  // Test 2: Language names
  console.log('\nTest 4.2: Language names');
  const sourceLang = getSourceLanguage();
  const targetLang = getTargetLanguage();
  const sourceLangName = getSourceLanguageName();
  const targetLangName = getTargetLanguageName();

  console.log(`DE_BG - Source lang: ${sourceLang}, Target lang: ${targetLang}`);
  console.log(`DE_BG - Source name: ${sourceLangName}, Target name: ${targetLangName}`);
  console.assert(sourceLang === 'de', 'DE_BG source language should be de');
  console.assert(targetLang === 'bg', 'DE_BG target language should be bg');
  console.assert(sourceLangName === 'German', 'DE_BG source language name should be German');
  console.assert(targetLangName === 'Bulgarian', 'DE_BG target language name should be Bulgarian');

  // Test 3: Direction indicators
  console.log('\nTest 4.3: Direction indicators');
  const directionArrow = getDirectionArrow();
  const directionText = getDirectionText();
  const oppositeDirectionText = getOppositeDirectionText();

  console.log(`DE_BG - Arrow: ${directionArrow}, Text: ${directionText}, Opposite: ${oppositeDirectionText}`);
  console.assert(directionArrow === '→', 'DE_BG arrow should be →');
  console.assert(directionText === 'German → Bulgarian', 'DE_BG text should be German → Bulgarian');
  console.assert(oppositeDirectionText === 'Bulgarian → German', 'DE_BG opposite should be Bulgarian → German');

  // Test 4: Language property extraction
  console.log('\nTest 4.4: Language property extraction');
  const grammarConcept = {
    name: { de: 'Artikel', bg: 'Членове' },
    description: { de: 'Beschreibung auf Deutsch', bg: 'Описание на български' }
  };

  const nameDe = getLanguageProperty(grammarConcept, 'name');
  const descDe = getLanguageProperty(grammarConcept, 'description');
  const nameBg = getOppositeLanguageProperty(grammarConcept, 'name');
  const descBg = getOppositeLanguageProperty(grammarConcept, 'description');

  console.log(`DE_BG - Name: ${nameDe}, Desc: ${descDe}`);
  console.log(`DE_BG - Opposite Name: ${nameBg}, Opposite Desc: ${descBg}`);
  console.assert(nameDe === 'Artikel', 'DE_BG name should be Artikel');
  console.assert(descDe === 'Beschreibung auf Deutsch', 'DE_BG description should be German');
  console.assert(nameBg === 'Членове', 'DE_BG opposite name should be Bulgarian');
  console.assert(descBg === 'Описание на български', 'DE_BG opposite description should be Bulgarian');

  // Test 5: Format bilingual example
  console.log('\nTest 4.5: Format bilingual example');
  const example = {
    sentence: { de: 'Wie geht es dir?', bg: 'Как си?' },
    translation: { de: 'Wie geht es dir?', bg: 'Как си?' }
  };

  const formattedExample = formatBilingualExample(example);
  console.log(`Formatted example: ${formattedExample}`);
  console.assert(formattedExample.includes('Wie geht es dir?'), 'Should include German sentence');
  console.assert(formattedExample.includes('Как си?'), 'Should include Bulgarian translation');

  // Test 6: BG_DE mode
  console.log('\nTest 4.6: BG_DE mode');
  appState.languageMode = 'BG_DE';

  const bgSourceText = getSourceText(vocabItem);
  const bgTargetText = getTargetText(vocabItem);
  const bgDirectionText = getDirectionText();

  console.log(`BG_DE - Source: ${bgSourceText}, Target: ${bgTargetText}`);
  console.log(`BG_DE - Direction: ${bgDirectionText}`);
  console.assert(bgSourceText === 'Здравей', 'BG_DE source should be Bulgarian');
  console.assert(bgTargetText === 'Hallo', 'BG_DE target should be German');
  console.assert(bgDirectionText === 'Bulgarian → German', 'BG_DE text should be Bulgarian → German');

  console.log('\n✅ Language Adapter Functions tests completed');
}

/**
 * Run all tests
 */
async function runTests() {
  try {
    console.log('🧪 Running Bilingual Support Tests\n');

    await testLanguageStateManagement();
    await testLocalizationSystem();
    await testLanguageAdapterFunctions();

    console.log('\n🎉 All Bilingual Support tests completed successfully!');
    console.log('\nTest Summary:');
    console.log('- Language State Management: ✅');
    console.log('- Localization System: ✅');
    console.log('- Language Adapter Functions: ✅');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the tests
runTests();