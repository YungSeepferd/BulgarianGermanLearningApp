use bglg_app_lib::data::{load_grammar, load_vocabulary};

fn main() {
    println!("Desktop app placeholder");
    match load_vocabulary() {
        Ok(v) => println!("Loaded {} vocabulary items", v.len()),
        Err(e) => eprintln!("Failed to load vocabulary: {}", e),
    }
    match load_grammar() {
        Ok(g) => println!("Loaded {} grammar topics", g.len()),
        Err(e) => eprintln!("Failed to load grammar: {}", e),
    }
}
