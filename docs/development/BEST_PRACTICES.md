# Development Best Practices

**Comprehensive development guidelines for the Bulgarian-German Learning App**  
*Consolidates: DEVELOPMENT.md, CONTRIBUTING.md, development-notes.md, guides/AGENTS.md*

---

## Overview

This guide establishes development standards, workflows, and best practices for maintaining high code quality and consistent development practices across the Bulgarian-German Learning App.

## Development Stack

### Core Technologies
- **Hugo Extended v0.128.0+** - Static site generator with SCSS support
- **Vanilla JavaScript ES Modules** - No external frameworks, modern browser APIs
- **SCSS** - CSS preprocessing with Hugo Pipes compilation
- **Go v1.21+** - Utility tools in `tools/` directory
- **Node.js v18+** - Build scripts and testing utilities

### Architecture Principles
- **Offline-first**: PWA with service worker for offline functionality
- **Progressive enhancement**: Core functionality works without JavaScript
- **Performance-focused**: Minimal dependencies, optimized builds
- **Accessibility-first**: ARIA compliance and keyboard navigation

---

## Development Workflow

### Daily Development Process
1. **Start development server**
   ```bash
   npm run dev
   # or
   hugo server -D --logLevel=debug
   ```

2. **Check console for errors**
   - No template warnings
   - No JavaScript errors
   - All assets load correctly

3. **Make changes incrementally**
   - Small, focused commits
   - Test functionality after each change
   - Use browser DevTools for debugging

4. **Run tests before committing**
   ```bash
   npm test              # Unit tests
   npm run lint:esm      # ES module validation
   npm run build         # Production build test
   ```

### Git Workflow
```bash
# Feature development
git checkout -b feature/vocabulary-search-enhancement
git add .
git commit -m "feat: enhance vocabulary search with fuzzy matching

- Add fuzzy search algorithm
- Improve search performance
- Update search UI feedback"

# Before pushing
npm run build         # Verify production build
npm test             # Run test suite
git push origin feature/vocabulary-search-enhancement
```

---

## Code Standards

### JavaScript Guidelines

**ES Module Structure**
```javascript
/**
 * @file vocabulary-search.js
 * @description Enhanced vocabulary search with fuzzy matching
 * @status ACTIVE
 * @version 1.2.0
 * @updated October 2025
 */

// Imports at top
import { languageToggle } from './language-toggle.js';
import { searchEngine } from './modules/search-engine.js';

// Class-based modules for complex functionality
export class VocabularySearch {
  constructor(options = {}) {
    this.container = options.container;
    this.debounceDelay = options.debounceDelay || 300;
    this.searchTimeout = null;
    
    this.init();
  }
  
  init() {
    this.bindEvents();
    this.loadSearchIndex();
  }
  
  // Clear method documentation
  /**
   * Performs fuzzy search on vocabulary items
   * @param {string} query - Search query
   * @param {Array} items - Vocabulary items to search
   * @returns {Array} Filtered and ranked results
   */
  performSearch(query, items) {
    // Implementation
  }
}

// Export for global access when needed
window.VocabularySearch = VocabularySearch;
```

**Coding Conventions**
- **Use modern JavaScript**: ES6+ features, async/await
- **Prefer const/let**: Never use `var`
- **Descriptive naming**: Clear variable and function names
- **Single responsibility**: Functions do one thing well
- **Error handling**: Always handle potential failures

**Module Organization**
```text
assets/js/
├── modules/                  # Reusable modules
│   ├── search-engine.js     # Search functionality
│   ├── storage-manager.js   # LocalStorage utilities
│   └── performance-monitor.js # Performance tracking
├── unified-*.js             # Core unified modules
├── vocabulary.js            # Page-specific functionality
└── app.js                   # Global application logic
```

### CSS/SCSS Guidelines

**Component Structure**
```scss
// _vocabulary-card.scss
.vocab-card {
  // Base styles
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-base);
  
  // States
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-hover);
  }
  
  &.is-flipped {
    .vocab-card__front { display: none; }
    .vocab-card__back { display: block; }
  }
  
  // Elements
  &__front,
  &__back {
    padding: var(--spacing-md);
  }
  
  &__word {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    color: var(--color-primary);
  }
  
  &__translation {
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
  }
}

// Responsive design
@media (max-width: 768px) {
  .vocab-card {
    &__word {
      font-size: var(--font-size-base);
    }
  }
}
```

**CSS Best Practices**
- **BEM methodology**: Block-Element-Modifier naming
- **CSS custom properties**: Use CSS variables for consistency
- **Mobile-first**: Write mobile styles first, desktop overrides
- **Logical properties**: Use `margin-inline-start` over `margin-left`

### Hugo Template Guidelines

