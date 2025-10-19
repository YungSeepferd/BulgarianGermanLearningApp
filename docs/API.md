# API & Data Interfaces (Placeholder)

> This document will catalogue all data interfaces used by the Bulgarian–German Learning App. Flesh out each section as features land.

## Vocabulary Data

- **Source files**: `data/vocabulary.json`, derived search index in `data/processed/`
- **Consumers**: Hugo data templates, `assets/js/vocab-cards.js`, `assets/js/flashcards.js`

### Vocabulary Schema

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | ✔ | Stable slug (kebab_case). Used for SM-2 persistence (`item_id`). |
| `word` | string | ✔ | Bulgarian term displayed on card front. |
| `translation` | string | ✔ | German (or target language) translation shown on card back. |
| `source_lang` | string | ✔ | ISO 639-1 code (e.g., `"bg"`). |
| `target_lang` | string | ✔ | ISO 639-1 code (e.g., `"de"`). |
| `category` | string | ✖ | Optional grouping (e.g., “Begrüßung”). Used by filters. |
| `level` | string | ✖ | CEFR level (`"A1"`, `"A2"`, ...). |
| `notes` | string/null | ✖ | Free-form learner tips. |
| `etymology` | string/null | ✖ | Origin information for advanced learners. |
| `cultural_note` | string/null | ✖ | Usage context, etiquette. |
| `linguistic_note` | string/null | ✖ | Pronunciation, grammar hints. |
| `difficulty` | number/null | ✖ | Range 1–5 (int or float). |
| `frequency` | number/null | ✖ | Range 0–100 (int). |
| `examples` | array | ✖ | List of example objects (see below). |

#### Example vocabulary object

```json
{
  "sentence": "Здравей, как си?",
  "translation": "Hallo, wie geht's?",
  "context": "informal"
}
```

### Vocabulary Validation Rules

- **Uniqueness**: `id` must be unique; enforce during data reviews or via `npm run process-data` validation (planned improvement).
- **Language codes**: Restrict `source_lang` / `target_lang` to ISO 639-1 values supported by `language-toggle.js`.
- **Examples**: When provided, each example requires `sentence` and `translation`; `context` optional but recommended.
- **Numeric ranges**: Clamp `difficulty` to 1–5, `frequency` to 0–100.

### Vocabulary Update Workflow

1. Edit `data/vocabulary.json` (manual or tooling-generated).
2. Run `npm run process-data` to regenerate derived indices (search payload, audio manifests).
3. Commit both source and generated files under `data/processed/`.
4. Verify via `hugo --logLevel debug -D` and browser smoke tests (offline and online modes).

## Grammar Data

- **Source files**: `data/grammar.json`
- **Consumers**: Grammar shortcodes (`layouts/_shortcodes/*`), `assets/js/grammar.js`

### Schema

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | ✔ | Stable slug used for linking and spaced repetition references. |
| `title` | string | ✔ | Display title for grammar rule. |
| `summary` | string | ✔ | Short description (1–2 sentences). |
| `category` | string | ✖ | Grouping (e.g., “Verbs”, “Cases”). |
| `level` | string | ✖ | CEFR tag for filtering. |
| `content` | string | ✔ | Markdown body rendered in detail views. |
| `examples` | array | ✖ | Example objects with `sentence`, `translation`, optional `note`. |
| `audio` | object/null | ✖ | Planned metadata for associated pronunciation clips. |

#### Example grammar entry

```json
{
  "id": "present-tense-overview",
  "title": "Präsensbildung im Bulgarischen",
  "summary": "Grundregeln zur Bildung des Präsens mit regelmäßigen Verben.",
  "category": "Verbs",
  "level": "A2",
  "content": "## Überblick\n...",
  "examples": [
    {
      "sentence": "Аз чета книга.",
      "translation": "Ich lese ein Buch.",
      "note": "typischer Aussagesatz"
    }
  ]
}
```

### Validation Rules

- `content` should be valid Markdown; run Markdown lint if available.
- Maintain parity between `category`/`level` values and UI filter options.
- Audio metadata schema (future) should mirror assets stored under `static/audio/grammar/` with hashed filenames.

### Update Workflow

1. Modify `data/grammar.json`.
2. Regenerate supporting indices once tooling lands (future `npm run process-data grammar`).
3. Preview via `hugo server -D` to ensure Markdown renders correctly.
4. Update related shortcodes/tests if new categories or levels are introduced.

## Spaced Repetition State

- Storage: `localStorage` under `bgde:` prefix with SM-2 fields (`item_id`, `interval`, `ease_factor`, etc.)
- Interfaces: `assets/js/spaced-repetition.js`, import/export routines

### Persistence Lifecycle

**Write Operations**:
- Review state written to localStorage after every flashcard grade
- Key format: `bgde:review-state:{item_id}`
- Atomic writes to prevent partial state corruption
- Failed writes logged to console but don't block user progress

**Read Operations**:
- State loaded on page load and cached in memory
- Lazy initialization - only load items that are due for review
- Cache invalidation on language direction changes

**Fallback Behavior**:
- If localStorage is unavailable (privacy mode, quota exceeded):
  - Falls back to in-memory Map() storage
  - Progress persists only for current session
  - Warning displayed to user about temporary storage
  - Import/export still available via JSON download

**Import/Export**:
- JSON format matches internal state schema
- Export: Download all review states as `bgde-progress-{timestamp}.json`
- Import: Merge or replace existing states with user confirmation
- Validation: Schema check before import, reject malformed data

## Audio Assets

- Static assets: `static/audio/`
- Generated assets: (planned) via `npm run process-data`

### Audio File Conventions

**Directory Structure**:
```
static/audio/
├── vocabulary/
│   ├── {id}.mp3          # e.g., zdravei.mp3
│   └── {id}-slow.mp3     # Optional slow pronunciation
└── grammar/
    └── {id}-example-{n}.mp3  # Numbered examples
```

**File Format**:
- **Codec**: MP3, 64kbps mono
- **Sample rate**: 44.1 kHz
- **Max duration**: 5 seconds for vocabulary, 10 seconds for examples
- **Normalization**: -16 LUFS target loudness

**Naming Convention**:
- Use vocabulary `id` field as filename (kebab-case)
- Examples: `zdravei.mp3`, `dobur-den.mp3`, `blagodarya.mp3`
- Language suffix optional: `zdravei-bg.mp3`, `guten-tag-de.mp3`

**Locale Support**:
- Bulgarian (bg): Native speaker recordings preferred
- German (de): Standard Hochdeutsch pronunciation
- TTS fallback: Use Web Speech API if file missing (no error)

**Caching Strategy**:
- Service worker precaches up to 50 most common words
- On-demand fetch and cache for remaining vocabulary
- Cache name: `bgde-audio-v1`
- Eviction policy: LRU when cache exceeds 10MB

**Fallback Behavior**:
- Missing audio file: Silent, no error displayed
- Network failure: Disable audio button, show offline indicator
- Playback error: Log to console, continue without audio

Last updated: September 24, 2025
