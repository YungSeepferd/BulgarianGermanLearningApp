import SwiftUI

/// Presents a list of grammar topics for a given learning level.  Each
/// row shows the title of the topic.  Selecting a row navigates to
/// `GrammarDetailView` which contains the full explanation and examples.
struct GrammarListView: View {
    let level: String
    @AppStorage("learningDirection") private var learningDirection: LearningDirection = .bulgarianToGerman
    private var topics: [GrammarTopic] {
        DataStore.grammarTopics.filter { $0.level == level }
            .sorted { $0.title(for: learningDirection) < $1.title(for: learningDirection) }
    }

    var body: some View {
        List {
            ForEach(topics) { topic in
                NavigationLink(destination: GrammarDetailView(topic: topic)) {
                    Text(topic.title(for: learningDirection))
                }
            }
        }
        .navigationTitle("\(level) \(learningDirection == .bulgarianToGerman ? "Grammatik" : "Граматика")")
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                DirectionToggle()
            }
        }
    }
}

struct GrammarListView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationView {
            GrammarListView(level: "A1")
        }
    }
}