# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Enhanced architecture documentation
- Comprehensive developer onboarding guide
- Architectural testing strategy
- Known issues documentation

## [2.0.0] - 2025-12-10 - Codebase Refinement
### ⚠️ BREAKING CHANGES
- Complete architecture overhaul with state separation
- New dependency injection system
- Event-based communication pattern
- Enhanced error handling system

### Added
- **State Management Architecture**:
  - `AppUIState` for UI-specific state management
  - `AppDataState` for persistent data management
  - Backward-compatible `AppState` facade
  - Svelte 5 Runes integration (`$state`, `$derived`, `$effect`)

- **Dependency Injection System**:
  - Centralized DI container (`src/lib/services/di-container.ts`)
  - Service registration and retrieval
  - Initialization sequence management
  - Service lifecycle management

- **Event Bus System**:
  - Decoupled event-based communication (`src/lib/services/event-bus.ts`)
  - Event types for common application events
  - Subscription management with cleanup
  - Event payload types and interfaces

- **Error Handling Improvements**:
  - Custom error classes for different domains
  - Centralized error handler with event emission
  - Consistent error reporting across services
  - Defensive programming patterns

- **Architectural Testing**:
  - State separation tests
  - Dependency injection tests
  - Event bus functionality tests
  - Error handling tests
  - Circular dependency elimination tests

- **Progress Tracking Enhancements**:
  - Comprehensive progress service with XP and leveling
  - Vocabulary mastery tracking
  - Lesson progress tracking
  - Quiz performance tracking
  - Daily progress tracking
  - Streak management

- **Lesson Generation System**:
  - Dynamic lesson generation from criteria
  - Template-based lesson creation
  - Cultural grammar integration
  - Lesson validation and fallback mechanisms

- **Data Architecture Improvements**:
  - Robust data validation pipeline
  - Schema validation with Zod
  - Data migration system
  - Error recovery mechanisms

### Changed
- **State Management**:
  - Migrated from monolithic state to separated UI/Data state
  - Eliminated circular dependencies between services
  - Consolidated state duplication to single sources of truth
  - Improved state persistence with validation

- **Service Architecture**:
  - Refactored services to use dependency injection
  - Implemented event-based communication between services
  - Enhanced error handling across all services
  - Improved service initialization sequence

- **Testing Strategy**:
  - Added architectural tests to ensure pattern integrity
  - Enhanced unit test coverage for business logic
  - Improved component testing with Playwright CT
  - Added accessibility testing with axe-core

- **Documentation**:
  - Updated architecture documentation to reflect new patterns
  - Enhanced developer onboarding guide
  - Added comprehensive changelog
  - Created known issues documentation

### Fixed
- Circular dependencies between `ProgressService` and `LearningSession`
- State duplication issues with XP tracking
- Error handling inconsistencies across services
- Data persistence issues with localStorage
- Initialization sequence problems

### Improved
- **Performance**: Optimized state management for faster reactivity
- **Maintainability**: Clean architecture with separation of concerns
- **Testability**: Decoupled services for easier testing
- **Error Handling**: Consistent error reporting and recovery
- **Developer Experience**: Comprehensive documentation and onboarding

### Migration Notes
1. **State Access**: Update components to use the new state management system:
   ```typescript
   // Old: Direct access to monolithic state
   import { appState } from '$lib/state/app.svelte';
   const languageMode = appState.languageMode;

   // New: Separated state access
   import { appUIState, appDataState } from '$lib/state/app.svelte';
   const languageMode = appUIState.languageMode;
   const favorites = appDataState.favorites;
   ```

2. **Service Access**: Update service usage to use dependency injection:
   ```typescript
   // Old: Direct service instantiation
   const progressService = new ProgressService();

   // New: Service access through DI container
   import { getProgressService } from '$lib/services/di-container';
   const progressService = getProgressService();
   ```

3. **Event Communication**: Replace direct service calls with event-based communication:
   ```typescript
   // Old: Direct service calls
   progressService.recordPracticeResult(itemId, correct);

   // New: Event-based communication
   import { eventBus, EventTypes } from '$lib/services/event-bus';
   await eventBus.emit(EventTypes.PRACTICE_RESULT, {
     itemId,
     correct,
     timestamp: new Date()
   });
   ```

4. **Error Handling**: Update error handling to use the new error classes:
   ```typescript
   // Old: Generic error handling
   try {
     // code
   } catch (error) {
     console.error(error);
   }

   // New: Consistent error handling
   import { ErrorHandler } from '$lib/services/errors';
   try {
     // code
   } catch (error) {
     ErrorHandler.handleError(error, 'Operation failed');
   }
   ```

5. **Initialization**: Update application initialization:
   ```typescript
   // Old: Simple initialization
   appState.init();

   // New: Proper initialization sequence
   import { initializeAppState } from '$lib/state/app.svelte';
   await initializeAppState();
   ```

## [1.0.0] - 2025-11-15 - Initial Release
### Added
- Core vocabulary learning functionality
- Flashcard system with German-Bulgarian translation
- Basic search functionality
- Lesson planning system
- Initial data architecture
- Basic state management
- Unit and component testing

### Known Issues (as of 2.0.0)
- See [`KNOWN_ISSUES.md`](development/KNOWN_ISSUES.md) for current known issues and technical debt