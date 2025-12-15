import fs from 'fs/promises';
import { JSDOM } from 'jsdom';
import PQueue from 'p-queue';

const INPUT_FILE = 'enrichment-output/adjectives-b21-50-list.json';
const OUTPUT_FILE = 'enrichment-output/batch-21-50-adjective-enrichment.json';

async function main() {
  console.log(`Reading input from ${INPUT_FILE}...`);
  const inputContent = await fs.readFile(INPUT_FILE, 'utf-8');
  const items = JSON.parse(inputContent);

  console.log(`Found ${items.length} adjectives to enrich.`);

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
  
  const url = `https://de.wiktionary.org/wiki/${encodeURIComponent(word)}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  const html = await response.text();
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  // Find the comparison table
  // | Positiv | Komparativ | Superlativ |
  const tables = Array.from(doc.querySelectorAll('table'));
  const table = tables.find(t => 
    t.textContent.includes('Positiv') && 
    t.textContent.includes('Komparativ') && 
    t.textContent.includes('Superlativ')
  );

  if (!table) {
    // Some adjectives are not comparable (e.g. "tot", "schwanger", "einzig")
    // Or the table is missing.
    // We can check if it says "keine Steigerung" or similar.
    // For now, just return null or throw.
    // Actually, for A1/A2, most should be comparable.
    throw new Error('No comparison table found');
  }

  const comparison = {};

  const rows = Array.from(table.querySelectorAll('tr'));
  
  // Helper to clean cell text
  const clean = (text) => text.replace(/\n/g, '').trim();

  // Iterate rows to find data
  // Usually Row 2 has the forms
  // | schnell | schneller | am schnellsten |
  
  // Find the row that corresponds to the headers
  // The headers might be in the first row or second row.
  
  // Let's look for the row AFTER the header row.
  let headerRowIndex = -1;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].textContent.includes('Positiv') && rows[i].textContent.includes('Komparativ')) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex !== -1 && rows[headerRowIndex + 1]) {
    const dataRow = rows[headerRowIndex + 1];
    const cells = Array.from(dataRow.querySelectorAll('td'));
    
    if (cells.length >= 3) {
      comparison.positive = clean(cells[0].textContent);
      comparison.comparative = clean(cells[1].textContent);
      comparison.superlative = clean(cells[2].textContent);
    }
  }

  if (!comparison.comparative || !comparison.superlative) {
    throw new Error('Could not extract comparison forms');
  }

  return {
    id: item.id,
    grammar: {
      comparative: comparison.comparative,
      superlative: comparison.superlative
    }
  };
}

main().catch(console.error);
