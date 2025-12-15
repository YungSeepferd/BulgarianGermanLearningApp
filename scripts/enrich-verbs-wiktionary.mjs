import fs from 'fs/promises';
import { JSDOM } from 'jsdom';
import PQueue from 'p-queue';

const INPUT_FILE = 'enrichment-output/verbs-b21-50-list.json';
const OUTPUT_FILE = 'enrichment-output/batch-21-50-verb-enrichment.json';

async function main() {
  console.log(`Reading input from ${INPUT_FILE}...`);
  const inputContent = await fs.readFile(INPUT_FILE, 'utf-8');
  const items = JSON.parse(inputContent);

  console.log(`Found ${items.length} verbs to enrich.`);

  const queue = new PQueue({ concurrency: 2 });
  const results = [];
  const errors = [];

  let processedCount = 0;

  for (const item of items) {
    queue.add(async () => {
      try {
        const enrichedItem = await enrichItem(item);
        if (enrichedItem) {
          results.push(enrichedItem);
        }
      } catch (error) {
        console.error(`Error enriching item ${item.id} (${item.cleanGerman}):`, error.message);
        errors.push({ id: item.id, error: error.message });
      } finally {
        processedCount++;
        if (processedCount % 5 === 0) {
          console.log(`Processed ${processedCount}/${items.length} items...`);
        }
      }
    });
  }

  await queue.onIdle();

  console.log(`Enrichment complete. Success: ${results.length}, Errors: ${errors.length}`);

  await fs.writeFile(OUTPUT_FILE, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`Results saved to ${OUTPUT_FILE}`);
}

async function enrichItem(item) {
  let word = item.cleanGerman;
  
  // Handle reflexive verbs: "sich setzen" -> "setzen"
  if (word.startsWith('sich ')) {
    word = word.replace('sich ', '');
  }

  const url = `https://de.wiktionary.org/wiki/${encodeURIComponent(word)}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  const html = await response.text();
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  // Find the conjugation table
  // It usually has "Präsens", "ich", "du", "er, sie, es"
  const tables = Array.from(doc.querySelectorAll('table'));
  const table = tables.find(t => 
    t.textContent.includes('Präsens') && 
    t.textContent.includes('ich') && 
    t.textContent.includes('Präteritum')
  );

  if (!table) {
    throw new Error('No standard conjugation table found');
  }

  const conjugation = {
    present: {},
    past: {},
    perfect: {}
  };

  const rows = Array.from(table.querySelectorAll('tr'));
  
  // Helper to clean cell text
  const clean = (text) => text.replace(/\n/g, '').trim();

  // Iterate rows to find data
  // Note: The structure is a bit loose, so we search for keywords in the first cell(s)
  
  let currentTense = null;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const cells = Array.from(row.querySelectorAll('td, th'));
    const rowText = row.textContent;

    // Check for Tense headers
    if (rowText.includes('Präsens')) {
      // Usually: | Präsens | ich | mache |
      // Or: | Präsens | ich | mache | du | machst ... (unlikely)
      // We assume the standard vertical layout
      
      // Row i: Präsens | ich | form
      if (cells.length >= 3) {
        conjugation.present.ich = clean(cells[2].textContent);
      }
      
      // Next row: | du | form
      if (rows[i+1]) {
        const nextCells = rows[i+1].querySelectorAll('td');
        if (nextCells.length >= 2 && nextCells[0].textContent.includes('du')) {
           conjugation.present.du = clean(nextCells[1].textContent);
        }
      }

      // Next next row: | er, sie, es | form
      if (rows[i+2]) {
        const nextNextCells = rows[i+2].querySelectorAll('td');
        if (nextNextCells.length >= 2 && nextNextCells[0].textContent.includes('er')) {
           conjugation.present.er_sie_es = clean(nextNextCells[1].textContent);
        }
      }
    }

    if (rowText.includes('Präteritum')) {
      // Row i: Präteritum | ich | form
      if (cells.length >= 3) {
        conjugation.past.ich = clean(cells[2].textContent);
      }
    }

    if (rowText.includes('Perfekt')) {
      // Row i: Perfekt | Partizip II | Hilfsverb
      // Row i+1: | gemacht | haben
      if (rows[i+1]) {
        const nextCells = rows[i+1].querySelectorAll('td');
        if (nextCells.length >= 2) {
          conjugation.perfect.participle = clean(nextCells[0].textContent);
          conjugation.perfect.auxiliary = clean(nextCells[1].textContent);
        }
      }
    }
  }

  // Infer missing forms if possible (simple heuristic for A1/A2)
  // Present Plural: wir = infinitive, ihr = stem+t, sie = infinitive
  // Past Plural: wir = past_stem+en, ihr = past_stem+t, sie = past_stem+en
  
  // We need the infinitive for inference
  const infinitive = word;
  
  // Infer Present Plural
  if (!conjugation.present.wir) conjugation.present.wir = infinitive;
  if (!conjugation.present.sie) conjugation.present.sie = infinitive;
  
  // Infer Past Plural (rough approximation)
  if (conjugation.past.ich) {
    const pastStem = conjugation.past.ich.replace(/e$/, ''); // machte -> macht, ging -> ging
    // Actually, "machte" ends in e, "ging" doesn't.
    // Regular: machte. ich machte, wir machten.
    // Irregular: ging. ich ging, wir gingen.
    
    // If ends in 'e' (machte), add 'n' for wir/sie.
    // If consonant (ging), add 'en'.
    
    const suffix = conjugation.past.ich.endsWith('e') ? 'n' : 'en';
    conjugation.past.wir = conjugation.past.ich + suffix;
    conjugation.past.sie = conjugation.past.ich + suffix;
  }

  // Validate
  if (!conjugation.present.ich || !conjugation.past.ich || !conjugation.perfect.participle) {
    // console.warn(`Incomplete conjugation for ${word}:`, conjugation);
    // We might still return it if partial
  }

  return {
    id: item.id,
    conjugation
  };
}

main().catch(console.error);
