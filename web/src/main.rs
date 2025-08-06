mod audio;

use audio::Audio;
use bglg_app_lib::VocabularyItem;
use yew::prelude::*;

#[function_component(App)]
fn app() -> Html {
    let audio = use_mut_ref(Audio::new);
    let sample = VocabularyItem {
        word: "Hallo".into(),
        translation: "Hello".into(),
        category: "greeting".into(),
        level: "A1".into(),
        notes: None,
    };
    let play_sample = {
        let audio = audio.clone();
        let word = sample.word.clone();
        Callback::from(move |_| {
            audio.borrow_mut().play(&word);
        })
    };

    html! {
        <div>
            <h1>{ "Bulgarian-German Trainer" }</h1>
            <p>{ format!("{} = {}", sample.word, sample.translation) }</p>
            <button onclick={play_sample}>{"Play"}</button>
        </div>
    }
}

fn main() {
    yew::Renderer::<App>::new().render();
}
