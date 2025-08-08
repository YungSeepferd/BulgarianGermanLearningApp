use std::cell::RefCell;

use js_sys::{Object, Reflect};
use log::{error, warn};
use wasm_bindgen::{closure::Closure, JsCast, JsValue};
use web_sys::{window, CustomEvent, CustomEventInit, SpeechSynthesisUtterance};

thread_local! {
    static CURRENT_UTTERANCE: RefCell<Option<SpeechSynthesisUtterance>> = RefCell::new(None);
    static SELECTED_LANGUAGE: RefCell<String> = RefCell::new(
        window()
            .and_then(|w| w.local_storage().ok().flatten())
            .and_then(|s| s.get_item(LANGUAGE_KEY).ok().flatten())
            .unwrap_or_else(|| {
                warn!("No stored language, defaulting to en-US");
                "en-US".to_string()
            })
    );
}

const LANGUAGE_KEY: &str = "selectedLanguage";
const RATE_KEY: &str = "speechRate";
const VOLUME_KEY: &str = "speechVolume";

pub fn set_language(language: &str) {
    SELECTED_LANGUAGE.with(|l| *l.borrow_mut() = language.to_string());
    if let Some(storage) = window().and_then(|w| w.local_storage().ok().flatten()) {
        if let Err(e) = storage.set_item(LANGUAGE_KEY, language) {
            warn!("Failed to store language: {:?}", e);
        }
    } else {
        warn!("Local storage unavailable; language not persisted");
    }
}

pub fn get_selected_language() -> String {
    SELECTED_LANGUAGE.with(|l| l.borrow().clone())
}

pub fn update_audio_settings(rate: f32, volume: f32) {
    if let Some(storage) = window().and_then(|w| w.local_storage().ok().flatten()) {
        if let Err(e) = storage.set_item(RATE_KEY, &rate.to_string()) {
            warn!("Failed to store rate: {:?}", e);
        }
        if let Err(e) = storage.set_item(VOLUME_KEY, &volume.to_string()) {
            warn!("Failed to store volume: {:?}", e);
        }
    } else {
        warn!("Local storage unavailable; audio settings not persisted");
    }
}

pub fn speak(text: &str) {
    let win = match window() {
        Some(w) => w,
        None => {
            error!("No window available");
            return;
        }
    };
    let synth = match win.speech_synthesis() {
        Ok(s) => Some(s),
        Err(e) => {
            warn!("Speech synthesis unavailable: {:?}", e);
            None
        }
    };
    if let Some(s) = synth.as_ref() {
        if s.speaking() {
            s.cancel();
        }
    }

    let utter = match SpeechSynthesisUtterance::new_with_text(text) {
        Ok(u) => u,
        Err(e) => {
            error!("Failed to create utterance: {:?}", e);
            return;
        }
    };
    let lang = get_selected_language();
    utter.set_lang(&lang);

    let storage = win.local_storage().ok().flatten();
    let rate = storage
        .as_ref()
        .and_then(|s| s.get_item(RATE_KEY).ok().flatten())
        .and_then(|v| v.parse().ok())
        .unwrap_or_else(|| {
            warn!("No rate found, defaulting to 1.0");
            1.0
        });
    let volume = storage
        .as_ref()
        .and_then(|s| s.get_item(VOLUME_KEY).ok().flatten())
        .and_then(|v| v.parse().ok())
        .unwrap_or_else(|| {
            warn!("No volume found, defaulting to 1.0");
            1.0
        });
    utter.set_rate(rate);
    utter.set_volume(volume);

    if let Some(s) = synth {
        // onstart event
        let start_win = win.clone();
        let start_lang = lang.clone();
        let start_text = text.to_string();
        let onstart = Closure::wrap(Box::new(move || {
            let detail = Object::new();
            if Reflect::set(
                &detail,
                &JsValue::from_str("isPlaying"),
                &JsValue::from_bool(true),
            )
            .is_err()
            {
                warn!("Failed to set isPlaying on detail");
            }
            if Reflect::set(
                &detail,
                &JsValue::from_str("text"),
                &JsValue::from_str(&start_text),
            )
            .is_err()
            {
                warn!("Failed to set text on detail");
            }
            if Reflect::set(
                &detail,
                &JsValue::from_str("language"),
                &JsValue::from_str(&start_lang),
            )
            .is_err()
            {
                warn!("Failed to set language on detail");
            }
            let event_init = CustomEventInit::new();
            event_init.set_detail(&JsValue::from(detail));
            if let Ok(event) =
                CustomEvent::new_with_event_init_dict("audioStateChanged", &event_init)
            {
                if let Some(doc) = start_win.document() {
                    if let Err(e) = doc.dispatch_event(&event) {
                        warn!("Failed to dispatch start event: {:?}", e);
                    }
                } else {
                    warn!("No document to dispatch start event");
                }
            } else {
                warn!("Failed to create start event");
            }
        }) as Box<dyn FnMut()>);
        utter.set_onstart(Some(onstart.as_ref().unchecked_ref()));
        onstart.forget();

        // onend event
        let end_win = win.clone();
        let end_lang = lang.clone();
        let onend = Closure::wrap(Box::new(move || {
            let detail = Object::new();
            if Reflect::set(
                &detail,
                &JsValue::from_str("isPlaying"),
                &JsValue::from_bool(false),
            )
            .is_err()
            {
                warn!("Failed to set isPlaying on detail");
            }
            if Reflect::set(&detail, &JsValue::from_str("text"), &JsValue::from_str("")).is_err() {
                warn!("Failed to set text on detail");
            }
            if Reflect::set(
                &detail,
                &JsValue::from_str("language"),
                &JsValue::from_str(&end_lang),
            )
            .is_err()
            {
                warn!("Failed to set language on detail");
            }
            let event_init = CustomEventInit::new();
            event_init.set_detail(&JsValue::from(detail));
            if let Ok(event) =
                CustomEvent::new_with_event_init_dict("audioStateChanged", &event_init)
            {
                if let Some(doc) = end_win.document() {
                    if let Err(e) = doc.dispatch_event(&event) {
                        warn!("Failed to dispatch end event: {:?}", e);
                    }
                } else {
                    warn!("No document to dispatch end event");
                }
            } else {
                warn!("Failed to create end event");
            }
            CURRENT_UTTERANCE.with(|u| u.borrow_mut().take());
        }) as Box<dyn FnMut()>);
        utter.set_onend(Some(onend.as_ref().unchecked_ref()));
        onend.forget();

        let utter_clone = utter.clone();
        s.speak(&utter);
        CURRENT_UTTERANCE.with(|u| *u.borrow_mut() = Some(utter_clone));
    } else {
        CURRENT_UTTERANCE.with(|u| *u.borrow_mut() = Some(utter));
    }
}

pub fn stop_speaking() {
    if let Some(win) = window() {
        match win.speech_synthesis() {
            Ok(synth) => {
                if synth.speaking() {
                    synth.cancel();
                }
            }
            Err(e) => warn!("Speech synthesis unavailable: {:?}", e),
        }
    } else {
        error!("No window available to stop speaking");
    }
}

pub fn current_utterance_language() -> Option<String> {
    CURRENT_UTTERANCE.with(|u| u.borrow().as_ref().map(|u| u.lang()))
}
