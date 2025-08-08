use web_sys::HtmlSelectElement;
use yew::prelude::*;

#[derive(Properties, PartialEq)]
pub struct LevelSelectorProps {
    pub level: String,
    pub on_change: Callback<String>,
}

#[function_component(LevelSelector)]
pub fn level_selector(props: &LevelSelectorProps) -> Html {
    let onchange = {
        let on_change = props.on_change.clone();
        Callback::from(move |e: Event| {
            let select: HtmlSelectElement = e.target_unchecked_into();
            on_change.emit(select.value());
        })
    };

    html! {
        <select onchange={onchange} value={props.level.clone()}>
            <option value="A1">{"A1"}</option>
            <option value="A2">{"A2"}</option>
        </select>
    }
}
