use bglg_app_lib::{next_review_time, ReviewState};
use std::time::{Duration, SystemTime};

fn approx_eq(a: f64, b: f64) {
    assert!((a - b).abs() < 1e-6, "{} != {}", a, b);
}

#[test]
fn sm2_correct_progression() {
    let mut state = ReviewState::default();

    // First correct answer
    let now = SystemTime::now();
    let next = next_review_time(true, &mut state);
    assert_eq!(state.repetitions, 1);
    assert_eq!(state.interval, 1);
    approx_eq(state.ease_factor, 2.6);
    let diff = next.duration_since(now).unwrap();
    assert!(diff >= Duration::from_secs(86400));

    // Second correct answer
    next_review_time(true, &mut state);
    assert_eq!(state.repetitions, 2);
    assert_eq!(state.interval, 6);
    approx_eq(state.ease_factor, 2.7);

    // Third correct answer
    next_review_time(true, &mut state);
    assert_eq!(state.repetitions, 3);
    assert_eq!(state.interval, 16); // round(6 * 2.7)
    approx_eq(state.ease_factor, 2.8);
}

#[test]
fn sm2_incorrect_resets() {
    let mut state = ReviewState::default();
    next_review_time(true, &mut state);
    next_review_time(true, &mut state);

    // Incorrect answer should reset repetitions and interval
    next_review_time(false, &mut state);
    assert_eq!(state.repetitions, 0);
    assert_eq!(state.interval, 1);
    approx_eq(state.ease_factor, 2.38);
}
