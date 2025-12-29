# Project Overview

**Time to read**: 5-10 minutes

## What is this project?

A clean, focused **tandem language learning application** for Bulgarian and German built with modern web technologies.

### Core Idea
- Learn Bulgarian and German together
- Bidirectional: German→Bulgarian OR Bulgarian→German
- Practice with vocabulary, flashcards, and lessons
- Completely offline-capable
- No accounts needed

---

## What Can Users Do?

### 1. Learn Vocabulary
- Search 2,164 vocabulary items
- Filter by category, difficulty, part of speech
- See translations, examples, pronunciation
- Track learning progress locally

### 2. Practice
- Interactive practice mode
- Get feedback on answers
- Track correct/incorrect responses
- Improve through repetition

### 3. Learn Lessons
- Pre-built lessons organized by topic
- Interactive flashcard system
- Learn at your own pace
- Offline access

### 4. Switch Languages
- One-click toggle between:
  - German → Bulgarian (learning Bulgarian)
  - Bulgarian → German (learning German)
- Entire UI switches to match

---

## Technology Stack

### Frontend
- **SvelteKit 2** - Web framework with file-based routing
- **Svelte 5** - Latest component syntax with Runes
- **Design System** - Phase 2-3 implementation (Dec 2025)
  - Unified VocabularyCard component (4 variants: grid, list, flashcard, lesson)
  - ActionButton semantic system (7 variants for consistent UI)
  - Design tokens (40+ CSS variables for spacing, typography, colors)
  - Responsive breakpoints (mobile-first approach)
- **Tailwind CSS v4** - Utility-first styling
- **TypeScript** - Type safety

### State Management
- **Svelte 5 Runes** - Modern reactivity system
  - `$state()` for reactive variables
  - `$derived()` for computed values
  - `$effect()` for side effects

### Data & Validation
- **Zod** - Runtime schema validation
- **JSON** - Vocabulary data format
- **localStorage** - Progress persistence

### Testing & Quality
- **Playwright** - E2E testing
- **Vitest** - Unit testing
- **ESLint + Prettier** - Code quality
- **TypeScript strict mode** - Type checking

### Deployment
- **GitHub Pages** - Hosting
- **Static build** - No server needed
- **Vite** - Build tool

---

## Architecture Overview

### High Level
```
User Interface (Svelte Components)
         ↓
State Management (Svelte 5 Runes)
         ↓
Services (Business Logic)
         ↓
Data Loading & Validation (Zod)
         ↓
Vocabulary JSON & localStorage
```

### Key Principles
1. **No Backend Needed** - All data bundled with app
2. **Type Safe** - TypeScript everywhere, Zod validation
3. **Responsive** - Mobile-first design
4. **Offline First** - Works without internet
5. **Accessible** - WCAG 2.1 AA compliance

---

## File Structure

### Important Folders

| Path | Purpose |
|------|---------|
| `src/` | All source code |
| `src/lib/components/` | Reusable UI components |
| `src/lib/services/` | Business logic |
| `src/lib/state/` | Global state management |
| `src/routes/` | App pages (SvelteKit routing) |
| `data/` | Vocabulary data files |
| `tests/` | Test files |
| `docs/` | Documentation |

See [FILE_STRUCTURE.md](FILE_STRUCTURE.md) for complete breakdown.

---

## Feature Status

### ✅ Implemented & Tested
- Vocabulary search and filtering
- Flashcard practice system
- Lesson generation
- Bilingual UI
- Language mode switching
- Responsive design
- Offline capability
- Local progress tracking
- Accessibility compliance

### ❌ Out of Scope (v1.0)
- User authentication
- Cloud sync
- Gamification (XP, levels, streaks)
- Social features
- User profiles
- Advanced analytics

These features may be added in future versions if needed.

---

## Data Format

### Vocabulary Items
```json
{
  "id": "zdravej_001",
  "german": "Hallo",
  "bulgarian": "Здравей",
  "partOfSpeech": "interjection",
  "difficulty": 1,
  "categories": ["greetings"],
  "transliteration": "zdravey",
  "metadata": {
    "examples": [...]
  }
}
```

### Lessons
```json
{
  "id": "lesson_001",
  "title": "Greetings",
  "difficulty": 1,
  "vocabulary": ["zdravej_001", "dobro_utro_002", ...],
  "content": "..."
}
```

---

## Development Workflow

### 1. Write Code
- Edit files in `src/`
- Dev server auto-reloads

### 2. Test Locally
- Manual testing in browser
- Run unit tests: `pnpm run test:unit`
- Run E2E tests: `pnpm run test:e2e`

### 3. Quality Checks
- Run `pnpm run simulate-ci` before pushing
- Checks TypeScript, linting, tests

### 4. Push & Deploy
- Push to GitHub
- GitHub Pages auto-deploys
- Live in minutes

---

## Key Decisions & Why

### No Backend Server
- **Why**: Simpler deployment, faster page loads, works offline
- **Trade-off**: All data must be bundled in build (~5MB)

### SvelteKit + Svelte 5
- **Why**: Modern, type-safe, excellent performance
- **Trade-off**: Smaller ecosystem than React

### Svelte 5 Runes Only
- **Why**: Latest syntax, most maintainable going forward
- **Trade-off**: Legacy store patterns removed

### TypeScript Strict Mode
- **Why**: Catch bugs at compile time, better IDE support
- **Trade-off**: Requires more explicit typing

### Zod Validation
- **Why**: Runtime validation catches data errors
- **Trade-off**: Small bundle size increase

---

## Performance Characteristics

| Metric | Target | Current |
|--------|--------|---------|
| First Load | < 2s | ~1.5s |
| Vocabulary Search | < 100ms | ~50ms |
| Practice Load | < 1s | ~800ms |
| Bundle Size | < 500KB | ~400KB |
| Lighthouse Score | > 90 | > 95 |

---

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

---

## Getting Started

See **[GETTING_STARTED.md](GETTING_STARTED.md)** for setup instructions.

---

## Learn More

- **How to develop**: [DEVELOPMENT.md](development/DEVELOPMENT.md)
- **System architecture**: [ARCHITECTURE.md](architecture/ARCHITECTURE.md)
- **How to test**: [TESTING.md](development/TESTING.md)
- **Troubleshooting**: [DEBUGGING_GUIDE.md](../DEBUGGING_GUIDE.md)