**Template Structure**
```html
<!-- layouts/_default/vocabulary.html -->
{{ define "title" }}{{ .Title }} - {{ .Site.Title }}{{ end }}

{{ define "head" }}
  <!-- Page-specific meta tags -->
  <meta name="description" content="{{ .Description | default .Summary }}">
  <meta name="keywords" content="vocabulary, {{ .Params.level }}, {{ delimit .Params.categories ", " }}">
{{ end }}

{{ define "main" }}
<article class="vocabulary-page">
  <header class="page-header">
    <h1>{{ .Title }}</h1>
    {{ with .Description }}
      <p class="page-description">{{ . }}</p>
    {{ end }}
  </header>
  
  <main class="page-content">
    {{ .Content }}
    
    {{ if .Params.vocabulary }}
      {{ partial "vocabulary-grid.html" . }}
    {{ end }}
  </main>
</article>
{{ end }}

{{ define "scripts" }}
  {{ $vocab := resources.Get "js/vocabulary.js" }}
  {{ $vocabMin := $vocab | resources.Minify | resources.Fingerprint }}
  <script src="{{ $vocabMin.RelPermalink }}" type="module"></script>
{{ end }}
```

**Template Best Practices**
- **Semantic HTML**: Use appropriate HTML elements
- **Accessibility**: Include ARIA attributes and proper headings
- **Performance**: Minify and fingerprint assets
- **SEO**: Include proper meta tags and structured data

---

## Data Management

### JSON Schema Standards

**Vocabulary Entry Structure**
```json
{
  "id": "vocab-001",
  "word": "Здравей",
  "translation": "Hallo",
  "level": "A1",
  "category": "Begrüßung",
  "examples": {
    "bg": ["Здравей, как си?"],
    "de": ["Hallo, wie geht es dir?"]
  },
  "notes_bg_to_de": "Informal greeting, used with friends",
  "notes_de_to_bg": "Informelle Begrüßung unter Freunden",
  "cultural_note": "Bulgarian greetings often include asking about health",
  "etymology": "From Old Church Slavonic 'съдравъ' (healthy)",
  "audio": {
    "bg": "audio/zdravej.mp3",
    "de": "audio/hallo.mp3"
  },
  "difficulty_multiplier": {
    "bg_to_de": 1.0,
    "de_to_bg": 1.2
  }
}
```

**Data Validation**
```javascript
// Vocabulary validation schema
const vocabularySchema = {
  required: ['id', 'word', 'translation', 'level', 'category'],
  properties: {
    id: { type: 'string', pattern: '^vocab-\\d{3,}$' },
    level: { enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] },
    category: { enum: ['Begrüßung', 'Familie', 'Lebensmittel', ...] }
  }
};
```

### LocalStorage Management

**Storage Conventions**
```javascript
// Storage key patterns
const STORAGE_KEYS = {
  LANGUAGE_DIRECTION: 'bgde:language-direction',
  REVIEW_PROGRESS: 'bgde:review_{id}_{direction}',
  SESSION_HISTORY: 'bgde:session_history',
  USER_PREFERENCES: 'bgde:preferences'
};

// Storage utilities
class StorageManager {
  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage failed:', error);
    }
  }
  
  static get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Storage retrieval failed:', error);
      return null;
    }
  }
}
```

---

## Performance Standards

### Build Performance
- **Build time**: < 5 seconds for development builds
- **Production build**: < 30 seconds with full optimization
- **Asset size**: CSS < 50KB, JS < 100KB (minified + gzipped)
- **Images**: WebP format, responsive sizing

### Runtime Performance
- **Page load**: < 3 seconds on 3G connection
- **Search response**: < 500ms for filtering results
- **Animation**: 60fps smooth transitions
- **Memory usage**: < 50MB heap size

### Performance Monitoring
```javascript
// Performance tracking utility
class PerformanceMonitor {
  static measureSearch(searchFunction) {
    return async (...args) => {
      const start = performance.now();
      const result = await searchFunction(...args);
      const duration = performance.now() - start;
      
      if (duration > 500) {
        console.warn(`Slow search: ${duration}ms`);
      }
      
      return result;
    };
  }
  
  static trackMemoryUsage() {
    if ('memory' in performance) {
      const memory = performance.memory;
      console.log(`Memory: ${memory.usedJSHeapSize / 1024 / 1024}MB`);
    }
  }
}
```

---

## Accessibility Guidelines

### ARIA Implementation
```html
<!-- Accessible flashcard component -->
<div class="flashcard" 
     role="button" 
     tabindex="0"
     aria-label="Vocabulary flashcard: Click to reveal translation"
     aria-expanded="false">
  
  <div class="flashcard__front" aria-hidden="false">
    <span class="word" lang="bg">Здравей</span>
  </div>
  
  <div class="flashcard__back" aria-hidden="true">
    <span class="translation" lang="de">Hallo</span>
  </div>
</div>

<!-- Accessible grade buttons -->
<div class="grade-buttons" role="group" aria-label="Rate your answer">
  <button class="grade-btn" data-grade="1" aria-label="Grade 1: Again">
    Again
  </button>
  <button class="grade-btn" data-grade="4" aria-label="Grade 4: Easy">
    Easy
  </button>
</div>
```

