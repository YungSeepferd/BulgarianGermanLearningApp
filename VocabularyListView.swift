import SwiftUI

/// Displays a list of vocabulary items for a given level.  Each row shows
/// the Bulgarian word and its English translation.  Tapping on a row
/// navigates to a detail view with more information.
struct VocabularyListView: View {
    let level: String
    @StateObject private var audioManager = AudioManager()
    @State private var searchText = ""
    @State private var selectedType = "All"
    
    // Filter the shared vocabulary items by level on initialisation
    private var items: [VocabularyItem] {
        DataStore.vocabularyItems.filter { $0.level == level }
            .sorted { $0.word < $1.word }
    }
    
    // Filtered items based on search and type
    private var filteredItems: [VocabularyItem] {
        var filtered = items
        
        if !searchText.isEmpty {
            filtered = filtered.filter { 
                $0.word.localizedCaseInsensitiveContains(searchText) ||
                $0.translation.localizedCaseInsensitiveContains(searchText)
            }
        }
        
        if selectedType != "All" {
            filtered = filtered.filter { $0.type == selectedType }
        }
        
        return filtered
    }
    
    // Available types for filtering
    private var availableTypes: [String] {
        let types = Set(items.map { $0.type })
        return ["All"] + Array(types).sorted()
    }

    var body: some View {
        VStack {
            // Search and filter controls
            VStack(spacing: 12) {
                // Search bar
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(.gray)
                    TextField("Search words...", text: $searchText)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                    if !searchText.isEmpty {
                        Button(action: { searchText = "" }) {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundColor(.gray)
                        }
                        .buttonStyle(PlainButtonStyle())
                        .accessibilityLabel("Clear search")
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
                Text("No results found.")
                    .foregroundColor(.secondary)
                    .padding()
                Spacer()
            } else {
                List {
                    ForEach(filteredItems) { item in
                        NavigationLink(destination: VocabularyDetailView(item: item)) {
                            HStack {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(item.word)
                                        .font(.headline)
                                    Text(item.translation)
                                        .font(.subheadline)
                                        .foregroundColor(.secondary)
                                    Text(item.type)
                                        .font(.caption)
                                        .foregroundColor(.blue)
                                        .padding(.horizontal, 6)
                                        .padding(.vertical, 2)
                                        .background(Color.blue.opacity(0.1))
                                        .cornerRadius(4)
                                }
                                Spacer()
                                // Audio button
                                Button(action: {
                                    if audioManager.isSpeaking && audioManager.currentText == item.word {
                                        audioManager.stop()
                                    } else {
                                        audioManager.speak(item.word)
                                    }
                                }) {
                                    Image(systemName: audioManager.isSpeaking && audioManager.currentText == item.word ? "stop.circle.fill" : "play.circle.fill")
                                        .font(.title2)
                                        .foregroundColor(.blue)
                                }
                                .buttonStyle(PlainButtonStyle())
                                .accessibilityLabel("Play pronunciation for \(item.word)")
                            }
                        }
                    }
                }
            }
        }
        .navigationTitle("\(level) Vocabulary")
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