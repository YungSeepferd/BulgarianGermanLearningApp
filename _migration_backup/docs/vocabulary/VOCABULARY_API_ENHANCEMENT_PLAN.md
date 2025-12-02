# Vocabulary API Enhancement Plan

## Overview

This document outlines the comprehensive enhancement of the vocabulary API with improved error handling and loading states. The enhancement will create a robust foundation for the Bulgarian-German learning application, ensuring reliable data loading, graceful error recovery, and excellent user experience.

## Current State Analysis

### Existing Implementation
- **vocabulary-api.ts**: Basic chunked loading with simple try-catch error handling
- **vocabulary-manager.ts**: localStorage operations with minimal error reporting
- **Error Handling**: Basic console logging and generic error messages
- **Loading States**: No progress tracking or loading state management

### Identified Issues
1. **Poor Error Classification**: No structured error types for different failure scenarios
2. **No Loading States**: Users cannot see progress during data loading
3. **Limited Retry Logic**: Failed requests are not retried with backoff strategies
4. **No Timeout Handling**: Network requests can hang indefinitely
5. **No Offline Detection**: No fallback strategies for poor connectivity
6. **Memory Management**: No monitoring of cache size or memory pressure
7. **Poor Debugging**: Limited error context for troubleshooting

## Enhancement Strategy

### Phase 1: Foundation - Structured Error System

#### 1.1 Error Type Hierarchy
```typescript
// Base error class for all vocabulary operations
abstract class VocabularyError extends Error {
  abstract readonly code: string;
  abstract readonly category: 'network' | 'validation' | 'storage' | 'parsing';
  readonly timestamp: Date;
  readonly context: Record<string, unknown>;

  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message);
    this.timestamp = new Date();
    this.context = context;
  }
}

// Specific error types
class NetworkError extends VocabularyError {
  readonly code = 'NETWORK_ERROR';
  readonly category = 'network';
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly retryable: boolean = true,
    context: Record<string, unknown> = {}
  ) {
    super(message, context);
  }
}

class ValidationError extends VocabularyError {
  readonly code = 'VALIDATION_ERROR';
  readonly category = 'validation';
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: unknown,
    context: Record<string, unknown> = {}
  ) {
    super(message, context);
  }
}

class StorageError extends VocabularyError {
  readonly code = 'STORAGE_ERROR';
  readonly category = 'storage';
  constructor(
    message: string,
    public readonly operation: 'read' | 'write' | 'clear',
    context: Record<string, unknown> = {}
  ) {
    super(message, context);
  }
}

class ParsingError extends VocabularyError {
  readonly code = 'PARSING_ERROR';
  readonly category = 'parsing';
  constructor(
    message: string,
    public readonly dataType: string,
    public readonly rawData?: string,
    context: Record<string, unknown> = {}
  ) {
    super(message, context);
  }
}
```

#### 1.2 Error Recovery Strategies
```typescript
interface ErrorRecoveryStrategy {
  canRecover(error: VocabularyError): boolean;
  recover(error: VocabularyError): Promise<unknown>;
}

class RetryStrategy implements ErrorRecoveryStrategy {
  constructor(
    private maxRetries: number = 3,
    private baseDelay: number = 1000
  ) {}

  canRecover(error: VocabularyError): boolean {
    return error.category === 'network' && 
           (error as NetworkError).retryable;
  }

  async recover(error: VocabularyError): Promise<unknown> {
    // Exponential backoff implementation
  }
}
```

### Phase 2: Loading State Management

#### 2.1 Loading State Interface
```typescript
interface LoadingState {
  isLoading: boolean;
  progress: number; // 0-100
  stage: string;
  startTime: Date;
  estimatedTimeRemaining?: number;
  chunks: Map<string, ChunkLoadingState>;
}

interface ChunkLoadingState {
  status: 'pending' | 'loading' | 'completed' | 'failed' | 'retrying';
  progress: number;
  error?: VocabularyError;
  retryCount: number;
  startTime: Date;
  endTime?: Date;
}
```

