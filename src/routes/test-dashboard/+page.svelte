<script lang="ts">
  import { onMount } from 'svelte';
  import LearningDashboard from '$lib/components/learning/LearningDashboard.svelte';
  import type { VocabularyItem, PartOfSpeech } from '$lib/types/vocabulary';
  import { getDB } from '$lib/db/idb';
  import { recordVocabularyAttempt } from '$lib/db/mutations';

  // Test vocabulary item
  const testItem: VocabularyItem = {
    id: 'acht',
    type: 'word',
    german: 'acht',
    bulgarian: 'осем',
    partOfSpeech: 'number' as PartOfSpeech,
    difficulty: 2,
    cefrLevel: 'A1',
    categories: ['numbers'],
    examples: [
      {
        german: 'Ich bin acht Jahre alt.',
        bulgarian: 'Аз съм на осем години.',
        context: 'Stating age',
        source: 'generated' as const
      },
      {
        german: 'Es ist acht Uhr.',
        bulgarian: 'Часът е осем.',
        context: 'Telling time',
        source: 'generated' as const
      }
    ],
    transliteration: {
      german: 'axt'
    },
    synonyms: [],
    culturalNotes: 'The number eight in German is used for counting, telling time, and ages.',
    isCommon: true,
    isVerified: true,
    learningPhase: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1
  };

  let initialized = $state(false);
  let error = $state<string | undefined>();

  onMount(async () => {
    try {
      // Initialize database
      await getDB();
      
      // Add some test progress data
      await recordVocabularyAttempt('acht', true);
      await recordVocabularyAttempt('acht', true);
      await recordVocabularyAttempt('acht', false);
      await recordVocabularyAttempt('acht', true);
      
      initialized = true;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to initialize test';
      console.error('Test initialization error:', e);
    }
  });
</script>

<svelte:head>
  <title>Learning Dashboard Test - Phase 1 Day 2-3</title>
</svelte:head>

