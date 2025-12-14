# Lernen Dashboard Implementation Plan

**Created**: December 14, 2025  
**Status**: Implementation Ready  
**Priority**: High

---

## 📋 Executive Summary

Transform the Lernen (Learn) tab from a simple flashcard shuffler into a **comprehensive learning dashboard** that provides deep insights into each vocabulary word, including grammar rules, word families, declension tables, etymology, and contextual usage.

---

## 🎯 Goals

### Primary Objectives
1. **Click-through Navigation**: Enable clicking a flashcard in the Vocabulary tab to open that specific word in the Lernen dashboard
2. **Rich Learning Context**: Display comprehensive word information based on word type (noun, verb, adjective, etc.)
3. **Grammar Integration**: Show declension tables, conjugation tables, and relevant grammar rules
4. **Word Analysis**: Display word families, compound word breakdown, etymologies, and anomalies
5. **External Resources**: Link to Langenscheidt for additional reference

### Secondary Objectives
- Maintain random/algorithm-based word selection for general learning mode
- Support both language directions (DE→BG and BG→DE)
- Ensure WCAG 2.1 AA accessibility compliance
- Implement responsive design for mobile devices

---

## 🔍 Current State Analysis

### Existing Implementation

#### 1. **Navigation Pattern** ✅
- **Vocabulary Page** (`src/routes/vocabulary/+page.svelte`):
  - Already has `goto('/learn/${item.id}')` on flashcard click (line 518)
  - Uses SvelteKit's `goto` from `$app/navigation`

- **Learn [id] Route** (`src/routes/learn/[id]/+page.svelte`):
  - ✅ Route exists and loads item by ID
  - ✅ Displays basic flashcard with Flashcard component
  - ✅ Shows hero section with word, badges, and properties
  - ✅ Two-column layout with examples and properties
  - ❌ No tabbed interface for different grammar views
  - ❌ No declension/conjugation tables
  - ❌ Limited word family/compound word analysis

#### 2. **Word Selection Algorithm**
- **Current**: Random shuffle on session start
```typescript
sessionCards = [...allVocabulary].sort(() => 0.5 - Math.random());
```
- **Location**: `src/routes/learn/+page.svelte` (line 100)
- **Note**: No URL parameter support for opening specific words

#### 3. **Available Data Fields**

From `unified-vocabulary.json` schema analysis:

```typescript
{
  // Core fields (always present)
  id: string;
  german: string;
  bulgarian: string;
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | ...;
  difficulty: 1-5;
  categories: string[];
  
  // Rich metadata (when available)
  metadata?: {
    gender?: 'masculine' | 'feminine' | 'neuter';
    article?: 'der' | 'die' | 'das' | 'ein' | 'eine';
    pluralForm?: string;
    conjugation?: Record<string, string>;
    declension?: Record<string, { singular?: string; plural?: string }>;
    examples?: Array<{ german: string; bulgarian: string; context?: string }>;
    synonyms?: string[];
    antonyms?: string[];
    relatedWords?: string[];
    components?: Array<{ part: string; meaning: string; note?: string }>;
    etymology?: string;
    culturalNote?: string;
    mnemonic?: string;
    links?: Array<{ label: string; url: string }>;
  };
  
  // Enrichment data (from Langenscheidt)
  enrichment?: {
    enriched: boolean;
    confidence: number;
    sourceURL?: string;
    enrichedAt?: string;
  };
  
  // Legacy fields
  notes?: {
    general?: string;
    forBulgarianSpeakers?: string;
    forGermanSpeakers?: string;
    linguistic?: string;
    linguisticForBulgarians?: string;
    linguisticForGermans?: string;
  };
  
  etymology?: string;
  culturalNotes?: string[];
  literalBreakdown?: Array<{ segment: string; literal: string; grammarTag?: string }>;
}
```

---

## 🏗️ Architecture Design

### Component Structure

```
src/routes/learn/[id]/
├── +page.svelte                 # Main dashboard page
├── +page.ts                     # Data loading (already exists)
└── components/
    ├── WordDashboard.svelte     # Container for all dashboard sections
    ├── DashboardTabs.svelte     # Tab navigation component
    ├── GrammarPanel.svelte      # Grammar tables and rules
    ├── WordFamilyPanel.svelte   # Related words, synonyms, antonyms
    ├── EtymologyPanel.svelte    # Etymology and word breakdown
    ├── ExamplesPanel.svelte     # Example sentences with context
    ├── NotesPanel.svelte        # Cultural notes and mnemonics
    └── ExternalLinksPanel.svelte # Langenscheidt and other dictionary links
```

