use bglg_app_lib::VocabularyItem;
use yew::prelude::*;

#[function_component(App)]
fn app() -> Html {
    let sample = VocabularyItem {
        word: "Hallo".into(),
        translation: "Hello".into(),
        category: "greeting".into(),
        level: "A1".into(),
        notes: None,
    };

    html! {
        <div>
            <h1>{ "Bulgarian-German Trainer" }</h1>
            <p>{ format!("{} = {}", sample.word, sample.translation) }</p>
        </div>
    }
}

fn main() {
    yew::Renderer::<App>::new().render();
}
