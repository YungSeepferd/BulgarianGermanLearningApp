mod grammar;
mod vocabulary;

use grammar::GrammarView;
use vocabulary::VocabularyView;
use web_sys::HtmlSelectElement;
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
        Callback::from(move |e: Event| {
            let select: HtmlSelectElement = e.target_unchecked_into();
            level.set(select.value());
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
        </div>
    }
}

fn main() {
    yew::Renderer::<App>::new().render();
}