### Dashboard Tab Structure

```typescript
type DashboardTab = 
  | 'overview'      // Flashcard + key metadata
  | 'grammar'       // Declension/conjugation tables + grammar rules
  | 'family'        // Word families, synonyms, antonyms, related words
  | 'examples'      // Example sentences with context
  | 'analysis'      // Etymology, literal breakdown, compound analysis
  | 'notes'         // Cultural notes, mnemonics, learning tips
  | 'resources';    // External dictionary links
```

### Word-Type-Specific Panels

#### For **Nouns** (`partOfSpeech: 'noun'`)
- ✅ Article (der/die/das)
- ✅ Gender (masculine/feminine/neuter)
- ✅ Plural form
- ✅ Declension table (Nominative, Accusative, Dative, Genitive × Singular/Plural)
- ✅ Compound word breakdown (if applicable)
- ✅ Related nouns in word family

#### For **Verbs** (`partOfSpeech: 'verb'`)
- ✅ Infinitive form
- ✅ Conjugation tables:
  - Present tense
  - Past tense (Präteritum)
  - Perfect tense (Perfekt)
  - Future tense (Futur I)
  - Subjunctive (Konjunktiv)
  - Imperative
- ✅ Auxiliary verb (haben/sein)
- ✅ Separable prefix indicator
- ✅ Irregular verb indicator

#### For **Adjectives** (`partOfSpeech: 'adjective'`)
- ✅ Comparative forms (gut → besser → am besten)
- ✅ Declension patterns (weak/mixed/strong endings)
- ✅ Predicative vs. attributive usage notes

#### For **All Word Types**
- ✅ Etymology
- ✅ Word family (synonyms, antonyms, related words)
- ✅ Example sentences with context
- ✅ Cultural notes
- ✅ Mnemonics
- ✅ Langenscheidt link

---

## 🛠️ Implementation Steps

### Phase 1: Enhanced [id] Route ✅ (Already Exists)

**Status**: Complete  
**Files**: `src/routes/learn/[id]/+page.svelte`, `+page.ts`

Current implementation already supports:
- Loading vocabulary by ID
- Displaying flashcard
- Showing examples and properties
- External navigation links

### Phase 2: Dashboard Tab Navigation (NEW)

**Priority**: High  
**Estimated Time**: 4 hours

#### 2.1. Create Tab Component

**File**: `src/routes/learn/[id]/components/DashboardTabs.svelte`

```svelte
<script lang="ts">
  type TabId = 'overview' | 'grammar' | 'family' | 'examples' | 'analysis' | 'notes' | 'resources';
  
  let {
    activeTab = $bindable('overview'),
    tabs = [
      { id: 'overview', label: 'Übersicht', icon: '📋' },
      { id: 'grammar', label: 'Grammatik', icon: '📚' },
      { id: 'family', label: 'Wortfamilie', icon: '🌳' },
      { id: 'examples', label: 'Beispiele', icon: '💬' },
      { id: 'analysis', label: 'Analyse', icon: '🔍' },
      { id: 'notes', label: 'Notizen', icon: '📝' },
      { id: 'resources', label: 'Quellen', icon: '🔗' }
    ]
  }: {
    activeTab?: TabId;
    tabs?: Array<{ id: TabId; label: string; icon: string }>;
  } = $props();
</script>

<nav class="dashboard-tabs" role="tablist">
  {#each tabs as tab}
    <button
      class="tab"
      class:active={activeTab === tab.id}
      role="tab"
      aria-selected={activeTab === tab.id}
      aria-controls="{tab.id}-panel"
      onclick={() => activeTab = tab.id}
    >
      <span class="tab-icon">{tab.icon}</span>
      <span class="tab-label">{tab.label}</span>
    </button>
  {/each}
</nav>

<style>
  .dashboard-tabs {
    display: flex;
    gap: var(--space-2);
    overflow-x: auto;
    border-bottom: 2px solid var(--color-neutral-border);
    padding-bottom: var(--space-2);
  }
  
  .tab {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: var(--border-radius-md) var(--border-radius-md) 0 0;
    transition: all 0.2s;
  }
  
  .tab:hover {
    background: var(--color-primary-light);
  }
  
  .tab.active {
    background: var(--color-primary);
    color: white;
  }
  
  .tab:focus-visible {
    outline: 3px solid var(--color-focus-ring);
    outline-offset: 2px;
  }
</style>
```

