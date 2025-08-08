use crate::{GrammarItem, VocabularyItem};
use log::info;

pub fn load_vocabulary() -> Result<Vec<VocabularyItem>, serde_json::Error> {
    let data = include_str!("../data/vocabulary.json");
    let vocab: Vec<VocabularyItem> = serde_json::from_str(data)?;
    info!("Loaded {} vocabulary items", vocab.len());
    Ok(vocab)
}

pub fn load_grammar() -> Result<Vec<GrammarItem>, serde_json::Error> {
    let data = include_str!("../data/grammar.json");
    let grammar: Vec<GrammarItem> = serde_json::from_str(data)?;
    info!("Loaded {} grammar topics", grammar.len());
    Ok(grammar)
}
