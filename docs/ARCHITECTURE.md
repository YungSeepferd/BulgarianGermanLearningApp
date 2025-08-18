# Bulgarian-German Learning App - Architecture

## Overview

This document outlines the high-level architecture of the Bulgarian-German Learning App, a web-based language learning application built with Rust (WASM) and modern web technologies.

## System Architecture

```text
┌───────────────────────────────────────────────────────────────┐
│                       Web Browser                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Web Application                     │  │
│  │  ┌─────────────┐  ┌─────────────────┐  ┌───────────┐  │  │
│  │  │  UI Layer   │  │  State Manager  │  │  Services  │  │  │
│  │  └──────┬──────┘  └────────┬────────┘  └─────┬─────┘  │  │
│  │         │                  │                  │        │  │
│  │  ┌──────▼──────────────────▼──────────────────▼────┐   │  │
│  │  │               Business Logic                    │   │  │
│  │  └─────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

## Directory Structure

```bash
bulgaria-learn/
├── .github/              # GitHub Actions workflows
├── docs/                 # Project documentation
├── lib/                  # Core Rust library (logic, models)
│   ├── src/
│   └── Cargo.toml
├── web/                  # Yew-based web application (WASM)
│   ├── src/
│   └── Cargo.toml
├── static/               # Static assets (styles, images)
├── tests/                # Integration and E2E tests
├── Cargo.toml            # Root workspace configuration
└── README.md
```

## Core Components

### 1. Web Application (`web`)
- **Framework**: Yew (Rust/WASM)
- **Responsibilities**:
  - Renders the user interface and all components.
  - Manages application state and routing.
  - Handles user interactions and events.

### 2. Core Library (`lib`)

- **Responsibilities**:
  - Defines shared data models (e.g., `VocabularyItem`, `GrammarItem`).
  - Contains the core business logic, including the spaced repetition algorithm.
  - Provides data persistence and state management logic.

## Data Flow

1. **Initialization**:
   - Load initial state from local storage
   - Fetch any required data

2. **User Interaction**:
   - User performs an action (e.g., answers a question)
   - UI dispatches an action
   - State is updated
   - UI re-renders with new state

3. **Persistence**:
   - Important state changes are saved to local storage
   - User progress is tracked and persisted

## Technical Stack

**IMPORTANT**: This project uses **Go and Hugo only** for implementation.

- **Backend Logic**: Go (spaced repetition algorithms, data processing)
- **Frontend Framework**: Hugo static site generator with Go templates
- **State Management**: Hugo's data pipeline and minimal JavaScript
- **Styling**: SCSS processed by Hugo
- **Build Tools**: Hugo CLI and Go toolchain
- **Testing**: Go testing framework

## Performance Considerations

- Code splitting for faster initial load
- Lazy loading of components
- Efficient state updates
- Minimized re-renders

## Security Considerations

- All user data is stored locally in the browser
- No sensitive data is collected or transmitted
- Input validation on all user inputs
