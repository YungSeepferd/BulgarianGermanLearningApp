# Debugging Notes

## Fuse.js Search Index Serialization

### Problem
When storing a Fuse.js index for later use, the naive approach fails:
```typescript
// This creates the index
const fuse = new Fuse(items, options);
const index = fuse.getIndex().toJSON(); // Returns { keys, records }

// This FAILS - passing raw object to constructor
const fuse2 = new Fuse([], options, index); // Error: "Incorrect 'index' type"
```

### Root Cause
Fuse.js v7's `toJSON()` returns a plain object `{ keys, records }`, but the `new Fuse()` constructor expects a `FuseIndex` class instance. The types don't match.

### Solution
Use `Fuse.parseIndex()` to properly deserialize:
```typescript
// Storing (correct)
const fuse = new Fuse(items, options);
const serialized = fuse.getIndex().toJSON();
const data = {
  index: { keys: serialized.keys, records: serialized.records },
  options: options
};

// Loading (correct)
const fuseIndex = Fuse.parseIndex({
  keys: data.index.keys,
  records: data.index.records as FuseIndexRecords
});
const fuse = new Fuse([], data.options, fuseIndex);
```

### Type Imports
```typescript
import Fuse from 'fuse.js';
import type { IFuseOptions, FuseIndexRecords } from 'fuse.js';
```

### Cache Storage Type
```typescript
let searchIndexCache: {
  index: { keys: string[]; records: FuseIndexRecords };
  options: IFuseOptions<UnifiedVocabularyItem>;
  // ... other fields
} | null = null;
```

## TypeScript exactOptionalPropertyTypes

### Problem
With `exactOptionalPropertyTypes: true`, optional properties can't be `undefined`:
```typescript
interface Options {
  eventBus?: EventBus;
}

// This fails when eventBus is undefined
const opts: Options = { eventBus: undefined }; // Error!
```

### Solution
Conditionally include the property:
```typescript
function buildOptions(eventBus?: EventBus): { eventBus?: EventBus } {
  return eventBus ? { eventBus } : {};
}

// Or inline
const opts = eventBus ? { eventBus } : {};
```

## Vocabulary Chunking Data Flow

```
1. User loads page
   └── vocabularyRepository.initialize()
       ├── loadIndex() -> fetches index.json (~15KB)
       └── loadLevelChunk('A1') -> fetches A1.json (~200KB)

2. User searches
   └── vocabularyRepository.search()
       └── loadSearchIndex() -> fetches search-index.json (~450KB)
           └── Uses pre-computed Fuse index for instant results

3. User navigates to vocabulary page
   └── vocabularyRepository.loadAll() -> fetches A2, B1, B2, C1 as needed
```

## Local Storage Cache Keys
- `vocab-index-v2` - Master index
- `vocab-search-index-v2` - Search index
- `vocab-chunk-{level}` - Individual level chunks

## Debugging Commands
```bash
# Check what's in localStorage
curl -s http://localhost:4173/BulgarianGermanLearningApp/ | head

# Verify chunk files exist
ls -la data/vocabulary/
ls -la static/data/vocabulary/
```
