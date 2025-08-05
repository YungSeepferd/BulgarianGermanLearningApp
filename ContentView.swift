import SwiftUI

/// The main navigation view.  Users choose between A1 and A2 levels and
/// further choose whether they want to study vocabulary or grammar.  Each
/// option navigates to the appropriate list view.
struct ContentView: View {
    @State private var showingSettings = false
    @AppStorage("learningDirection") private var learningDirection: LearningDirection = .bulgarianToGerman
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Header with app title and settings
                HStack(spacing: 12) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(learningDirection == .bulgarianToGerman ? "Bulgarisch" : "Немски")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                        Text(learningDirection == .bulgarianToGerman ? "Lern-App" : "Учебно приложение")
                            .font(.title2)
                            .foregroundColor(.secondary)
                    }

                    Spacer()

                    DirectionToggle()

                    Button(action: {
                        showingSettings = true
                    }) {
                        Image(systemName: "gearshape.fill")
                            .font(.title2)
                            .foregroundColor(.blue)
                    }
                }
                .padding()
                .background(Color(NSColor.windowBackgroundColor))
                .padding(.bottom, 8)
                
                // Main content
                List {
                    Section(header: Text(learningDirection == .bulgarianToGerman ? "Niveau A1 - Anfänger" : "Ниво A1 - начинаещи")) {
                        NavigationLink(destination: VocabularyListView(level: "A1")) {
                            HStack {
                                Image(systemName: "textformat.abc")
                                    .foregroundColor(.blue)
                                    .frame(width: 30)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(learningDirection == .bulgarianToGerman ? "A1 Vokabeln" : "A1 Лексика")
                                        .font(.headline)
                                    Text(learningDirection == .bulgarianToGerman ? "Grundlegende Wörter und Sätze" : "Основни думи и изрази")
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
                                    Text(learningDirection == .bulgarianToGerman ? "A1 Grammatik" : "A1 Граматика")
                                        .font(.headline)
                                    Text(learningDirection == .bulgarianToGerman ? "Grundregeln" : "Основни граматични правила")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                            }
                        }
                    }
                    
                    Section(header: Text(learningDirection == .bulgarianToGerman ? "Niveau A2 - Grundstufe" : "Ниво A2 - средно")) {
                        NavigationLink(destination: VocabularyListView(level: "A2")) {
                            HStack {
                                Image(systemName: "textformat.abc")
                                    .foregroundColor(.blue)
                                    .frame(width: 30)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(learningDirection == .bulgarianToGerman ? "A2 Vokabeln" : "A2 Лексика")
                                        .font(.headline)
                                    Text(learningDirection == .bulgarianToGerman ? "Erweiterter Wortschatz" : "Разширен речник")
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
                                    Text(learningDirection == .bulgarianToGerman ? "A2 Grammatik" : "A2 Граматика")
                                        .font(.headline)
                                    Text(learningDirection == .bulgarianToGerman ? "Fortgeschrittene Grammatik" : "По-напреднала граматика")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                            }
                        }
                    }
                }
                .listStyle(SidebarListStyle())
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