### Phase 3: Grammar Panel with Declension/Conjugation Tables (NEW)

**Priority**: High  
**Estimated Time**: 6 hours

#### 3.1. Declension Table Component (For Nouns)

**File**: `src/routes/learn/[id]/components/DeclensionTable.svelte`

```svelte
<script lang="ts">
  import type { VocabularyItem } from '$lib/types/vocabulary';
  
  let { item }: { item: VocabularyItem } = $props();
  
  const declension = $derived(item.metadata?.declension || {});
  
  const cases = [
    { key: 'Nominative', label: { de: 'Nominativ', bg: 'Именителен' } },
    { key: 'Accusative', label: { de: 'Akkusativ', bg: 'Винителен' } },
    { key: 'Dative', label: { de: 'Dativ', bg: 'Дателен' } },
    { key: 'Genitive', label: { de: 'Genitiv', bg: 'Притежателен' } }
  ];
</script>

{#if Object.keys(declension).length > 0}
  <div class="declension-table">
    <table>
      <thead>
        <tr>
          <th>Kasus</th>
          <th>Singular</th>
          <th>Plural</th>
        </tr>
      </thead>
      <tbody>
        {#each cases as caseRow}
          {#if declension[caseRow.key]}
            <tr>
              <td class="case-label">{caseRow.label.de}</td>
              <td>{declension[caseRow.key].singular || '—'}</td>
              <td>{declension[caseRow.key].plural || '—'}</td>
            </tr>
          {/if}
        {/each}
      </tbody>
    </table>
  </div>
{:else}
  <p class="no-data">Keine Deklinationsdaten verfügbar</p>
{/if}

<style>
  .declension-table {
    overflow-x: auto;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th, td {
    padding: var(--space-2) var(--space-3);
    text-align: left;
    border-bottom: 1px solid var(--color-neutral-border);
  }
  
  .case-label {
    font-weight: var(--font-semibold);
    color: var(--color-primary);
  }
  
  .no-data {
    color: var(--color-neutral-text);
    font-style: italic;
  }
</style>
```

#### 3.2. Conjugation Table Component (For Verbs)

**File**: `src/routes/learn/[id]/components/ConjugationTable.svelte`

```svelte
<script lang="ts">
  import type { VocabularyItem } from '$lib/types/vocabulary';
  
  let { item, tense = $bindable('present') }: {
    item: VocabularyItem;
    tense?: 'present' | 'past' | 'perfect' | 'future';
  } = $props();
  
  const conjugation = $derived(item.metadata?.conjugation || {});
  
  const tenses = [
    { id: 'present', label: 'Präsens' },
    { id: 'past', label: 'Präteritum' },
    { id: 'perfect', label: 'Perfekt' },
    { id: 'future', label: 'Futur I' }
  ];
  
  const pronouns = [
    { key: 'ich', label: 'ich' },
    { key: 'du', label: 'du' },
    { key: 'er_sie_es', label: 'er/sie/es' },
    { key: 'wir', label: 'wir' },
    { key: 'ihr', label: 'ihr' },
    { key: 'sie_Sie', label: 'sie/Sie' }
  ];
</script>

<div class="conjugation-panel">
  <!-- Tense tabs -->
  <div class="tense-tabs">
    {#each tenses as t}
      <button
        class="tense-tab"
        class:active={tense === t.id}
        onclick={() => tense = t.id}
      >
        {t.label}
      </button>
    {/each}
  </div>
  
  <!-- Conjugation table -->
  {#if Object.keys(conjugation).length > 0}
    <table class="conjugation-table">
      <thead>
        <tr>
          <th>Pronomen</th>
          <th>Form</th>
        </tr>
      </thead>
      <tbody>
        {#each pronouns as pronoun}
          {@const formKey = `${tense}_${pronoun.key}`}
          {#if conjugation[formKey]}
            <tr>
              <td class="pronoun">{pronoun.label}</td>
              <td class="form">{conjugation[formKey]}</td>
            </tr>
          {/if}
        {/each}
      </tbody>
    </table>
  {:else}
    <p class="no-data">Keine Konjugationsdaten verfügbar</p>
  {/if}
</div>

<style>
  .tense-tabs {
    display: flex;
    gap: var(--space-2);
    margin-bottom: var(--space-3);
  }
  
  .tense-tab {
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-neutral-border);
    background: var(--color-neutral-light);
    cursor: pointer;
    border-radius: var(--border-radius-md);
  }
  
  .tense-tab.active {
    background: var(--color-primary);
    color: white;
  }
  
  .conjugation-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .conjugation-table th,
  .conjugation-table td {
    padding: var(--space-2) var(--space-3);
    text-align: left;
    border-bottom: 1px solid var(--color-neutral-border);
  }
  
  .pronoun {
    font-weight: var(--font-semibold);
    color: var(--color-primary);
  }
</style>
```

