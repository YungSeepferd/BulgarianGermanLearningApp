# Bulgarian-German Learning App - Project Plan

## Project Overview

An interactive web application for learning Bulgarian and German vocabulary and grammar, featuring spaced repetition and audio pronunciation.

## Development Phases

### Phase 1: Core Infrastructure (Weeks 1-2)

#### 1.1 Project Setup & Architecture

- [x] Initialize Hugo Extended site structure
- [x] Configure SCSS + JS pipelines via Hugo Pipes
- [x] Establish data sources under `data/`
- [ ] Harden CI/CD workflow for GitHub Pages

#### 1.2 Core Foundations

- [x] Define shared vocabulary/grammar schemas (`data/*.json`)
- [ ] Formalize client-side state helpers (SM-2, storage utilities)
- [ ] Document coding assistant practices (`AGENTS.md`)
- [ ] Add error/reporting conventions for Go tooling in `tools/`

### Phase 2: Core Features (Weeks 3-6)

#### 2.1 Vocabulary Module

- [ ] Flashcard interface (Hugo shortcode + `assets/js/flashcards.js`)
- [ ] Word search and filtering (`assets/js/vocab-cards.js`)
- [ ] Progress tracking views
- [ ] Spaced repetition scheduling (`assets/js/spaced-repetition.js`)

#### 2.2 Grammar Module

- [ ] Grammar rules browser (Markdown + shortcodes)
- [ ] Interactive exercises (client-side quizzes)
- [ ] Examples with audio playback
- [ ] Progress tracking

### Phase 3: Enhanced Learning (Weeks 7-10)

#### 3.1 Audio & PWA Enhancements

- [ ] Text-to-speech integration (Web Speech API)
- [ ] Pronunciation practice workflows
- [ ] Offline-ready audio flashcards
- [ ] PWA offline shell + update UX

#### 3.2 User Experience

- [ ] Responsive design polish
- [ ] Dark/light theme toggle
- [ ] Accessibility improvements (ARIA, keyboard flows)
- [ ] Performance optimizations (lazy data loading)

### Phase 4: Testing & Polish (Weeks 11-12)

#### 4.1 Testing

- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance testing

#### 4.2 Polish

- [ ] UI/UX refinements
- [ ] Loading states
- [ ] Error handling
- [ ] Documentation

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
