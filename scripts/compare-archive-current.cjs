#!/usr/bin/env node

/**
 * Script to compare archive vocabulary with current vocabulary
 * Identifies entries that exist in archive but not in current
 * Identifies entries that exist in current but not in archive
 * Highlights differences in entry content
 */

const fs = require('fs');
const path = require('path');

// Function to normalize text for comparison
function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.,;:!?]/g, '');
}

// Function to create a comparison key for deduplication
function createComparisonKey(entry) {
  // Create a key based on German word and part of speech
  const german = normalizeText(entry.german || entry.word || '');
  const pos = normalizeText(entry.partOfSpeech || entry.pos || 'unknown');
  return `${german}||${pos}`;
}

// Function to load JSON file
function loadJSONFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error.message);
    return null;
  }
}

// Function to compare two entries
function compareEntries(archiveEntry, currentEntry) {
  const differences = [];
  
  // Compare basic fields
  const fieldsToCompare = [
    'bulgarian', 'category', 'cefrLevel', 'partOfSpeech',
    'examples', 'culturalNotes', 'usageNotes'
  ];
  
  for (const field of fieldsToCompare) {
    const archiveValue = archiveEntry[field];
    const currentValue = currentEntry[field];
    
    // Handle array comparison
    if (Array.isArray(archiveValue) || Array.isArray(currentValue)) {
      const archiveArray = Array.isArray(archiveValue) ? archiveValue : [archiveValue];
      const currentArray = Array.isArray(currentValue) ? currentValue : [currentValue];
      
      if (JSON.stringify(archiveArray) !== JSON.stringify(currentArray)) {
        differences.push({
          field,
          archive: archiveArray,
          current: currentArray
        });
      }
    } else {
      // Handle string/object comparison
      if (archiveValue !== currentValue) {
        differences.push({
          field,
          archive: archiveValue,
          current: currentValue
        });
      }
    }
  }
  
  return differences;
}

// Function to generate comparison report
function generateComparisonReport(archiveEntries, currentEntries) {
  console.log('Starting comparison between archive and current vocabulary...');
  
  // Create maps for easier lookup
  const archiveMap = new Map();
  const currentMap = new Map();
  
  // Process archive entries
  for (const entry of archiveEntries) {
    const key = createComparisonKey(entry);
    archiveMap.set(key, entry);
  }
  
  // Process current entries
  for (const entry of currentEntries) {
    const key = createComparisonKey(entry);
    currentMap.set(key, entry);
  }
  
  console.log(`Archive entries: ${archiveMap.size}`);
  console.log(`Current entries: ${currentMap.size}`);
  
  // Find entries in archive but not in current
  const onlyInArchive = [];
  for (const [key, entry] of archiveMap) {
    if (!currentMap.has(key)) {
      onlyInArchive.push(entry);
    }
  }
  
  // Find entries in current but not in archive
  const onlyInCurrent = [];
  for (const [key, entry] of currentMap) {
    if (!archiveMap.has(key)) {
      onlyInCurrent.push(entry);
    }
  }
  
  // Find entries in both with differences
  const differentEntries = [];
  for (const [key, archiveEntry] of archiveMap) {
    if (currentMap.has(key)) {
      const currentEntry = currentMap.get(key);
      const differences = compareEntries(archiveEntry, currentEntry);
      
      if (differences.length > 0) {
        differentEntries.push({
          key,
          german: archiveEntry.german || archiveEntry.word,
          archiveEntry,
          currentEntry,
          differences
        });
      }
    }
  }
  
  // Generate report
  const report = {
    stats: {
      archiveEntries: archiveMap.size,
      currentEntries: currentMap.size,
      onlyInArchive: onlyInArchive.length,
      onlyInCurrent: onlyInCurrent.length,
      differentEntries: differentEntries.length,
      startTime: new Date().toISOString()
    },
    onlyInArchive,
    onlyInCurrent,
    differentEntries
  };
  
  return report;
}

// Function to format differences for markdown
function formatDifferences(differences) {
  let output = '';
  for (const diff of differences) {
    output += `- **${diff.field}**:\n`;
    output += `  - Archive: ${JSON.stringify(diff.archive)}\n`;
    output += `  - Current: ${JSON.stringify(diff.current)}\n`;
  }
  return output;
}

