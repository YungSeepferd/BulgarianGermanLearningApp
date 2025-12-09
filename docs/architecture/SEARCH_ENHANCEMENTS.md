# Architecture Design: Enhanced Search Functionality

## 1. Overview

This document outlines the architecture for the new Enhanced Search Functionality. The goal is to create a powerful, flexible, and performant search system that leverages the rich metadata available in the `unified-vocabulary.json`.

The new search functionality will be encapsulated in a dedicated **Search Service**, ensuring a clean separation of concerns and making it easy to maintain and extend.

## 2. Core Components

### 2.1. `SearchService` (`src/lib/services/search.ts`)

This new service will be the central hub for all search-related operations. It will expose a primary function, `searchVocabulary`, which will take a set of search parameters and return a structured result set.

**Key Responsibilities:**

-   **Filtering:** Filter vocabulary items by metadata such as `partOfSpeech`, `difficulty`, and `categories`.
-   **Fuzzy Search:** Implement fuzzy matching on the `german` and `bulgarian` fields to handle typos and partial matches.
-   **Relevance Scoring:** Implement a weighted scoring system to rank results based on their relevance to the search query. Matches in primary fields (e.g., `german`, `bulgarian`) will have a higher weight than matches in secondary fields (e.g., `examples`, `notes`).
-   **Pagination:** Support `limit` and `offset` parameters to enable efficient pagination of search results.

### 2.2. Data Flow

The data flow for a search query will be as follows:

```mermaid
graph TD
    A[UI Component] -->|Search Query / Filters| B(SearchService);
    B -->|loadVocabulary()| C(DataLoader);
    C -->|unified-vocabulary.json| B;
    B -->|Filtered & Scored Results| A;
```

1.  A UI component (e.g., a search bar) will call the `searchVocabulary` function in the `SearchService` with the user's query and selected filters.
2.  The `SearchService` will use the existing `DataLoader` to get the full vocabulary dataset.
3.  The service will then apply the filtering, fuzzy search, and scoring logic to the dataset.
4.  Finally, it will return a paginated and ranked list of results to the UI component for display.

## 3. Implementation Details

### 3.1. Fuzzy Search Library

To implement the fuzzy search and relevance scoring, we will integrate a lightweight, client-side fuzzy search library. A good candidate is **Fuse.js**, which is powerful, easy to use, and has a small footprint.

### 3.2. Search Parameters

The `searchVocabulary` function will accept a parameter object with the following structure:

```typescript
export interface SearchParams {
  query?: string;
  partOfSpeech?: string;
  difficulty?: number;
  categories?: string[];
  limit?: number;
  offset?: number;
}
```

## 4. Integration Points

-   **Search UI:** The existing search UI components will be updated to call the new `SearchService` instead of performing a simple filter.
-   **Data Loading:** The `SearchService` will reuse the existing `loadVocabulary` function from `src/lib/data/loader.ts`, ensuring that the search functionality benefits from the existing caching and data loading mechanisms.

## 5. Detailed Implementation Plan

Here is a step-by-step plan for implementing the Enhanced Search Functionality:

### Step 1: Install Fuse.js
-   **Task:** Add Fuse.js to the project dependencies.
-   **Command:** `pnpm add fuse.js`

### Step 2: Create the Search Service
-   **Task:** Create the new file `src/lib/services/search.ts`.
-   **Details:** This file will contain the `searchVocabulary` function and all related logic.

### Step 3: Implement the `searchVocabulary` Function
-   **Task:** Implement the core search logic inside `src/lib/services/search.ts`.
-   **Details:**
    -   Import `loadVocabulary` to fetch the data.
    -   Initialize Fuse.js with the vocabulary items and configure it for fuzzy search on `german` and `bulgarian` fields. Define weights for relevance scoring.
    -   Implement filtering logic for `partOfSpeech`, `difficulty`, and `categories`.
    -   Combine filtering and fuzzy search to produce a ranked list of results.
    -   Implement pagination using `limit` and `offset`.

