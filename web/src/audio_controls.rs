use crate::audio::{set_language, speak, stop_speaking, update_audio_settings};
use web_sys::{HtmlInputElement, HtmlSelectElement};
use yew::prelude::*;

#[function_component(AudioControls)]
pub fn audio_controls() -> Html {
    let audio_text = use_state(|| "".to_string());
    let rate = use_state(|| 1.0f32);
    let volume = use_state(|| 1.0f32);

    let on_audio_input = {
        let audio_text = audio_text.clone();
        Callback::from(move |e: InputEvent| {
            let input: HtmlInputElement = e.target_unchecked_into();
            audio_text.set(input.value());
        })
    };

    let on_audio_lang_change = Callback::from(|e: Event| {
        let select: HtmlSelectElement = e.target_unchecked_into();
        set_language(&select.value());
    });

    let on_rate_change = {
        let rate = rate.clone();
        let volume = volume.clone();
        Callback::from(move |e: Event| {
            let input: HtmlInputElement = e.target_unchecked_into();
            if let Ok(r) = input.value().parse::<f32>() {
                rate.set(r);
                update_audio_settings(r, *volume);
            }
        })
    };

    let on_volume_change = {
        let rate = rate.clone();
        let volume = volume.clone();
        Callback::from(move |e: Event| {
            let input: HtmlInputElement = e.target_unchecked_into();
            if let Ok(v) = input.value().parse::<f32>() {
                volume.set(v);
                update_audio_settings(*rate, v);
            }
        })
    };

    let on_speak = {
        let audio_text = audio_text.clone();
        Callback::from(move |_| speak(&audio_text))
    };

    let on_stop = Callback::from(|_| stop_speaking());

    html! {
        <div class="audio-controls">
            <input type="text" value={(*audio_text).clone()} oninput={on_audio_input} placeholder="Text" />
            <select onchange={on_audio_lang_change}>
                <option value="en-US">{"English"}</option>
                <option value="bg-BG">{"Bulgarian"}</option>
                <option value="de-DE">{"German"}</option>
            </select>
            <div>
                <label>{"Rate"}</label>
                <input type="range" min="0.5" max="2.0" step="0.1" value={rate.to_string()} onchange={on_rate_change} />
                <label>{"Volume"}</label>
                <input type="range" min="0.0" max="1.0" step="0.1" value={volume.to_string()} onchange={on_volume_change} />
            </div>
            <button onclick={on_speak}>{"Speak"}</button>
            <button onclick={on_stop}>{"Stop"}</button>
        </div>
    }
}
