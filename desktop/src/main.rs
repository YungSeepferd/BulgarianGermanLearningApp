use bglg_app_lib::data::{load_grammar, load_vocabulary};

fn main() {
    env_logger::init();
    log::info!("Desktop app placeholder");
    match load_vocabulary() {
        Ok(v) => log::info!("Loaded {} vocabulary items", v.len()),
        Err(e) => log::error!("Failed to load vocabulary: {}", e),
    }
    match load_grammar() {
        Ok(g) => log::info!("Loaded {} grammar topics", g.len()),
        Err(e) => log::error!("Failed to load grammar: {}", e),
    }
}
