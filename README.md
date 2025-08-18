# Bulgarian-German Learning App

This repository contains a language-agnostic implementation of a Bulgarian-German vocabulary and grammar learning application. The original Rust/WASM implementation has been converted to pseudocode to facilitate easy porting to other programming languages.

## Project Structure

```text
.
├── docs/                 # Project documentation
│   ├── ARCHITECTURE.md   # System architecture
│   ├── CONTRIBUTING.md   # Contribution guidelines
│   ├── DEVELOPMENT.md    # Development setup
│   ├── PROJECT_PLAN.md   # Project planning
│   └── TESTING.md        # Testing strategy
│
├── pseudocode/          # Language-agnostic implementation
│   ├── core/            # Core data models and services
│   │   ├── models.pseudo
│   │   └── services.pseudo
│   │
│   └── web/             # Web application components
│       ├── main.pseudo
│       ├── practice.pseudo
│       ├── services.pseudo
│       └── views.pseudo
│
├── web/                 # Static assets for web frontend
│   ├── static/          # Static files (CSS, JSON data)
│   │   ├── data/        # Vocabulary and grammar data
│   │   └── styles/      # CSS stylesheets
│   └── index.html       # Main HTML file
│
└── README.md            # This file
```

## Key Features

- **Spaced Repetition System**: Implements the SM-2 algorithm for optimal learning intervals
- **Vocabulary Training**: Flashcard-based learning of Bulgarian-German word pairs
- **Grammar Exercises**: Structured grammar rules with examples and exercises
- **Progress Tracking**: Tracks learning progress and review history
- **Responsive Design**: Works on both desktop and mobile devices

## Data Structure

The application uses two main JSON data files:

- `vocabulary.json`: Contains word pairs, categories, and difficulty levels
- `grammar.json`: Contains grammar rules, examples, and exercises

## Getting Started

1. **Choose Your Technology Stack**:
   - The pseudocode in the `pseudocode/` directory is designed to be easily portable to any modern programming language
   - The web frontend can be implemented using any web framework of your choice

2. **Set Up Development Environment**:
   - Install your chosen programming language and web framework
   - Review the pseudocode documentation for implementation details

3. **Run the Application**:
   - Follow the framework-specific instructions to serve the web application
   - The static assets in `web/` can be used as a starting point for your frontend

## Implementation Notes

- The core learning algorithm is based on the SM-2 spaced repetition system
- The UI is designed to be simple and focused on the learning experience
- All user progress is stored in the browser's localStorage
- The application is designed to work offline after the initial load

## License

This project is open source and available under the [MIT License](LICENSE).
