import SwiftUI

/// Shows detailed information about a single vocabulary item.  Besides the
/// Bulgarian word and its translation, this view displays the part of
/// speech and any additional notes.  A spacer pushes content to the top
/// when there is little information.
struct VocabularyDetailView: View {
    let item: VocabularyItem
    @StateObject private var audioManager = AudioManager()
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Bulgarian word with audio button
                HStack {
                    Text(item.word)
                        .font(.largeTitle)
                        .bold()
                    
                    Spacer()
                    
                    Button(action: {
                        if audioManager.isSpeaking && audioManager.currentText == item.word {
                            audioManager.stop()
                        } else {
                            audioManager.speak(item.word, language: "bg-BG")
                        }
                    }) {
                        Image(systemName: audioManager.isSpeaking && audioManager.currentText == item.word ? "stop.circle.fill" : "play.circle.fill")
                            .font(.title)
                            .foregroundColor(.blue)
                    }
                }
                
                // German translation
                Text(item.translation)
                    .font(.title2)
                    .foregroundColor(.primary)
                
                // Part of speech
                Text("Part of speech: \(item.type)")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(8)
                
                // Notes section
                if let notes = item.notes, !notes.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Notes:")
                            .font(.headline)
                            .foregroundColor(.primary)
                        
                        Text(notes)
                            .font(.body)
                            .foregroundColor(.secondary)
                            .padding()
                            .background(Color.blue.opacity(0.05))
                            .cornerRadius(12)
                    }
                }
                
                Spacer()
            }
            .padding()
        }
        .navigationTitle(item.word)
        .onDisappear {
            audioManager.stop()
        }
    }
}

struct VocabularyDetailView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationView {
            VocabularyDetailView(item: VocabularyItem(word: "Здравей", translation: "Hello", type: "Greeting", level: "A1", notes: nil))
        }
    }
}