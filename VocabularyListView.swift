import SwiftUI

/// Displays a list of vocabulary items for a given level.  Each row shows
/// the Bulgarian word and its English translation.  Tapping on a row
/// navigates to a detail view with more information.
struct VocabularyListView: View {
    let level: String
    // Filter the shared vocabulary items by level on initialisation
    private var items: [VocabularyItem] {
        DataStore.vocabularyItems.filter { $0.level == level }
            .sorted { $0.word < $1.word }
    }

    var body: some View {
        List {
            ForEach(items) { item in
                NavigationLink(destination: VocabularyDetailView(item: item)) {
                    VStack(alignment: .leading) {
                        Text(item.word)
                            .font(.headline)
                        Text(item.translation)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                }
            }
        }
        .navigationTitle("\(level) Vocabulary")
    }
}

struct VocabularyListView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationView {
            VocabularyListView(level: "A1")
        }
    }
}