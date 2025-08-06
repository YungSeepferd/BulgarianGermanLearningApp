use bglg_app_lib::{data::grammar, GrammarItem};
use yew::prelude::*;

#[derive(Properties, PartialEq)]
pub struct GrammarProps {
    pub level: String,
}

#[function_component(GrammarView)]
pub fn grammar_view(props: &GrammarProps) -> Html {
    let items: Vec<GrammarItem> = grammar()
        .into_iter()
        .filter(|g| g.level == props.level)
        .collect();

    html! {
        <div>
            <h2>{ format!("Grammar {}", props.level) }</h2>
            { for items.iter().map(|g| html! {
                <div class="grammar-topic">
                    <h3>{ &g.title }</h3>
                    <p>{ &g.description }</p>
                    <ul>
                        { for g.examples.iter().map(|ex| html! { <li>{ ex }</li> }) }
                    </ul>
                </div>
            }) }
        </div>
    }
}