### Phase 4: Word Family Panel (NEW)

**Priority**: Medium  
**Estimated Time**: 3 hours

**File**: `src/routes/learn/[id]/components/WordFamilyPanel.svelte`

```svelte
<script lang="ts">
  import type { VocabularyItem } from '$lib/types/vocabulary';
  
  let { item }: { item: VocabularyItem } = $props();
  
  const synonyms = $derived(item.metadata?.synonyms || []);
  const antonyms = $derived(item.metadata?.antonyms || []);
  const relatedWords = $derived(item.metadata?.relatedWords || []);
</script>

<div class="word-family-panel">
  {#if synonyms.length > 0}
    <section class="family-section">
      <h4>Synonyme</h4>
      <ul class="word-list">
        {#each synonyms as word}
          <li class="word-tag synonym">{word}</li>
        {/each}
      </ul>
    </section>
  {/if}
  
  {#if antonyms.length > 0}
    <section class="family-section">
      <h4>Antonyme</h4>
      <ul class="word-list">
        {#each antonyms as word}
          <li class="word-tag antonym">{word}</li>
        {/each}
      </ul>
    </section>
  {/if}
  
  {#if relatedWords.length > 0}
    <section class="family-section">
      <h4>Verwandte Wörter</h4>
      <ul class="word-list">
        {#each relatedWords as word}
          <li class="word-tag related">{word}</li>
        {/each}
      </ul>
    </section>
  {/if}
  
  {#if synonyms.length === 0 && antonyms.length === 0 && relatedWords.length === 0}
    <p class="no-data">Keine Wortfamilie-Daten verfügbar</p>
  {/if}
</div>

<style>
  .family-section {
    margin-bottom: var(--space-4);
  }
  
  .family-section h4 {
    margin-bottom: var(--space-2);
    font-size: var(--text-md);
    color: var(--color-neutral-dark);
  }
  
  .word-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    list-style: none;
    padding: 0;
  }
  
  .word-tag {
    padding: var(--space-2) var(--space-3);
    border-radius: var(--border-radius-md);
    font-size: var(--text-sm);
  }
  
  .word-tag.synonym {
    background: var(--color-success-light);
    color: var(--color-success-dark);
  }
  
  .word-tag.antonym {
    background: var(--color-danger-light);
    color: var(--color-danger-dark);
  }
  
  .word-tag.related {
    background: var(--color-info-light);
    color: var(--color-info-dark);
  }
</style>
```

### Phase 5: Etymology & Analysis Panel (NEW)

**Priority**: Medium  
**Estimated Time**: 4 hours

**File**: `src/routes/learn/[id]/components/EtymologyPanel.svelte`

```svelte
<script lang="ts">
  import type { VocabularyItem } from '$lib/types/vocabulary';
  
  let { item }: { item: VocabularyItem } = $props();
  
  const etymology = $derived(item.metadata?.etymology || item.etymology || '');
  const components = $derived(item.metadata?.components || item.literalBreakdown || []);
</script>

<div class="etymology-panel">
  {#if etymology}
    <section class="etymology-section">
      <h4>Etymology</h4>
      <p class="etymology-text">{etymology}</p>
    </section>
  {/if}
  
  {#if components.length > 0}
    <section class="breakdown-section">
      <h4>Wort-Zerlegung</h4>
      <div class="component-list">
        {#each components as component}
          <div class="component-card">
            <div class="component-part">{component.segment || component.part}</div>
            <div class="component-arrow">→</div>
            <div class="component-meaning">{component.literal || component.meaning}</div>
            {#if component.note || component.grammarTag}
              <div class="component-note">{component.note || component.grammarTag}</div>
            {/if}
          </div>
        {/each}
      </div>
    </section>
  {/if}
  
  {#if !etymology && components.length === 0}
    <p class="no-data">Keine Etymology-Daten verfügbar</p>
  {/if}
</div>

<style>
  .etymology-section,
  .breakdown-section {
    margin-bottom: var(--space-4);
  }
  
  h4 {
    margin-bottom: var(--space-2);
    font-size: var(--text-md);
    color: var(--color-neutral-dark);
  }
  
  .etymology-text {
    line-height: 1.6;
    color: var(--color-neutral-dark);
  }
  
  .component-list {
    display: grid;
    gap: var(--space-3);
  }
  
  .component-card {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: var(--space-2);
    align-items: center;
    padding: var(--space-3);
    border: 1px solid var(--color-neutral-border);
    border-radius: var(--border-radius-md);
    background: var(--color-neutral-light);
  }
  
  .component-part {
    font-weight: var(--font-semibold);
    color: var(--color-primary);
  }
  
  .component-arrow {
    color: var(--color-neutral-text);
  }
  
  .component-meaning {
    color: var(--color-neutral-dark);
  }
  
  .component-note {
    grid-column: 1 / -1;
    font-size: var(--text-sm);
    color: var(--color-neutral-text);
    font-style: italic;
  }
</style>
```

