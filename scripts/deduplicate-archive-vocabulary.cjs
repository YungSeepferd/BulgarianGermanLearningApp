const fs = require('fs');
const path = require('path');

const ARCHIVE_DIR = '_legacy_archive/data';
const OUTPUT_FILE = 'reports/migration-reports/consolidated-archive-vocabulary.json';

// Helper to recursively get all JSON files
function getJsonFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getJsonFiles(filePath, fileList);
    } else {
      if (path.extname(file) === '.json') {
        fileList.push(filePath);
      }
    }
  });
  return fileList;
}

function processFiles() {
  console.log('Starting deduplication process...');
  
  const allFiles = getJsonFiles(ARCHIVE_DIR);
  console.log(`Found ${allFiles.length} JSON files in archive.`);

  const vocabularyMap = new Map(); // Key: german_word + part_of_speech (if available), Value: entry
  let totalEntries = 0;
  let duplicateCount = 0;

  // Sort files to prioritize "cleanup" files and then by date (newest first)
  // This is a simple heuristic; we might need more sophisticated logic if file dates aren't in names
  allFiles.sort((a, b) => {
    const aIsCleanup = a.includes('archive-data-cleanup');
    const bIsCleanup = b.includes('archive-data-cleanup');
    
    if (aIsCleanup && !bIsCleanup) return -1; // a comes first
    if (!aIsCleanup && bIsCleanup) return 1;  // b comes first
    
    // If both are cleanup or both are not, try to sort by timestamp in filename if present
    // Assuming format YYYY-MM-DD...
    const aMatch = a.match(/\d{4}-\d{2}-\d{2}/);
    const bMatch = b.match(/\d{4}-\d{2}-\d{2}/);
    
    if (aMatch && bMatch) {
        return b.localeCompare(a); // Newest first
    }
    
    return a.localeCompare(b);
  });

  console.log('Processing files in order:', allFiles);

  allFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const data = JSON.parse(content);
      
      // Handle both array and object wrapper formats
      const entries = Array.isArray(data) ? data : (data.items || data.vocabulary || []);

      if (!Array.isArray(entries)) {
          console.warn(`Skipping ${file}: Could not find array of entries.`);
          return;
      }

      entries.forEach(entry => {
        totalEntries++;
        
        // Normalize key for deduplication
        // We use German word as the primary key. 
        // We also consider part of speech if available to distinguish e.g. noun vs verb
        if (!entry.german && !entry.word) {
            // console.warn('Skipping entry without German word:', entry);
            return;
        }

        const germanWord = (entry.german || entry.word || '').trim();
        if (!germanWord) return;

        // Try to determine part of speech or category to disambiguate
        const pos = entry.partOfSpeech || entry.category || '';
        
        // Create a unique key. 
        // We lowercase for comparison but keep original for storage if needed
        const key = `${germanWord.toLowerCase()}`; // Simple key for now to catch duplicates aggressively

        if (vocabularyMap.has(key)) {
          duplicateCount++;
          // Optional: merge logic here if we want to keep data from older entries
          // For now, since we sorted files by priority, the first one we saw is "best"
          // so we don't overwrite unless we implement a merge strategy.
          // BUT: Actually we are iterating priority first, so we KEEP the existing one.
          
          const existing = vocabularyMap.get(key);
          
          // Basic merging: if new entry has more fields, maybe update?
          // For this pass, we'll stick to "first found (highest priority file) wins"
          
          // Track origins
          existing.metadata = existing.metadata || {};
          existing.metadata.sources = existing.metadata.sources || [];
          if (!existing.metadata.sources.includes(file)) {
              existing.metadata.sources.push(file);
          }

        } else {
          // Normalize entry structure slightly for the consolidated file
          const normalizedEntry = {
            ...entry,
            german: germanWord,
            bulgarian: entry.bulgarian || entry.translation || '',
            metadata: {
                originalId: entry.id,
                sources: [file],
                firstSeen: new Date().toISOString()
            }
          };
          
          vocabularyMap.set(key, normalizedEntry);
        }
      });

    } catch (err) {
      console.error(`Error processing ${file}:`, err.message);
    }
  });

  const consolidatedList = Array.from(vocabularyMap.values());
  
  // Sort alphabetically by German word
  consolidatedList.sort((a, b) => a.german.localeCompare(b.german));

  console.log('Deduplication complete.');
  console.log(`Total entries processed: ${totalEntries}`);
  console.log(`Duplicates found (skipped): ${duplicateCount}`);
  console.log(`Unique entries retained: ${consolidatedList.length}`);

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(consolidatedList, null, 2));
  console.log(`Consolidated archive written to ${OUTPUT_FILE}`);
}

processFiles();