import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, '../static/data/vocabulary-unified.json');

function migrate() {
  console.log('Starting vocabulary migration...');

  try {
    const rawData = fs.readFileSync(DATA_PATH, 'utf-8');
    const vocabulary = JSON.parse(rawData);

    console.log(`Found ${vocabulary.length} items. Migrating...`);

    const migrated = vocabulary.map(item => {
      // Create a new object to ensure key order if desired, or just mutate
      const richItem = {
        ...item,
        // Add new Rich Context fields if they don't exist
        contextual_nuance: item.contextual_nuance || undefined,
        mnemonics: item.mnemonics || undefined,
        emoji: item.emoji || undefined,
        image_url: item.image_url || undefined,
        audio_url: item.audio_url || undefined,
        xp_value: item.xp_value || 10, // Default XP
        
        // Ensure grammar object structure exists if applicable
        grammar: item.grammar ? {
          ...item.grammar,
          // Add rich grammar fields if missing (undefined by default to keep JSON clean)
          verb_aspect: item.grammar.verb_aspect || undefined,
          verb_partner_id: item.grammar.verb_partner_id || undefined,
          plural_form: item.grammar.plural_form || undefined,
          conjugation_class: item.grammar.conjugation_class || undefined
        } : undefined
      };

      return richItem;
    });

    fs.writeFileSync(DATA_PATH, JSON.stringify(migrated, null, 2));
    console.log('Migration complete! Updated vocabulary-unified.json');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();