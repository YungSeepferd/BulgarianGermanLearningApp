#[cfg(target_arch = "wasm32")]
use web_sys::{window, SpeechSynthesis, SpeechSynthesisUtterance};

#[cfg(target_arch = "wasm32")]
pub struct Audio {
    synth: SpeechSynthesis,
    rate: f32,
    volume: f32,
    language: String,
}

#[cfg(target_arch = "wasm32")]
impl Audio {
    pub fn new() -> Self {
        let win = window().expect("no window");
        let synth = win
            .speech_synthesis()
            .expect("speech synthesis not available");
        let storage = win.local_storage().ok().flatten();
        let rate = storage
            .as_ref()
            .and_then(|s| s.get_item("speechRate").ok().flatten())
            .and_then(|v| v.parse().ok())
            .unwrap_or(1.0);
        let volume = storage
            .as_ref()
            .and_then(|s| s.get_item("speechVolume").ok().flatten())
            .and_then(|v| v.parse().ok())
            .unwrap_or(1.0);
        let language = storage
            .as_ref()
            .and_then(|s| s.get_item("selectedLanguage").ok().flatten())
            .unwrap_or_else(|| "en-US".to_string());
        Self {
            synth,
            rate,
            volume,
            language,
        }
    }

    pub fn set_language(&mut self, language: &str) {
        self.language = language.to_string();
        if let Some(storage) = window()
            .and_then(|w| w.local_storage().ok())
            .flatten()
        {
            let _ = storage.set_item("selectedLanguage", language);
        }
    }

    pub fn update_settings(&mut self, rate: f32, volume: f32) {
        self.rate = rate;
        self.volume = volume;
        if let Some(storage) = window()
            .and_then(|w| w.local_storage().ok())
            .flatten()
        {
            let _ = storage.set_item("speechRate", &rate.to_string());
            let _ = storage.set_item("speechVolume", &volume.to_string());
        }
    }

    pub fn play(&mut self, text: &str) {
        if self.synth.speaking() {
            let _ = self.synth.cancel();
        }
        let utter = SpeechSynthesisUtterance::new().expect("create utterance");
        utter.set_text(text);
        utter.set_lang(&self.language);
        utter.set_rate(self.rate);
        utter.set_volume(self.volume);
        let _ = self.synth.speak(&utter);
    }

    pub fn stop(&self) {
        if self.synth.speaking() {
            let _ = self.synth.cancel();
        }
    }
}

#[cfg(not(target_arch = "wasm32"))]
pub struct Audio;

#[cfg(not(target_arch = "wasm32"))]
impl Audio {
    pub fn new() -> Self {
        Self
    }
    pub fn set_language(&mut self, _language: &str) {}
    pub fn update_settings(&mut self, _rate: f32, _volume: f32) {}
    pub fn play(&mut self, _text: &str) {}
    pub fn stop(&self) {}
}

