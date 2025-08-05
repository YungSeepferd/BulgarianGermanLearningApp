import SwiftUI

/// The main navigation view.  Users choose between A1 and A2 levels and
/// further choose whether they want to study vocabulary or grammar.  Each
/// option navigates to the appropriate list view.
struct ContentView: View {
    var body: some View {
        NavigationView {
            List {
                Section(header: Text("Level A1")) {
                    NavigationLink(destination: VocabularyListView(level: "A1")) {
                        Text("A1 Vocabulary")
                    }
                    NavigationLink(destination: GrammarListView(level: "A1")) {
                        Text("A1 Grammar")
                    }
                }
                Section(header: Text("Level A2")) {
                    NavigationLink(destination: VocabularyListView(level: "A2")) {
                        Text("A2 Vocabulary")
                    }
                    NavigationLink(destination: GrammarListView(level: "A2")) {
                        Text("A2 Grammar")
                    }
                }
            }
            .listStyle(InsetGroupedListStyle())
            .navigationTitle("Bulgarian A1–A2")
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}