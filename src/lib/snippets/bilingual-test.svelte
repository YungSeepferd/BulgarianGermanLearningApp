<script>
  /**
   * Bilingual Support Test Component
   *
   * This component provides a simple interface for testing the bilingual support functionality
   * directly in the browser.
   */

  import { appState } from '$lib/state/app-state';
  import { t } from '$lib/services/localization';
  import {
    getSourceText,
    getTargetText,
    getSourceLanguage,
    getTargetLanguage,
    getSourceLanguageName,
    getTargetLanguageName,
    getDirectionArrow,
    getDirectionText
  } from '$lib/services/lesson-generation/template-language-adapter';

  // Test data
  const testVocabulary = [
    { german: 'Hallo', bulgarian: 'Здравей' },
    { german: 'Danke', bulgarian: 'Благодаря' },
    { german: 'Bitte', bulgarian: 'Моля' }
  ];

  const testGrammarConcept = {
    name: { de: 'Artikel', bg: 'Членове' },
    description: {
      de: 'Deutsche Artikel (der, die, das) und ihre Verwendung',
      bg: 'Български членове и тяхното използване'
    }
  };

  // Test functions
  function testLanguageState() {
    console.log('=== Language State Test ===');
    console.log(`Current language mode: ${appState.languageMode}`);
    console.log(`Default should be DE_BG: ${appState.languageMode === 'DE_BG' ? '✅' : '❌'}`);

    // Test toggle
    const originalMode = appState.languageMode;
    appState.toggleLanguageMode();
    console.log(`After toggle: ${appState.languageMode}`);
    console.log(`Should be different: ${appState.languageMode !== originalMode ? '✅' : '❌'}`);

    // Toggle back
    appState.toggleLanguageMode();
    console.log(`After toggle back: ${appState.languageMode}`);
    console.log(`Should be original: ${appState.languageMode === originalMode ? '✅' : '❌'}`);
  }

  function testLocalization() {
    console.log('\n=== Localization Test ===');
    console.log(`Dashboard translation: ${t('navigation.dashboard')}`);
    console.log(`Practice translation: ${t('navigation.practice')}`);
    console.log(`Check answer translation: ${t('practice.check_answer')}`);

    // Test language change
    const originalLang = LocalizationService.currentLanguage;
    LocalizationService.setLanguage('de');
    console.log(`DE - Dashboard: ${t('navigation.dashboard')}`);

    LocalizationService.setLanguage('bg');
    console.log(`BG - Dashboard: ${t('navigation.dashboard')}`);

    LocalizationService.setLanguage(originalLang);
  }

  function testLanguageAdapter() {
    console.log('\n=== Language Adapter Test ===');

    const vocabItem = testVocabulary[0];
    console.log(`Test item: ${JSON.stringify(vocabItem)}`);

    console.log(`Source text: ${getSourceText(vocabItem)}`);
    console.log(`Target text: ${getTargetText(vocabItem)}`);
    console.log(`Source language: ${getSourceLanguage()}`);
    console.log(`Target language: ${getTargetLanguage()}`);
    console.log(`Source language name: ${getSourceLanguageName()}`);
    console.log(`Target language name: ${getTargetLanguageName()}`);
    console.log(`Direction arrow: ${getDirectionArrow()}`);
    console.log(`Direction text: ${getDirectionText()}`);

    // Test direction change
    const originalMode = appState.languageMode;
    appState.toggleLanguageMode();

    console.log(`\nAfter direction change:`);
    console.log(`Source text: ${getSourceText(vocabItem)}`);
    console.log(`Target text: ${getTargetText(vocabItem)}`);
    console.log(`Direction text: ${getDirectionText()}`);

    // Restore original mode
    appState.languageMode = originalMode;
  }

  function testTemplateLanguage() {
    console.log('\n=== Template Language Test ===');

    console.log(`Grammar concept name: ${getLanguageProperty(testGrammarConcept, 'name')}`);
    console.log(`Grammar concept description: ${getLanguageProperty(testGrammarConcept, 'description')}`);

    // Test direction change
    const originalMode = appState.languageMode;
    appState.toggleLanguageMode();

    console.log(`\nAfter direction change:`);
    console.log(`Grammar concept name: ${getLanguageProperty(testGrammarConcept, 'name')}`);
    console.log(`Grammar concept description: ${getLanguageProperty(testGrammarConcept, 'description')}`);

    // Restore original mode
    appState.languageMode = originalMode;
  }

  function runAllTests() {
    console.log('🧪 Running Bilingual Support Tests...\n');
    testLanguageState();
    testLocalization();
    testLanguageAdapter();
    testTemplateLanguage();
    console.log('\n🎉 Bilingual Support Tests Completed!');
  }
</script>

<div class="bilingual-test-container">
  <h2>Bilingual Support Test</h2>

  <div class="test-controls">
    <button onclick={runAllTests} class="btn btn-primary">
      Run All Tests
    </button>

    <button onclick={testLanguageState} class="btn btn-secondary">
      Test Language State
    </button>

    <button onclick={testLocalization} class="btn btn-secondary">
      Test Localization
    </button>

    <button onclick={testLanguageAdapter} class="btn btn-secondary">
      Test Language Adapter
    </button>

    <button onclick={testTemplateLanguage} class="btn btn-secondary">
      Test Template Language
    </button>
  </div>

  <div class="test-results">
    <h3>Test Instructions</h3>
    <p>Click the buttons above to run tests. Check the browser console (F12) for detailed test results.</p>

    <div class="test-info">
      <h4>Current Language State</h4>
      <p>Language Mode: <strong>{appState.languageMode}</strong></p>
      <p>Direction: <strong>{getDirectionText()}</strong></p>
    </div>

    <div class="test-example">
      <h4>Example Vocabulary</h4>
      <div class="vocabulary-example">
        {#each testVocabulary as item}
          <div class="vocab-item">
            <div class="source">{getSourceText(item)}</div>
            <div class="arrow">{getDirectionArrow()}</div>
            <div class="target">{getTargetText(item)}</div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .bilingual-test-container {
    max-width: 800px;
    margin: 2rem auto;
    padding: 2rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .bilingual-test-container h2 {
    color: #1e293b;
    margin-top: 0;
    margin-bottom: 1.5rem;
  }

  .test-controls {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-primary {
    background: #3b82f6;
    color: white;
  }

  .btn-primary:hover {
    background: #2563eb;
  }

  .btn-secondary {
    background: #f1f5f9;
    color: #1e293b;
  }

  .btn-secondary:hover {
    background: #e2e8f0;
  }

  .test-results {
    background: #f8fafc;
    padding: 1.5rem;
    border-radius: 8px;
  }

  .test-info, .test-example {
    margin-top: 1.5rem;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
  }

  .vocabulary-example {
    margin-top: 1rem;
  }

  .vocab-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
    padding: 0.5rem;
    background: #f8fafc;
    border-radius: 6px;
  }

  .source {
    font-weight: 600;
    color: #1e293b;
  }

  .target {
    color: #3b82f6;
  }

  .arrow {
    color: #64748b;
  }

  @media (max-width: 768px) {
    .test-controls {
      flex-direction: column;
    }

    .btn {
      width: 100%;
    }
  }
</style>