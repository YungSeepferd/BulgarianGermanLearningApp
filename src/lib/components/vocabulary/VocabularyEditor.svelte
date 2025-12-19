<script lang="ts">
  import { z } from 'zod';
  import { UnifiedVocabularyItemSchema } from '$lib/schemas/vocabulary';
  import { ErrorHandler } from '$lib/services/errors';
  import { v4 as uuidv4 } from 'uuid';

  interface Props {
    item?: z.infer<typeof UnifiedVocabularyItemSchema> | null;
    onSave: (item: z.infer<typeof UnifiedVocabularyItemSchema>) => void;
    onCancel: () => void;
  }

  let { item = null, onSave, onCancel }: Props = $props();

  // Form state
  let formData = $state({
    id: item?.id ?? uuidv4(),
    german: item?.german ?? '',
    bulgarian: item?.bulgarian ?? '',
    partOfSpeech: item?.partOfSpeech ?? 'noun',
    difficulty: item?.difficulty ?? 'A1',
    categories: item?.categories ?? [],
    definition: {
      german: item?.definition?.german ?? '',
      bulgarian: item?.definition?.bulgarian ?? '',
    },
    examples: item?.examples ?? [
      { german: '', bulgarian: '', context: 'neutral' },
    ],
    grammarNotes: {
      german: item?.grammarNotes?.german ?? '',
      bulgarian: item?.grammarNotes?.bulgarian ?? '',
    },
    culturalNotes: item?.culturalNotes ?? '',
    pronunciation: {
      german: item?.pronunciation?.german ?? '',
      bulgarian: item?.pronunciation?.bulgarian ?? '',
    },
  });

  let errors = $state<Record<string, string>>({});
  let isSaving = $state(false);
  let showPreview = $state(false);

  // Validation
  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (!formData.german.trim()) {
      newErrors.german = 'German word is required';
    }
    if (!formData.bulgarian.trim()) {
      newErrors.bulgarian = 'Bulgarian word is required';
    }
    if (formData.examples.some((ex) => !ex.german.trim() && !ex.bulgarian.trim())) {
      newErrors.examples = 'All example fields must be filled';
    }

    errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }

  // Grammar validation (German)
  function validateGermanGrammar(): string[] {
    const warnings: string[] = [];

    if (formData.partOfSpeech === 'noun') {
      const article = formData.grammarNotes.german.match(/der|die|das/i);
      if (!article) {
        warnings.push('⚠️ German noun missing article (der/die/das)');
      }
    }

    return warnings;
  }

  // Grammar validation (Bulgarian)
  function validateBulgarianGrammar(): string[] {
    const warnings: string[] = [];

    if (formData.partOfSpeech === 'noun') {
      const hasDefiniteArticle = formData.grammarNotes.bulgarian.match(/-та|-ът|-то|-те/);
      if (!hasDefiniteArticle) {
        warnings.push('⚠️ Bulgarian noun may need definite article suffix (-та, -ът, -то, -те)');
      }
    }

    return warnings;
  }

  async function handleSave() {
    if (!validateForm()) {
      return;
    }

    isSaving = true;

    try {
      // Validate against Zod schema
      const validatedItem = UnifiedVocabularyItemSchema.parse({
        ...formData,
        // Ensure required fields have defaults
        etymology: formData.grammarNotes.german, // Use grammar notes as etymology placeholder
        contextualNuance: formData.culturalNotes,
        metadata: {
          culturalNote: formData.culturalNotes,
          examples: formData.examples,
        },
      });

      onSave(validatedItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const schemaErrors = error.errors.reduce(
          (acc, err) => {
            acc[err.path.join('.')] = err.message;
            return acc;
          },
          {} as Record<string, string>
        );
        errors = schemaErrors;
      } else {
        ErrorHandler.handleError(error, 'VocabularyEditor.save', {
          formData,
        });
      }
    } finally {
      isSaving = false;
    }
  }

  function addExample() {
    formData.examples = [
      ...formData.examples,
      { german: '', bulgarian: '', context: 'neutral' },
    ];
  }

  function removeExample(index: number) {
    formData.examples = formData.examples.filter((_, i) => i !== index);
  }

  function addCategory() {
    const newCategory = prompt('Enter category name:');
    if (newCategory && !formData.categories.includes(newCategory)) {
      formData.categories = [...formData.categories, newCategory];
    }
  }

  function removeCategory(category: string) {
    formData.categories = formData.categories.filter((c) => c !== category);
  }

  const germanWarnings = $derived(validateGermanGrammar());
  const bulgarianWarnings = $derived(validateBulgarianGrammar());
