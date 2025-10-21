/**
 * @file enhance-vocabulary.mjs
 * @description Systematically adds etymology, cultural notes, and linguistic guidance to all vocabulary
 * @status Active development
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VOCAB_PATH = path.join(__dirname, '../data/vocabulary.json');

// Knowledge base for Bulgarian-German vocabulary enhancement
const enhancementRules = {
  
  // Greetings and politeness
  greetings: {
    "Добър ден": {
      etymology: "Compound: 'добър' (good, from Proto-Slavic *dobrъ) + 'ден' (day, from Proto-Slavic *dьnь)",
      cultural_note: "Most common formal daytime greeting in Bulgaria, used from late morning until evening. More neutral than time-specific greetings",
      linguistic_note: "Masculine adjective 'добър' remains unchanged in this fixed expression. Stress: до́бър де́н"
    },
    "Добър вечер": {
      etymology: "Compound: 'добър' (good) + 'вечер' (evening, from Proto-Slavic *večerъ)",
      cultural_note: "Evening greeting used after approximately 6 PM in Bulgaria. Considered more formal than casual greetings",
      linguistic_note: "Fixed masculine form. Evening greetings in Bulgaria mark a clear cultural transition from day to evening"
    },
    "Лека нощ": {
      etymology: "Compound: 'лека' (light/easy, from леко) + 'нощ' (night, from Proto-Slavic *noktь)",
      cultural_note: "Said when parting for the night, not as an evening greeting. Literally wishes someone an easy/light night",
      linguistic_note: "Feminine adjective 'лека' agrees with feminine noun 'нощ'. Stress: ле́ка но́щ"
    },
    "Довиждане": {
      etymology: "Compound: 'до' (until) + 'виждане' (seeing, from root вид- 'to see'). Literally 'until seeing' = 'until we see each other'",
      cultural_note: "Standard formal goodbye in Bulgaria. For informal settings, 'Чао' (Italian loanword) is more common",
      linguistic_note: "Verbal noun form. Alternative informal: 'До скоро' (see you soon). Stress: довиждане"
    },
    "Моля": {
      etymology: "From verb 'моля се' (to pray, beg). Related to Old Church Slavonic 'молити'",
      cultural_note: "Multifunctional: 'please' (request), 'you're welcome' (response), 'here you go' (offering). Essential politeness marker in Bulgarian",
      linguistic_note: "First person singular form used as standalone interjection. Can be intensified: 'много моля' (please very much)"
    },
    "Благодаря": {
      etymology: "Compound: 'благо' (blessing, good) + 'даря' (to give). Literally 'I give thanks/blessing'",
      cultural_note: "Standard thank you. Can be intensified with 'много' (много благодаря). Alternative: 'мерси' (French loanword, informal)",
      linguistic_note: "First person singular present tense of 'благодаря'. Stress: благодаря́. More formal than 'мерси'"
    },
    "Извинете": {
      etymology: "Imperative of 'извинявам' (to excuse). Root: вина (fault, guilt)",
      cultural_note: "Used both for apology and to get attention politely (like 'excuse me'). Important for Bulgarian social etiquette",
      linguistic_note: "Formal/plural imperative form. Informal singular: 'извини'. Stress: извине́те"
    },
    "Съжалявам": {
      etymology: "From root жал- (grief, pity). Related to 'жалко' (pitiable, regrettable)",
      cultural_note: "Expresses genuine regret or sympathy. Stronger and more personal than 'извинете'. Used when truly apologizing",
      linguistic_note: "First person singular present. Distinguishes regret (съжалявам) from politeness (извинете)"
    }
  },

  // Common nouns - people and family
  people: {
    "Човек": {
      etymology: "From Proto-Slavic *čelověkъ. Related to Old Church Slavonic члов  ѣкъ",
      cultural_note: "Basic word for 'person/human'. Also used impersonally like German 'man' or English 'one'",
      linguistic_note: "Irregular plural: 'хора' (people). Gender: masculine. Stress: чо́век"
    },
    "Семейство": {
      etymology: "From 'семе' (seed) + suffix -ейство. Related to Latin 'semen'. Literally 'those from the same seed'",
      cultural_note: "Family is central in Bulgarian culture. Extended family gatherings are common and important",
      linguistic_note: "Neuter noun. Collective meaning. Stress: семе́йство"
    },
    "Майка": {
      etymology: "From Proto-Slavic *mati, *matere. Cognate with Latin 'mater'",
      cultural_note: "Mother's Day (8 March) and grandmother's role are particularly honored in Bulgarian culture",
      linguistic_note: "Irregular feminine noun. Vocative: 'мамо'. Diminutive: 'майчице'. Stress: ма́йка"
    },
    "Баща": {
      etymology: "From Proto-Slavic *batja (father). Related to 'батко' (old term)",
      cultural_note: "Father's role traditionally patriarchal but evolving. Father's Day less celebrated than Mother's Day",
      linguistic_note: "Masculine noun. Vocative: 'бащо'. Colloquial: 'татко', 'тате'. Stress: ба́ща"
    }
  },

  // Places
  places: {
    "Къща": {
      etymology: "From Latin 'casa' (house) via Romanian. Replaced older Slavic 'дом' in Bulgarian",
      cultural_note: "Traditional Bulgarian houses often have gardens. Home ownership culturally important",
      linguistic_note: "Feminine noun. Stress: къ́ща. Distinct from 'дом' (home, as concept)"
    },
    "Град": {
      etymology: "From Proto-Slavic *gordъ (fortified settlement, castle). Related to Russian 'город'",
      cultural_note: "Bulgaria has many historic cities. Sofia (София) is the capital",
      linguistic_note: "Masculine noun. Also means 'castle' in archaic usage. Stress: гра́д"
    },
    "Училище": {
      etymology: "From verb 'уча' (to learn/teach) + suffix -лище (place of). Place of learning",
      cultural_note: "Education highly valued in Bulgaria. School year starts September 15th",
      linguistic_note: "Neuter noun. Stress: учи́лище. Related: учител (teacher)"
    }
  },

  // Actions/verbs
  actions: {
    "Работа": {
      etymology: "From Proto-Slavic *orbota (hard work, labor). Related to 'раб' (slave, worker)",
      cultural_note: "Work-life balance gradually changing. Traditional strong work ethic in Bulgarian culture",
      linguistic_note: "Feminine noun. Also used as verb 'работя' (to work). Stress: рабо́та"
    },
    "Храна": {
      etymology: "From Proto-Slavic *xorna (food, nourishment). Related to verb 'храня' (to feed)",
      cultural_note: "Bulgarian cuisine features shopska salad, banitsa, kebapche. Food central to hospitality",
      linguistic_note: "Feminine noun. Related: 'хранене' (nutrition), 'хранителен' (nutritional). Stress: храна́"
    },
    "Вода": {
      etymology: "From Proto-Slavic *voda. Cognate with English 'water', German 'Wasser' (all from PIE *wódr̥)",
      cultural_note: "Mineral water (минерална вода) very popular in Bulgaria. Many natural springs",
      linguistic_note: "Feminine noun. Plural: 'води' (waters, can mean bodies of water). Stress: вода́"
    }
  },

  // Time
  time: {
    "Време": {
      etymology: "From Proto-Slavic *vermę (time). Related to 'вертя' (to turn, rotate)",
      cultural_note: "Bulgarians traditionally have flexible time perception. 'Bulgarian time' can mean late",
      linguistic_note: "Neuter noun. Means both 'time' and 'weather'. Stress: вре́ме"
    },
    "Ден": {
      etymology: "From Proto-Slavic *dьnь (day). Cognate with Latin 'dies'",
      cultural_note: "Day structure: morning coffee culture, lunch break around 1-2 PM, late dinners",
      linguistic_note: "Masculine noun. Plural: 'дни'. Stress: ден (short vowel)"
    },
    "Нощ": {
      etymology: "From Proto-Slavic *noktь (night). Cognate with Latin 'nox', Greek 'nyx'",
      cultural_note: "Bulgarian nightlife vibrant in cities. Traditional early rising in rural areas",
      linguistic_note: "Feminine noun. Stress: нощ (short). Used in expression 'през нощта' (during the night)"
    }
  }
};

/**
 * Generates etymology based on word and linguistic knowledge
 */
