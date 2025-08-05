import SwiftUI

/// Displays a list of vocabulary items for a given level.  Each row adapts to
/// the current learning direction, presenting the headword with its
/// translation.  Tapping on a row navigates to a detail view with more
/// information.
struct VocabularyListView: View {
    let level: String
    @StateObject private var audioManager = AudioManager()
    @State private var searchText = ""
    @State private var selectedType = ""
    @AppStorage("learningDirection") private var learningDirection: LearningDirection = .bulgarianToGerman
    
    // Filter the shared vocabulary items by level on initialisation
    private var items: [VocabularyItem] {
        DataStore.vocabularyItems.filter { $0.level == level }
            .sorted { $0.displayedWord(for: learningDirection) < $1.displayedWord(for: learningDirection) }
    }
    
    // Filtered items based on search and type
    private var filteredItems: [VocabularyItem] {
        var filtered = items
        
        if !searchText.isEmpty {
            filtered = filtered.filter { 
                $0.displayedWord(for: learningDirection).localizedCaseInsensitiveContains(searchText) ||
                $0.displayedTranslation(for: learningDirection).localizedCaseInsensitiveContains(searchText)
            }
        }
        
        if selectedType != allFilterLabel {
            filtered = filtered.filter { $0.displayedType(for: learningDirection) == selectedType }
        }
        
        return filtered
    }
    
    // Available types for filtering
    private var availableTypes: [String] {
        let types = Set(items.map { $0.displayedType(for: learningDirection) })
        return [allFilterLabel] + Array(types).sorted()
    }

    private var allFilterLabel: String { learningDirection.allFilterLabel }

    var body: some View {
        VStack {
            // Search and filter controls
            VStack(spacing: 12) {
                // Search bar
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(.gray)
                    TextField(learningDirection == .bulgarianToGerman ? "Wörter suchen..." : "Търсене...", text: $searchText)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                    if !searchText.isEmpty {
                        Button(action: { searchText = "" }) {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundColor(.gray)
                        }
                        .buttonStyle(PlainButtonStyle())
                        .accessibilityLabel(learningDirection.clearSearchLabel)
                    }
                }
                .padding(6)
                .background(Color.gray.opacity(0.08))
                .cornerRadius(10)
                
                // Type filter
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(availableTypes, id: \.self) { type in
                            Button(action: {
                                selectedType = type
                            }) {
                                Text(type)
                                    .font(.caption)
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 6)
                                    .background(selectedType == type ? Color.blue : Color.gray.opacity(0.2))
                                    .foregroundColor(selectedType == type ? .white : .primary)
                                    .cornerRadius(16)
                            }
                        }
                    }
                    .padding(.horizontal)
                }
            }
            .padding()
            
            // Vocabulary list
            if filteredItems.isEmpty {
                Spacer()
                Text(learningDirection.noResultsText)
                    .foregroundColor(.secondary)
                    .padding()
                Spacer()
            } else {
                List {
                    ForEach(filteredItems) { item in
                        NavigationLink(destination: VocabularyDetailView(item: item)) {
                            HStack {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(item.displayedWord(for: learningDirection))
                                        .font(.headline)
                                    Text(item.displayedTranslation(for: learningDirection))
                                        .font(.subheadline)
                                        .foregroundColor(.secondary)
                                    Text(item.displayedType(for: learningDirection))
                                        .font(.caption)
                                        .foregroundColor(.blue)
                                        .padding(.horizontal, 6)
                                        .padding(.vertical, 2)
                                        .background(Color.blue.opacity(0.1))
                                        .cornerRadius(4)
                                }
                                Spacer()
                                let baseWord = item.displayedWord(for: learningDirection)
                                Button(action: {
                                    if audioManager.isSpeaking && audioManager.currentText == baseWord {
                                        audioManager.stop()
                                    } else {
                                        audioManager.speak(baseWord, language: item.audioLanguage(for: learningDirection))
                                    }
                                }) {
                                    Image(systemName: audioManager.isSpeaking && audioManager.currentText == baseWord ? "stop.circle.fill" : "play.circle.fill")
                                        .font(.title2)
                                        .foregroundColor(.blue)
                                }
                                .buttonStyle(PlainButtonStyle())
                                .accessibilityLabel(learningDirection.playPronunciationLabel(for: baseWord))
                            }
                        }
                    }
                }
            }
        }
        .navigationTitle("\(level) \(learningDirection == .bulgarianToGerman ? "Vokabeln" : "Лексика")")
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                DirectionToggle()
            }
        }
        .onAppear { selectedType = allFilterLabel }
        .onChange(of: learningDirection) { _ in
            selectedType = allFilterLabel
        }
        .onDisappear {
            audioManager.stop()
        }
    }
}

struct VocabularyListView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationView {
            VocabularyListView(level: "A1")
        }
    }
}