</script>

<div class="vocabulary-editor">
  <div class="editor-header">
    <h2>{item ? 'Edit Vocabulary Item' : 'Add New Vocabulary Item'}</h2>
    <button
      class="btn-preview"
      onclick={() => (showPreview = !showPreview)}
      aria-label="Toggle preview"
    >
      {showPreview ? '✏️ Edit' : '👁️ Preview'}
    </button>
  </div>

  {#if showPreview}
    <!-- Preview Mode -->
    <div class="preview-panel">
      <div class="preview-item">
        <div class="preview-header">
          <div class="word-pair">
            <div class="word german">{formData.german}</div>
            <div class="arrow">↔️</div>
            <div class="word bulgarian">{formData.bulgarian}</div>
          </div>
          <div class="metadata">
            <span class="difficulty">{formData.difficulty}</span>
            <span class="speech">{formData.partOfSpeech}</span>
          </div>
        </div>

        {#if formData.pronunciation.german || formData.pronunciation.bulgarian}
          <div class="pronunciation">
            <strong>Pronunciation:</strong>
            <div class="lang-pair">
              {#if formData.pronunciation.german}
                <span>🇩🇪 {formData.pronunciation.german}</span>
              {/if}
              {#if formData.pronunciation.bulgarian}
                <span>🇧🇬 {formData.pronunciation.bulgarian}</span>
              {/if}
            </div>
          </div>
        {/if}

        {#if formData.definition.german || formData.definition.bulgarian}
          <div class="definitions">
            <strong>Definition:</strong>
            {#if formData.definition.german}
              <div>🇩🇪 {formData.definition.german}</div>
            {/if}
            {#if formData.definition.bulgarian}
              <div>🇧🇬 {formData.definition.bulgarian}</div>
            {/if}
          </div>
        {/if}

        {#if formData.examples.length > 0}
          <div class="examples">
            <strong>Examples:</strong>
            {#each formData.examples as example, idx}
              {#if example.german || example.bulgarian}
                <div class="example">
                  {#if example.german}
                    <div class="example-text">🇩🇪 {example.german}</div>
                  {/if}
                  {#if example.bulgarian}
                    <div class="example-text">🇧🇬 {example.bulgarian}</div>
                  {/if}
                  {#if example.context}
                    <span class="context">{example.context}</span>
                  {/if}
                </div>
              {/if}
            {/each}
          </div>
        {/if}

        {#if germanWarnings.length > 0 || bulgarianWarnings.length > 0}
          <div class="warnings">
            <strong>⚠️ Grammar Hints:</strong>
            {#each germanWarnings as warning}
              <div class="warning">{warning}</div>
            {/each}
            {#each bulgarianWarnings as warning}
              <div class="warning">{warning}</div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {:else}
    <!-- Edit Mode -->
    <form class="editor-form" onsubmit={(e) => e.preventDefault()}>
      <!-- Basic Information -->
      <fieldset class="form-section">
        <legend>Basic Information</legend>

        <div class="form-group">
          <label for="german">German Word *</label>
          <input
            id="german"
            type="text"
            bind:value={formData.german}
            placeholder="Enter German word"
            aria-label="German word"
          />
          {#if errors.german}
            <span class="error">{errors.german}</span>
          {/if}
        </div>

        <div class="form-group">
          <label for="bulgarian">Bulgarian Word *</label>
          <input
            id="bulgarian"
            type="text"
            bind:value={formData.bulgarian}
            placeholder="Enter Bulgarian word"
            aria-label="Bulgarian word"
          />
          {#if errors.bulgarian}
            <span class="error">{errors.bulgarian}</span>
          {/if}
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="partOfSpeech">Part of Speech</label>
            <select
              id="partOfSpeech"
              bind:value={formData.partOfSpeech}
              aria-label="Part of speech"
            >
              <option value="noun">Noun</option>
              <option value="verb">Verb</option>
              <option value="adjective">Adjective</option>
              <option value="adverb">Adverb</option>
              <option value="pronoun">Pronoun</option>
              <option value="preposition">Preposition</option>
              <option value="conjunction">Conjunction</option>
              <option value="interjection">Interjection</option>
            </select>
          </div>

          <div class="form-group">
            <label for="difficulty">CEFR Level</label>
            <select
              id="difficulty"
              bind:value={formData.difficulty}
              aria-label="CEFR difficulty level"
            >
              <option value="A1">A1 (Beginner)</option>
              <option value="A2">A2 (Elementary)</option>
              <option value="B1">B1 (Intermediate)</option>
              <option value="B2">B2 (Upper Intermediate)</option>
              <option value="C1">C1 (Advanced)</option>
              <option value="C2">C2 (Mastery)</option>
            </select>
          </div>
        </div>
      </fieldset>

      <!-- Definitions -->
      <fieldset class="form-section">
        <legend>Definitions</legend>

        <div class="form-group">
          <label for="def-de">German Definition</label>
          <textarea
            id="def-de"
            bind:value={formData.definition.german}
            placeholder="Definition in German"
            rows="3"
            aria-label="German definition"
          />
        </div>

        <div class="form-group">
          <label for="def-bg">Bulgarian Definition</label>
          <textarea
            id="def-bg"
            bind:value={formData.definition.bulgarian}
            placeholder="Definition in Bulgarian"
            rows="3"
            aria-label="Bulgarian definition"
          />
        </div>
      </fieldset>

      <!-- Pronunciation -->
      <fieldset class="form-section">
        <legend>Pronunciation</legend>

        <div class="form-row">
          <div class="form-group">
            <label for="pron-de">German Pronunciation</label>
            <input
              id="pron-de"
              type="text"
              bind:value={formData.pronunciation.german}
              placeholder="e.g., /ˈɡuːtən ˈmoːɐ̯ɡən/"
              aria-label="German pronunciation"
            />
          </div>

          <div class="form-group">
            <label for="pron-bg">Bulgarian Pronunciation</label>
            <input
              id="pron-bg"
              type="text"
              bind:value={formData.pronunciation.bulgarian}
              placeholder="e.g., /ˈdɔbər ˈutrə/"
              aria-label="Bulgarian pronunciation"
            />
          </div>
        </div>
      </fieldset>

      <!-- Grammar Notes -->
      <fieldset class="form-section">
        <legend>Grammar Notes</legend>

        <div class="form-group">
          <label for="grammar-de">German Grammar</label>
          <textarea
            id="grammar-de"
            bind:value={formData.grammarNotes.german}
            placeholder="Article, case, conjugation info, etc."
            rows="3"
            aria-label="German grammar notes"
          />
          {#each germanWarnings as warning}
            <span class="hint">{warning}</span>
          {/each}
        </div>

        <div class="form-group">
          <label for="grammar-bg">Bulgarian Grammar</label>
          <textarea
            id="grammar-bg"
            bind:value={formData.grammarNotes.bulgarian}
            placeholder="Gender, definite article forms, aspect, etc."
            rows="3"
            aria-label="Bulgarian grammar notes"
          />
          {#each bulgarianWarnings as warning}
            <span class="hint">{warning}</span>
          {/each}
        </div>
      </fieldset>

      <!-- Examples -->
      <fieldset class="form-section">
        <legend>Examples</legend>

        {#each formData.examples as example, idx}
          <div class="example-group" key={idx}>
            <h4>Example {idx + 1}</h4>

            <div class="form-row">
              <div class="form-group flex-1">
                <label for="example-de-{idx}">German Example</label>
                <input
                  id="example-de-{idx}"
                  type="text"
                  bind:value={example.german}
                  placeholder="German example sentence"
                  aria-label="German example {idx + 1}"
                />
              </div>

              <div class="form-group flex-1">
                <label for="example-bg-{idx}">Bulgarian Example</label>
                <input
                  id="example-bg-{idx}"
                  type="text"
                  bind:value={example.bulgarian}
                  placeholder="Bulgarian example sentence"
                  aria-label="Bulgarian example {idx + 1}"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="context-{idx}">Context</label>
                <select
                  id="context-{idx}"
                  bind:value={example.context}
                  aria-label="Example context {idx + 1}"
                >
                  <option value="neutral">Neutral</option>
                  <option value="formal">Formal</option>
                  <option value="informal">Informal</option>
                  <option value="colloquial">Colloquial</option>
                  <option value="business">Business</option>
                  <option value="cultural">Cultural</option>
                </select>
              </div>

              {#if formData.examples.length > 1}
                <div class="form-group">
                  <button
                    type="button"
                    class="btn-danger btn-small"
                    onclick={() => removeExample(idx)}
                    aria-label="Remove example {idx + 1}"
                  >
                    Remove
                  </button>
                </div>
              {/if}
            </div>
          </div>
        {/each}

        <button
          type="button"
          class="btn-secondary"
          onclick={addExample}
          aria-label="Add new example"
        >
          + Add Example
        </button>
      </fieldset>

      <!-- Categories & Tags -->
      <fieldset class="form-section">
        <legend>Categories</legend>

        {#if formData.categories.length > 0}
          <div class="tag-list">
            {#each formData.categories as category}
              <span class="tag">
                {category}
                <button
                  type="button"
                  class="tag-remove"
                  onclick={() => removeCategory(category)}
                  aria-label="Remove category {category}"
                >
                  ✕
                </button>
              </span>
            {/each}
          </div>
        {/if}

        <button
          type="button"
          class="btn-secondary"
          onclick={addCategory}
          aria-label="Add category"
        >
          + Add Category
        </button>
      </fieldset>

      <!-- Cultural Notes -->
      <fieldset class="form-section">
        <legend>Cultural Notes</legend>

        <div class="form-group">
          <label for="cultural">Cultural Context & Usage</label>
          <textarea
            id="cultural"
            bind:value={formData.culturalNotes}
            placeholder="Cultural context, usage tips, regional variations, etc."
            rows="4"
            aria-label="Cultural notes"
          />
        </div>
      </fieldset>

      <!-- Error Display -->
      {#if Object.keys(errors).length > 0}
        <div class="error-summary">
          <h3>Please fix the following errors:</h3>
          <ul>
            {#each Object.entries(errors) as [field, error]}
              <li>{field}: {error}</li>
            {/each}
          </ul>
        </div>
      {/if}

      <!-- Actions -->
      <div class="form-actions">
        <button
          type="button"
          class="btn-secondary"
          onclick={onCancel}
          disabled={isSaving}
          aria-label="Cancel editing"
        >
          Cancel
        </button>
        <button
          type="button"
          class="btn-primary"
          onclick={handleSave}
          disabled={isSaving}
          aria-label="Save vocabulary item"
        >
          {isSaving ? 'Saving...' : 'Save Item'}
        </button>
      </div>
    </form>
  {/if}
</div>

<style>
  .vocabulary-editor {
    background: var(--color-surface, #fff);
    border-radius: var(--border-radius, 8px);
    padding: var(--spacing-lg, 1.5rem);
    box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
  }

  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg, 1.5rem);
    border-bottom: 2px solid var(--color-border, #e0e0e0);
    padding-bottom: var(--spacing-md, 1rem);
  }

  .editor-header h2 {
    margin: 0;
    font-size: 1.5rem;
    color: var(--color-text-primary, #333);
  }

  .btn-preview {
    background: var(--color-secondary, #f0f0f0);
    border: 1px solid var(--color-border, #d0d0d0);
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .btn-preview:hover {
    background: var(--color-tertiary, #e8e8e8);
  }

  /* Preview Panel */
  .preview-panel {
    background: var(--color-background, #f9f9f9);
    border: 1px solid var(--color-border, #e0e0e0);
    border-radius: 6px;
    padding: var(--spacing-lg, 1.5rem);
    margin-bottom: var(--spacing-lg, 1.5rem);
  }

  .preview-item {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md, 1rem);
  }

  .preview-header {
    padding: var(--spacing-md, 1rem);
    background: white;
    border-radius: 4px;
    border-left: 4px solid var(--color-primary, #0070f3);
  }

  .word-pair {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }

  .word {
    font-size: 1.25rem;
    font-weight: 600;
  }

  .word.german {
    color: var(--color-german, #d4a373);
  }

  .word.bulgarian {
    color: var(--color-bulgarian, #4a90e2);
  }

  .arrow {
    font-size: 1.5rem;
  }

  .metadata {
    display: flex;
    gap: 1rem;
    font-size: 0.9rem;
  }

  .difficulty,
  .speech {
    background: var(--color-primary, #0070f3);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-weight: 500;
  }

  .pronunciation,
  .definitions,
  .examples,
  .warnings {
    padding: var(--spacing-md, 1rem);
    background: white;
    border-radius: 4px;
    border-left: 2px solid var(--color-secondary, #f0f0f0);
  }

  .pronunciation strong,
  .definitions strong,
  .examples strong,
  .warnings strong {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--color-text-primary, #333);
  }

  .lang-pair {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .example {
    margin-bottom: 1rem;
    padding: 0.5rem;
    background: var(--color-background, #f9f9f9);
    border-radius: 3px;
  }

  .example-text {
    margin: 0.25rem 0;
    line-height: 1.5;
  }

  .context {
    display: inline-block;
    font-size: 0.75rem;
    background: var(--color-secondary, #f0f0f0);
    padding: 0.25rem 0.5rem;
    border-radius: 3px;
    margin-top: 0.25rem;
  }

  .warning {
    padding: 0.5rem;
    background: #fff3cd;
    border-left: 2px solid #ffc107;
    border-radius: 3px;
    margin: 0.25rem 0;
    font-size: 0.9rem;
  }

  /* Form Sections */
  .editor-form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg, 1.5rem);
  }

  .form-section {
    border: 1px solid var(--color-border, #e0e0e0);
    border-radius: 6px;
    padding: var(--spacing-md, 1rem);
    background: white;
  }

  .form-section legend {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--color-text-primary, #333);
    padding: 0 0.5rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: var(--spacing-md, 1rem);
  }

  .form-group:last-child {
    margin-bottom: 0;
  }

  .form-group.flex-1 {
    flex: 1;
  }

  .form-group label {
    font-weight: 500;
    color: var(--color-text-primary, #333);
    font-size: 0.95rem;
  }

  .form-group input,
  .form-group textarea,
  .form-group select {
    padding: 0.75rem;
    border: 1px solid var(--color-border, #d0d0d0);
    border-radius: 4px;
    font-family: inherit;
    font-size: 1rem;
    transition: border-color 0.2s ease;
  }

  .form-group input:focus,
  .form-group textarea:focus,
  .form-group select:focus {
    outline: none;
    border-color: var(--color-primary, #0070f3);
    box-shadow: 0 0 0 3px rgba(0, 112, 243, 0.1);
  }

  .form-group input::placeholder,
  .form-group textarea::placeholder {
    color: var(--color-text-tertiary, #999);
  }

  .form-group .error {
    color: #d32f2f;
    font-size: 0.85rem;
    margin-top: 0.25rem;
  }

  .form-group .hint {
    color: #f57c00;
    font-size: 0.85rem;
    margin-top: 0.25rem;
    display: block;
  }

  .form-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-md, 1rem);
  }

  .example-group {
    background: var(--color-background, #f9f9f9);
    padding: var(--spacing-md, 1rem);
    border-radius: 4px;
    margin-bottom: var(--spacing-md, 1rem);
  }

  .example-group h4 {
    margin: 0 0 var(--spacing-sm, 0.5rem) 0;
    color: var(--color-text-secondary, #666);
    font-size: 0.9rem;
  }

  /* Tags */
  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: var(--spacing-md, 1rem);
  }

  .tag {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--color-primary, #0070f3);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
  }

  .tag-remove {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 1rem;
    padding: 0;
    line-height: 1;
  }

  .tag-remove:hover {
    opacity: 0.8;
  }

  /* Buttons */
  .btn-primary,
  .btn-secondary,
  .btn-danger,
  .btn-small {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-primary {
    background: var(--color-primary, #0070f3);
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: var(--color-primary-dark, #0052cc);
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-secondary {
    background: var(--color-secondary, #f0f0f0);
    color: var(--color-text-primary, #333);
    border: 1px solid var(--color-border, #d0d0d0);
  }

  .btn-secondary:hover:not(:disabled) {
    background: var(--color-tertiary, #e8e8e8);
  }

  .btn-danger {
    background: #d32f2f;
    color: white;
  }

  .btn-danger:hover:not(:disabled) {
    background: #b71c1c;
  }

  .btn-small {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  .form-actions {
    display: flex;
    gap: var(--spacing-md, 1rem);
    justify-content: flex-end;
    padding-top: var(--spacing-md, 1rem);
    border-top: 1px solid var(--color-border, #e0e0e0);
  }

  .error-summary {
    background: #ffebee;
    border: 1px solid #f5bdbd;
    border-radius: 4px;
    padding: var(--spacing-md, 1rem);
    color: #c62828;
  }

  .error-summary h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
  }

  .error-summary ul {
    margin: 0;
    padding-left: 1.5rem;
  }

  .error-summary li {
    margin: 0.25rem 0;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .vocabulary-editor {
      padding: var(--spacing-md, 1rem);
    }

    .form-row {
      grid-template-columns: 1fr;
    }

    .form-actions {
      flex-direction: column;
    }

    .btn-primary,
    .btn-secondary {
      width: 100%;
    }
  }
</style>