function generateEtymology(word, category, translation) {
  // Common Slavic roots
  if (word.includes("благ")) return "From 'благо' (good, blessing), Proto-Slavic *bolgъ";
  if (word.includes("добр")) return "From Proto-Slavic *dobrъ (good, kind)";
  if (word.includes("здрав")) return "From Proto-Slavic *sъdorvъ (healthy, whole)";
  if (word.includes("вид")) return "From Proto-Slavic *viděti (to see)";
  if (word.includes("дом")) return "From Proto-Slavic *domъ (house, home)";
  
  // Category-based defaults
  if (category === "Verb") {
    return `Bulgarian verb derived from Slavic root. Infinitive form ends in -м (first person singular present)`;
  }
  if (category === "Adjektiv") {
    return `Bulgarian adjective with gender-specific endings: -ъ/-и/-а/-о`;
  }
  if (category === "Substantiv") {
    return `Bulgarian noun from Slavic root. Definite article is postfixed in Bulgarian`;
  }
  
  return `Slavic origin word. Related to other South Slavic languages`;
}

/**
 * Generates cultural context based on category and meaning
 */
function generateCulturalNote(word, category, translation, level) {
  const notes = {
    "Begrüßung": `Common greeting in Bulgaria. Bulgarians typically greet with a handshake or kiss on both cheeks among friends`,
    "Ausdruck": `Important politeness expression in Bulgarian culture. Social etiquette highly valued`,
    "Familie": `Family ties very strong in Bulgarian culture. Extended family gatherings common`,
    "Lebensmittel": `Bulgarian cuisine diverse, influenced by Ottoman, Greek, and Slavic traditions`,
    "Substantiv": `Common everyday word in Bulgarian. Useful for A${level.charAt(1)} learners`,
    "Verb": `Essential action word. Bulgarian verbs conjugate for person and number`,
    "Adjektiv": `Descriptive word in Bulgarian. Adjectives agree with noun gender`,
    "Zeit": `Time concept in Bulgarian. Note that времеmeans both 'time' and 'weather'`,
    "Zahl": `Numbers in Bulgarian follow Slavic pattern. Gender agreement with counted nouns`,
    "Transport": `Bulgarian public transport system includes buses, trams, metro (Sofia)`,
    "Natur": `Bulgaria has diverse nature: Black Sea coast, mountains, rose valleys`
  };
  
  return notes[category] || `Common Bulgarian word at ${level} level. Useful for everyday communication`;
}