### Phase 6: External Links Panel (NEW)

**Priority**: High (User requested Langenscheidt link)  
**Estimated Time**: 2 hours

**File**: `src/routes/learn/[id]/components/ExternalLinksPanel.svelte`

```svelte
<script lang="ts">
  import type { VocabularyItem } from '$lib/types/vocabulary';
  
  let { item }: { item: VocabularyItem } = $props();
  
  const links = $derived(item.metadata?.links || []);
  const enrichmentURL = $derived(item.enrichment?.sourceURL || '');
  
  // Generate Langenscheidt URL if not already present
  const langenscheidtURL = $derived.by(() => {
    const existingLangenscheidt = links.find(l => l.label.toLowerCase().includes('langenscheidt'));
    if (existingLangenscheidt) return existingLangenscheidt.url;
    
    // Generate URL based on Bulgarian word
    if (item.bulgarian) {
      const encodedWord = encodeURIComponent(item.bulgarian);
      return `https://en.langenscheidt.com/bulgarian-german/${encodedWord}`;
    }
    return '';
  });
</script>

<div class="external-links-panel">
  <h4>Externe Wörterbücher</h4>
  
  <ul class="link-list">
    {#if langenscheidtURL}
      <li class="link-item">
        <a href={langenscheidtURL} target="_blank" rel="noopener noreferrer" class="link-card">
          <span class="link-icon">🔗</span>
          <div class="link-content">
            <span class="link-label">Langenscheidt</span>
            <span class="link-description">Detaillierte Definition und Beispiele</span>
          </div>
        </a>
      </li>
    {/if}
    
    {#each links.filter(l => !l.label.toLowerCase().includes('langenscheidt')) as link}
      <li class="link-item">
        <a href={link.url} target="_blank" rel="noopener noreferrer" class="link-card">
          <span class="link-icon">🔗</span>
          <div class="link-content">
            <span class="link-label">{link.label}</span>
          </div>
        </a>
      </li>
    {/each}
  </ul>
</div>

<style>
  h4 {
    margin-bottom: var(--space-3);
    font-size: var(--text-md);
    color: var(--color-neutral-dark);
  }
  
  .link-list {
    list-style: none;
    padding: 0;
    display: grid;
    gap: var(--space-2);
  }
  
  .link-card {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3);
    border: 1px solid var(--color-neutral-border);
    border-radius: var(--border-radius-md);
    background: var(--color-neutral-light);
    text-decoration: none;
    color: inherit;
    transition: all 0.2s;
  }
  
  .link-card:hover {
    background: var(--color-primary-light);
    border-color: var(--color-primary);
  }
  
  .link-icon {
    font-size: var(--text-xl);
  }
  
  .link-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }
  
  .link-label {
    font-weight: var(--font-semibold);
    color: var(--color-primary);
  }
  
  .link-description {
    font-size: var(--text-sm);
    color: var(--color-neutral-text);
  }
</style>
```

### Phase 7: Integration & Testing

**Priority**: High  
**Estimated Time**: 4 hours

#### 7.1. Update Main Dashboard Page

**File**: `src/routes/learn/[id]/+page.svelte`

```svelte
<script lang="ts">
  import { appState } from '$lib/state/app-state';
  import type { VocabularyItem } from '$lib/types/vocabulary';
  import Flashcard from '$lib/components/Flashcard.svelte';
  import DashboardTabs from './components/DashboardTabs.svelte';
  import GrammarPanel from './components/GrammarPanel.svelte';
  import WordFamilyPanel from './components/WordFamilyPanel.svelte';
  import EtymologyPanel from './components/EtymologyPanel.svelte';
  import ExamplesPanel from './components/ExamplesPanel.svelte';
  import NotesPanel from './components/NotesPanel.svelte';
  import ExternalLinksPanel from './components/ExternalLinksPanel.svelte';
  
  let { data } = $props<{ data: { item: VocabularyItem | null } }>();
  let item = $derived<VocabularyItem | null>(data?.item ?? null);
  let activeTab = $state<'overview' | 'grammar' | 'family' | 'examples' | 'analysis' | 'notes' | 'resources'>('overview');
