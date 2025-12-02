# Bulgarian-German Learning App - Project Plan

## Project Overview

An interactive web application for learning Bulgarian and German vocabulary and grammar, featuring spaced repetition and audio pronunciation.

## Development Phases

### Phase 1: Core Infrastructure (Weeks 1-2)

#### 1.1 Project Setup & Architecture

- [x] Initialize Hugo Extended site structure
- [x] Configure SCSS + JS pipelines via Hugo Pipes
- [x] Establish data sources under `data/`
- [x] CI/CD workflow for GitHub Pages (working, minor improvements possible)

#### 1.2 Core Foundations

- [x] Define shared vocabulary/grammar schemas (`data/*.json`)
- [x] Formalize client-side state helpers (SM-2, storage utilities)
- [x] Document coding assistant practices (`AGENTS.md`)
- [ ] Add error/reporting conventions for Go tooling in `tools/`

### Phase 2: Core Features (Weeks 3-6)

#### 2.1 Vocabulary Module

- [x] Flashcard interface (Hugo shortcode + `assets/js/flashcards.js`)
- [x] Word search and filtering (`assets/js/vocab-cards.js`)
- [x] Progress tracking views (localStorage-based)
- [x] Spaced repetition scheduling (`assets/js/spaced-repetition.js`)
- [x] Bidirectional learning support (BG↔DE with difficulty multipliers)
- [x] Cultural context display (etymology, linguistic notes)

#### 2.2 Grammar Module

- [x] Grammar rules browser (Markdown + shortcodes)
- [ ] Interactive exercises (client-side quizzes) - ⚠️ Needs implementation
- [ ] Examples with audio playback - ⚠️ Needs verification
- [ ] Progress tracking - ⚠️ Needs implementation

### Phase 3: Enhanced Learning (Weeks 7-10)

#### 3.1 Audio & PWA Enhancements

- [x] Text-to-speech integration (Web Speech API) - `speech-recognition.js` implemented
- [ ] Pronunciation practice workflows - ⚠️ Partial
- [ ] Offline-ready audio flashcards - ⚠️ Needs work
- [ ] PWA offline shell + update UX - ⚠️ Service worker needs fixes

#### 3.2 User Experience

- [x] Responsive design polish (desktop complete, mobile needs fixes)
- [x] Dark/light theme toggle
- [x] Language toggle (Bulgarian↔German) with confirmation modal
- [x] Onboarding flow (Vincent & Ida personas)
- [ ] Accessibility improvements (ARIA, keyboard flows) - ⚠️ Partial, needs audit
- [x] Performance optimizations (Hugo builds <200ms)

### Phase 4: Testing & Polish (Weeks 11-12)

#### 4.1 Testing

- [ ] Unit tests - ⚠️ Not implemented (planned: Vitest/Jest)
- [ ] Integration tests - ⚠️ Not implemented
- [x] E2E tests - ✅ Playwright configured (15/40 passing, mobile issues)
- [x] Performance testing - ✅ Manual testing done (Hugo builds: <200ms)

#### 4.2 Polish

- [x] UI/UX refinements - ✅ Desktop polished, mobile needs work
- [ ] Loading states - ⚠️ Needs implementation
- [ ] Error handling - ⚠️ Partial
- [x] Documentation - ✅ Comprehensive (ARCHITECTURE, DEVELOPMENT, API, module docs)
- [x] Repository cleanup - ✅ Build artifacts removed, .gitignore fixed

## Technical Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture and design decisions
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development setup and workflow
- [API.md](./API.md) - API documentation (to be created)
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines (to be created)

## Development Workflow

1. **Branching Strategy**
   - `main` - Production-ready code
   - `develop` - Integration branch
   - `feature/*` - New features
   - `bugfix/*` - Bug fixes

2. **Code Review**
   - All changes require PRs
   - At least one approval required
   - CI must pass

## Deployment

- Automated deployment to GitHub Pages
- Staging environment for testing
- Production deployment from `main` branch

## Monitoring & Maintenance

- Error tracking
- Performance monitoring
- User analytics (opt-in)
- Regular dependency updates
