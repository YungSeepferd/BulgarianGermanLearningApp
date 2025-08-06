import SwiftUI

/// Displays the contents of a single grammar topic.  The description
/// explains the concept, followed by a list of example sentences.  A
/// scroll view ensures content is readable on smaller screens.
struct GrammarDetailView: View {
    let topic: GrammarTopic
    @AppStorage("learningDirection") private var learningDirection: LearningDirection = .bulgarianToGerman

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text(topic.title(for: learningDirection))
                    .font(.title)
                    .bold()
                let descriptions = topic.descriptionPair(for: learningDirection)
                Text(descriptions.primary)
                    .font(.body)
                if !descriptions.secondary.isEmpty {
                    Text((learningDirection == .bulgarianToGerman ? "На български: " : "Auf Deutsch: ") + descriptions.secondary)
                        .font(.body)
                        .foregroundColor(.secondary)
                }

                let examples = topic.examplesPair(for: learningDirection)
                if !examples.primary.isEmpty {
                    Text(learningDirection == .bulgarianToGerman ? "Beispiele:" : "Примери:")
                        .font(.headline)
                        .padding(.top)
                    ForEach(examples.primary, id: \.self) { example in
                        Text("• \(example)")
                    }
                }
                if !examples.secondary.isEmpty {
                    Text(learningDirection == .bulgarianToGerman ? "Примери на български:" : "Beispiele auf Deutsch:")
                        .font(.headline)
                        .padding(.top)
                    ForEach(examples.secondary, id: \.self) { example in
                        Text("• \(example)")
                    }
                }
                Spacer()
            }
            .padding()
        }
        .navigationTitle(topic.title(for: learningDirection))
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                DirectionToggle()
            }
        }
    }
}

struct GrammarDetailView_Previews: PreviewProvider {
    static var previews: some View {
        let sample = GrammarTopic(
            titleBG: "Род на съществителните",
            titleDE: "Genus der Substantive",
            descriptionBG: "Примерно описание",
            descriptionDE: "Beispielbeschreibung",
            examplesBG: ["мъж – мъжки род"],
            examplesDE: ["мъж – Mann (Maskulinum)"],
            level: "A1"
        )
        return NavigationView {
            GrammarDetailView(topic: sample)
        }
    }
}