# Bulgarian-German Learning App

A SwiftUI-based iOS application for learning Bulgarian and German vocabulary and grammar.

## Features

- **Vocabulary Learning**: Browse words organised by CEFR levels (A1 and A2)
- **Grammar Topics**: Learn grammar concepts with detailed explanations
- **Bilingual Mode**: Toggle between Bulgarian→German and German→Bulgarian learning directions on every screen
- **Dual-Language Explanations**: Notes and grammar descriptions appear in both languages so partners can compare phrasing
- **Offline Learning**: Complete offline functionality with local data storage
- **User-Friendly Interface**: Clean, intuitive SwiftUI interface

## Project Structure

- `BulgarianVocabularyApp.swift` - Main app entry point
- `ContentView.swift` - Main navigation view
- `DataStore.swift` - Static data store containing vocabulary and grammar content
- `Models.swift` - Data models for vocabulary items and grammar topics
- `VocabularyListView.swift` - List view for vocabulary items by level
- `VocabularyDetailView.swift` - Detailed view for individual vocabulary items
- `GrammarListView.swift` - List view for grammar topics by level
- `GrammarDetailView.swift` - Detailed view for grammar topics

## Learning Levels

### A1 (Beginner)
- Basic greetings and expressions
- Essential nouns, verbs, and adjectives
- Fundamental grammar concepts
- Common adverbs and phrases

### A2 (Elementary)
- Extended vocabulary for everyday situations
- More complex grammar topics
- Numbers, time expressions, and quantities
- Travel, shopping, and health vocabulary

## Development

This app is built using SwiftUI and requires Xcode for development. The app is completely offline and stores all language data locally in static arrays.

## License

This project is open source and available under the MIT License. 