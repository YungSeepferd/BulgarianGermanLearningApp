import Foundation
import AVFoundation

/// Manages text-to-speech functionality for pronunciation
class AudioManager: ObservableObject {
    private let synthesizer = AVSpeechSynthesizer()

    @Published var isPlaying = false
    @Published var currentText = ""

    /// Default audio settings
    @Published var speechRate: Float {
        didSet {
            UserDefaults.standard.set(speechRate, forKey: "speechRate")
        }
    }

    @Published var speechVolume: Float {
        didSet {
            UserDefaults.standard.set(speechVolume, forKey: "speechVolume")
        }
    }

    /// Spoken language for the synthesizer
    @Published var speechLanguage: String {
        didSet {
            UserDefaults.standard.set(speechLanguage, forKey: "speechLanguage")
        }
    }

    init() {
        // Load saved settings or use defaults
        let savedRate = UserDefaults.standard.float(forKey: "speechRate")
        self.speechRate = savedRate == 0 ? 0.5 : savedRate

        let savedVolume = UserDefaults.standard.float(forKey: "speechVolume")
        self.speechVolume = savedVolume == 0 ? 1.0 : savedVolume

        let savedLanguage = UserDefaults.standard.string(forKey: "speechLanguage") ?? "en-US"
        self.speechLanguage = savedLanguage

        // Set up audio session
        setupAudioSession()
    }
    
    private func setupAudioSession() {
        #if os(iOS)
        do {
            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            print("Failed to set up audio session: \(error)")
        }
        #endif
    }
    
    /// Speak the given text with current settings
    func speak(_ text: String, language: String? = nil) {
        // Stop any current speech
        if synthesizer.isSpeaking {
            synthesizer.stopSpeaking(at: .immediate)
        }

        let utterance = AVSpeechUtterance(string: text)
        let voiceLanguage = language ?? speechLanguage
        utterance.voice = AVSpeechSynthesisVoice(language: voiceLanguage)
        utterance.rate = speechRate
        utterance.volume = speechVolume

        currentText = text
        isPlaying = true

        synthesizer.speak(utterance)

        // Reset playing state when finished
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            if !self.synthesizer.isSpeaking {
                self.isPlaying = false
            }
        }
    }
    
    /// Stop current speech
    func stop() {
        synthesizer.stopSpeaking(at: .immediate)
        isPlaying = false
    }
    
    /// Check if synthesizer is currently speaking
    var isSpeaking: Bool {
        synthesizer.isSpeaking
    }
} 