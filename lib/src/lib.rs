use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct VocabularyItem {
    pub word: String,
    pub translation: String,
    pub category: String,
    pub level: String,
    pub notes: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct GrammarItem {
    pub title: String,
    pub description: String,
    pub examples: Vec<String>,
    pub level: String,
}

pub mod data;

// Placeholder for spaced repetition logic
pub fn next_review_time(_correct: bool) -> Option<std::time::SystemTime> {
    None
}