</script>

<div class="learn-dashboard">
  {#if item}
    <!-- Flashcard at top -->
    <div class="flashcard-section">
      <Flashcard vocabularyItem={item} />
    </div>
    
    <!-- Tab navigation -->
    <DashboardTabs bind:activeTab />
    
    <!-- Tab panels -->
    <div class="dashboard-content">
      {#if activeTab === 'overview'}
        <!-- Existing hero and overview content -->
      {:else if activeTab === 'grammar'}
        <GrammarPanel {item} />
      {:else if activeTab === 'family'}
        <WordFamilyPanel {item} />
      {:else if activeTab === 'examples'}
        <ExamplesPanel {item} />
      {:else if activeTab === 'analysis'}
        <EtymologyPanel {item} />
      {:else if activeTab === 'notes'}
        <NotesPanel {item} />
      {:else if activeTab === 'resources'}
        <ExternalLinksPanel {item} />
      {/if}
    </div>
  {/if}
</div>
```

---

## 📊 Data Enhancement Needs

### Current Data Gaps

Based on analysis of `unified-vocabulary.json`, many entries lack:

1. **Declension tables** (only ~5% have `metadata.declension`)
2. **Conjugation tables** (verb conjugations mostly missing)
3. **Word families** (synonyms/antonyms/related words sparse)
4. **Etymology** (only enriched entries have this)

### Recommended Data Enhancement Strategy

1. **Phase 1**: Use existing enriched data from Langenscheidt (~90% of entries)
2. **Phase 2**: Add declension templates for common nouns
3. **Phase 3**: Add conjugation templates for common verbs
4. **Phase 4**: Expand word family relationships

---

## 🧪 Testing Strategy

### Unit Tests
- [ ] Test tab navigation state management
- [ ] Test declension table rendering with various data formats
- [ ] Test conjugation table rendering
- [ ] Test word family panel with missing data
- [ ] Test external link generation

### Component Tests
- [ ] Test DashboardTabs component keyboard navigation
- [ ] Test GrammarPanel with noun vs. verb data
- [ ] Test ExternalLinksPanel fallback URL generation

### E2E Tests
- [ ] Test click-through from Vocabulary → Lernen dashboard
- [ ] Test tab navigation on dashboard
- [ ] Test external link opening in new tab
- [ ] Test accessibility (WCAG 2.1 AA)

### Accessibility Tests
- [ ] Verify tab navigation with screen reader
- [ ] Test keyboard-only navigation
- [ ] Verify color contrast on all panels
- [ ] Test focus management across tabs

---

## 📅 Implementation Timeline

| Phase | Task | Time | Status |
|-------|------|------|--------|
| 1 | Enhanced [id] route | - | ✅ Complete |
| 2 | Dashboard tab navigation | 4h | 🔄 Planned |
| 3 | Grammar panel (declension/conjugation) | 6h | 🔄 Planned |
| 4 | Word family panel | 3h | 🔄 Planned |
| 5 | Etymology & analysis panel | 4h | 🔄 Planned |
| 6 | External links panel | 2h | 🔄 Planned |
| 7 | Integration & testing | 4h | 🔄 Planned |
| **Total** | | **23h** | |

---

## 🚀 Next Steps

1. **Review this plan** with the team/user
2. **Start with Phase 2** (Dashboard tabs) - foundation for all other panels
3. **Implement Phase 3** (Grammar panel) - highest value feature
4. **Iterate** based on user feedback

---

## 📚 References

- **Existing Implementation**: `src/routes/learn/[id]/+page.svelte`
- **Vocabulary Schema**: `src/lib/schemas/vocabulary.ts`
- **Data Source**: `src/lib/data/unified-vocabulary.json`
- **Open Source Inspiration**: See user's research on vocabulary dashboard projects

---

**Status**: Ready for implementation  
**Next Action**: Begin Phase 2 (Dashboard Tabs)
