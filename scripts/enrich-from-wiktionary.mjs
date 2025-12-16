import fs from 'fs/promises';
import path from 'path';
import { JSDOM } from 'jsdom';
import PQueue from 'p-queue';

const INPUT_FILE = 'enrichment-output/nouns-missing-declension.json';
const OUTPUT_FILE = 'enrichment-output/nouns-declension-enrichment.json';

async function main() {
  console.log(`Reading input from ${INPUT_FILE}...`);
  const inputContent = await fs.readFile(INPUT_FILE, 'utf-8');
  const inputData = JSON.parse(inputContent);
  const items = inputData.items;

  console.log(`Found ${items.length} items to enrich.`);

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
        console.error(`Error enriching item ${item.id} (${item.german}):`, error.message);
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
  // Clean German word: "das Haus" -> "Haus", "das Heim, das Zuhause" -> "Heim"
  let word = item.german.split(',')[0].trim();
  // Remove article (der, die, das)
  word = word.replace(/^(der|die|das)\s+/i, '');
  
  // Handle special cases or cleanup
  word = word.trim();

  const url = `https://de.wiktionary.org/wiki/${encodeURIComponent(word)}`;
  // console.log(`Fetching ${url}...`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  // Find gender
  // Look for "Substantiv, <gender>" in headers or text
  // Example: "Substantiv, n"
  let gender = null;
  const genderRegex = /Substantiv,\s*([mfn])/i;
  
  // Try to find it in the text content of headers or paragraphs
  const contentText = doc.body.textContent;
  const genderMatch = contentText.match(genderRegex);
  if (genderMatch) {
    gender = genderMatch[1].toLowerCase();
  }

  // Find declension table
  // Look for a table that contains "Nominativ", "Genitiv", "Dativ", "Akkusativ"
  const tables = doc.querySelectorAll('table.wikitable');
  let declensionTable = null;

  for (const table of tables) {
    const text = table.textContent;
    if (text.includes('Nominativ') && text.includes('Genitiv') && text.includes('Singular') && text.includes('Plural')) {
      declensionTable = table;
      break;
    }
  }

  let declension = null;

  if (declensionTable) {
    declension = extractDeclension(declensionTable);
  } else {
    // console.warn(`No declension table found for ${word}`);
  }

  if (!gender && !declension) {
    throw new Error(`No gender or declension found for ${word}`);
  }

  return {
    id: item.id,
    gender: gender || item.gender || 'n', // Fallback to existing or 'n'
    declension: declension
  };
}

function extractDeclension(table) {
  const rows = table.querySelectorAll('tr');
  const result = {
    singular: {},
    plural: {}
  };

  const cases = ['nominativ', 'genitiv', 'dativ', 'akkusativ'];
  
  // Map row index to case? No, better to look at the th in the row
  
  for (const row of rows) {
    const ths = row.querySelectorAll('th');
    const tds = row.querySelectorAll('td');
    
    if (ths.length === 0 && tds.length === 0) continue;

    // Check if this row is a case row
    let caseName = null;
    let caseHeader = null;

    // Sometimes the case is in the first th
    if (ths.length > 0) {
      const headerText = ths[0].textContent.trim().toLowerCase();
      if (cases.includes(headerText)) {
        caseName = headerText;
        caseHeader = ths[0];
      }
    }

    if (caseName) {
      // Assuming structure: [Case Header] [Singular] [Plural]
      // But sometimes it's different.
      // Standard Wiktionary German declension table:
      // Row 1: Headers (Singular, Plural)
      // Row 2: Nominativ, Sing, Plur
      
      // Let's look at the cells.
      // Usually: th(Case), td(Singular), td(Plural)
      
      let singularCell = null;
      let pluralCell = null;

      if (tds.length >= 2) {
        singularCell = tds[0];
        pluralCell = tds[1];
      } else if (tds.length === 1) {
        // Maybe only singular or plural?
        // Or maybe the table is transposed?
        // Standard is usually vertical cases.
      }

      if (singularCell) {
        result.singular[caseName] = cleanCellText(singularCell);
      }
      if (pluralCell) {
        result.plural[caseName] = cleanCellText(pluralCell);
      }
    }
  }

  // Validate if we got all cases
  const hasAllSingular = cases.every(c => result.singular[c]);
  const hasAllPlural = cases.every(c => result.plural[c]);

  if (!hasAllSingular && !hasAllPlural) {
    return null;
  }

  return result;
}

function cleanCellText(element) {
  // Clone to not modify DOM
  const clone = element.cloneNode(true);
  
  // Replace <br> with newline
  const brs = clone.querySelectorAll('br');
  brs.forEach(br => br.replaceWith('\n'));
  
  let text = clone.textContent;

  // Remove footnotes like [1], [2]
  let clean = text.replace(/\[\d+\]/g, '');
  // Remove IPA or other annotations if present (usually not in the cell text directly mixed with word)
  // But sometimes there are multiple forms separated by comma or newline
  // "dem Haus\ndem Hause" -> "dem Haus, dem Hause"
  clean = clean.replace(/\n/g, ', ');
  clean = clean.replace(/\s+/g, ' ').trim();
  // Fix potential missing spaces between words if they were stuck together
  // e.g. "des Heimsdes Heimes" -> "des Heims, des Heimes"
  // This is hard to do perfectly with regex without knowing words.
  // But with the <br> fix above, it should be handled.
  
  return clean;
}

main().catch(console.error);