### Keyboard Navigation
```javascript
// Keyboard navigation implementation
class KeyboardNavigation {
  constructor() {
    this.init();
  }
  
  init() {
    document.addEventListener('keydown', this.handleKeydown.bind(this));
  }
  
  handleKeydown(event) {
    // Skip if user is typing in input
    if (event.target.matches('input, textarea')) return;
    
    switch (event.code) {
      case 'Space':
      case 'Enter':
        event.preventDefault();
        this.flipCard();
        break;
      case 'Digit1':
      case 'Digit2':
      case 'Digit3':
      case 'Digit4':
      case 'Digit5':
        event.preventDefault();
        this.gradeCard(parseInt(event.key));
        break;
      case 'Escape':
        this.closeModals();
        break;
    }
  }
}
```

---

## Testing Standards

### Unit Test Requirements
- **Coverage**: Minimum 80% code coverage
- **Test files**: Co-located with source files or in `tests/` directory
- **Naming**: `*.test.js` or `*.spec.js`
- **Documentation**: Clear test descriptions

### E2E Test Requirements
- **Critical paths**: All P0 user flows must have E2E tests
- **Cross-browser**: Test in Chrome, Firefox, Safari
- **Mobile**: Test responsive layouts and touch interactions
- **Performance**: Include performance assertions

### Test Example
```javascript
// vocabulary-search.test.js
import { describe, test, expect, beforeEach } from 'vitest';
import { VocabularySearch } from '../vocabulary-search.js';

describe('VocabularySearch', () => {
  let searchInstance;
  let mockContainer;
  
  beforeEach(() => {
    mockContainer = document.createElement('div');
    mockContainer.innerHTML = `
      <input id="search-input" />
      <div id="results"></div>
    `;
    document.body.appendChild(mockContainer);
    
    searchInstance = new VocabularySearch({
      container: mockContainer
    });
  });
  
  test('filters vocabulary by search term', async () => {
    const testData = [
      { word: 'Здравей', translation: 'Hallo' },
      { word: 'Довиждане', translation: 'Tschüss' }
    ];
    
    const results = searchInstance.performSearch('здрав', testData);
    
    expect(results).toHaveLength(1);
    expect(results[0].word).toBe('Здравей');
  });
});
```

---

## Security Guidelines

### Input Sanitization
```javascript
// Sanitize user input for search
function sanitizeSearchQuery(query) {
  return query
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML
    .substring(0, 100);   // Limit length
}

// Sanitize vocabulary display
function sanitizeVocabularyText(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
```

### Content Security Policy
```html
<!-- In baseof.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline';
               img-src 'self' data:;">
```

---

## AI Assistant Guidelines

### Code Generation Standards
When working with AI assistants (Claude, GitHub Copilot, etc.):

1. **Always review generated code** for security and performance
2. **Test thoroughly** - AI code may have subtle bugs
3. **Maintain consistency** with existing codebase patterns
4. **Document AI assistance** in commit messages when significant

### Prompt Engineering
```text
# Good prompt example
"Create a JavaScript function that filters vocabulary items by search term.
Requirements:
- Use fuzzy matching algorithm
- Return results ranked by relevance
- Handle both Bulgarian and German text
- Include performance optimization for large datasets
- Follow our existing ES module patterns"

# Include context about existing code patterns
```

---

## Code Review Checklist

### Before Submitting PR
- [ ] Code follows established patterns and conventions
- [ ] All tests pass (`npm test`)
- [ ] Production build succeeds (`npm run build`)
- [ ] No console errors or warnings
- [ ] Accessibility standards met
- [ ] Performance impact assessed
- [ ] Documentation updated if needed

### Review Criteria
- [ ] **Functionality**: Code works as intended
- [ ] **Performance**: No significant performance regression
- [ ] **Security**: No security vulnerabilities introduced
- [ ] **Maintainability**: Code is readable and well-structured
- [ ] **Testing**: Adequate test coverage
- [ ] **Documentation**: Changes are documented

---

## Troubleshooting Common Issues

### Hugo Build Failures
```bash
# Check Hugo version
hugo version

# Verify extended features
hugo version | grep extended

# Debug template issues
hugo server --templateMetrics --logLevel=debug
```

### JavaScript Module Issues
```bash
# Check ES module syntax
npm run lint:esm

# Test individual module
node --input-type=module --eval "import('./assets/js/vocabulary.js')"

# Debug in browser
# Open DevTools → Sources → Check for syntax errors
```

### CSS Build Problems
```bash
# Check SCSS syntax
sass --check assets/scss/main.scss

# Debug Hugo Pipes
hugo server --logLevel=debug | grep -i scss
```

---

This comprehensive guide establishes the foundation for high-quality, maintainable development of the Bulgarian-German Learning App while ensuring consistency across the development team.