// Function to generate markdown report
function generateMarkdownReport(report) {
  let markdown = `# Archive vs Current Vocabulary Comparison Report\n\n`;
  markdown += `Generated on: ${new Date().toISOString()}\n\n`;
  
  // Stats section
  markdown += `## Statistics\n\n`;
  markdown += `| Metric | Count |\n`;
  markdown += `|--------|-------|\n`;
  markdown += `| Archive Entries | ${report.stats.archiveEntries} |\n`;
  markdown += `| Current Entries | ${report.stats.currentEntries} |\n`;
  markdown += `| Only in Archive | ${report.stats.onlyInArchive} |\n`;
  markdown += `| Only in Current | ${report.stats.onlyInCurrent} |\n`;
  markdown += `| Different Entries | ${report.stats.differentEntries} |\n\n`;
  
  // Only in archive section
  if (report.onlyInArchive.length > 0) {
    markdown += `## Entries Only in Archive (${report.onlyInArchive.length})\n\n`;
    markdown += `These entries exist in the archive but not in the current vocabulary:\n\n`;
    
    for (const entry of report.onlyInArchive) {
      markdown += `- **${entry.german || entry.word}** (${entry.partOfSpeech || entry.pos || 'unknown'})\n`;
      if (entry.bulgarian) {
        markdown += `  - Bulgarian: ${entry.bulgarian}\n`;
      }
      if (entry.category) {
        markdown += `  - Category: ${entry.category}\n`;
      }
    }
    markdown += '\n';
  }
  
  // Only in current section
  if (report.onlyInCurrent.length > 0) {
    markdown += `## Entries Only in Current (${report.onlyInCurrent.length})\n\n`;
    markdown += `These entries exist in the current vocabulary but not in the archive:\n\n`;
    
    for (const entry of report.onlyInCurrent) {
      markdown += `- **${entry.german || entry.word}** (${entry.partOfSpeech || entry.pos || 'unknown'})\n`;
      if (entry.bulgarian) {
        markdown += `  - Bulgarian: ${entry.bulgarian}\n`;
      }
      if (entry.category) {
        markdown += `  - Category: ${entry.category}\n`;
      }
    }
    markdown += '\n';
  }
  
  // Different entries section
  if (report.differentEntries.length > 0) {
    markdown += `## Entries with Differences (${report.differentEntries.length})\n\n`;
    markdown += `These entries exist in both but have different content:\n\n`;
    
    for (const item of report.differentEntries) {
      markdown += `### ${item.german} (${item.key})\n\n`;
      markdown += formatDifferences(item.differences);
      markdown += '\n';
    }
  }
  
  return markdown;
}

// Main function
async function main() {
  try {
    console.log('Loading vocabulary files...');
    
    // Load archive vocabulary
    const archivePath = path.join(__dirname, '..', 'reports', 'migration-reports', 'consolidated-archive-vocabulary.json');
    const archiveEntries = loadJSONFile(archivePath);
    
    if (!archiveEntries) {
      console.error('Failed to load archive vocabulary');
      process.exit(1);
    }
    
    // Load current vocabulary
    const currentPath = path.join(__dirname, '..', 'data', 'unified-vocabulary.json');
    const currentData = loadJSONFile(currentPath);
    
    if (!currentData) {
      console.error('Failed to load current vocabulary');
      process.exit(1);
    }
    
    // Extract items from current vocabulary
    const currentEntries = currentData.items || [];
    
    console.log('Generating comparison report...');
    
    // Generate comparison report
    const report = generateComparisonReport(archiveEntries, currentEntries);
    
    // Save JSON report
    const reportPath = path.join(__dirname, '..', 'reports', 'migration-reports', 'archive-current-comparison.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`Comparison report saved to: ${reportPath}`);
    
    // Generate and save markdown report
    const markdownReport = generateMarkdownReport(report);
    const markdownPath = path.join(__dirname, '..', 'reports', 'migration-reports', 'archive-current-comparison.md');
    fs.writeFileSync(markdownPath, markdownReport);
    console.log(`Markdown report saved to: ${markdownPath}`);
    
    console.log('Comparison complete!');
    console.log(`- Archive entries: ${report.stats.archiveEntries}`);
    console.log(`- Current entries: ${report.stats.currentEntries}`);
    console.log(`- Only in archive: ${report.stats.onlyInArchive}`);
    console.log(`- Only in current: ${report.stats.onlyInCurrent}`);
    console.log(`- Different entries: ${report.stats.differentEntries}`);
    
  } catch (error) {
    console.error('Error during comparison:', error);
    process.exit(1);
  }
}

// Run main function
if (require.main === module) {
  main();
}

module.exports = {
  createComparisonKey,
  compareEntries,
  generateComparisonReport
};