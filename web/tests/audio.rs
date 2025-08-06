use wasm_bindgen_test::*;
use bglg_app_web::audio;

#[wasm_bindgen_test]
fn set_language_updates_storage() {
    audio::set_language("bg-BG");
    assert_eq!(audio::get_selected_language(), "bg-BG");
}

#[wasm_bindgen_test]
fn speak_uses_selected_language() {
    audio::set_language("bg-BG");
    audio::speak("test");
    if let Some(lang) = audio::current_utterance_language() {
        assert_eq!(lang, "bg-BG");
    }
}
