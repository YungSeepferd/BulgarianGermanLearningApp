#!/usr/bin/env tsx
/**
 * Emoji and Transliteration Enrichment Script
 *
 * Automatically adds:
 * 1. Emoji based on vocabulary category and semantic meaning
 * 2. Latin transliteration for Bulgarian words using Bulgarian phonetic rules
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

interface VocabularyItem {
  id: string;
  german: string;
  bulgarian: string;
  partOfSpeech: string;
  categories: string[];
  emoji?: string;
  transliteration?: {
    german?: string;
    bulgarian?: string;
  };
}

// Category to emoji mapping
const CATEGORY_EMOJI: Record<string, string[]> = {
  greetings: ['👋', '🤝', '💬', '🙋'],
  numbers: ['🔢', '1️⃣', '2️⃣', '📊'],
  family: ['👨‍👩‍👧‍👦', '👪', '👨‍👩‍👧', '👶', '👴', '👵'],
  food: ['🍎', '🍞', '🍖', '🥗', '🍽️', '🥘', '🍲', '🥦', '🥩', '🥖'],
  colors: ['🎨', '🌈', '🔴', '🔵', '🟢', '⚪', '⚫', '🟡'],
  animals: ['🐕', '🐈', '🐦', '🐟', '🦁', '🐘', '🦋', '🐎'],
  'body-parts': ['👁️', '👂', '👃', '🦷', '💪', '🫀', '🦴', '🧠'],
  clothing: ['👕', '👖', '👗', '👔', '👠', '🧥', '👒', '🧤'],
  home: ['🏠', '🏡', '🚪', '🛋️', '🛏️', '🪑', '📺', '🛁'],
  nature: ['🌳', '🌲', '🌸', '🌺', '🌿', '🍃', '🌊', '⛰️'],
  transport: ['🚗', '🚌', '🚲', '✈️', '🚆', '🚢', '🚕', '🚙'],
  technology: ['💻', '📱', '🖥️', '⌨️', '🖱️', '📷', '🔋', '💾'],
  time: ['⏰', '🕐', '📅', '⏳', '📆', '🕰️', '⏱️'],
  weather: ['☀️', '🌧️', '⛈️', '❄️', '🌈', '☁️', '🌤️', '🌪️'],
  professions: ['👨‍⚕️', '👩‍🏫', '👨‍🍳', '👩‍🔧', '👨‍💼', '👮', '🧑‍🌾'],
  places: ['🏢', '🏥', '🏦', '🏪', '🏫', '🏛️', '🏟️', '🗼'],
  grammar: ['📝', '📖', '✍️', '📚', '🗒️', '✏️'],
  culture: ['🎭', '🎨', '🎬', '🎵', '🎪', '🎭', '🎸', '🎺'],
  'everyday-phrases': ['💬', '🗣️', '📢', '💭', '🗨️', '👄']
};

// Word-specific emoji overrides for common words
const WORD_EMOJI: Record<string, string> = {
  // German words
  'Haus': '🏠',
  'Wohnung': '🏢',
  'Schule': '🏫',
  'Krankenhaus': '🏥',
  'Kirche': '⛪',
  'Kino': '🎬',
  'Restaurant': '🍽️',
  'Hotel': '🏨',
  'Bank': '🏦',
  'Bäckerei': '🥖',
  'Apotheke': '💊',
  'Supermarkt': '🛒',
  'Wasser': '💧',
  'Brot': '🍞',
  'Milch': '🥛',
  'Kaffee': '☕',
  'Tee': '🍵',
  'Bier': '🍺',
  'Wein': '🍷',
  'Apfel': '🍎',
  'Banane': '🍌',
  'Buch': '📚',
  'Hund': '🐕',
  'Katze': '🐈',
  'Vogel': '🐦',
  'Fisch': '🐟',
  'Auto': '🚗',
  'Fahrrad': '🚲',
  'Zug': '🚆',
  'Flugzeug': '✈️',
  'Bus': '🚌',
  'Uhr': '⌚',
  'Telefon': '📱',
  'Computer': '💻',
  'Fernsehen': '📺',
  'Mutter': '👩',
  'Vater': '👨',
  'Kind': '👶',
  'Bruder': '👨',
  'Schwester': '👩',
  'Sonne': '☀️',
  'Mond': '🌙',
  'Stern': '⭐',
  'Regen': '🌧️',
  'Schnee': '❄️',
  'Wind': '💨',
  'Feuer': '🔥',
  'Baum': '🌳',
  'Blume': '🌸',
  'Geld': '💰',
  'Arbeit': '💼',
  'Freund': '👫',
  'Liebe': '❤️',
  'Essen': '🍽️',
  'Trinken': '🥤',
  'Schlafen': '😴',
  'Lesen': '📖',
  'Schreiben': '✍️',
  'Laufen': '🏃',
  'Schwimmen': '🏊',
  'Fußball': '⚽',
  'Musik': '🎵',
  'Film': '🎬',
  'Foto': '📷',
  'Arzt': '👨‍⚕️',
  'Lehrer': '👨‍🏫',
  'Polizist': '👮',
  'Koch': '👨‍🍳',
  'Hallo': '👋',
  'Guten Tag': '☀️',
  'Guten Morgen': '🌅',
  'Gute Nacht': '🌙',
  'Danke': '🙏',
  'Bitte': '😊',
  'Ja': '✅',
  'Nein': '❌',
  // Bulgarian words
  'Къща': '🏠',
  'Вода': '💧',
  'Хляб': '🍞',
  'Мляко': '🥛',
  'Кафе': '☕',
  'Чай': '🍵',
  'Книга': '📚',
  'Куче': '🐕',
  'Котка': '🐈',
  'Птица': '🐦',
  'Риба': '🐟',
  'Кола': '🚗',
  'Влак': '🚆',
  'Самолет': '✈️',
  'Автобус': '🚌',
  'Телефон': '📱',
  'Компютър': '💻',
  'Майка': '👩',
  'Баща': '👨',
  'Дете': '👶',
  'Брат': '👨',
  'Сестра': '👩',
  'Слънце': '☀️',
  'Луна': '🌙',
  'Звезда': '⭐',
  'Дъжд': '🌧️',
  'Сняг': '❄️',
  'Вятър': '💨',
  'Огън': '🔥',
  'Дърво': '🌳',
  'Цвете': '🌸',
  'Пари': '💰',
  'Работа': '💼',
  'Приятел': '👫',
  'Любов': '❤️',
  'Здравей': '👋',
  'Добър ден': '☀️',
  'Добро утро': '🌅',
  'Лека нощ': '🌙',
  'Благодаря': '🙏',
  'Моля': '😊',
  'Да': '✅',
  'Не': '❌'
};

// Bulgarian to Latin transliteration mapping
const TRANSLIT_MAP: Record<string, string> = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ж': 'zh',
  'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
  'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f',
  'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sht', 'ъ': 'a', 'ь': 'y',
  'ю': 'yu', 'я': 'ya',
  'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ж': 'Zh',
  'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N',
  'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F',
  'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sht', 'Ъ': 'A', 'Ь': 'Y',
  'Ю': 'Yu', 'Я': 'Ya'
};

function transliterateBulgarian(text: string): string {
  let result = '';
  for (const char of text) {
    result += TRANSLIT_MAP[char] || char;
  }
  return result;
}

function getEmojiForItem(item: VocabularyItem): string | undefined {
  // Check word-specific override first
  const germanLower = item.german.toLowerCase();
  const bulgarianLower = item.bulgarian.toLowerCase();

  // Try exact match
  if (WORD_EMOJI[item.german]) return WORD_EMOJI[item.german];
  if (WORD_EMOJI[item.bulgarian]) return WORD_EMOJI[item.bulgarian];

  // Try case-insensitive match
  for (const [word, emoji] of Object.entries(WORD_EMOJI)) {
    if (word.toLowerCase() === germanLower || word.toLowerCase() === bulgarianLower) {
      return emoji;
    }
  }

  // Fall back to category emoji
  for (const category of item.categories) {
    const emojis = CATEGORY_EMOJI[category];
    if (emojis && emojis.length > 0) {
      // Use hash of ID to pick consistently
      const hash = item.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      return emojis[hash % emojis.length];
    }
  }

  return undefined;
}

async function loadVocabularyChunks(): Promise<Map<string, VocabularyItem[]>> {
  const chunks = new Map<string, VocabularyItem[]>();
  const vocabDir = 'data/vocabulary';

  const files = await glob('*.json', { cwd: vocabDir });
  for (const file of files) {
    if (file === 'index.json' || file === 'search-index.json') continue;

    const content = await fs.readFile(path.join(vocabDir, file), 'utf-8');
    const data = JSON.parse(content);
    if (Array.isArray(data)) {
      chunks.set(file, data);
    }
  }

  return chunks;
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║    EMOJI & TRANSLITERATION ENRICHMENT                       ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // Load vocabulary
  console.log('📂 Loading vocabulary chunks...');
  const chunks = await loadVocabularyChunks();
  let totalItems = 0;
  for (const [file, items] of chunks) {
    console.log(`   ${file}: ${items.length} items`);
    totalItems += items.length;
  }
  console.log(`   Total: ${totalItems} items\n`);

  // Apply enrichments
  console.log('🔄 Adding emoji and transliteration...');
  let emojiAdded = 0;
  let transliterationAdded = 0;
  let skipped = 0;

  for (const [file, items] of chunks) {
    let fileEmoji = 0;
    let fileTranslit = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      let modified = false;

      // Add emoji if missing
      if (!item.emoji) {
        const emoji = getEmojiForItem(item);
        if (emoji) {
          item.emoji = emoji;
          emojiAdded++;
          fileEmoji++;
          modified = true;
        }
      }

      // Add transliteration if missing
      if (!item.transliteration?.bulgarian) {
        if (!item.transliteration) {
          item.transliteration = {};
        }
        item.transliteration.bulgarian = transliterateBulgarian(item.bulgarian);
        transliterationAdded++;
        fileTranslit++;
        modified = true;
      }

      if (!modified) {
        skipped++;
      }
    }

    if (fileEmoji > 0 || fileTranslit > 0) {
      console.log(`   ✅ ${file}: ${fileEmoji} emoji, ${fileTranslit} transliteration`);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Emoji added: ${emojiAdded}/${totalItems} (${((emojiAdded/totalItems)*100).toFixed(1)}%)`);
  console.log(`   Transliteration added: ${transliterationAdded}/${totalItems} (${((transliterationAdded/totalItems)*100).toFixed(1)}%)`);
  console.log(`   Already enriched: ${skipped}\n`);

  // Save enriched chunks
  console.log('💾 Saving enriched chunks...');
  for (const [file, items] of chunks) {
    await fs.writeFile(
      path.join('data/vocabulary', file),
      JSON.stringify(items, null, 2),
      'utf-8'
    );
    console.log(`   ✅ ${file}`);
  }

  console.log('\n✅ Emoji and transliteration enrichment complete!');
  console.log('\nNext steps:');
  console.log('   1. npm run build:search-index  # Regenerate search index');
  console.log('   2. npm run build               # Build application');
  console.log('   3. npm run preview             # Test changes\n');
}

main().catch(error => {
  console.error('❌ Enrichment failed:', error);
  process.exit(1);
});
