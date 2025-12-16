const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/unified-vocabulary.json');
const BACKUP_FILE = path.join(__dirname, `../data/unified-vocabulary-backup-phase8-${Date.now()}.json`);

function migrate() {
  console.log('Starting Phase 8 Data Migration...');

  // 1. Read data
  const rawData = fs.readFileSync(DATA_FILE, 'utf8');
  const data = JSON.parse(rawData);
  const items = Array.isArray(data) ? data : (data.items || []);

  console.log(`Loaded ${items.length} items.`);

  // 2. Backup
  fs.writeFileSync(BACKUP_FILE, rawData);
  console.log(`Backup created at ${BACKUP_FILE}`);

  let modifiedCount = 0;

  // 3. Transform
  const migratedItems = items.map(item => {
    let modified = false;
    const newItem = { ...item };

    // --- Cultural Notes Migration ---
    const notes = [];
    
    // Check root culturalNotes (could be string or array)
    if (newItem.culturalNotes) {
      if (Array.isArray(newItem.culturalNotes)) {
        notes.push(...newItem.culturalNotes);
      } else if (typeof newItem.culturalNotes === 'string') {
        notes.push(newItem.culturalNotes);
      }
    }

    // Check metadata culturalNotes
    if (newItem.metadata && newItem.metadata.culturalNotes) {
      notes.push(newItem.metadata.culturalNotes);
      delete newItem.metadata.culturalNotes; // Remove from metadata
      modified = true;
    }

    // Deduplicate and join
    const uniqueNotes = [...new Set(notes.filter(n => n && n.trim().length > 0))];
    if (uniqueNotes.length > 0) {
      const newNotes = uniqueNotes.join('\n\n');
      if (newItem.culturalNotes !== newNotes) {
        newItem.culturalNotes = newNotes;
        modified = true;
      }
    } else if (newItem.culturalNotes) {
        // If it was present but empty/invalid, remove it to be clean
        delete newItem.culturalNotes;
        modified = true;
    }

    // --- Mnemonics Migration ---
    if (newItem.metadata && newItem.metadata.mnemonics) {
      const mnemonicText = newItem.metadata.mnemonics;
      
      // Only create if root mnemonic doesn't exist or is empty
      if (!newItem.mnemonic) {
        newItem.mnemonic = {
          text: mnemonicText,
          author: 'system',
          createdAt: new Date().toISOString(),
          upvotes: 0
        };
        modified = true;
      }
      
      delete newItem.metadata.mnemonics; // Remove from metadata
      modified = true;
    }

    if (modified) {
      modifiedCount++;
    }

    return newItem;
  });

  // 4. Save
  // Force object structure with items array
  const outputData = {
    id: "d90bfaa2-8f93-4fb2-8571-8133bb392434", // Keep consistent ID if possible or generate new
    name: "German-Bulgarian Vocabulary",
    description: "Comprehensive German-Bulgarian vocabulary collection with unified schema",
    languagePair: "de-bg",
    difficultyRange: [1, 5],
    categories: ["greetings", "everyday-phrases"], // This should ideally be dynamic but hardcoding for structure
    itemCount: migratedItems.length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 2,
    items: migratedItems
  };
  
  fs.writeFileSync(DATA_FILE, JSON.stringify(outputData, null, 2));
  console.log(`Migration complete. Modified ${modifiedCount} items. Saved as object structure.`);
}

migrate();
