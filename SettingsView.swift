import SwiftUI

/// Settings view for audio controls and app preferences
struct SettingsView: View {
    @StateObject private var audioManager = AudioManager()
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Audio Settings")) {
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text("Speech Rate")
                            Spacer()
                            Text("\(Int(audioManager.speechRate * 100))%")
                                .foregroundColor(.secondary)
                        }
                        
                        Slider(value: $audioManager.speechRate, in: 0.1...1.0, step: 0.1)
                            .accentColor(.blue)
                        Text("Adjust how fast the words are spoken.")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text("Volume")
                            Spacer()
                            Text("\(Int(audioManager.speechVolume * 100))%")
                                .foregroundColor(.secondary)
                        }
                        
                        Slider(value: $audioManager.speechVolume, in: 0.0...1.0, step: 0.1)
                            .accentColor(.blue)
                        Text("Adjust the pronunciation volume.")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                Section(header: Text("Test Audio")) {
                    HStack {
                        Text("Test pronunciation")
                        Spacer()
                        Button(action: {
                            audioManager.speak("Здравей", language: "bg-BG")
                        }) {
                            Image(systemName: audioManager.isSpeaking ? "stop.circle.fill" : "play.circle.fill")
                                .font(.title2)
                                .foregroundColor(.blue)
                        }
                    }
                }
                
                Section(header: Text("About")) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Bulgarian-German Learning App")
                            .font(.headline)
                        Text("Version 1.0")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                        Text("Learn Bulgarian vocabulary with German translations and audio pronunciation.")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .padding(.vertical, 4)
                }
            }
            .navigationTitle("Settings")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button("Done") {
                        presentationMode.wrappedValue.dismiss()
                    }
                }
            }
        }
        .onDisappear {
            audioManager.stop()
        }
    }
}

struct SettingsView_Previews: PreviewProvider {
    static var previews: some View {
        SettingsView()
    }
} 