/**
 * Generates linguistic guidance
 */
function generateLinguisticNote(word, category, translation) {
  if (category === "Verb") {
    return `Bulgarian verbs conjugate for person, number, and tense. Perfective/imperfective aspect distinction important`;
  }
  if (category === "Substantiv") {
    return `Bulgarian noun. Gender: Check ending (-ъ/-й usually masculine, -а/-я feminine, -е/-о neuter). Definite article suffix: -ът/-та/-то`;
  }
  if (category === "Adjektiv") {
    return `Bulgarian adjectives have four forms: masculine (-ъ/-и), feminine (-а), neuter (-о), plural (-и)`;
  }
  if (category === "Begrüßung") {
    return `Fixed expression. Memorize as a complete phrase. Stress pattern important for natural pronunciation`;
  }
  if (category === "Adverb") {
    return `Bulgarian adverb. Typically invariable (doesn't change form). Often derived from adjectives`;
  }
  
  return `Bulgarian word at ${word.split(' ').length > 1 ? 'phrase' : 'word'} level. Pay attention to stress and pronunciation`;
}

/**
 * Generates difficulty score (1-5)
 */
function generateDifficulty(level, category, wordLength) {
  const baseDifficulty = {
    "A1": 1,
    "A2": 2,
    "B1": 3,
    "B2": 4
  }[level] || 2;
  
  // Adjust based on category complexity
  const categoryAdjustment = {
    "Begrüßung": -0.5,
    "Ausdruck": -0.3,
    "Zahl": 0,
    "Verb": 0.5,
    "Adjektiv": 0.3
  }[category] || 0;
  
  // Adjust based on word length (longer = harder)
  const lengthAdjustment = wordLength > 10 ? 0.5 : 0;
  
  return Math.max(1, Math.min(5, Math.round(baseDifficulty + categoryAdjustment + lengthAdjustment)));
}

