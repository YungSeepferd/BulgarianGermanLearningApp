import SwiftUI

/// Settings view for audio controls and app preferences
struct SettingsView: View {
    @StateObject private var audioManager = AudioManager()
    @Environment(\.presentationMode) var presentationMode
    @AppStorage("learningDirection") private var learningDirection: LearningDirection = .bulgarianToGerman
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text(learningDirection == .bulgarianToGerman ? "Audioeinstellungen" : "Аудио настройки")) {
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text(learningDirection == .bulgarianToGerman ? "Sprechgeschwindigkeit" : "Скорост на речта")
                            Spacer()
                            Text("\(Int(audioManager.speechRate * 100))%")
                                .foregroundColor(.secondary)
                        }

                        Slider(value: $audioManager.speechRate, in: 0.1...1.0, step: 0.1)
                            .accentColor(.blue)
                        Text(learningDirection == .bulgarianToGerman ? "Stellen Sie ein, wie schnell die Wörter gesprochen werden." : "Настройте колко бързо се произнасят думите.")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }

                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text(learningDirection == .bulgarianToGerman ? "Lautstärke" : "Сила на звука")
                            Spacer()
                            Text("\(Int(audioManager.speechVolume * 100))%")
                                .foregroundColor(.secondary)
                        }

                        Slider(value: $audioManager.speechVolume, in: 0.0...1.0, step: 0.1)
                            .accentColor(.blue)
                        Text(learningDirection == .bulgarianToGerman ? "Stellen Sie die Lautstärke der Aussprache ein." : "Настройте силата на произношението.")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }

                Section(header: Text(learningDirection == .bulgarianToGerman ? "Audio testen" : "Тествай аудио")) {
                    HStack {
                        Text(learningDirection == .bulgarianToGerman ? "Aussprache testen" : "Тествай произношението")
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

                Section(header: Text(learningDirection == .bulgarianToGerman ? "Über die App" : "Относно приложението")) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text(learningDirection == .bulgarianToGerman ? "Bulgarisch-Deutsche Lern-App" : "Българо-немско учебно приложение")
                            .font(.headline)
                        Text("Version 1.0")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                        Text(learningDirection == .bulgarianToGerman ? "Lerne bulgarischen Wortschatz mit deutschen Übersetzungen und Audioaussprache." : "Учи немски думи с български преводи и произношение.")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .padding(.vertical, 4)
                }
                // Language direction selection
                Section(header: Text(learningDirection == .bulgarianToGerman ? "Lernrichtung" : "Посока на обучение")) {
                    Picker("", selection: $learningDirection) {
                        Text("Bulgarisch ➜ Deutsch").tag(LearningDirection.bulgarianToGerman)
                        Text("Deutsch ➜ Bulgarisch").tag(LearningDirection.germanToBulgarian)
                    }
                    .pickerStyle(SegmentedPickerStyle())
                }
            }
            .navigationTitle(learningDirection == .bulgarianToGerman ? "Einstellungen" : "Настройки")
                .toolbar {
                    ToolbarItem(placement: .navigationBarLeading) {
                        DirectionToggle()
                    }
                    ToolbarItem(placement: .primaryAction) {
                        Button(learningDirection == .bulgarianToGerman ? "Fertig" : "Готово") {
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