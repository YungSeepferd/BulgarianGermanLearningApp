#!/usr/bin/env node

// Use CommonJS to match lint configuration
const fs = require('fs');

// Load IPA mappings
const ipaMappings = JSON.parse(fs.readFileSync('./docs/audit/ipa_mappings.json', 'utf8'));

// Load vocabulary data
const data = JSON.parse(fs.readFileSync('./docs/audit/work-in-progress.json', 'utf8'));

// Create mapping for quick lookup
const ipaMap = {};
ipaMappings.forEach(mapping => {
  ipaMap[mapping.id] = mapping.ipa;
});

// Apply IPA transcriptions
let appliedCount = 0;
data.items.forEach(item => {
  if (ipaMap[item.id]) {
    item.ipa = ipaMap[item.id];
    appliedCount++;
  }
});

// Save corrected data
fs.writeFileSync('./docs/audit/work-in-progress.json', JSON.stringify(data, null, 2));

console.log(`✅ IPA transcriptions applied to ${appliedCount} items`);
console.log(`Total items processed: ${data.items.length}`);
