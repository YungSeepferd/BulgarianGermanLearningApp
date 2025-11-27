# API Documentation

This document provides comprehensive API documentation for all public modules in the Bulgarian-German Learning Application.

## Table of Contents

- [API Client](#api-client)
- [Vocabulary API](#vocabulary-api)
- [Service Worker Manager](#service-worker-manager)
- [User Preferences](#user-preferences)
- [Performance Monitor](#performance-monitor)
- [Error Types](#error-types)
- [Loading State Manager](#loading-state-manager)
- [Network Manager](#network-manager)
- [Connectivity Manager](#connectivity-manager)
- [Memory Manager](#memory-manager)
- [Error Logger](#error-logger)

---

## API Client

**Module**: `assets/js/modules/api-client.ts`

### Overview

The API Client provides optimized data loading with caching, pagination, and performance monitoring for vocabulary, grammar, and practice data.

### Classes

#### APIClient

```typescript
class APIClient {
  constructor()
}
```

### Methods

#### getVocabulary()

```typescript
public async getVocabulary(options: VocabularyOptions = {}): Promise<PaginatedResponse<VocabularyItem>>
```

Fetches vocabulary items with optional filtering, pagination, and caching.

**Parameters:**
- `options` - Query options for vocabulary request
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 50)
  - `category?: string` - Category filter
  - `level?: string` - Level filter
  - `search?: string` - Search query
  - `direction?: 'bg-de' | 'de-bg'` - Language direction (default: 'bg-de')
  - `useCache?: boolean` - Enable caching (default: true)

**Returns:** `Promise<PaginatedResponse<VocabularyItem>>`

**Example:**
```typescript
const api = new APIClient();
const vocab = await api.getVocabulary({
  page: 1,
  limit: 50,
  category: 'verbs',
  level: 'A1'
});
```

#### getVocabularyItem()

```typescript
public async getVocabularyItem(id: string): Promise<VocabularyItem>
```

Fetches a specific vocabulary item by ID with caching.

**Parameters:**
- `id` - Vocabulary item ID

**Returns:** `Promise<VocabularyItem>`

#### getGrammar()

```typescript
public async getGrammar(options: GrammarOptions = {}): Promise<PaginatedResponse<GrammarItem>>
```

Fetches grammar items with optional filtering and pagination.

**Parameters:**
- `options` - Query options for grammar request
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 20)
  - `category?: string` - Category filter
  - `level?: string` - Level filter
  - `useCache?: boolean` - Enable caching (default: true)

**Returns:** `Promise<PaginatedResponse<GrammarItem>>`

#### getPracticeItems()

```typescript
public async getPracticeItems(options: PracticeOptions = {}): Promise<PracticeItem[]>
```

Fetches practice items for sessions based on specified criteria.

**Parameters:**
- `options` - Options for practice item selection
  - `count?: number` - Number of items (default: 20)
  - `categories?: string[]` - Category filters
  - `levels?: string[]` - Level filters
  - `direction?: 'bg-de' | 'de-bg'` - Language direction (default: 'bg-de')
  - `reviewType?: 'due' | 'new' | 'review'` - Review type (default: 'due')
  - `useCache?: boolean` - Enable caching (default: false)

**Returns:** `Promise<PracticeItem[]>`

#### search()

```typescript
public async search(query: string, options: SearchOptions = {}): Promise<SearchResponse>
```

Searches across vocabulary and grammar content with caching.

**Parameters:**
- `query` - Search query string
- `options` - Search options
  - `type?: 'vocabulary' | 'grammar' | 'all'` - Search type (default: 'all')
  - `limit?: number` - Result limit (default: 50)
  - `useCache?: boolean` - Enable caching (default: true)

**Returns:** `Promise<SearchResponse>`

#### clearCache()

```typescript
public clearCache(pattern: string | null = null): void
```

Clears cache entries, optionally filtered by pattern.

**Parameters:**
- `pattern` - Pattern to match for selective clearing (default: null)

#### getMetrics()

```typescript
public getMetrics(): ExtendedMetrics
```

Returns detailed performance metrics for monitoring.

**Returns:** `ExtendedMetrics` - Comprehensive metrics including cache statistics

#### prefetchVocabulary()

```typescript
public async prefetchVocabulary(categories: string[] = [], levels: string[] = []): Promise<void>
```

Preloads vocabulary data to improve subsequent load times.

**Parameters:**
- `categories` - Categories to prefetch
- `levels` - Levels to prefetch

#### batchGetVocabulary()

```typescript
public async batchGetVocabulary(ids: string[]): Promise<BatchResult<VocabularyItem>[]>
```

Fetches multiple vocabulary items in parallel with error handling.

**Parameters:**
- `ids` - Array of vocabulary item IDs

**Returns:** `Promise<BatchResult<VocabularyItem>[]>`

#### healthCheck()

```typescript
public async healthCheck(): Promise<HealthCheckResponse>
```

Checks API availability and responsiveness.

**Returns:** `Promise<HealthCheckResponse>`

### Interfaces

#### VocabularyItem

```typescript
interface VocabularyItem {
  id: string;
  bulgarian: string;
  german: string;
  category: string;
  level: string;
  tags?: string[];
  examples?: string[];
  pronunciation?: string;
  difficulty?: number;
}
```

#### GrammarItem

```typescript
interface GrammarItem {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  examples: string[];
  rules: string[];
}
```

#### PracticeItem

```typescript
interface PracticeItem {
  id: string;
  type: 'vocabulary' | 'grammar';
  question: string;
  answer: string;
  category: string;
  level: string;
  difficulty: number;
  reviewType: 'due' | 'new' | 'review';
}
```

---

## Vocabulary API

**Module**: `assets/js/modules/vocabulary-api.ts`

### Overview

The Vocabulary API provides lazy-loading capabilities for split vocabulary data with enhanced error handling, loading states, and network resilience.

### Classes

#### VocabularyAPI

```typescript
class VocabularyAPI {
  constructor()
}
```

### Methods

#### loadChunk()

```typescript
async loadChunk(fileName: string): Promise<VocabularyEntry[]>
```

Loads a specific vocabulary chunk by file name with enhanced error handling and loading states.

**Parameters:**
- `fileName` - Name of the chunk file to load

**Returns:** `Promise<VocabularyEntry[]>`

#### loadByLevel()

```typescript
async loadByLevel(level: string): Promise<VocabularyEntry[]>
```

Loads vocabulary by CEFR level with enhanced error handling.

**Parameters:**
- `level` - CEFR level to load ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')

**Returns:** `Promise<VocabularyEntry[]>`

#### loadByCategory()

```typescript
async loadByCategory(category: string): Promise<VocabularyEntry[]>
```

Loads vocabulary by category with enhanced error handling.

**Parameters:**
- `category` - Category to load

**Returns:** `Promise<VocabularyEntry[]>`

#### loadAll()

```typescript
async loadAll(): Promise<VocabularyEntry[]>
```

Loads all vocabulary with enhanced error handling and loading states.

**Returns:** `Promise<VocabularyEntry[]>`

#### loadFiltered()

```typescript
async loadFiltered(filters: { level?: string; category?: string; search?: string } = {}): Promise<VocabularyEntry[]>
```

Loads vocabulary with filters and enhanced error handling.

**Parameters:**
- `filters` - Filter criteria
  - `level?: string` - Level filter
  - `category?: string` - Category filter
  - `search?: string` - Search filter

**Returns:** `Promise<VocabularyEntry[]>`

#### getItemById()

```typescript
async getItemById(id: string): Promise<VocabularyEntry | null>
```

Gets specific vocabulary item by ID with enhanced error handling.

**Parameters:**
- `id` - Vocabulary item ID

**Returns:** `Promise<VocabularyEntry | null>`

#### getAvailableLevels()

```typescript
getAvailableLevels(): string[]
```

Gets available levels from index.

**Returns:** `string[]` - Array of available CEFR levels

#### getAvailableCategories()

```typescript
getAvailableCategories(): string[]
```

Gets available categories from index.

**Returns:** `string[]` - Array of available categories

#### clearCache()

```typescript
async clearCache(): Promise<void>
```

Clears loaded chunks and memory cache with enhanced cleanup.

#### getMemoryStats()

```typescript
getMemoryStats(): {
  loadedChunks: number;
  totalEntries: number;
  cacheSizeKB: number;
  memoryStats: any;
  networkStats: any;
  connectivityStatus: any;
  indexLoaded: boolean;
}
```

Gets comprehensive memory and performance statistics.

**Returns:** Detailed statistics object

#### performHealthCheck()

```typescript
async performHealthCheck(): Promise<{
  healthy: boolean;
  issues: string[];
  recommendations: string[];
  details: any;
}>
```

Performs health check on vocabulary API.

**Returns:** Promise resolving to health check result

#### preloadChunks()

```typescript
async preloadChunks(chunkNames: string[]): Promise<void>
```

Preloads commonly used chunks for better performance.

**Parameters:**
- `chunkNames` - Array of chunk names to preload

#### getMetadata()

```typescript
getMetadata(): VocabularyChunkMetadata[]
```

Gets metadata for all available vocabulary chunks.

**Returns:** Array of vocabulary chunk metadata

#### isLoading()

```typescript
isLoading(): boolean
```

Checks if vocabulary API is currently loading.

**Returns:** `boolean`

#### getProgress()

```typescript
getProgress(): VocabularyLoadingState
```

Gets current loading state.

**Returns:** Current loading state

### Interfaces

#### VocabularyEntry

```typescript
interface VocabularyEntry extends VocabularyItem {
  // Extends VocabularyItem from api-client.ts
}
```

#### VocabularyChunkMetadata

```typescript
interface VocabularyChunkMetadata {
  name: string;
  level: string;
  category: string;
  count: number;
  size: number;
  lastModified: number;
}
```

#### VocabularyLoadingState

```typescript
interface VocabularyLoadingState {
  isLoading: boolean;
  progress: number;
  totalChunks: number;
  loadedChunks: number;
  currentChunk: string;
  error: string | null;
}
```

---

## Service Worker Manager

**Module**: `assets/js/modules/service-worker.ts`

### Overview

Handles PWA functionality, offline support, and cache management with automatic service worker registration, update notifications, install prompts, connection status monitoring, and background sync capabilities.

### Classes

#### ServiceWorkerManager

```typescript
class ServiceWorkerManager {
  constructor()
}
```

### Methods

#### clearCache()

```typescript
public async clearCache(): Promise<boolean>
```

Clears the service worker cache.

**Returns:** `Promise<boolean>` - True if cache was cleared successfully

#### getVersion()

```typescript
public async getVersion(): Promise<any>
```

Gets the current service worker version.

**Returns:** `Promise<any>` - Version information or null if not available

#### isSupported()

```typescript
public isSupported(): boolean
```

Checks if service workers are supported in the current browser.

**Returns:** `boolean`

#### isInstalled()

```typescript
public isInstalled(): boolean
```

Checks if the app is installed as a PWA.

**Returns:** `boolean`

#### destroy()

```typescript
public destroy(): void
```

Destroys the service worker manager and cleans up resources.

### Properties

#### isServiceWorkerReady

```typescript
public get isServiceWorkerReady(): boolean
```

Gets whether the service worker is registered and ready.

**Returns:** `boolean`

#### isAppOnline

```typescript
public get isAppOnline(): boolean
```

Gets whether the app is currently online.

**Returns:** `boolean`

#### hasUpdateAvailable

```typescript
public get hasUpdateAvailable(): boolean
```

Gets whether a service worker update is available.

**Returns:** `boolean`

### Interfaces

#### ServiceWorkerMessage

```typescript
interface ServiceWorkerMessage {
  type: ServiceWorkerMessageType;
  version?: string;
  url?: string;
  data?: any;
}
```

#### BeforeInstallPromptEvent

```typescript
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
```

---

## User Preferences

**Module**: `assets/js/modules/user-preferences.ts`

### Overview

Manages user settings, language direction, and learning preferences with localStorage persistence and event-driven updates.

### Classes

#### UserPreferences

```typescript
class UserPreferences {
  constructor()
}
```

### Methods

#### Core Preference Management

##### get()

```typescript
get<K extends keyof UserPreferencesData>(key?: K): K extends undefined ? UserPreferencesData : UserPreferencesData[K]
```

Gets preference value(s).

**Parameters:**
- `key` - Preference key to get, or undefined to get all preferences

**Returns:** Preference value(s)

##### set()

```typescript
set(key: keyof UserPreferencesData | Partial<UserPreferencesData>, value?: UserPreferencesData[keyof UserPreferencesData]): void
```

Sets preference value(s).

**Parameters:**
- `key` - Preference key or object for bulk update
- `value` - Preference value (only used for single key updates)

##### reset()

```typescript
reset(keys?: keyof UserPreferencesData | (keyof UserPreferencesData)[]): void
```

Resets preferences to defaults.

**Parameters:**
- `keys` - Specific keys to reset, or null to reset all

##### save()

```typescript
save(): boolean
```

Saves preferences to localStorage.

**Returns:** `boolean` - True if successful, false otherwise

#### Language and Direction Management

##### setNativeLanguage()

```typescript
setNativeLanguage(language: 'bg' | 'de'): void
```

Sets native language and auto-adjusts learning direction.

**Parameters:**
- `language` - Native language ('bg' or 'de')

##### setLearningDirection()

```typescript
setLearningDirection(direction: 'bg-de' | 'de-bg'): void
```

Sets learning direction.

**Parameters:**
- `direction` - Learning direction ('bg-de' or 'de-bg')

##### toggleLearningDirection()

```typescript
toggleLearningDirection(): 'bg-de' | 'de-bg'
```

Toggles learning direction.

**Returns:** New learning direction

##### getSourceLanguage()

```typescript
getSourceLanguage(): string
```

Gets source language from learning direction.

**Returns:** Source language code

##### getTargetLanguage()

```typescript
getTargetLanguage(): string
```

Gets target language from learning direction.

**Returns:** Target language code

#### UI Preferences

##### setTheme()

```typescript
setTheme(theme: 'light' | 'dark' | 'auto'): void
```

Sets theme.

**Parameters:**
- `theme` - Theme ('light', 'dark', or 'auto')

##### setFontSize()

```typescript
setFontSize(size: 'small' | 'medium' | 'large'): void
```

Sets font size.

**Parameters:**
- `size` - Font size ('small', 'medium', or 'large')

#### Learning Preferences

##### setSessionLength()

```typescript
setSessionLength(length: number): void
```

Sets session length.

**Parameters:**
- `length` - Session length (5-100 items)

##### setDifficultyLevel()

```typescript
setDifficultyLevel(level: 'easy' | 'medium' | 'hard' | 'adaptive'): void
```

Sets difficulty level.

**Parameters:**
- `level` - Difficulty level

#### Category and Level Preferences

##### addPreferredCategory()

```typescript
addPreferredCategory(category: string): void
```

Adds preferred category.

**Parameters:**
- `category` - Category to add

##### removePreferredCategory()

```typescript
removePreferredCategory(category: string): void
```

Removes preferred category.

**Parameters:**
- `category` - Category to remove

##### setPreferredLevels()

```typescript
setPreferredLevels(levels: ('A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2')[]): void
```

Sets preferred levels.

**Parameters:**
- `levels` - Array of levels to set

#### Spaced Repetition Customization

##### setSpacedRepetitionSettings()

```typescript
setSpacedRepetitionSettings(settings: SpacedRepetitionSettings): void
```

Sets spaced repetition settings.

**Parameters:**
- `settings` - Settings object with optional properties

#### Event System

##### addListener()

```typescript
addListener(callback: PreferenceEventListener): () => void
```

Adds event listener.

**Parameters:**
- `callback` - Event callback function

**Returns:** Function to remove the listener

##### removeListener()

```typescript
removeListener(callback: PreferenceEventListener): void
```

Removes event listener.

**Parameters:**
- `callback` - Event callback function to remove

#### Import/Export

##### export()

```typescript
export(): ExportedPreferences
```

Exports preferences.

**Returns:** Exported preferences object

##### import()

```typescript
import(data: ExportedPreferences): boolean
```

Imports preferences.

**Parameters:**
- `data` - Exported preferences data

**Returns:** `boolean` - True if successful, false otherwise

#### Utility Methods

##### isDarkMode()

```typescript
isDarkMode(): boolean
```

Checks if dark mode is active.

**Returns:** `boolean`

##### getEffectiveDifficulty()

```typescript
getEffectiveDifficulty(): 'easy' | 'medium' | 'hard'
```

Gets effective difficulty level.

**Returns:** Effective difficulty level

##### shouldShowFeature()

```typescript
shouldShowFeature(feature: FeatureType): boolean
```

Checks if a feature should be shown.

**Parameters:**
- `feature` - Feature to check

**Returns:** `boolean`

##### getDebugInfo()

```typescript
getDebugInfo(): DebugInfo
```

Gets debug information.

**Returns:** Debug information object

### Interfaces

#### UserPreferencesData

```typescript
interface UserPreferencesData {
  // Language and direction settings
  nativeLanguage: 'bg' | 'de';
  learningDirection: 'bg-de' | 'de-bg';
  
  // UI preferences
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  animationsEnabled: boolean;
  soundEnabled: boolean;
  
  // Learning preferences
  sessionLength: number;
  difficultyLevel: 'easy' | 'medium' | 'hard' | 'adaptive';
  showCulturalContext: boolean;
  showEtymology: boolean;
  showExamples: boolean;
  
  // Spaced repetition settings
  easyMultiplier: number;
  hardMultiplier: number;
  intervalCap: number;
  
  // Practice settings
  practiceMode: 'flashcards' | 'typing' | 'multiple-choice' | 'mixed';
  showHints: boolean;
  autoPlayAudio: boolean;
  
  // Categories and levels
  preferredCategories: string[];
  preferredLevels: ('A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2')[];
  
  // Privacy and data
  analyticsEnabled: boolean;
  syncEnabled: boolean;
  
  // Accessibility
  highContrast: boolean;
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
  
  // Advanced settings
  debugMode: boolean;
  betaFeatures: boolean;
}
```

#### SpacedRepetitionSettings

```typescript
interface SpacedRepetitionSettings {
  easyMultiplier?: number;
  hardMultiplier?: number;
  intervalCap?: number;
}
```

#### ExportedPreferences

```typescript
interface ExportedPreferences {
  preferences: UserPreferencesData;
  version: string;
  exportedAt: string;
}
```

---

## Performance Monitor

**Module**: `assets/js/modules/performance-monitor.ts`

### Overview

Tracks Core Web Vitals, custom metrics, and performance analytics for the Bulgarian-German learning application with comprehensive monitoring and reporting capabilities.

### Classes

#### PerformanceMonitor

```typescript
class PerformanceMonitor {
  constructor()
}
```

### Methods

#### getMetrics()

```typescript
public getMetrics(): Metric[]
```

Gets all collected performance metrics.

**Returns:** `Metric[]` - Array of all performance metrics collected during the session

#### getWebVitals()

```typescript
public getWebVitals(): WebVitalsSummary
```

Gets Core Web Vitals metrics summary.

**Returns:** `WebVitalsSummary` - Object containing LCP, FID, CLS, FCP, and TTFB metrics

#### getSummary()

```typescript
public getSummary(): PerformanceSummary
```

Gets comprehensive performance summary with recommendations.

**Returns:** `PerformanceSummary` - Complete performance analysis including scores and recommendations

#### configure()

```typescript
public configure(options: Partial<PerformanceMonitorConfig>): void
```

Updates performance monitor configuration.

**Parameters:**
- `options` - Configuration options to update

#### destroy()

```typescript
public destroy(): void
```

Destroys the performance monitor and cleans up resources.

### Properties

#### sessionIdValue

```typescript
public get sessionIdValue(): string
```

Gets the unique session identifier.

**Returns:** `string`

#### monitorConfig

```typescript
public get monitorConfig(): Required<PerformanceMonitorConfig>
```

Gets the current monitor configuration.

**Returns:** `Required<PerformanceMonitorConfig>`

### Interfaces

#### PerformanceMonitorConfig

```typescript
interface PerformanceMonitorConfig {
  enableWebVitals?: boolean;
  enableCustomMetrics?: boolean;
  enableResourceTiming?: boolean;
  enableNavigationTiming?: boolean;
  sampleRate?: number;
  reportingEndpoint?: string | null;
  bufferSize?: number;
  reportingInterval?: number;
}
```

#### WebVitalsSummary

```typescript
interface WebVitalsSummary {
  LCP?: LCPMetric;
  FID?: FIDMetric;
  CLS?: CLSMetric;
  FCP?: FCPMetric;
  TTFB?: TTFBMetric;
}
```

#### PerformanceSummary

```typescript
interface PerformanceSummary {
  sessionId: string;
  webVitals: WebVitalsSummary;
  customMetricsCount: number;
  overallScore: number;
  recommendations: string[];
}
```

#### Metric Types

##### LCPMetric

```typescript
interface LCPMetric extends BaseMetric {
  value: number;
  element: string;
  url: string;
  rating: WebVitalsRating;
}
```

##### FIDMetric

```typescript
interface FIDMetric extends BaseMetric {
  value: number;
  eventType: string;
  rating: WebVitalsRating;
}
```

##### CLSMetric

```typescript
interface CLSMetric extends BaseMetric {
  value: number;
  entries: number;
  rating: WebVitalsRating;
}
```

##### VocabularyLoadTimeMetric

```typescript
interface VocabularyLoadTimeMetric extends BaseMetric {
  value: number;
  itemCount: number;
  rating: WebVitalsRating;
}
```

##### SearchPerformanceMetric

```typescript
interface SearchPerformanceMetric extends BaseMetric {
  query: string;
  resultCount: number;
  responseTime: number;
  rating: WebVitalsRating;
}
```

##### PracticeSessionMetric

```typescript
interface PracticeSessionMetric extends BaseMetric {
  duration: number;
  accuracy: number;
  itemCount: number;
  itemsPerMinute: number;
}
```

---

## Error Types

**Module**: `assets/js/modules/error-types.ts`

### Overview

Provides structured error handling with custom error types, retry strategies, and error factories for consistent error management across the application.

### Classes

#### ErrorFactory

```typescript
class ErrorFactory {
  static network(message: string, context?: any): NetworkError
  static parsing(message: string, expectedType: string, actualData: string, expectedFormat: string): ParsingError
  static validation(message: string, field: string, value: any, expectedType: string, validOptions?: string): ValidationError
  static fromError(error: any, context?: any): Error
}
```

#### RetryStrategy

```typescript
class RetryStrategy {
  constructor(maxRetries: number, baseDelay: number, maxDelay: number)
  recover<T>(error: Error, options: { retryFunction: () => Promise<T> }): Promise<T>
}
```

### Error Classes

#### NetworkError

```typescript
class NetworkError extends Error {
  constructor(message: string, statusCode?: number, url?: string, retryAfter?: number, retryCount?: number)
}
```

#### ParsingError

```typescript
class ParsingError extends Error {
  constructor(message: string, expectedType: string, actualData: string, expectedFormat: string)
}
```

#### ValidationError

```typescript
class ValidationError extends Error {
  constructor(message: string, field: string, value: any, expectedType: string, validOptions?: string)
}
```

---

## Loading State Manager

**Module**: `assets/js/modules/loading-state-manager.ts`

### Overview

Manages loading states across the application with progress tracking, chunk loading, and event-driven state updates.

### Classes

#### LoadingStateManager

```typescript
class LoadingStateManager {
  constructor()
}
```

### Methods

#### startLoading()

```typescript
startLoading(totalChunks: number, message: string): string
```

Starts a new loading operation.

**Parameters:**
- `totalChunks` - Number of chunks to load
- `message` - Loading message

**Returns:** `string` - Operation ID

#### updateStage()

```typescript
updateStage(operationId: string, stage: string): void
```

Updates the loading stage for an operation.

**Parameters:**
- `operationId` - Operation ID
- `stage` - New stage message

#### startChunk()

```typescript
startChunk(operationId: string, chunkId: string): void
```

Starts loading a specific chunk.

**Parameters:**
- `operationId` - Operation ID
- `chunkId` - Chunk identifier

#### updateChunkProgress()

```typescript
updateChunkProgress(operationId: string, chunkId: string, progress: number): void
```

Updates progress for a specific chunk.

**Parameters:**
- `operationId` - Operation ID
- `chunkId` - Chunk identifier
- `progress` - Progress percentage (0-100)

#### completeChunk()

```typescript
completeChunk(operationId: string, chunkId: string): void
```

Marks a chunk as completed.

**Parameters:**
- `operationId` - Operation ID
- `chunkId` - Chunk identifier

#### failChunk()

```typescript
failChunk(operationId: string, chunkId: string, error: Error): void
```

Marks a chunk as failed.

**Parameters:**
- `operationId` - Operation ID
- `chunkId` - Chunk identifier
- `error` - Error that caused the failure

#### subscribe()

```typescript
subscribe(callback: (event: LoadingEvent) => void): () => void
```

Subscribes to loading state events.

**Parameters:**
- `callback` - Event callback function

**Returns:** Function to unsubscribe

---

## Network Manager

**Module**: `assets/js/modules/network-manager.ts`

### Overview

Provides enhanced network request handling with timeout management, retry logic, and comprehensive error handling.

### Classes

#### NetworkManager

```typescript
class NetworkManager {
  constructor()
}
```

### Methods

#### fetch()

```typescript
fetch(url: string, options?: NetworkRequestOptions): Promise<Response>
```

Performs an enhanced network request with timeout and retry logic.

**Parameters:**
- `url` - Request URL
- `options` - Request options
  - `timeout?: number` - Request timeout in milliseconds
  - `retries?: number` - Number of retry attempts
  - `metadata?: any` - Request metadata

**Returns:** `Promise<Response>`

#### getStatistics()

```typescript
getStatistics(): NetworkStatistics
```

Gets network performance statistics.

**Returns:** `NetworkStatistics`

---

## Connectivity Manager

**Module**: `assets/js/modules/connectivity-manager.ts`

### Overview

Monitors network connectivity status and provides connection state management with event-driven updates.

### Classes

#### ConnectivityManager

```typescript
class ConnectivityManager {
  constructor()
}
```

### Methods

#### isOnline()

```typescript
isOnline(): boolean
```

Checks if the application is online.

**Returns:** `boolean`

#### getStatus()

```typescript
getStatus(): ConnectionStatus
```

Gets current connection status.

**Returns:** `ConnectionStatus`

#### subscribe()

```typescript
subscribe(callback: (status: ConnectionStatus) => void): () => void
```

Subscribes to connection status changes.

**Parameters:**
- `callback` - Status change callback

**Returns:** Function to unsubscribe

---

## Memory Manager

**Module**: `assets/js/modules/memory-manager.ts`

### Overview

Provides memory management with caching, cleanup, and pressure monitoring for optimal performance.

### Classes

#### MemoryManager

```typescript
class MemoryManager {
  constructor()
}
```

### Methods

#### set()

```typescript
set<T>(key: string, value: T, ttlMinutes?: number, metadata?: any): Promise<void>
```

Stores a value in memory cache with optional TTL.

**Parameters:**
- `key` - Cache key
- `value` - Value to store
- `ttlMinutes` - Time to live in minutes
- `metadata` - Optional metadata

#### get()

```typescript
get<T>(key: string): Promise<T | null>
```

Retrieves a value from memory cache.

**Parameters:**
- `key` - Cache key

**Returns:** `Promise<T | null>`

#### clear()

```typescript
clear(): Promise<void>
```

Clears all memory cache.

#### getStatistics()

```typescript
getStatistics(): MemoryStatistics
```

Gets memory usage statistics.

**Returns:** `MemoryStatistics`

#### forceCleanup()

```typescript
forceCleanup(priority: 'low' | 'medium' | 'high'): Promise<void>
```

Forces cleanup of memory cache based on priority.

**Parameters:**
- `priority` - Cleanup priority level

---

## Error Logger

**Module**: `assets/js/modules/error-logger.ts`

### Overview

Provides comprehensive error logging with categorization, context tracking, and persistent storage.

### Classes

#### ErrorLogger

```typescript
class ErrorLogger {
  constructor()
}
```

### Methods

#### error()

```typescript
error(message: string, error?: Error, context?: any, category?: string): void
```

Logs an error message.

**Parameters:**
- `message` - Error message
- `error` - Error object
- `context` - Additional context
- `category` - Error category

#### warn()

```typescript
warn(message: string, context?: any, category?: string): void
```

Logs a warning message.

**Parameters:**
- `message` - Warning message
- `context` - Additional context
- `category` - Warning category

#### info()

```typescript
info(message: string, context?: any, category?: string): void
```

Logs an info message.

**Parameters:**
- `message` - Info message
- `context` - Additional context
- `category` - Info category

#### debug()

```typescript
debug(message: string, context?: any, category?: string): void
```

Logs a debug message.

**Parameters:**
- `message` - Debug message
- `context` - Additional context
- `category` - Debug category

#### logVocabularyError()

```typescript
logVocabularyError(error: Error, operation: string, context?: any): void
```

Logs vocabulary-specific errors with enhanced context.

**Parameters:**
- `error` - Error object
- `operation` - Operation being performed
- `context` - Additional context

#### logNetworkOperation()

```typescript
logNetworkOperation(operation: string, url: string, method: string, context?: any): void
```

Logs network operations for debugging.

**Parameters:**
- `operation` - Operation name
- `url` - Request URL
- `method` - HTTP method
- `context` - Additional context

#### logLoadingState()

```typescript
logLoadingState(operationId: string, state: string, progress?: number, context?: any): void
```

Logs loading state changes.

**Parameters:**
- `operationId` - Loading operation ID
- `state` - Loading state
- `progress` - Progress percentage
- `context` - Additional context

#### getLogs()

```typescript
getLogs(category?: string, limit?: number): ErrorLogEntry[]
```

Gets logged entries with optional filtering.

**Parameters:**
- `category` - Filter by category
- `limit` - Maximum number of entries

**Returns:** `ErrorLogEntry[]`

#### clearLogs()

```typescript
clearLogs(category?: string): void
```

Clears logged entries.

**Parameters:**
- `category` - Category to clear (optional)

---

## Usage Examples

### Basic API Client Usage

```typescript
import apiClient from './modules/api-client.js';

// Get vocabulary with filtering
const vocabulary = await apiClient.getVocabulary({
  page: 1,
  limit: 20,
  category: 'verbs',
  level: 'A1'
});

// Search for content
const searchResults = await apiClient.search('hello', {
  type: 'vocabulary',
  limit: 10
});

// Get performance metrics
const metrics = apiClient.getMetrics();
console.log(`Cache hit rate: ${metrics.cacheHitRate}`);
```

### Vocabulary API Usage

```typescript
import vocabularyAPI from './modules/vocabulary-api.js';

// Load vocabulary by level
const a1Vocabulary = await vocabularyAPI.loadByLevel('A1');

// Load vocabulary by category
const verbs = await vocabularyAPI.loadByCategory('verbs');

// Get memory statistics
const stats = vocabularyAPI.getMemoryStats();
console.log(`Loaded chunks: ${stats.loadedChunks}`);
```

### Service Worker Usage

```typescript
import serviceWorkerManager from './modules/service-worker.js';

// Check if PWA is installed
if (serviceWorkerManager.isInstalled()) {
  console.log('App is installed as PWA');
}

// Check for updates
if (serviceWorkerManager.hasUpdateAvailable) {
  console.log('Update available');
}

// Clear cache if needed
await serviceWorkerManager.clearCache();
```

### User Preferences Usage

```typescript
import userPreferences from './modules/user-preferences.js';

// Set native language
userPreferences.setNativeLanguage('bg');

// Configure learning preferences
userPreferences.set({
  sessionLength: 25,
  difficultyLevel: 'adaptive',
  showCulturalContext: true
});

// Listen for preference changes
const unsubscribe = userPreferences.addListener((event, data) => {
  console.log('Preference changed:', event, data);
});
```

### Performance Monitor Usage

```typescript
import performanceMonitor from './modules/performance-monitor.js';

// Get performance summary
const summary = performanceMonitor.getSummary();
console.log(`Overall score: ${summary.overallScore}`);
console.log('Recommendations:', summary.recommendations);

// Get Web Vitals
const webVitals = performanceMonitor.getWebVitals();
if (webVitals.LCP) {
  console.log(`LCP: ${webVitals.LCP.value}ms (${webVitals.LCP.rating})`);
}
```

### Error Handling Usage

```typescript
import { ErrorFactory, RetryStrategy } from './modules/error-types.js';

// Create custom error
const error = ErrorFactory.network('Failed to fetch data', {
  url: '/api/vocabulary',
  statusCode: 500
});

// Use retry strategy
const retryStrategy = new RetryStrategy(3, 1000, 10000);
const result = await retryStrategy.recover(error, {
  retryFunction: async () => {
    return await fetch('/api/vocabulary');
  }
});
```

---

## Best Practices

### Error Handling

1. Always use structured error types from `error-types.ts`
2. Implement retry logic for network operations
3. Log errors with context using `error-logger.ts`
4. Provide fallback behavior when possible

### Performance Monitoring

1. Monitor vocabulary loading times
2. Track search performance
3. Measure practice session metrics
4. Use Web Vitals for core performance indicators

### Memory Management

1. Use memory manager for caching with TTL
2. Monitor memory pressure
3. Implement cleanup strategies
4. Use lazy loading for large datasets

### User Preferences

1. Validate all preference values
2. Provide sensible defaults
3. Use event-driven updates
4. Persist preferences to localStorage

### Service Worker

1. Handle offline scenarios gracefully
2. Implement background sync
3. Provide update notifications
4. Monitor connection status

---

## TypeScript Support

All modules are fully typed with TypeScript. The following types are commonly used:

- `VocabularyItem` - Vocabulary data structure
- `GrammarItem` - Grammar data structure
- `PracticeItem` - Practice session data
- `UserPreferencesData` - User preferences structure
- `PerformanceSummary` - Performance metrics summary
- `WebVitalsSummary` - Core Web Vitals data
- `Error` - Base error class
- `LoadingEvent` - Loading state events

---

## Contributing

When adding new modules or updating existing ones:

1. Follow the established documentation format
2. Include comprehensive JSDoc comments
3. Provide usage examples
4. Add TypeScript interfaces for all data structures
5. Include error handling and validation
6. Add performance monitoring where appropriate
7. Update this documentation file

---

## Version History

- **v1.0.0** - Initial API documentation
- **v1.1.0** - Added performance monitoring and error handling
- **v1.2.0** - Enhanced service worker and PWA functionality
- **v1.3.0** - Added comprehensive TypeScript support