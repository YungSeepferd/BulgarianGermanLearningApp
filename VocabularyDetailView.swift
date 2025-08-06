import SwiftUI

/// Shows detailed information about a single vocabulary item.  Depending on
/// the current learning direction, the view presents the headword with its
/// translation, the part of speech and any additional notes.  A spacer pushes
/// content to the top when there is little information.
struct VocabularyDetailView: View {
    let item: VocabularyItem
    @StateObject private var audioManager = AudioManager()
    @AppStorage("learningDirection") private var learningDirection: LearningDirection = .bulgarianToGerman
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Word with audio button
                HStack {
                    let baseWord = item.displayedWord(for: learningDirection)
                    Text(baseWord)
                        .font(.largeTitle)
                        .bold()

                    Spacer()

                    Button(action: {
                        if audioManager.isSpeaking && audioManager.currentText == baseWord {
                            audioManager.stop()
                        } else {
                            audioManager.speak(baseWord, language: item.audioLanguage(for: learningDirection))
                        }
                    }) {
                        Image(systemName: audioManager.isSpeaking && audioManager.currentText == baseWord ? "stop.circle.fill" : "play.circle.fill")
                            .font(.title)
                            .foregroundColor(.blue)
                    }
                    .accessibilityLabel(learningDirection.playPronunciationLabel(for: baseWord))
                }
                Divider()
                // Translation
                Text(item.displayedTranslation(for: learningDirection))
                    .font(.title2)
                    .foregroundColor(.primary)
                Divider()
                // Part of speech
                Text((learningDirection == .bulgarianToGerman ? "Wortart: " : "Част на речта: ") + item.displayedType(for: learningDirection))
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(8)
                Divider()
                // Notes section with both languages
                let notePair = item.notesPair(for: learningDirection)
                if (notePair.primary ?? "").isEmpty == false || (notePair.secondary ?? "").isEmpty == false {
                    VStack(alignment: .leading, spacing: 8) {
                        Text(learningDirection == .bulgarianToGerman ? "Notizen:" : "Бележки:")
                            .font(.headline)
                            .foregroundColor(.primary)

                        if let primary = notePair.primary, !primary.isEmpty {
                            Text(primary)
                                .font(.body)
                                .foregroundColor(.primary)
                                .padding()
                                .background(Color.blue.opacity(0.05))
                                .cornerRadius(12)
                        }

                        if let secondary = notePair.secondary, !secondary.isEmpty {
                            Text((learningDirection == .bulgarianToGerman ? "На български: " : "Auf Deutsch: ") + secondary)
                                .font(.body)
                                .foregroundColor(.secondary)
                                .padding()
                                .background(Color.blue.opacity(0.05))
                                .cornerRadius(12)
                        }
                    }
                }
                
                Spacer()
            }
            .padding()
        }
        .navigationTitle(item.displayedWord(for: learningDirection))
        .navigationBarBackButtonHidden(false)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                DirectionToggle()
            }
        }
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