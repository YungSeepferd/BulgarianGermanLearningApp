import fs from 'fs/promises';
import path from 'path';

const VOCAB_FILE = 'data/unified-vocabulary.json';

async function fixIssues() {
  try {
    const vocabPath = path.resolve(process.cwd(), VOCAB_FILE);
    const data = JSON.parse(await fs.readFile(vocabPath, 'utf-8'));
    
    let fixedCount = 0;

    // Access the items array
    if (Array.isArray(data.items)) {
        data.items = data.items.map(item => {
            // Fix die Mutter
            if (item.german === 'die Mutter') {
                if (!item.grammar) item.grammar = {};
                item.grammar.gender = 'feminine';
                item.grammar.plural = 'die Mütter';
                fixedCount++;
            }

            // Fix der Vater
            if (item.german === 'der Vater') {
                if (!item.grammar) item.grammar = {};
                item.grammar.gender = 'masculine';
                item.grammar.plural = 'die Väter';
                fixedCount++;
            }

            return item;
        });
    } else {
        console.error('❌ Error: data.items is not an array');
        process.exit(1);
    }

    if (fixedCount > 0) {
      await fs.writeFile(vocabPath, JSON.stringify(data, null, 2));
      console.log(`✅ Added gender info for ${fixedCount} items.`);
    } else {
      console.log('✨ No issues found to fix.');
    }

  } catch (error) {
    console.error('❌ Error fixing issues:', error);
    process.exit(1);
  }
}

fixIssues();
