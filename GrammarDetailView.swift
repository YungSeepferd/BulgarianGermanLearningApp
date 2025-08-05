import SwiftUI

/// Displays the contents of a single grammar topic.  The description
/// explains the concept, followed by a list of example sentences.  A
/// scroll view ensures content is readable on smaller screens.
struct GrammarDetailView: View {
    let topic: GrammarTopic

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text(topic.title)
                    .font(.title)
                    .bold()
                Text(topic.description)
                    .font(.body)
                if !topic.examples.isEmpty {
                    Text("Examples:")
                        .font(.headline)
                        .padding(.top)
                    ForEach(topic.examples, id: \.self) { example in
                        Text("• \(example)")
                    }
                }
                Spacer()
            }
            .padding()
        }
        .navigationTitle(topic.title)
    }
}

struct GrammarDetailView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationView {
            GrammarDetailView(topic: GrammarTopic(title: "Gender of Nouns", description: "Example description", examples: ["мъж – man"], level: "A1"))
        }
    }
}