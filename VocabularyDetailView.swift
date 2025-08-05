import SwiftUI

/// Shows detailed information about a single vocabulary item.  Besides the
/// Bulgarian word and its translation, this view displays the part of
/// speech and any additional notes.  A spacer pushes content to the top
/// when there is little information.
struct VocabularyDetailView: View {
    let item: VocabularyItem

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text(item.word)
                    .font(.largeTitle)
                    .bold()
                Text(item.translation)
                    .font(.title2)
                    .foregroundColor(.primary)
                Text("Part of speech: \(item.type)")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                if let notes = item.notes, !notes.isEmpty {
                    Text(notes)
                        .font(.body)
                }
                Spacer()
            }
            .padding()
        }
        .navigationTitle(item.word)
    }
}

struct VocabularyDetailView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationView {
            VocabularyDetailView(item: VocabularyItem(word: "Здравей", translation: "Hello", type: "Greeting", level: "A1", notes: nil))
        }
    }
}