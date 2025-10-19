# JavaScript Modules Documentation

**Purpose**: Central registry of all JavaScript modules in the Bulgarian-German Learning App

---

## Module Architecture

### Core Modules (Top-level)

These are the **actively maintained** modules used by the application:

| Module | Size | Status | Used By | Purpose |
|--------|------|--------|---------|---------|
| `flashcards.js` | 26KB | ✅ **ACTIVE** | practice pages | Main flashcard system with SM-2 integration |
| `spaced-repetition.js` | 13KB | ✅ **ACTIVE** | flashcards, practice | SM-2 algorithm implementation |
| `vocab-cards.js` | 12KB | ✅ **ACTIVE** | vocabulary shortcode | Interactive vocabulary card display |
| `practice.js` | 14KB | ✅ **ACTIVE** | practice pages | Practice session management |
| `vocabulary.js` | 9KB | ✅ **ACTIVE** | vocabulary pages | Vocabulary browsing and filtering |
| `grammar.js` | 9KB | ✅ **ACTIVE** | grammar pages | Grammar rules display |
| `app.js` | 9KB | ✅ **ACTIVE** | global | Main app initialization |
| `language-toggle.js` | 13KB | ✅ **ACTIVE** | global | Bidirectional language switching |
| `speech-recognition.js` | 2KB | ✅ **ACTIVE** | flashcards | Speech practice integration |
| `home.js` | 2KB | ✅ **ACTIVE** | homepage | Homepage-specific interactions |
| `code.js` | 0.8KB | ✅ **ACTIVE** | code blocks | Syntax highlighting support |

### Enhanced Modules

Extended functionality built on top of core modules for bidirectional learning:

| Module | Size | Status | Extends | Used By | Purpose |
|--------|------|--------|---------|---------|---------|
| `enhanced-bidirectional-system.js` | 15KB | ✅ **ACTIVE** | language-toggle | vocabulary/list.html, practice/single.html | Direction-aware learning features, difficulty multipliers (BG→DE: 1.2x, DE→BG: 1.1x) |
| `enhanced-practice-session.js` | 10KB | ✅ **ACTIVE** | practice.js | practice/single.html | Bidirectional flashcard practice with cultural context |
| `enhanced-spaced-repetition.js` | 4KB | ✅ **ACTIVE** | spaced-repetition.js | practice/single.html | Direction-aware SM-2 algorithm with multipliers |
| `enhanced-vocab-cards.js` | 2KB | ✅ **ACTIVE** | vocab-cards.js | vocabulary/list.html | Cultural context display in vocabulary cards |

**Status**: ✅ **VERIFIED** - All enhanced modules are actively used in production templates for bidirectional learning (Vincent & Ida user personas). These implement the core bidirectional features specified in `docs/archive/plans/BIDIRECTIONAL_IMPLEMENTATION_PLAN.md`.

### Deprecated Modules (Removed)

| Module | Reason | Replacement | Status |
|--------|--------|-------------|--------|
| `practice-simple.js` | Simplified version no longer needed | `practice.js` | ✅ **DELETED** (Oct 19, 2025) |
| `spaced-repetition-simple.js` | Old implementation | `spaced-repetition.js` | ✅ **DELETED** (Oct 19, 2025) |
| `vocabulary-simple.js` | Superseded by main implementation | `vocabulary.js` | ✅ **DELETED** (Oct 19, 2025) |
| `vocabulary-old.js` | Legacy code | `vocabulary.js` | ✅ **DELETED** (Oct 19, 2025) |

### Specialized Modules

| Module | Size | Status | Purpose |
|--------|------|--------|---------|
| `bidirectional-flashcards.js` | 8KB | ✅ **ACTIVE** | Core bidirectional flashcard features (separate from enhanced-practice-session.js) |
| `vocabulary-adapter.js` | 2KB | ✅ **ACTIVE** | Backward compatibility adapter for legacy vocabulary data |
| `cultural-context-toggle.js` | 4KB | ✅ **ACTIVE** | Toggle control for etymology and cultural notes |
| `onboarding.js` | 8KB | ✅ **ACTIVE** | User onboarding flow for Vincent & Ida personas |
| `language-toggle-confirmation.js` | 3KB | ✅ **ACTIVE** | Confirmation modal for direction switching |
| `session-stats-dashboard.js` | 23KB | ✅ **ACTIVE** | Statistics dashboard and progress tracking |

---

## Modules Subfolder

Organized feature modules under `modules/`:

| Module | Size | Status | Purpose |
|--------|------|--------|---------|
| `api-client.js` | 11KB | ❓ **AUDIT** | API communication layer |
| `learning-session.js` | 15KB | ❓ **AUDIT** | Learning session management |
| `performance-monitor.js` | 17KB | ❓ **AUDIT** | Performance tracking |
| `practice-page.js` | 25KB | ❓ **AUDIT** | Practice page orchestration |
| `search-engine.js` | 18KB | ❓ **AUDIT** | Search functionality |
| `service-worker.js` | 11KB | ❓ **AUDIT** | PWA service worker utilities |
| `user-preferences.js` | 11KB | ❓ **AUDIT** | User settings management |
| `vocabulary-page.js` | 14KB | ❓ **AUDIT** | Vocabulary page orchestration |

**Status**: ❓ Requires import analysis to determine if these are actively used or redundant with top-level modules.

---

## Import Guidelines

### Standard Import Pattern

```javascript
// ES module import from top-level
import { Flashcards } from '/assets/js/flashcards.js';

// ES module import from modules/
import { APIClient } from '/assets/js/modules/api-client.js';
```

