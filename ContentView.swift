import SwiftUI

/// The main navigation view.  Users choose between A1 and A2 levels and
/// further choose whether they want to study vocabulary or grammar.  Each
/// option navigates to the appropriate list view.
struct ContentView: View {
    @State private var showingSettings = false
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Header with app title and settings
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Bulgarian")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                        Text("Learning App")
                            .font(.title2)
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                    
                    Button(action: {
                        showingSettings = true
                    }) {
                        Image(systemName: "gearshape.fill")
                            .font(.title2)
                            .foregroundColor(.blue)
                    }
                }
                .padding()
                .background(Color(.systemBackground))
                
                // Main content
                List {
                    Section(header: Text("Level A1 - Beginner")) {
                        NavigationLink(destination: VocabularyListView(level: "A1")) {
                            HStack {
                                Image(systemName: "textformat.abc")
                                    .foregroundColor(.blue)
                                    .frame(width: 30)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text("A1 Vocabulary")
                                        .font(.headline)
                                    Text("Basic words and phrases")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                            }
                        }
                        
                        NavigationLink(destination: GrammarListView(level: "A1")) {
                            HStack {
                                Image(systemName: "book.fill")
                                    .foregroundColor(.green)
                                    .frame(width: 30)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text("A1 Grammar")
                                        .font(.headline)
                                    Text("Fundamental grammar rules")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                            }
                        }
                    }
                    
                    Section(header: Text("Level A2 - Elementary")) {
                        NavigationLink(destination: VocabularyListView(level: "A2")) {
                            HStack {
                                Image(systemName: "textformat.abc")
                                    .foregroundColor(.blue)
                                    .frame(width: 30)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text("A2 Vocabulary")
                                        .font(.headline)
                                    Text("Extended vocabulary")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                            }
                        }
                        
                        NavigationLink(destination: GrammarListView(level: "A2")) {
                            HStack {
                                Image(systemName: "book.fill")
                                    .foregroundColor(.green)
                                    .frame(width: 30)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text("A2 Grammar")
                                        .font(.headline)
                                    Text("Advanced grammar concepts")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                            }
                        }
                    }
                }
                .listStyle(InsetGroupedListStyle())
            }
        }
        .sheet(isPresented: $showingSettings) {
            SettingsView()
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}