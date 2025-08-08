use serde::{Deserialize, Serialize};
use std::time::{Duration, SystemTime};

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

/// State used by the SM-2 spaced repetition algorithm.
///
/// * `interval` - the current interval in days
/// * `ease_factor` - ease factor used to grow the interval
/// * `repetitions` - number of consecutive correct reviews
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReviewState {
    pub interval: u32,
    pub ease_factor: f64,
    pub repetitions: u32,
}

impl Default for ReviewState {
    fn default() -> Self {
        Self {
            interval: 0,
            ease_factor: 2.5,
            repetitions: 0,
        }
    }
}

/// Calculate the next review time using the SM-2 algorithm.
///
/// The `correct` flag represents whether the user answered the item
/// correctly. The provided `state` is updated in place and the
/// `SystemTime` of the next review is returned.
pub fn next_review_time(correct: bool, state: &mut ReviewState) -> SystemTime {
    // Map the bool to a SM-2 quality response. Correct answers are treated as
    // quality 5, wrong answers as quality 2 so that the card is considered
    // failed and repetitions reset.
    let quality: u32 = if correct { 5 } else { 2 };

    if quality < 3 {
        state.repetitions = 0;
        state.interval = 1;
    } else {
        state.repetitions += 1;
        match state.repetitions {
            1 => state.interval = 1,
            2 => state.interval = 6,
            _ => {
                state.interval = (state.interval as f64 * state.ease_factor).round() as u32;
            }
        }
    }

    // Update ease factor according to SM-2 formula.
    let q = quality as f64;
    state.ease_factor += 0.1 - (5.0 - q) * (0.08 + (5.0 - q) * 0.02);
    if state.ease_factor < 1.3 {
        state.ease_factor = 1.3;
    }

    SystemTime::now() + Duration::from_secs(state.interval as u64 * 60 * 60 * 24)
}
