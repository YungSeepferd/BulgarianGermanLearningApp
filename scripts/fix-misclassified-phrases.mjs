import fs from 'fs/promises';
import path from 'path';

const VOCAB_FILE = 'data/unified-vocabulary.json';

const POS_MAPPING = {
    // Verbs
    'kommen': 'verb', 'kaufen': 'verb', 'geben': 'verb', 'arbeiten': 'verb', 
    'verstehen': 'verb', 'glauben': 'verb', 'fühlen': 'verb', 'bleiben': 'verb', 
    'suchen': 'verb', 'sehen': 'verb', 'danken': 'verb', 'bitten': 'verb', 
    'entschuldigen': 'verb', 'bezahlen': 'verb', 'kosten': 'verb', 'reisen': 'verb', 
    'haben': 'verb', 'schauen': 'verb', 'ansehen': 'verb', 'gehen': 'verb', 'fahren': 'verb',
    'aufstehen': 'verb', 'werden': 'verb', 'tragen': 'verb', 'anhaben': 'verb', 
    'nehmen': 'verb', 'holen': 'verb',

    // Adjectives
    'rot': 'adjective', 'blau': 'adjective', 'grün': 'adjective', 'gelb': 'adjective', 
    'orange': 'adjective', 'braun': 'adjective', 'grau': 'adjective', 'rosa': 'adjective', 
    'pink': 'adjective', 'groß': 'adjective', 'klein': 'adjective', 'hoch': 'adjective', 
    'niedrig': 'adjective', 'lang': 'adjective', 'kurz': 'adjective', 'dick': 'adjective', 
    'fett': 'adjective', 'dünn': 'adjective', 'schön': 'adjective', 'hübsch': 'adjective', 
    'nett': 'adjective', 'hässlich': 'adjective', 'jung': 'adjective', 'heiß': 'adjective', 
    'kalt': 'adjective', 'warm': 'adjective', 'reich': 'adjective', 'arm': 'adjective', 
    'stark': 'adjective', 'schwach': 'adjective', 'schnell': 'adjective', 'langsam': 'adjective', 
    'glücklich': 'adjective', 'traurig': 'adjective', 'müde': 'adjective', 'hungrig': 'adjective', 
    'durstig': 'adjective', 'krank': 'adjective', 'gesund': 'adjective', 'gut': 'adjective', 
    'schlecht': 'adjective', 'wichtig': 'adjective',

    // Nouns (Days/Months/Family)
    'Montag': 'noun', 'Dienstag': 'noun', 'Mittwoch': 'noun', 'Donnerstag': 'noun', 
    'Freitag': 'noun', 'Samstag': 'noun', 'Sonntag': 'noun', 'Sonnabend': 'noun',
    'Januar': 'noun', 'Februar': 'noun', 'März': 'noun', 'April': 'noun', 
    'Mai': 'noun', 'Juni': 'noun', 'Juli': 'noun', 'August': 'noun', 
    'September': 'noun', 'Oktober': 'noun', 'November': 'noun', 'Dezember': 'noun',
    'Tag': 'noun', 'Woche': 'noun', 'Jahr': 'noun',
    'Sohn': 'noun', 'Tochter': 'noun', 'Bruder': 'noun', 'Schwester': 'noun',

    // Conjunctions
    'und': 'conjunction', 'aber': 'conjunction', 'oder': 'conjunction',

    // Adverbs
    'immer': 'adverb', 'nie': 'adverb', 'oft': 'adverb', 'selten': 'adverb', 
    'noch': 'adverb', 'jetzt': 'adverb', 'gestern': 'adverb', 'morgen': 'adverb', 
    'heute': 'adverb', 'hier': 'adverb', 'dort': 'adverb'
};

async function fixMisclassifiedPhrases() {
  try {
    const vocabPath = path.resolve(process.cwd(), VOCAB_FILE);
    const data = JSON.parse(await fs.readFile(vocabPath, 'utf-8'));
    
    let fixedCount = 0;

    if (Array.isArray(data.items)) {
        data.items = data.items.map(item => {
            // Only check items marked as 'phrase'
            if (item.partOfSpeech === 'phrase') {
                // Clean the german string to handle commas and parentheses
                // e.g. "schauen, sehen, ansehen" -> "schauen"
                // e.g. "fahren (weggehen)" -> "fahren"
                // e.g. "der Tag" -> "Tag" (handle articles for nouns)
                
                let cleanGerman = item.german.split(',')[0].trim();
                cleanGerman = cleanGerman.split('(')[0].trim();
                
                // Remove articles for noun checking
                if (cleanGerman.startsWith('der ')) cleanGerman = cleanGerman.substring(4);
                if (cleanGerman.startsWith('die ')) cleanGerman = cleanGerman.substring(4);
                if (cleanGerman.startsWith('das ')) cleanGerman = cleanGerman.substring(4);

                // Check exact match
                if (POS_MAPPING[cleanGerman]) {
                    item.partOfSpeech = POS_MAPPING[cleanGerman];
                    fixedCount++;
                } 
                // Check if it starts with the word (fallback)
                else {
                    const firstWord = cleanGerman.split(' ')[0];
                    if (POS_MAPPING[firstWord]) {
                         item.partOfSpeech = POS_MAPPING[firstWord];
                         fixedCount++;
                    }
                }
                
                // Special case for reflexive verbs "sich ..."
                if (item.german.startsWith('sich ')) {
                    item.partOfSpeech = 'verb';
                    fixedCount++;
                }
                
                // Special case for "schlafen gehen"
                if (item.german === 'schlafen gehen') {
                    item.partOfSpeech = 'verb';
                    fixedCount++;
                }
            }
            return item;
        });
    } else {
        console.error('❌ Error: data.items is not an array');
        process.exit(1);
    }

    if (fixedCount > 0) {
      await fs.writeFile(vocabPath, JSON.stringify(data, null, 2));
      console.log(`✅ Fixed partOfSpeech for ${fixedCount} items.`);
    } else {
      console.log('✨ No items found to fix.');
    }

  } catch (error) {
    console.error('❌ Error fixing phrases:', error);
    process.exit(1);
  }
}

fixMisclassifiedPhrases();