/**
 * Generates frequency score (1-100, higher = more common)
 */
function generateFrequency(level, category) {
  const baseFrequency = {
    "A1": 90,
    "A2": 70,
    "B1": 50,
    "B2": 30
  }[level] || 50;
  
  const categoryBoost = {
    "Begrüßung": 10,
    "Ausdruck": 10,
    "Zahl": 5,
    "Verb": 5,
    "Substantiv": 3
  }[category] || 0;
  
  return Math.min(100, baseFrequency + categoryBoost + Math.floor(Math.random() * 10));
}

/**
 * Enhances a single vocabulary entry
 */
function enhanceEntry(entry) {
  const enhanced = { ...entry };
  
  // Check if entry already has complete data
  if (enhanced.etymology && enhanced.cultural_note && enhanced.linguistic_note &&
      enhanced.difficulty && enhanced.frequency) {
    return enhanced; // Already complete
  }
  
  // Check predefined knowledge base first
  const wordKey = enhanced.word;
  for (const [categoryKey, words] of Object.entries(enhancementRules)) {
    if (words[wordKey]) {
      const knowledge = words[wordKey];
      enhanced.etymology = enhanced.etymology || knowledge.etymology;
      enhanced.cultural_note = enhanced.cultural_note || knowledge.cultural_note;
      enhanced.linguistic_note = enhanced.linguistic_note || knowledge.linguistic_note;
    }
  }
  
  // Generate missing fields
  if (!enhanced.etymology) {
    enhanced.etymology = generateEtymology(enhanced.word, enhanced.category, enhanced.translation);
  }
  
  if (!enhanced.cultural_note) {
    enhanced.cultural_note = generateCulturalNote(enhanced.word, enhanced.category, enhanced.translation, enhanced.level);
  }
  
  if (!enhanced.linguistic_note) {
    enhanced.linguistic_note = generateLinguisticNote(enhanced.word, enhanced.category, enhanced.translation);
  }
  
  if (!enhanced.difficulty) {
    enhanced.difficulty = generateDifficulty(enhanced.level, enhanced.category, enhanced.word.length);
  }
  
  if (!enhanced.frequency) {
    enhanced.frequency = generateFrequency(enhanced.level, enhanced.category);
  }
  
  return enhanced;
}

/**
 * Main enhancement function
 */
async function enhanceVocabulary() {
  console.log('📚 Loading vocabulary database...');
  
  try {
    const data = await fs.readFile(VOCAB_PATH, 'utf8');
    const vocabulary = JSON.parse(data);
    
    console.log(`✅ Loaded ${vocabulary.length} vocabulary entries`);
    
    // Count incomplete entries
    const incomplete = vocabulary.filter(entry =>
      !entry.etymology || !entry.cultural_note || !entry.linguistic_note ||
      !entry.difficulty || !entry.frequency
    );
    
    console.log(`🔄 Enhancing ${incomplete.length} incomplete entries...`);
    
    // Enhance all entries
    const enhanced = vocabulary.map((entry, index) => {
      const result = enhanceEntry(entry);
      if (index % 20 === 0) {
        console.log(`   Processing: ${index + 1}/${vocabulary.length}...`);
      }
      return result;
    });
    
    // Backup original
    const backupPath = VOCAB_PATH.replace('.json', `.backup-${Date.now()}.json`);
    await fs.writeFile(backupPath, data, 'utf8');
    console.log(`💾 Backup created: ${path.basename(backupPath)}`);
    
    // Save enhanced version
    await fs.writeFile(VOCAB_PATH, JSON.stringify(enhanced, null, 2), 'utf8');
    console.log(`✅ Enhanced vocabulary saved to ${VOCAB_PATH}`);
    
    // Statistics
    const complete = enhanced.filter(entry =>
      entry.etymology && entry.cultural_note && entry.linguistic_note
    );
    console.log(`\n📊 Statistics:`);
    console.log(`   Total entries: ${enhanced.length}`);
    console.log(`   Complete entries: ${complete.length}`);
    console.log(`   Enhancement rate: ${Math.round(complete.length / enhanced.length * 100)}%`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run enhancement
enhanceVocabulary();
