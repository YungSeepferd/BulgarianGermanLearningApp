use crate::{GrammarItem, VocabularyItem};

pub fn load_vocabulary() -> Result<Vec<VocabularyItem>, serde_json::Error> {
    let data = include_str!("../data/vocabulary.json");
    serde_json::from_str(data)
}

pub fn load_grammar() -> Result<Vec<GrammarItem>, serde_json::Error> {
    let data = include_str!("../data/grammar.json");
    serde_json::from_str(data)
}
