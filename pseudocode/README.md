# Bulgarian-German Learning App - Pseudocode

This directory contains a complete pseudocode representation of the Bulgarian-German Learning App. The pseudocode is designed to be language-agnostic and can be easily translated into any programming language.

## Directory Structure

```
pseudocode/
├── core/                    # Core application logic
│   ├── models.pseudo       # Data models (VocabularyItem, GrammarItem, ReviewState)
│   └── services.pseudo     # Core services (spaced repetition algorithm)
│
├── web/                    # Web application components
│   ├── main.pseudo         # Application entry point and root component
│   ├── services.pseudo     # Web services (vocabulary, practice)
│   ├── views.pseudo        # View components (vocabulary, grammar)
│   └── practice.pseudo     # Practice view and flashcard components
│
└── README.md              # This file
```

## Key Components

### Core
- **Models**: Defines the data structures used throughout the application
  - `VocabularyItem`: Represents a word/phrase with translation and metadata
  - `GrammarItem`: Represents a grammar rule with examples
  - `ReviewState`: Tracks spaced repetition data for each item

- **Services**: Implements the SM-2 spaced repetition algorithm
  - `calculate_next_review`: Core algorithm for determining review intervals

### Web Application
- **Main Application**: Root component and initialization
- **Services**:
  - `VocabularyService`: Manages vocabulary and grammar data
  - `PracticeService`: Handles practice sessions and review states
- **Views**:
  - `VocabularyView`: Displays and filters vocabulary items
  - `GrammarView`: Shows grammar rules and examples
  - `PracticeView`: Implements the flashcard learning interface
  - `Flashcard`: Interactive flashcard component

## Data Flow

1. **Initialization**:
   - Load vocabulary and grammar data from JSON files
   - Initialize review states from local storage

2. **Practice Session**:
   - Select due items using spaced repetition algorithm
   - Present flashcards to the user
   - Record responses and update review states
   - Persist updated states to local storage

3. **Vocabulary/Grammar Browsing**:
   - Filter and search through items
   - View details and examples

## Implementation Notes

- The pseudocode uses a simplified syntax that should be familiar to developers
- All components are designed to be modular and reusable
- State management is handled through props and local component state
- The code follows a functional programming style where appropriate

## Implementation Requirements

**IMPORTANT**: This project must be implemented using **Go and Hugo only**. No other frameworks or languages should be used for the core functionality.

### Next Steps for Go/Hugo Implementation

1. **Implement Go services** in `tools/` directory based on pseudocode
2. **Create Hugo shortcodes** for interactive vocabulary components
3. **Build Go data processors** to generate practice sessions from JSON
4. **Use Hugo's data pipeline** to create dynamic vocabulary pages
5. **Implement Go backend services** for progress tracking
6. **Leverage Hugo Pipes** for asset processing and optimization

### Go/Hugo Architecture

- **Core Logic**: Implement spaced repetition algorithm in Go
- **Data Processing**: Use Go to transform JSON data for Hugo consumption
- **Frontend**: Hugo templates with minimal JavaScript for interactivity
- **Build Process**: Hugo CLI with Go tools integration
