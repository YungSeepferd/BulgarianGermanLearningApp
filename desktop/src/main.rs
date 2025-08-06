use bglg_app_lib::VocabularyItem;

fn main() {
    println!("Desktop app placeholder");
    let _ = VocabularyItem {
        word: "Hallo".into(),
        translation: "Hello".into(),
        category: "greeting".into(),
        level: "A1".into(),
        notes: None,
    };
}
