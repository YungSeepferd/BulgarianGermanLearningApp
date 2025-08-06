use std::cell::RefCell;

use js_sys::{Object, Reflect};
use wasm_bindgen::{closure::Closure, JsCast, JsValue};
use web_sys::{window, CustomEvent, CustomEventInit, SpeechSynthesisUtterance};

thread_local! {
    static CURRENT_UTTERANCE: RefCell<Option<SpeechSynthesisUtterance>> = RefCell::new(None);
    static SELECTED_LANGUAGE: RefCell<String> = RefCell::new(
        window()
            .and_then(|w| w.local_storage().ok().flatten())
            .and_then(|s| s.get_item(LANGUAGE_KEY).ok().flatten())
            .unwrap_or_else(|| "en-US".to_string())
    );
}

const LANGUAGE_KEY: &str = "selectedLanguage";
const RATE_KEY: &str = "speechRate";
const VOLUME_KEY: &str = "speechVolume";

pub fn set_language(language: &str) {
    SELECTED_LANGUAGE.with(|l| *l.borrow_mut() = language.to_string());
    if let Some(storage) = window().and_then(|w| w.local_storage().ok().flatten()) {
        let _ = storage.set_item(LANGUAGE_KEY, language);
    }
}

pub fn get_selected_language() -> String {
    SELECTED_LANGUAGE.with(|l| l.borrow().clone())
}

pub fn update_audio_settings(rate: f32, volume: f32) {
    if let Some(storage) = window().and_then(|w| w.local_storage().ok().flatten()) {
        let _ = storage.set_item(RATE_KEY, &rate.to_string());
        let _ = storage.set_item(VOLUME_KEY, &volume.to_string());
    }
}

pub fn speak(text: &str) {
    let win = match window() {
        Some(w) => w,
        None => return,
    };
    let synth = win.speech_synthesis().ok();
    if let Some(s) = synth.as_ref() {
        if s.speaking() {
            let _ = s.cancel();
        }
    }

    let utter = match SpeechSynthesisUtterance::new_with_text(text) {
        Ok(u) => u,
        Err(_) => return,
    };
    let lang = get_selected_language();
    utter.set_lang(&lang);

    let storage = win.local_storage().ok().flatten();
    let rate = storage
        .as_ref()
        .and_then(|s| s.get_item(RATE_KEY).ok().flatten())
        .and_then(|v| v.parse().ok())
        .unwrap_or(1.0);
    let volume = storage
        .as_ref()
        .and_then(|s| s.get_item(VOLUME_KEY).ok().flatten())
        .and_then(|v| v.parse().ok())
        .unwrap_or(1.0);
    utter.set_rate(rate);
    utter.set_volume(volume);

    if let Some(s) = synth {
        // onstart event
        let start_win = win.clone();
        let start_lang = lang.clone();
        let start_text = text.to_string();
        let onstart = Closure::wrap(Box::new(move || {
            let detail = Object::new();
            let _ = Reflect::set(
                &detail,
                &JsValue::from_str("isPlaying"),
                &JsValue::from_bool(true),
            );
            let _ = Reflect::set(&detail, &JsValue::from_str("text"), &JsValue::from_str(&start_text));
            let _ = Reflect::set(&detail, &JsValue::from_str("language"), &JsValue::from_str(&start_lang));
            let event_init = CustomEventInit::new();
            event_init.set_detail(&JsValue::from(detail));
            if let Ok(event) = CustomEvent::new_with_event_init_dict("audioStateChanged", &event_init) {
                if let Some(doc) = start_win.document() {
                    let _ = doc.dispatch_event(&event);
                }
            }
        }) as Box<dyn FnMut()>);
        utter.set_onstart(Some(onstart.as_ref().unchecked_ref()));
        onstart.forget();

        // onend event
        let end_win = win.clone();
        let end_lang = lang.clone();
        let onend = Closure::wrap(Box::new(move || {
            let detail = Object::new();
            let _ = Reflect::set(
                &detail,
                &JsValue::from_str("isPlaying"),
                &JsValue::from_bool(false),
            );
            let _ = Reflect::set(&detail, &JsValue::from_str("text"), &JsValue::from_str(""));
            let _ = Reflect::set(&detail, &JsValue::from_str("language"), &JsValue::from_str(&end_lang));
            let event_init = CustomEventInit::new();
            event_init.set_detail(&JsValue::from(detail));
            if let Ok(event) = CustomEvent::new_with_event_init_dict("audioStateChanged", &event_init) {
                if let Some(doc) = end_win.document() {
                    let _ = doc.dispatch_event(&event);
                }
            }
            CURRENT_UTTERANCE.with(|u| u.borrow_mut().take());
        }) as Box<dyn FnMut()>);
        utter.set_onend(Some(onend.as_ref().unchecked_ref()));
        onend.forget();

        let utter_clone = utter.clone();
        let _ = s.speak(&utter);
        CURRENT_UTTERANCE.with(|u| *u.borrow_mut() = Some(utter_clone));
    } else {
        CURRENT_UTTERANCE.with(|u| *u.borrow_mut() = Some(utter));
    }
}

pub fn stop_speaking() {
    if let Some(win) = window() {
        if let Ok(synth) = win.speech_synthesis() {
            if synth.speaking() {
                let _ = synth.cancel();
            }
        }
    }
}

pub fn current_utterance_language() -> Option<String> {
    CURRENT_UTTERANCE.with(|u| u.borrow().as_ref().map(|u| u.lang()))
}

