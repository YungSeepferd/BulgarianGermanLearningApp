// swift-tools-version: 5.9
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "BulgarianVocabularyApp",
    platforms: [
        .iOS(.v17),
        .macOS(.v14)
    ],
    products: [
        .executable(
            name: "BulgarianVocabularyApp",
            targets: ["BulgarianVocabularyApp"]
        )
    ],
    targets: [
        .executableTarget(
            name: "BulgarianVocabularyApp",
            path: ".",
            exclude: ["README.md"],
            sources: [
                "BulgarianVocabularyApp.swift",
                "ContentView.swift",
                "DataStore.swift",
                "Models.swift",
                "GrammarData.swift",
                "VocabularyListView.swift",
                "VocabularyDetailView.swift",
                "GrammarListView.swift",
                "GrammarDetailView.swift",
                "DirectionToggle.swift",
                "AudioManager.swift",
                "SettingsView.swift"
            ]
        )
    ]
)