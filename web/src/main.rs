use bglg_app_web::audio::{set_language, speak, stop_speaking, update_audio_settings};
use bglg_app_web::{GrammarView, VocabularyView};
use web_sys::{HtmlInputElement, HtmlSelectElement};
use yew::prelude::*;

#[function_component(App)]
fn app() -> Html {
    let show_vocab = use_state(|| true);
    let level = use_state(|| "A1".to_string());
    let audio_text = use_state(|| "".to_string());
    let rate = use_state(|| 1.0f32);
    let volume = use_state(|| 1.0f32);

    let toggle_view = {
        let show_vocab = show_vocab.clone();
        Callback::from(move |_| show_vocab.set(!*show_vocab))
    };

    let on_level_change = {
        let level = level.clone();
        Callback::from(move |e: Event| {
            let select: HtmlSelectElement = e.target_unchecked_into();
            level.set(select.value());
        })
    };

    let on_audio_lang_change = Callback::from(|e: Event| {
        let select: HtmlSelectElement = e.target_unchecked_into();
        set_language(&select.value());
    });

    let on_audio_input = {
        let audio_text = audio_text.clone();
        Callback::from(move |e: InputEvent| {
            let input: HtmlInputElement = e.target_unchecked_into();
            audio_text.set(input.value());
        })
    };

    let on_speak = {
        let audio_text = audio_text.clone();
        Callback::from(move |_| speak(&audio_text))
    };

    let on_stop = Callback::from(|_| stop_speaking());

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

    html! {
        <div>
            <h1>{ "Bulgarian-German Trainer" }</h1>
            <div>
                <button onclick={toggle_view}>
                    { if *show_vocab { "Show Grammar" } else { "Show Vocabulary" } }
                </button>
                <select onchange={on_level_change} value={(*level).clone()}>
                    <option value="A1">{ "A1" }</option>
                    <option value="A2">{ "A2" }</option>
                </select>
            </div>
            {
                if *show_vocab {
                    html! { <VocabularyView level={(*level).clone()} /> }
                } else {
                    html! { <GrammarView level={(*level).clone()} /> }
                }
            }
            <div class="audio-controls">
                <input type="text" value={(*audio_text).clone()} oninput={on_audio_input} placeholder="Text" />
                <select onchange={on_audio_lang_change}>
                    <option value="en-US">{ "English" }</option>
                    <option value="bg-BG">{ "Bulgarian" }</option>
                    <option value="de-DE">{ "German" }</option>
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
        </div>
    }
}

fn main() {
    wasm_logger::init(wasm_logger::Config::default());
    yew::Renderer::<App>::new().render();
}