#### 2.2 Progress Tracking System
```typescript
class LoadingStateManager {
  private states: Map<string, LoadingState> = new Map();
  private listeners: Set<(state: LoadingState) => void> = new Set();

  startLoading(operationId: string, totalChunks: number): void {
    // Initialize loading state
  }

  updateProgress(operationId: string, chunkId: string, progress: number): void {
    // Update chunk progress and calculate overall progress
  }

  completeChunk(operationId: string, chunkId: string): void {
    // Mark chunk as completed
  }

  failChunk(operationId: string, chunkId: string, error: VocabularyError): void {
    // Handle chunk failure with retry logic
  }

  subscribe(listener: (state: LoadingState) => void): () => void {
    // Subscribe to loading state changes
  }
}
```

### Phase 3: Network Resilience

#### 3.1 Timeout and Retry Logic
```typescript
class NetworkManager {
  private defaultTimeout = 10000; // 10 seconds
  private retryStrategy = new RetryStrategy();

  async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout: number = this.defaultTimeout
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw new NetworkError(
        `Network request failed: ${(error as Error).message}`,
        undefined,
        true,
        { url, timeout }
      );
    }
  }

  async fetchWithRetry(
    url: string,
    options: RequestInit = {},
    maxRetries: number = 3
  ): Promise<Response> {
    // Implement retry logic with exponential backoff
  }
}
```

#### 3.2 Offline Detection
```typescript
class ConnectivityManager {
  private isOnline = navigator.onLine;
  private listeners: Set<(online: boolean) => void> = new Set();

  constructor() {
    window.addEventListener('online', () => this.handleConnectivityChange(true));
    window.addEventListener('offline', () => this.handleConnectivityChange(false));
  }

  private handleConnectivityChange(online: boolean): void {
    this.isOnline = online;
    this.notifyListeners(online);
  }

  async checkConnectivity(): Promise<boolean> {
    try {
      const response = await fetch('/data/vocab/index.json', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  subscribe(listener: (online: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
```

### Phase 4: Memory Management

#### 4.1 Cache Monitoring
```typescript
class MemoryManager {
  private maxCacheSize = 50 * 1024 * 1024; // 50MB
  private warningThreshold = 0.8; // 80%

  checkMemoryPressure(): { pressure: 'low' | 'medium' | 'high'; usage: number } {
    const usage = this.calculateCacheSize();
    const pressure = usage > this.maxCacheSize * this.warningThreshold ? 'high' :
                    usage > this.maxCacheSize * 0.6 ? 'medium' : 'low';
    return { pressure, usage };
  }

  private calculateCacheSize(): number {
    // Calculate total cache size in bytes
  }

  async cleanupCache(): Promise<void> {
    // Remove least recently used chunks
  }
}
```

### Phase 5: Enhanced Vocabulary API

#### 5.1 Updated VocabularyAPI Class
```typescript
class EnhancedVocabularyAPI extends VocabularyAPI {
  private loadingManager = new LoadingStateManager();
  private networkManager = new NetworkManager();
  private connectivityManager = new ConnectivityManager();
  private memoryManager = new MemoryManager();

  async loadChunk(fileName: string): Promise<VocabularyEntry[]> {
    const operationId = `load-${fileName}-${Date.now()}`;
    
    try {
      this.loadingManager.startLoading(operationId, 1);
      
      // Check connectivity
      if (!await this.connectivityManager.checkConnectivity()) {
        throw new NetworkError('Offline - cannot load vocabulary data', undefined, false);
      }

      // Check memory pressure
      const { pressure } = this.memoryManager.checkMemoryPressure();
      if (pressure === 'high') {
        await this.memoryManager.cleanupCache();
      }

      // Load with timeout and retry
      const response = await this.networkManager.fetchWithRetry(
        `${this.basePath}${fileName}`
      );

      const entries = await this.parseVocabularyData(response, fileName);
      
      this.loadingManager.completeChunk(operationId, fileName);
      return entries;

    } catch (error) {
      const vocabError = this.normalizeError(error);
      this.loadingManager.failChunk(operationId, fileName, vocabError);
      throw vocabError;
    }
  }

  private normalizeError(error: unknown): VocabularyError {
    if (error instanceof VocabularyError) {
      return error;
    }
    
    if (error instanceof Error) {
      return new NetworkError(error.message, undefined, true, { originalError: error });
    }
    
    return new VocabularyError('Unknown error occurred', { originalError: error });
  }
}
```

### Phase 6: UI Integration

