import Foundation

/// A single vocabulary entry consisting of the Bulgarian word, its English
/// translation, the part of speech (noun, verb, adjective, etc.) and the
/// associated CEFR level (A1 or A2).  A unique identifier is generated
/// automatically so that the objects can be used in SwiftUI lists.
struct VocabularyItem: Identifiable {
    let id = UUID()
    let word: String
    let translation: String
    let type: String
    let level: String
    let notes: String?
}

/// A grammar topic summarises a single concept such as gender or word order.
/// Each topic has a title, a detailed description, a list of example
/// sentences, and an associated level indicating when a learner is
/// expected to encounter the topic.
struct GrammarTopic: Identifiable {
    let id = UUID()
    let title: String
    let description: String
    let examples: [String]
    let level: String
}