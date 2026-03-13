# Bulgarian-German Learning App - Memory

## Project Overview
A language learning application for Bulgarian-German vocabulary with:
- Chunked vocabulary loading by CEFR level (A1, A2, B1, B2, C1)
- Pre-computed Fuse.js search index for instant search
- Svelte 5 with runes for reactive state management
- Static adapter for deployment

## Architecture Decisions

### Chunked Vocabulary Loading
- Split 1.3MB unified-vocabulary.json into smaller chunks by CEFR level
- Only A1 level (867 items) loads initially (~200KB)
- Other levels load on demand
- Reduces initial page load from 1.3MB to ~220KB

### Search Index Format
- Uses Fuse.js v7 with pre-computed index
- Stored as `{ keys: string[], records: FuseIndexRecords }` in JSON
- Must use `Fuse.parseIndex()` to rehydrate, not pass directly to constructor
- See [debugging.md](./debugging.md) for Fuse.js type details

## Common Issues & Solutions

### Fuse.js Search Index Error: "Incorrect 'index' type"
**Problem**: Passing serialized index directly to `new Fuse()` constructor fails.
**Solution**: Use `Fuse.parseIndex({ keys, records })` to properly deserialize.

### TypeScript exactOptionalPropertyTypes
**Problem**: Optional properties can't be `undefined` with strict option.
**Solution**: Conditionally include properties: `eventBus ? { eventBus } : {}`

## File Locations
- Chunked data: `data/vocabulary/{A1,A2,B1,B2,C1}.json`
- Search index: `data/vocabulary/search-index.json`
- Loader: `src/lib/data/vocabulary-loader.ts`
- Repository: `src/lib/data/vocabulary-repository.svelte.ts`

## Build Commands
```bash
npm run chunk:vocabulary    # Generate chunks from unified file
npm run build:search-index  # Generate Fuse.js search index
npm run verify:chunks       # Validate chunk integrity
```