#### 6.1 Loading State Events
```typescript
interface VocabularyLoadingEvent {
  type: 'loading-started' | 'loading-progress' | 'loading-completed' | 'loading-failed';
  operationId: string;
  progress?: number;
  stage?: string;
  error?: VocabularyError;
}

class VocabularyUIManager {
  constructor(private vocabularyAPI: EnhancedVocabularyAPI) {
    this.subscribeToLoadingEvents();
  }

  private subscribeToLoadingEvents(): void {
    this.vocabularyAPI.onLoadingEvent((event: VocabularyLoadingEvent) => {
      this.handleLoadingEvent(event);
    });
  }

  private handleLoadingEvent(event: VocabularyLoadingEvent): void {
    switch (event.type) {
      case 'loading-started':
        this.showLoadingIndicator(event.stage || 'Loading vocabulary...');
        break;
      case 'loading-progress':
        this.updateProgress(event.progress || 0);
        break;
      case 'loading-completed':
        this.hideLoadingIndicator();
        break;
      case 'loading-failed':
        this.showError(event.error);
        break;
    }
  }
}
```

## Implementation Timeline

### Week 1: Foundation
- [ ] Create structured error types and classes
- [ ] Implement error recovery strategies
- [ ] Add comprehensive error logging
- [ ] Write unit tests for error handling

### Week 2: Loading States
- [ ] Implement loading state management system
- [ ] Add progress tracking for chunk loading
- [ ] Create loading state event system
- [ ] Write integration tests for loading states

### Week 3: Network Resilience
- [ ] Add timeout handling and retry mechanisms
- [ ] Implement offline detection
- [ ] Add network error classification
- [ ] Write network resilience tests

### Week 4: Memory Management & Integration
- [ ] Implement memory pressure monitoring
- [ ] Add cache cleanup strategies
- [ ] Integrate with existing vocabulary-manager.ts
- [ ] Create UI components for loading states
- [ ] Write end-to-end tests

## Testing Strategy

### Unit Tests
- Error type creation and classification
- Loading state management
- Network retry logic
- Memory management

### Integration Tests
- Vocabulary API with enhanced error handling
- Loading state UI integration
- Offline fallback behavior
- Memory pressure scenarios

### End-to-End Tests
- Complete vocabulary loading workflow
- Error recovery scenarios
- Performance under poor network conditions
- Memory usage under load

## Performance Considerations

### Metrics to Monitor
- Loading time for vocabulary chunks
- Memory usage patterns
- Error recovery success rates
- User experience during loading

### Optimization Targets
- < 2 seconds for initial vocabulary load
- < 500ms for chunk loading
- < 50MB memory usage for cache
- < 5% error rate in normal conditions

## Backward Compatibility

### API Compatibility
- Maintain existing public method signatures
- Add optional parameters for new features
- Provide migration guide for breaking changes

### Data Compatibility
- Support existing vocabulary data format
- Gradual migration to enhanced error handling
- Fallback to original behavior for unsupported features

## Documentation Updates

### Technical Documentation
- API reference with error types
- Error handling best practices
- Loading state integration guide
- Performance optimization guide

### User Documentation
- Loading state indicators
- Error message explanations
- Troubleshooting guide
- Accessibility considerations

## Success Criteria

### Functional Requirements
- [ ] All vocabulary operations have structured error handling
- [ ] Loading states are visible and informative
- [ ] Network failures are handled gracefully
- [ ] Memory usage stays within acceptable limits
- [ ] Offline scenarios have appropriate fallbacks

### Non-Functional Requirements
- [ ] Error recovery is transparent to users
- [ ] Loading performance is maintained or improved
- [ ] Code coverage remains above 80%
- [ ] All quality gates pass
- [ ] Accessibility standards are maintained

## Risk Mitigation

### Technical Risks
- **Complexity**: Incremental implementation with thorough testing
- **Performance**: Continuous monitoring and optimization
- **Compatibility**: Comprehensive backward compatibility testing

### User Experience Risks
- **Confusion**: Clear error messages and loading indicators
- **Frustration**: Graceful degradation and quick recovery
- **Accessibility**: Screen reader support and keyboard navigation

## Conclusion

This enhancement plan provides a comprehensive approach to improving the vocabulary API's error handling and loading states. The phased implementation ensures manageable development cycles while maintaining system stability and user experience. The resulting system will be more robust, user-friendly, and maintainable for future development.