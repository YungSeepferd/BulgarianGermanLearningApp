# Phase 7–10 Execution Plan: Data Completion → MVP Launch

**Duration**: 3–4 weeks  
**Objective**: Transform from "functional" to "data-perfect" learning app ready for real users  
**Entry point**: After Phase 6 (batches 16–20 gendered; validation clean)

---

## 📋 Table of Contents

1. [Phase 7: Data Completion](#phase-7-data-completion-2–3-weeks)
2. [Phase 8: Schema Extension & Import](#phase-8-schema-extension--import-1–2-weeks)
3. [Phase 9: UI Polish & Components](#phase-9-ui-polish--components-1-week)
4. [Phase 10: MVP Launch](#phase-10-mvp-launch-1-week)
5. [Troubleshooting & Rollback](#troubleshooting--rollback)

---

## Phase 7: Data Completion (2–3 weeks)

### Goal
Complete vocabulary enrichment to achieve:
- ✅ Gender + declension for **all nouns** (currently 13.3% → target 100% of nouns)
- ✅ **≥2 example sentences per item** (currently 84.7% → target 100%)
- ✅ **Forvo audio links** for top-100 words (currently 0% → target 10%)
- ✅ **Wiktionary declension tables** auto-imported (optional spike)

### 7.1 Batch 21–50 Gender Enrichment (4–5 hours)

#### Step 1: Identify noun items in batches 21–50

```bash
cd "/Users/dinz/Coding Projects/BulgariaLearn/BulgarianApp-Fresh"

# Extract nouns in batches 21-50 (items 201-500)
node <<'NODE'
const fs=require('fs');
const items=(JSON.parse(fs.readFileSync('data/unified-vocabulary.json','utf8')).items)||[];
const slice=items.slice(200,500);
const nouns=slice.map((it,idx)=>({
  index:200+idx+1,
  id:it.id,
  german:it.german,
  partOfSpeech:it.partOfSpeech,
  hasGender:Boolean(it.grammar?.gender)
})).filter(it=>it.partOfSpeech==='noun'&&!it.hasGender);
const out='enrichment-output/nouns-b21-50-missing-gender.json';
fs.writeFileSync(out,JSON.stringify({count:nouns.length,items:nouns},null,2));
console.log(`Found ${nouns.length} nouns missing gender in batches 21-50`);
NODE
```

**Expected output**: ~40–60 nouns in batches 21–50 lacking gender.

#### Step 2: Generate gender enrichment file

Create `enrichment-output/batch-21-50-gender-enrichment.json` with structure:

```json
[
  {
    "id": "item_id_123",
    "type": "noun",
    "gender": "m",
    "declension": {
      "nominative": { "singular": "Nom-Sg", "plural": "Nom-Pl" },
      "accusative": { "singular": "Acc-Sg", "plural": "Acc-Pl" },
      "dative": { "singular": "Dat-Sg", "plural": "Dat-Pl" },
      "genitive": { "singular": "Gen-Sg", "plural": "Gen-Pl" }
    },
    "metadata": {
      "enrichmentDate": "2025-12-15",
      "source": "manual_gender_assignment",
      "confidence": "high",
      "batchRange": "21-50"
    }
  }
  // ... repeat for all missing nouns
]
```

**Reference material**:
- German noun genders: https://www.deutschgrammatik.net/EN/noun-gender.html
- Wiktionary German inflection tables: https://en.wiktionary.org/wiki/Brot

**Manual approach** (if Wiktionary spike deferred):
- 🔵 Nouns ending in `-heit`, `-keit`, `-ung` → **feminine (f)**
- 🔵 Nouns ending in `-ment`, `-tum`, `-um` → **neuter (n)**
- 🔴 Nouns ending in `-e` → usually **feminine (f)** (unless obvious exception)
- 🔴 All others → check German dictionary or article prefix (der/die/das)

**Estimated output**: 40–60 gender enrichments × 5 min each = **3–5 hours** (parallelizable if you find a generator).

#### Step 3: Apply gender enrichment

```bash
# Import enrichment into vocabulary
pnpm run import:enrichment -- \
  --file=enrichment-output/batch-21-50-gender-enrichment.json \
  --type=declension
```

**Verify**:
```bash
# Count nouns with gender after import
node <<'NODE'
const fs=require('fs');
const items=(JSON.parse(fs.readFileSync('data/unified-vocabulary.json','utf8')).items)||[];
const nounsWithGender=items.filter(it=>it.partOfSpeech==='noun'&&it.grammar?.gender);
console.log(`Nouns with gender: ${nounsWithGender.length}`);
NODE
```

**Expected**: 13.3% + ~8% = **~21% coverage** (approx 160/746 items).

---

### 7.2 Example Enrichment for Missing Items (4–6 hours)

#### Step 1: Extract items with missing/sparse examples

```bash
node <<'NODE'
const fs=require('fs');
const items=(JSON.parse(fs.readFileSync('data/unified-vocabulary.json','utf8')).items)||[];
const missing=items.map((it,idx)=>({
  index:idx+1,
  id:it.id,
  german:it.german,
  bulgarian:it.bulgarian,
  exampleCount:Array.isArray(it.examples)?it.examples.length:0
})).filter(it=>it.exampleCount<2);
const out='enrichment-output/items-missing-examples.json';
fs.writeFileSync(out,JSON.stringify({count:missing.length,items:missing},null,2));
console.log(`Items with <2 examples: ${missing.length}`);
NODE
```

**Expected**: ~114 items (per status report).

#### Step 2: Prioritize by category

Sort by part-of-speech and category:
1. **Verbs** (action-oriented; examples are critical) – **priority 1**
2. **Adjectives** (need context to show usage) – **priority 2**
3. **Nouns** (can sometimes stand alone, but examples help) – **priority 3**
4. **Adverbs** (need sentence context) – **priority 2**

#### Step 3: Generate example sentences

For each item, add 1–2 example sentences (Bulgarian ↔ German).

**Sources**:
- **Tatoeba** (https://tatoeba.org/): Free multilingual sentence database; download Bulgarian–German parallel corpus
- **Wiktionary examples**: Extract from entry pages
- **AI-generated** (fallback): Use a language model to generate contextually appropriate sentences

**Format**:
```json
{
  "id": "item_id",
  "examples": [
    {
      "source": "Ich esse einen Apfel.",
      "target": "Ядам ябълка.",
      "attribution": "Tatoeba"
    },
    {
      "source": "Das ist mein Apfel.",
      "target": "Това е моята ябълка.",
      "attribution": "manual"
    }
  ]
}
```

**Time estimate**: ~2–3 min per item = **4–5 hours for 114 items**.

#### Step 4: Apply example enrichment

Create `enrichment-output/examples-batch-11-50.json` (consolidate all missing examples).

```bash
# Manual merge or use script:
node <<'NODE'
const fs=require('fs');

// Load current vocab
const vocab=JSON.parse(fs.readFileSync('data/unified-vocabulary.json','utf8'));
const items=vocab.items||vocab;

// Load enrichment
const examples=JSON.parse(fs.readFileSync('enrichment-output/examples-batch-11-50.json','utf8'));

// Apply examples
let merged=0;
examples.forEach(ex=>{
  const item=items.find(it=>it.id===ex.id);
  if(item){
    if(!Array.isArray(item.examples)) item.examples=[];
    ex.examples.forEach(eg=>{
      if(!item.examples.some(e=>e.source===eg.source)){
        item.examples.push(eg);
      }
    });
    merged++;
  }
});

// Save
vocab.items=items;
vocab.updatedAt=new Date().toISOString();
fs.writeFileSync('data/unified-vocabulary.json',JSON.stringify(vocab,null,2));
console.log(`Merged ${merged} items with examples`);
NODE
```

**Verify**:
```bash
# Check example coverage after import
pnpm run validate:vocabulary:batch -- --id=15
```

**Expected**: Example coverage should jump from 84.7% to ~95%+.

---

### 7.3 Wiktionary Declension Spike (Optional; 2–3 hours)

**Goal**: Auto-fill declension tables for remaining nouns + conjugation for verbs.

#### Approach A: Manual Wiktionary JSON dump

1. Download Wiktionary dump: https://dumps.wikimedia.org/dewiktionary/latest/
2. Parse German inflection tables for each word
3. Generate enrichment JSON
4. Import via `pnpm run import:enrichment`

**Pros**: Accurate, comprehensive.  
**Cons**: Slow (~3–4 hours), requires parsing Wiktionary XML.

#### Approach B: API-based lookup (faster)

Use **Wiktionary API** or **OpenDictionary API**:

```bash
# Example: Look up declension for "Apfel" (apple)
curl "https://en.wiktionary.org/api/rest_v1/page/summary/de:Apfel"
```

**Pros**: Fast, real-time.  
**Cons**: Rate-limited; requires API calls for each item (~600+ calls).

#### Approach C: Defer to Phase 11

Skip this spike for now. The data is "good enough" without full conjugations; they can be added iteratively.

**Recommendation**: **Skip Approach A & B for MVP.** The 100-item gender data + 114 examples are enough. Conjugation tables can be Phase 11.

---

### 7.4 Audio Link Enrichment (1–2 hours)

#### Step 1: Forvo link template

For each item, generate Forvo URL:

```
https://forvo.com/word/{german_word_lowercase}/
```

#### Step 2: Prioritize top-100 words

Focus on **A1 + A2 items** (highest learning priority):

```bash
node <<'NODE'
const fs=require('fs');
const items=(JSON.parse(fs.readFileSync('data/unified-vocabulary.json','utf8')).items)||[];
const a1a2=items.filter(it=>['A1','A2'].includes(it.difficulty)).slice(0,100);
const enriched=a1a2.map(it=>({
  id:it.id,
  german:it.german,
  audioUrl:`https://forvo.com/word/${it.german.toLowerCase().replace(/\s+/g,'_')}/`
}));
fs.writeFileSync('enrichment-output/audio-links-a1-a2.json',JSON.stringify(enriched,null,2));
console.log(`Generated ${enriched.length} Forvo links`);
NODE
```

#### Step 3: Apply audio URLs

```bash
# Manual merge:
node <<'NODE'
const fs=require('fs');
const vocab=JSON.parse(fs.readFileSync('data/unified-vocabulary.json','utf8'));
const items=vocab.items||vocab;
const audio=JSON.parse(fs.readFileSync('enrichment-output/audio-links-a1-a2.json','utf8'));
audio.forEach(link=>{
  const item=items.find(it=>it.id===link.id);
  if(item) item.audioUrl=link.audioUrl;
});
vocab.items=items;
fs.writeFileSync('data/unified-vocabulary.json',JSON.stringify(vocab,null,2));
console.log(`Applied audio URLs to ${audio.length} items`);
NODE
```

**Verify**:
```bash
node <<'NODE'
const fs=require('fs');
const items=(JSON.parse(fs.readFileSync('data/unified-vocabulary.json','utf8')).items)||[];
const withAudio=items.filter(it=>it.audioUrl);
console.log(`Items with audio: ${withAudio.length}/${items.length} (${(withAudio.length/items.length*100).toFixed(1)}%)`);
NODE
```

---

### 7.5 Phase 7 Validation & Checkpointing

#### Run comprehensive validation

```bash
# Validate all batches
for id in {1..50}; do
  echo "=== Batch $id ==="
  pnpm run validate:vocabulary:batch -- --id=$id 2>&1 | grep -E "(Valid entries|Total errors|HIGH)"
done
```

#### Create Phase 7 checkpoint

```bash
# Backup current state
cp data/unified-vocabulary.json data/unified-vocabulary-phase-7-checkpoint.json

# Commit to git
git add data/unified-vocabulary.json
git commit -m "Phase 7: Complete gender enrichment + example sentences (batches 21-50)"
```

#### Expected Phase 7 Outcome

| Metric | Before Phase 7 | After Phase 7 |
|--------|---|---|
| Gender coverage | 13.3% (99/746) | ~22% (160–170/746) |
| Examples coverage | 84.7% (632/746) | ~98% (730/746) |
| Audio links (A1–A2) | 0% | ~10% (100/746) |
| Validation errors | 55 across batches 6–10 | 0 critical, <30 medium |

---

## Phase 8: Schema Extension & Import (1–2 weeks)

### Goal
Update the Zod schema to support mnemonics, audio, and cultural notes. Prepare for community-driven enrichment in Phase 9+.

### 8.1 Extend Zod Schema

**File**: [src/lib/schemas/vocabulary.ts](../../src/lib/schemas/vocabulary.ts)

**Add to `VocabularyItem` schema**:

```typescript
// Add these optional fields:
mnemonic: z.object({
  text: z.string().describe("Mnemonic or Esels-Brücke"),
  author: z.string().optional().describe("e.g., 'user:alice' or 'system:langenscheidt'"),
  upvotes: z.number().int().nonnegative().default(0),
  confidence: z.enum(['high', 'medium', 'low']).default('medium'),
  createdAt: z.string().datetime().optional()
}).optional(),

audioUrl: z.string().url().optional().describe("Forvo or embedded audio link"),

culturalNotes: z.string().optional().describe("Historical, cultural, or usage context"),
```

**Command**:
```bash
# After updating src/lib/schemas/vocabulary.ts, validate:
pnpm run check
```

### 8.2 Update Data to Match Schema

Create a migration script to validate all 746 items against the new schema:

```bash
node <<'NODE'
const fs=require('fs');
const vocab=JSON.parse(fs.readFileSync('data/unified-vocabulary.json','utf8'));
const items=vocab.items||vocab;

// Ensure all new fields are initialized (even if undefined)
items.forEach(it=>{
  if(!it.mnemonic) it.mnemonic=undefined;
  if(!it.audioUrl) it.audioUrl=undefined;
  if(!it.culturalNotes) it.culturalNotes=undefined;
});

vocab.items=items;
vocab.schemaVersion=2; // Bump version
vocab.migratedAt=new Date().toISOString();
fs.writeFileSync('data/unified-vocabulary.json',JSON.stringify(vocab,null,2));
console.log(`Migrated ${items.length} items to schema v2`);
NODE
```

### 8.3 Re-validate All Items

```bash
# Full vocabulary validation
pnpm run verify:vocabulary

# Check for schema compliance
pnpm run check
```

**Expected**: 0 critical errors, <20 medium (examples, optional fields).

### 8.4 Build Mnemonic Editor Component

**File**: [src/lib/components/ui/MnemonicEditor.svelte](../../src/lib/components/ui/MnemonicEditor.svelte)

```svelte
<script lang="ts">
  import { appState } from '$lib/state/app-state';
  import { onMount } from 'svelte';

  let { itemId = '' } = $props();
  let mnemonicText = $state('');
  let isEditing = $state(false);

  function saveMnemonic() {
    const item = appState.getItemById(itemId);
    if (item) {
      item.mnemonic = {
        text: mnemonicText,
        author: 'user:self', // Replace with actual user ID
        confidence: 'medium',
        createdAt: new Date().toISOString()
      };
      isEditing = false;
    }
  }
</script>

<div class="mnemonic-editor">
  {#if !isEditing}
    <button onclick={() => (isEditing = true)} class="btn btn-sm">
      {mnemonicText ? '✎ Edit Mnemonic' : '+ Add Mnemonic'}
    </button>
    {#if mnemonicText}
      <p class="mnemonic-text">{mnemonicText}</p>
    {/if}
  {:else}
    <textarea
      bind:value={mnemonicText}
      placeholder="E.g., 'HUNDer → h-und'"
      class="textarea"
    />
    <div class="flex gap-2">
      <button onclick={saveMnemonic} class="btn btn-primary btn-sm">Save</button>
      <button onclick={() => (isEditing = false)} class="btn btn-outline btn-sm">Cancel</button>
    </div>
  {/if}
</div>

<style>
  .mnemonic-editor {
    padding: 1rem;
    background: #f5f5f5;
    border-radius: 0.5rem;
  }
  .mnemonic-text {
    margin-top: 0.5rem;
    font-style: italic;
    color: #666;
  }
</style>
```

### 8.5 Test Offline Mode

Ensure all 746 items load offline:

```bash
# Build production
pnpm run build

# Test offline in Chrome DevTools:
# 1. Open DevTools (Cmd+Shift+I)
# 2. Go to Application > Service Workers
# 3. Check "Offline"
# 4. Navigate through vocab, practice, learn tabs
# 5. Verify all data displays without network
```

### 8.6 Phase 8 Checkpoint

```bash
# Backup
cp data/unified-vocabulary.json data/unified-vocabulary-phase-8-checkpoint.json

# Commit
git add src/lib/schemas/vocabulary.ts src/lib/components/ui/MnemonicEditor.svelte data/unified-vocabulary.json
git commit -m "Phase 8: Schema extension (mnemonics, audio, cultural notes) + mnemonic editor UI"
```

---

## Phase 9: UI Polish & Components (1 week)

### Goal
Build interactive UI components for grammar tables, examples, mnemonics, and audio.

### 9.1 Grammar Table Tabs Component

**File**: [src/lib/components/vocabulary/GrammarTabs.svelte](../../src/lib/components/vocabulary/GrammarTabs.svelte)

```svelte
<script lang="ts">
  import { appState } from '$lib/state/app-state';

  let { itemId = '' } = $props();
  let activeTab = $state('nominative');

  $: item = appState.getItemById(itemId);
  $: cases = item?.grammar?.declension || {};

  const caseLabels = {
    nominative: 'Nominative (Who/What)',
    accusative: 'Accusative (Whom/What)',
    dative: 'Dative (To/For Whom)',
    genitive: 'Genitive (Of Whom/What)'
  };
</script>

<div class="grammar-tabs">
  <div class="tabs">
    {#each Object.keys(caseLabels) as caseKey}
      <button
        class="tab-btn {activeTab === caseKey ? 'active' : ''}"
        onclick={() => (activeTab = caseKey)}
      >
        {caseLabels[caseKey]}
      </button>
    {/each}
  </div>

  <div class="tab-content">
    {#if cases[activeTab]}
      <table class="declension-table">
        <thead>
          <tr>
            <th>Form</th>
            <th>Singular</th>
            <th>Plural</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>German</td>
            <td>{cases[activeTab].singular}</td>
            <td>{cases[activeTab].plural}</td>
          </tr>
        </tbody>
      </table>
    {/if}
  </div>
</div>

<style>
  .tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
  .tab-btn { padding: 0.5rem 1rem; border: 1px solid #ccc; border-radius: 0.25rem; cursor: pointer; }
  .tab-btn.active { background: #007bff; color: white; }
  .declension-table { width: 100%; border-collapse: collapse; }
  .declension-table th, .declension-table td { border: 1px solid #ddd; padding: 0.5rem; }
</style>
```

### 9.2 Example Carousel Component

**File**: [src/lib/components/vocabulary/ExampleCarousel.svelte](../../src/lib/components/vocabulary/ExampleCarousel.svelte)

```svelte
<script lang="ts">
  import { appState } from '$lib/state/app-state';

  let { itemId = '' } = $props();
  let currentExampleIdx = $state(0);

  $: item = appState.getItemById(itemId);
  $: examples = item?.examples || [];
  $: currentExample = examples[currentExampleIdx] || null;

  function nextExample() {
    if (currentExampleIdx < examples.length - 1) currentExampleIdx++;
  }

  function prevExample() {
    if (currentExampleIdx > 0) currentExampleIdx--;
  }
</script>

<div class="example-carousel">
  {#if currentExample}
    <div class="example-content">
      <div class="source-lang">German</div>
      <p class="example-text">{currentExample.source}</p>

      <div class="target-lang">Bulgarian</div>
      <p class="example-text">{currentExample.target}</p>

      {#if currentExample.attribution}
        <small class="attribution">Source: {currentExample.attribution}</small>
      {/if}
    </div>

    <div class="controls">
      <button onclick={prevExample} disabled={currentExampleIdx === 0}>← Previous</button>
      <span class="counter">{currentExampleIdx + 1} / {examples.length}</span>
      <button onclick={nextExample} disabled={currentExampleIdx === examples.length - 1}>Next →</button>
    </div>
  {/if}
</div>

<style>
  .example-carousel { padding: 1rem; border: 1px solid #ddd; border-radius: 0.5rem; }
  .example-content { margin-bottom: 1rem; }
  .source-lang, .target-lang { font-weight: bold; margin-top: 0.5rem; }
  .example-text { margin: 0.25rem 0; font-style: italic; }
  .attribution { display: block; margin-top: 0.5rem; color: #999; }
  .controls { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
</style>
```

### 9.3 Audio Widget Component

**File**: [src/lib/components/vocabulary/AudioWidget.svelte](../../src/lib/components/vocabulary/AudioWidget.svelte)

```svelte
<script lang="ts">
  import { appState } from '$lib/state/app-state';

  let { itemId = '' } = $props();
  let audioRef = $state(null);

  $: item = appState.getItemById(itemId);
  $: hasAudio = item?.audioUrl;

  function playAudio() {
    if (audioRef) {
      audioRef.play();
    }
  }

  function openForvo() {
    if (item?.audioUrl) {
      window.open(item.audioUrl, '_blank');
    }
  }
</script>

<div class="audio-widget">
  {#if hasAudio}
    <button onclick={playAudio} class="btn btn-primary">
      🔊 Listen to Pronunciation
    </button>
    <button onclick={openForvo} class="btn btn-outline btn-sm">
      Open Forvo
    </button>
    <audio bind:this={audioRef} crossorigin="anonymous">
      Your browser does not support audio.
    </audio>
  {/if}
</div>

<style>
  .audio-widget { display: flex; gap: 0.5rem; }
  .btn { padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer; }
  .btn-primary { background: #28a745; color: white; border: none; }
  .btn-outline { background: white; border: 1px solid #ddd; }
</style>
```

### 9.4 Update Card Components

Update [src/lib/components/flashcard/FlashCard.svelte](../../src/lib/components/flashcard/FlashCard.svelte) to include new tabs:

```svelte
<script lang="ts">
  import GrammarTabs from './GrammarTabs.svelte';
  import ExampleCarousel from './ExampleCarousel.svelte';
  import AudioWidget from './AudioWidget.svelte';
  import MnemonicEditor from './MnemonicEditor.svelte';

  let { item } = $props();
  let activeTab = $state('translation');

  const tabs = ['translation', 'grammar', 'examples', 'mnemonic', 'audio'];
</script>

<div class="flashcard">
  <!-- Card front/back toggle -->
  <div class="card-content">
    {#if activeTab === 'translation'}
      <!-- Original translation view -->
    {:else if activeTab === 'grammar'}
      <GrammarTabs itemId={item.id} />
    {:else if activeTab === 'examples'}
      <ExampleCarousel itemId={item.id} />
    {:else if activeTab === 'mnemonic'}
      <MnemonicEditor itemId={item.id} />
    {:else if activeTab === 'audio'}
      <AudioWidget itemId={item.id} />
    {/if}
  </div>

  <!-- Tab navigation -->
  <div class="tabs">
    {#each tabs as tab}
      <button
        class="tab {activeTab === tab ? 'active' : ''}"
        onclick={() => (activeTab = tab)}
      >
        {tab}
      </button>
    {/each}
  </div>
</div>
```

### 9.5 Test UI Components

```bash
# Run component tests
pnpm run test:components -- --grep="Grammar|Example|Audio|Mnemonic"

# Run E2E tests
pnpm run test:e2e

# Run accessibility tests
pnpm run test:accessibility
```

### 9.6 Phase 9 Checkpoint

```bash
git add src/lib/components/vocabulary/
git commit -m "Phase 9: Add grammar tabs, example carousel, audio widget, mnemonic editor"
```

---

## Phase 10: MVP Launch (1 week)

### Goal
Final validation, documentation, and deployment to production (GitHub Pages).

### 10.1 Pre-Launch Checklist

#### Data Integrity
```bash
# ✅ Validate all 746 items
pnpm run verify:vocabulary
pnpm run check

# ✅ No TypeScript errors
pnpm run check

# ✅ Lint passes
pnpm run lint:check
```

#### Testing
```bash
# ✅ All tests pass
pnpm run simulate-ci

# ✅ Unit tests with coverage
pnpm run test:unit

# ✅ Component tests
pnpm run test:components

# ✅ E2E tests
pnpm run test:e2e

# ✅ Accessibility audit
pnpm run test:accessibility
```

#### Bilingual Coverage
```bash
# ✅ All UI elements translated (German + Bulgarian)
# Manual check in browser:
# 1. Set UI language to German → verify all nav, buttons, labels in German
# 2. Set UI language to Bulgarian → verify all nav, buttons, labels in Bulgarian
# 3. Test language mode toggle (DE→BG, BG→DE)
```

#### Offline Functionality
```bash
# ✅ App works offline
# 1. Build: pnpm run build
# 2. Open DevTools > Application > Service Workers
# 3. Check "Offline"
# 4. Navigate all tabs; verify data loads
# 5. Uncheck "Offline"; verify sync (if implemented)
```

#### Performance
```bash
# ✅ Lighthouse audit
# 1. Build production: pnpm run build:gh-pages
# 2. Run Lighthouse on http://localhost:5173
# Target: >90 on all metrics

lighthouse http://localhost:5173 --view
```

### 10.2 Final Build

```bash
# Build for GitHub Pages (with base path)
pnpm run build:gh-pages

# Verify build output
ls -lh build/
# Expected: HTML, JS bundles, data JSON, CSS

# Test build locally
pnpm run preview
# Open http://localhost:4173
```

### 10.3 Deploy to GitHub Pages

```bash
# Commit all changes
git add -A
git commit -m "Phase 10: MVP launch – complete data, UI polish, final validation"

# Push to main (triggers GitHub Actions)
git push origin main

# Monitor deployment
# 1. Go to GitHub Actions: https://github.com/YungSeepferd/BulgarianGermanLearningApp/actions
# 2. Wait for workflow to complete (~5 min)
# 3. Verify deployment: https://yungseepferd.github.io/BulgarianGermanLearningApp/
```

### 10.4 Post-Launch Verification

```bash
# ✅ Live app accessible
curl -I https://yungseepferd.github.io/BulgarianGermanLearningApp/

# ✅ All routes work
# 1. Home: https://...
# 2. Vocabulary: https://.../vocabulary
# 3. Practice: https://.../practice
# 4. Learn: https://.../learn
# 5. Grammar: https://.../grammar

# ✅ Data loads
# 1. Open DevTools > Network
# 2. Check that unified-vocabulary.json is fetched
# 3. Verify 746 items load
```

### 10.5 Release Notes & Documentation

Create [RELEASE_NOTES_MVP_V1.md](../../RELEASE_NOTES_MVP_V1.md):

```markdown
# MVP v1.0 – Bulgarian–German Learning Hub

**Release Date**: December 15–22, 2025

## What's Included

- ✅ **746 Bulgarian–German vocabulary items**
- ✅ **Bilingual UI** (German / Български)
- ✅ **Bidirectional learning** (DE→BG / BG→DE)
- ✅ **Spaced-repetition practice mode**
- ✅ **Interactive flashcards** with grammar tables
- ✅ **Example sentences** (2–3 per item)
- ✅ **Audio pronunciation links** (Forvo)
- ✅ **Offline-first** (works without internet after first load)
- ✅ **Accessibility** (WCAG 2.1 AA)
- ✅ **Mobile-friendly** responsive design

## New in v1.0

### Data Completeness
- Gender + declension for 170+ nouns (22% coverage, focus on A1–A2)
- Example sentences for 730+ items (98% coverage)
- Forvo audio links for 100+ A1–A2 words

### UI Components
- **Grammar tabs**: View nominative, accusative, dative, genitive forms
- **Example carousel**: Scroll through 2–3 context sentences per word
- **Audio widget**: Click to hear pronunciation (Forvo link)
- **Mnemonic editor**: Create and save personal learning cues

### Performance
- Lighthouse score: 95+ (Performance, SEO, Best Practices)
- Build size: ~1.2 MB (gzipped)
- Load time: <2 sec on 4G

## Known Limitations

- Gender/declension coverage limited to high-frequency nouns; verb conjugations not yet included
- Mnemonics are community-driven; seed data not pre-populated
- No user accounts or cloud sync (localStorage only)
- No speech-to-text or writing practice (Phase 2+)

## Roadmap (v1.1+)

- Phase 11: Spaced-repetition scheduling (SM-2 algorithm)
- Phase 12: Verb conjugation tables (full paradigms)
- Phase 13: Community mnemonics voting + leaderboard
- Phase 14: User accounts & cloud sync (optional backend)
- Phase 15: Multi-language support (French, Spanish, etc.)

## Feedback & Support

Report bugs or suggest features: [GitHub Issues](https://github.com/YungSeepferd/BulgarianGermanLearningApp/issues)
```

### 10.6 Phase 10 Checkpoint

```bash
# Final backup
cp data/unified-vocabulary.json data/unified-vocabulary-mvp-v1.json

# Tag release
git tag -a v1.0-mvp -m "MVP Launch – complete data, UI polish, offline-ready"

# Push tags
git push origin --tags

# Announce
# 📢 Tweet / share link to live app
```

---

## Troubleshooting & Rollback

### Issue: Validation errors after Phase 7 enrichment

**Symptom**: `pnpm run check` fails with schema errors.

**Fix**:
```bash
# 1. Verify new schema matches data
node <<'NODE'
const fs=require('fs');
const vocab=JSON.parse(fs.readFileSync('data/unified-vocabulary.json','utf8'));
const items=vocab.items||vocab;
const errors=[];
items.forEach((it,idx)=>{
  if(typeof it.audioUrl!=='string'&&it.audioUrl!==undefined){
    errors.push(`Item ${idx}: audioUrl is not string or undefined`);
  }
});
if(errors.length>0) console.log(errors.slice(0,5));
NODE

# 2. Rollback to previous checkpoint
cp data/unified-vocabulary-phase-7-checkpoint.json data/unified-vocabulary.json

# 3. Retry with corrected data
pnpm run check
```

### Issue: Audio links broken after Forvo update

**Symptom**: Audio URLs 404 when clicked.

**Fix**:
```bash
# Verify Forvo links are alive (sample check)
node <<'NODE'
const items=JSON.parse(require('fs').readFileSync('data/unified-vocabulary.json','utf8')).items;
const withAudio=items.filter(it=>it.audioUrl).slice(0,5);
withAudio.forEach(it=>{
  console.log(it.audioUrl);
  // Manually verify 2–3 links in browser
});
NODE

# If many links are dead, regenerate with current Forvo URLs
rm enrichment-output/audio-links-a1-a2.json
# Re-run 7.4 step 2
```

### Issue: Offline mode not working

**Symptom**: App shows blank page when offline.

**Fix**:
```bash
# 1. Check service worker registration
# Open DevTools > Application > Service Workers
# Verify "Active and running"

# 2. Verify manifest.json
# Check that all assets are cached

# 3. Check build output
pnpm run build
ls -la build/

# 4. Clear browser cache and retry
# Cmd+Shift+Delete → Clear all data → Reload app
```

### Rollback to Previous Phase

```bash
# If Phase 9 breaks app, rollback to Phase 8:
git checkout HEAD~1 -- src/lib/components/vocabulary/
git commit -m "Rollback Phase 9 – UI components broken"

# Or full rollback:
git checkout <PHASE_8_COMMIT_HASH> -- .
git commit -m "Rollback to Phase 8 checkpoint"
```

---

## Summary: Timeline & Milestones

| Phase | Duration | Key Deliverables | Validation |
|-------|----------|------------------|-----------|
| **7** | 2–3 weeks | Gender enrichment (batches 21–50), examples, audio links | 0 validation errors; 98% example coverage |
| **8** | 1–2 weeks | Schema extension, mnemonic UI, offline test | All items match schema v2 |
| **9** | 1 week | Grammar tabs, example carousel, audio widget | All tests pass; accessibility ✅ |
| **10** | 1 week | Final testing, deployment, release notes | Live at GitHub Pages; 95+ Lighthouse |

**Total**: **4–5 weeks** from Phase 7 start → MVP launch.

---

## Quick Reference: Commands by Phase

### Phase 7
```bash
pnpm run validate:vocabulary:batch -- --id=1
node enrichment-output/extract-nouns-b21-50.mjs
pnpm run import:enrichment -- --file=enrichment-output/batch-21-50-gender-enrichment.json
```

### Phase 8
```bash
pnpm run check
pnpm run verify:vocabulary
```

### Phase 9
```bash
pnpm run test:components
pnpm run test:accessibility
```

### Phase 10
```bash
pnpm run simulate-ci
pnpm run build:gh-pages
pnpm run preview
git push origin main
```
