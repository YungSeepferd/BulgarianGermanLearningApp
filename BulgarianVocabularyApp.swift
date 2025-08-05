import SwiftUI

/// Entry point for the Bulgarian vocabulary application.
///
/// This simple app presents two learning levels (A1 and A2) and splits
/// content into grammar topics and vocabulary lists.  It uses SwiftUI for
/// declarative user interface construction.  When building the project on a
/// Mac, add these files to a new SwiftUI project or a Swift package with
/// an application target.  The app is completely offline and stores all
/// language data locally in static arrays defined in `DataStore.swift`.
@main
struct BulgarianVocabularyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}