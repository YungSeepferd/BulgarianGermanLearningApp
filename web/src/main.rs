use bglg_app_web::{AudioControls, GrammarView, LevelSelector, VocabularyView};
use yew::prelude::*;

#[function_component(App)]
fn app() -> Html {
    let show_vocab = use_state(|| true);
    let level = use_state(|| "A1".to_string());

    let toggle_view = {
        let show_vocab = show_vocab.clone();
        Callback::from(move |_| show_vocab.set(!*show_vocab))
    };

    let on_level_change = {
        let level = level.clone();
        Callback::from(move |new_level: String| level.set(new_level))
    };

    html! {
        <div>
            <h1>{ "Bulgarian-German Trainer" }</h1>
            <div>
                <button onclick={toggle_view}>
                    { if *show_vocab { "Show Grammar" } else { "Show Vocabulary" } }
                </button>
                <LevelSelector level={(*level).clone()} on_change={on_level_change} />
            </div>
            {
                if *show_vocab {
                    html! { <VocabularyView level={(*level).clone()} /> }
                } else {
                    html! { <GrammarView level={(*level).clone()} /> }
                }
            }
            <AudioControls />
        </div>
    }
}

fn main() {
    yew::Renderer::<App>::new().render();
}