<div class="test-page">
  <header class="test-header">
    <h1>🧪 Learning Dashboard Component Test</h1>
    <p class="test-info">
      Testing Phase 1 Day 2-3 components with live IndexedDB data
    </p>
  </header>

  <main class="test-content">
    {#if error}
      <div class="test-error">
        <h2>❌ Initialization Error</h2>
        <p>{error}</p>
      </div>
    {:else if !initialized}
      <div class="test-loading">
        <div class="spinner"></div>
        <p>Initializing test environment...</p>
      </div>
    {:else}
      <div class="test-success">
        <h2>✅ Test Environment Ready</h2>
        <p>Database initialized with test data for word: <strong>acht (8)</strong></p>
        <ul>
          <li>4 practice attempts added (3 correct, 1 incorrect)</li>
          <li>Progress tracking enabled</li>
          <li>All 5 components loaded</li>
        </ul>
      </div>

      <div class="component-showcase">
        <h2>Learning Dashboard Component</h2>
        <LearningDashboard item={testItem} />
      </div>

      <div class="test-actions">
        <h3>Test Actions</h3>
        <div class="action-buttons">
          <button
            class="test-button"
            onclick={async () => {
              await recordVocabularyAttempt('acht', true);
              window.location.reload();
            }}
          >
            ✅ Add Correct Answer
          </button>
          <button
            class="test-button"
            onclick={async () => {
              await recordVocabularyAttempt('acht', false);
              window.location.reload();
            }}
          >
            ❌ Add Incorrect Answer
          </button>
          <button
            class="test-button secondary"
            onclick={() => window.location.reload()}
          >
            🔄 Refresh Page
          </button>
        </div>
        <p class="test-note">
          Click buttons to update progress and reload page to see changes
        </p>
      </div>

      <div class="test-checklist">
        <h3>Manual Test Checklist</h3>
        <ul>
          <li>
            <label>
              <input type="checkbox" />
              WordCard displays correctly (German, Bulgarian, part of speech)
            </label>
          </li>
          <li>
            <label>
              <input type="checkbox" />
              ProgressStats shows circular progress (should be ~75%)
            </label>
          </li>
          <li>
            <label>
              <input type="checkbox" />
              Tab navigation works (Overview, Exercises, Grammar, Edit)
            </label>
          </li>
          <li>
            <label>
              <input type="checkbox" />
              Example sentences display in ExampleCard components
            </label>
          </li>
          <li>
            <label>
              <input type="checkbox" />
              GrammarInfo shows part of speech information
            </label>
          </li>
          <li>
            <label>
              <input type="checkbox" />
              No console errors in DevTools
            </label>
          </li>
          <li>
            <label>
              <input type="checkbox" />
              Responsive on mobile (test with DevTools)
            </label>
          </li>
        </ul>
      </div>
    {/if}
  </main>
</div>

<style>
  .test-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: var(--spacing-6, 1.5rem);
  }

  .test-header {
    text-align: center;
    color: white;
    margin-bottom: var(--spacing-8, 2rem);
  }

  .test-header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 var(--spacing-2, 0.5rem) 0;
  }

  .test-info {
    font-size: 1.125rem;
    opacity: 0.9;
  }

  .test-content {
    max-width: 1400px;
    margin: 0 auto;
  }

  .test-loading,
  .test-error,
  .test-success {
    padding: var(--spacing-6, 1.5rem);
    background-color: white;
    border-radius: var(--radius-lg, 0.5rem);
    margin-bottom: var(--spacing-6, 1.5rem);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }

  .test-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-4, 1rem);
  }

  .spinner {
    width: 50px;
    height: 50px;
    border: 5px solid #f3f4f6;
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .test-error h2 {
    color: #dc2626;
  }

  .test-success h2 {
    color: #10b981;
    margin-bottom: var(--spacing-3, 0.75rem);
  }

  .test-success ul {
    margin: var(--spacing-3, 0.75rem) 0 0 var(--spacing-6, 1.5rem);
  }

  .test-success li {
    margin-bottom: var(--spacing-2, 0.5rem);
  }

  .component-showcase {
    background-color: white;
    border-radius: var(--radius-lg, 0.5rem);
    padding: var(--spacing-6, 1.5rem);
    margin-bottom: var(--spacing-6, 1.5rem);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }

  .component-showcase h2 {
    margin: 0 0 var(--spacing-6, 1.5rem) 0;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .test-actions {
    background-color: white;
    border-radius: var(--radius-lg, 0.5rem);
    padding: var(--spacing-6, 1.5rem);
    margin-bottom: var(--spacing-6, 1.5rem);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }

  .test-actions h3 {
    margin: 0 0 var(--spacing-4, 1rem) 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .action-buttons {
    display: flex;
    gap: var(--spacing-3, 0.75rem);
    margin-bottom: var(--spacing-3, 0.75rem);
    flex-wrap: wrap;
  }

  .test-button {
    padding: var(--spacing-3, 0.75rem) var(--spacing-4, 1rem);
    background-color: #667eea;
    color: white;
    border: none;
    border-radius: var(--radius-md, 0.375rem);
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .test-button:hover {
    background-color: #5a67d8;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .test-button.secondary {
    background-color: #6b7280;
  }

  .test-button.secondary:hover {
    background-color: #4b5563;
  }

  .test-note {
    font-size: 0.875rem;
    color: #6b7280;
    font-style: italic;
  }

  .test-checklist {
    background-color: white;
    border-radius: var(--radius-lg, 0.5rem);
    padding: var(--spacing-6, 1.5rem);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }

  .test-checklist h3 {
    margin: 0 0 var(--spacing-4, 1rem) 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .test-checklist ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .test-checklist li {
    margin-bottom: var(--spacing-3, 0.75rem);
  }

  .test-checklist label {
    display: flex;
    align-items: center;
    gap: var(--spacing-3, 0.75rem);
    cursor: pointer;
    padding: var(--spacing-2, 0.5rem);
    border-radius: var(--radius-md, 0.375rem);
    transition: background-color 0.2s ease;
  }

  .test-checklist label:hover {
    background-color: #f9fafb;
  }

  .test-checklist input[type='checkbox'] {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }
</style>