### Hugo Template Integration

```html
<script type="module">
  import { VocabCards } from '/assets/js/vocab-cards.js';
  
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.vocab-container');
    new VocabCards(container);
  });
</script>
```

---

## File Naming Conventions

| Pattern | Purpose | Example |
|---------|---------|---------|
| `feature.js` | Core feature module | `flashcards.js` |
| `enhanced-feature.js` | Extended functionality | `enhanced-practice-session.js` |
| `feature-simple.js` | ❌ **DEPRECATED** - Simplified version | `practice-simple.js` |
| `feature-old.js` | ❌ **DEPRECATED** - Legacy code | `vocabulary-old.js` |
| `feature-adapter.js` | Compatibility layer | `vocabulary-adapter.js` |

---

## Code Standards

### Required File Header

Every JavaScript module should include:

```javascript
/**
 * @file flashcards.js
 * @description Core flashcard system with SM-2 spaced repetition integration
 * @status ACTIVE | REVIEW | DEPRECATED
 * @replaces None (current implementation) | [old-file.js]
 * @dependencies spaced-repetition.js, language-toggle.js
 * @used_by layouts/practice/single.html, layouts/_shortcodes/flashcards.html
 * @see docs/ARCHITECTURE.md for system design
 * @version 2.0.0
 * @updated October 2025
 */
```

### Export Patterns

**Preferred** (named exports):
```javascript
export class Flashcards { /* ... */ }
export function initFlashcards() { /* ... */ }
```

**Legacy** (default exports):
```javascript
export default class Flashcards { /* ... */ }
```

**Recommendation**: Migrate to named exports for better tree-shaking.

---

## localStorage Conventions

All modules use the `bgde:` prefix for localStorage keys:

| Key Pattern | Purpose | Example |
|-------------|---------|---------|
| `bgde:review-state:{id}` | Spaced repetition state | `bgde:review-state:zdravei` |
| `bgde:session-stats` | Session statistics | `bgde:session-stats` |
| `bgde:preferences` | User preferences | `bgde:preferences` |
| `bgde:language-direction` | Current language direction | `bgde:language-direction` |

**See**: `docs/API.md` for full schema documentation.

---

## Testing

### Unit Testing
Currently **not implemented**. Planned addition:
- Framework: Vitest or Jest
- Location: `tests/unit/js/`
- Coverage target: >80% for core modules

### E2E Testing
- Framework: Playwright
- Location: `tests/playwright/`
- Status: ✅ Configured

### Manual Testing Checklist
- [ ] Flashcard flip animations work
- [ ] Keyboard shortcuts respond (Space/Enter to flip, 1-5 to grade)
- [ ] Language toggle persists across page loads
- [ ] Speech recognition works in supported browsers
- [ ] Offline mode functions with service worker
- [ ] Progress persists in localStorage

---

## Deprecation Policy

### Before Removing a Module:

1. ✅ **Confirm no imports**: `grep -r "import.*filename" layouts/ assets/`
2. ✅ **Check Hugo templates**: Search shortcodes and partials
3. ✅ **Test build**: `npm run build && npm test`
4. ✅ **Document removal**: Update this README and CHANGELOG
5. ✅ **Git remove**: `git rm assets/js/deprecated-file.js`

### Deprecation Notice

Add to deprecated files before removal:

```javascript
/**
 * @deprecated This module is deprecated and will be removed in v3.0.0
 * @use flashcards.js instead
 * @removal_date 2025-12-01
 */
console.warn('[DEPRECATED] practice-simple.js is deprecated. Use practice.js instead.');
```

---

## Migration Guide

### From *-simple.js to Core Modules

If you're using deprecated simple modules, update imports:

**Before**:
```javascript
import { Practice } from '/assets/js/practice-simple.js';
```

**After**:
```javascript
import { Practice } from '/assets/js/practice.js';
```

**Breaking Changes**: None expected - API compatibility maintained.

---

## Maintenance Checklist

- [ ] All modules have file headers
- [ ] Deprecated modules removed after 3-month notice
- [ ] Enhanced modules reviewed (merge or document)
- [ ] Modules/ subfolder usage audited
- [ ] Import graph documented
- [ ] Unit tests added for new modules
- [ ] This README updated with new modules

---

## Resolved Questions (October 19, 2025)

1. ✅ **Enhanced modules**: Kept separate - they extend core modules for bidirectional features. Used in production.
2. ⚠️ **Modules/ subfolder**: Still needs import analysis to verify active usage.
3. ✅ **bidirectional-flashcards.js**: Works alongside flashcards.js, handles direction switching logic.
4. ✅ **session-stats-dashboard.js**: Active component for displaying learning statistics.

## Remaining Questions

1. **Modules/ subfolder**: Are api-client.js, learning-session.js, etc. actively imported?
2. **Module consolidation**: Should we consolidate modules/ into top-level if duplicates found?

**Next Action**: Run import analysis: `grep -r "import.*modules/" layouts/ assets/js/`

---

**Last Updated**: October 19, 2025  
**Maintained By**: Development Team  
**Change Log**:
- Oct 19, 2025: Verified enhanced modules are active, deleted deprecated *-simple.js and vocabulary-old.js files, updated specialized modules list
- Oct 17, 2025: Initial comprehensive module documentation created

**See Also**: 
- `docs/REPOSITORY_AUDIT_AND_CLEANUP_PLAN.md`
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/archive/plans/BIDIRECTIONAL_IMPLEMENTATION_PLAN.md`
- `docs/archive/implementation-reports/INTEGRATION_COMPLETE.md`