### Step 4: Update UI Components
-   **Task:** Modify the relevant Svelte components to use the new `SearchService`.
-   **Files to update (likely):**
    -   `src/lib/components/SearchList.svelte` (or a similar component responsible for search)
    -   The main page/layout where the search bar is located.
-   **Details:**
    -   Import and call `searchVocabulary` from the new service.
    -   Pass the user's input and filter selections to the service.
    -   Update the component's state with the results returned by the service.

### Step 5: Add Unit Tests
-   **Task:** Create unit tests for the `SearchService`.
-   **File to create:** `src/lib/services/search.test.ts`
-   **Details:**
    -   Test the filtering logic with various combinations of parameters.
    -   Test the fuzzy search to ensure it handles typos correctly.
    -   Test the relevance scoring to confirm that results are ranked as expected.
    -   Test pagination logic.

## 6. Implementation Status: COMPLETED ✅

The Enhanced Search Functionality has been successfully implemented and is now fully operational.

### Files Created/Updated

#### New Files:
- [`src/lib/services/search.ts`](src/lib/services/search.ts) - Main search service implementation
- [`tests/unit/search.test.ts`](tests/unit/search.test.ts) - Comprehensive unit tests (26 tests passing)

#### Updated Files:
- [`src/lib/data/vocabulary.ts`](src/lib/data/vocabulary.ts) - Updated to use the new search service
- [`src/lib/components/SearchList.svelte`](src/lib/components/SearchList.svelte) - Fixed animation issue
- [`src/routes/vocabulary/+page.svelte`](src/routes/vocabulary/+page.svelte) - Already using the new search service

## 7. Features Implemented

### Core Search Functionality
✅ **Fuzzy Search**: Uses Fuse.js for relevance-based fuzzy matching on German, Bulgarian, and transliteration fields
✅ **Comprehensive Filtering**: Filter by part of speech, difficulty level, categories, and learning phase
✅ **Pagination**: Support for loading more results with configurable page size
✅ **Sorting**: Sort by German, Bulgarian, difficulty, or creation date in ascending/descending order
✅ **Search Suggestions**: Autocomplete functionality for quick search
✅ **Statistics**: Filter statistics for dynamic UI elements
✅ **Learning Phase Filtering**: Filter by SRS learning phase (0-6)

### Technical Implementation
✅ **Type Safety**: Full TypeScript support with Zod schemas
✅ **Caching**: Vocabulary data caching to avoid repeated loading
✅ **Performance**: Filters applied before fuzzy search to reduce dataset size
✅ **Testing**: Comprehensive unit tests covering all functionality
✅ **Integration**: Seamless integration with existing UI components

## 8. Usage Examples

### Basic Search
```typescript
const result = await searchVocabulary({
  query: 'Haus',
  limit: 20,
  offset: 0,
  sortBy: 'german',
  sortOrder: 'asc'
});
```

### Filtered Search
```typescript
const result = await searchVocabulary({
  partOfSpeech: 'noun',
  difficulty: 2,
  categories: ['house'],
  learningPhase: 3,
  limit: 10,
  offset: 0
});
```

### Fuzzy Search (with typos)
```typescript
const result = await searchVocabulary({
  query: 'Hus', // Typo for "Haus"
  limit: 5,
  offset: 0
});
```

## 9. Testing
The search functionality has been thoroughly tested with 26 unit tests covering:
- All filter combinations
- Fuzzy search with typos
- Pagination and sorting
- Search suggestions
- Statistics generation
- Cache management

All tests are passing successfully.

## 10. Next Steps
The enhanced search functionality is now fully implemented and ready for use. Next phases can build on this foundation to create more advanced features like:
- Lesson Integration Engine
- Adaptive Quiz System
- Grammar-Aware Features
- Cultural Context Modules