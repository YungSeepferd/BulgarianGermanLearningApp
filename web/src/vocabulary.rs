use bglg_app_lib::{data::load_vocabulary, VocabularyItem};
use yew::prelude::*;

#[derive(Properties, PartialEq)]
pub struct VocabularyProps {
    pub level: String,
}

#[function_component(VocabularyView)]
pub fn vocabulary_view(props: &VocabularyProps) -> Html {
    match load_vocabulary() {
        Ok(items) => {
            let items: Vec<VocabularyItem> = items
                .into_iter()
                .filter(|i| i.level == props.level)
                .collect();

            html! {
                <div>
                    <h2>{ format!("Vocabulary {}", props.level) }</h2>
                    <ul>
                        { for items.iter().map(|item| html! { <li>{ format!("{} – {}", item.word, item.translation) }</li> }) }
                    </ul>
                </div>
            }
        }
        Err(e) => {
            html! { <div class="error">{ format!("Failed to load vocabulary: {}", e) }</div> }
        }
    }
}
