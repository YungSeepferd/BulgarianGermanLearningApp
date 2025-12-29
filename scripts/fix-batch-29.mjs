#!/usr/bin/env node

/**
 * Batch 29 Linguistic Correction
 * Fixes critical issues in entries 1401-1450
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '../static/data/unified-vocabulary.linguistic-corrected.json');
const BACKUP_FILE = path.join(__dirname, '../static/data/unified-vocabulary.linguistic-corrected.backup-batch29.json');

// Load the vocabulary data
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

// Create backup before making changes
fs.writeFileSync(BACKUP_FILE, JSON.stringify(data, null, 2));
console.log('💾 Backup created: unified-vocabulary.linguistic-corrected.backup-batch29.json');

console.log('🔧 Batch 29 Linguistic Correction (Entries 1401-1450)');
console.log('='.repeat(50));

let correctionsApplied = 0;

// Find and fix the problematic entries
const batch29 = data.items.slice(1400, 1450); // Entries 1401-1450

batch29.forEach((entry, index) => {
  const entryNum = 1401 + index;
  
  // Fix Entry 1401: Remove IPA transcription and Latin characters
  if (entryNum === 1401 && entry.id === 'svrhnva-ugua9') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "свръхнова"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1402: Remove IPA transcription and Latin characters
  if (entryNum === 1402 && entry.id === 'planta-bh975c') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "планета"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1403: Remove IPA transcription and Latin characters
  if (entryNum === 1403 && entry.id === 'asterod-5q6zc') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "астероид"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1404: Remove IPA transcription and Latin characters
  if (entryNum === 1404 && entry.id === 'komta-8io36n') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "комета"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1405: Remove IPA transcription and Latin characters
  if (entryNum === 1405 && entry.id === 'meteort-zgwuv8') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "метеорит"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1406: Remove IPA transcription and Latin characters
  if (entryNum === 1406 && entry.id === 'krter-w1b9j') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "кратер"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1407: Remove IPA transcription and Latin characters
  if (entryNum === 1407 && entry.id === 'litosfera-l80jhu') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "литосфера"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1408: Remove IPA transcription and Latin characters
  if (entryNum === 1408 && entry.id === 'sptnik-udn79') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "спътник"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1409: Remove IPA transcription and Latin characters
  if (entryNum === 1409 && entry.id === 'geografskadlina-sfczo') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "географска дължина"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1410: Remove IPA transcription and Latin characters
  if (entryNum === 1410 && entry.id === 'ekvtor-xi74f') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "екватор"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1411: Remove IPA transcription and Latin characters
  if (entryNum === 1411 && entry.id === 'severenpoljus-i13bef') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "Северен полюс"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1412: Remove IPA transcription and Latin characters
  if (entryNum === 1412 && entry.id === 'jenpljus-6apzgr') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "Южен полюс"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1413: Remove IPA transcription and Latin characters
  if (entryNum === 1413 && entry.id === 'zemljanin-e6fm5j') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "землянин"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1414: Remove IPA transcription and Latin characters
  if (entryNum === 1414 && entry.id === 'zornica-4q0h4o') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "Зорница"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1415: Remove IPA transcription and Latin characters
  if (entryNum === 1415 && entry.id === 'zemj-du4aj7') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "Земя"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1416: Remove IPA transcription and Latin characters
  if (entryNum === 1416 && entry.id === 'slnce-yo9eh') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "Слънце"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1417: Remove IPA transcription and Latin characters
  if (entryNum === 1417 && entry.id === 'merkrij-809gqo') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "Меркурий"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1418: Remove IPA transcription and Latin characters
  if (entryNum === 1418 && entry.id === 'venra-h55oke') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "Венера"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1419: Remove IPA transcription and Latin characters
  if (entryNum === 1419 && entry.id === 'mars-x48w8h') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "Марс"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1420: Remove IPA transcription and Latin characters
  if (entryNum === 1420 && entry.id === 'satrn-kugrw') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "Сатурн"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1421: Remove IPA transcription and Latin characters
  if (entryNum === 1421 && entry.id === 'slnevasistma-6hqfvb') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "Слънчева система"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1422: Remove IPA transcription and Latin characters
  if (entryNum === 1422 && entry.id === 'polumsec-kbcdg') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "полумесец"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1423: Remove IPA transcription and Latin characters
  if (entryNum === 1423 && entry.id === 'perihelij-vcnxhh') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "перихелий"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1424: Remove IPA transcription and Latin characters
  if (entryNum === 1424 && entry.id === 'zent-229jd3') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "зенит"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1425: Remove IPA transcription and Latin characters
  if (entryNum === 1425 && entry.id === 'nadir-kh4qu') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "надир"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1426: Remove IPA transcription and Latin characters
  if (entryNum === 1426 && entry.id === 'zatmnenie-r2c9k') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "затъмнение"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1427: Remove IPA transcription and Latin characters
  if (entryNum === 1427 && entry.id === 'ekliptika-6w0ac') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "еклиптика"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1428: Remove IPA transcription and Latin characters
  if (entryNum === 1428 && entry.id === 'zaljazvam-nd6ih') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "залязвам"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1429: Remove IPA transcription and Latin characters
  if (entryNum === 1429 && entry.id === 'termosfra-pakns') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "термосфера"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1430: Remove IPA transcription and Latin characters
  if (entryNum === 1430 && entry.id === 'atmosfra-w932r') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "атмосфера"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1431: Remove IPA transcription and Latin characters
  if (entryNum === 1431 && entry.id === 'neb-gw1vkm') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "небе"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1432: Remove IPA transcription and Latin characters
  if (entryNum === 1432 && entry.id === 'nebosvod-ekamsw') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "небосвод"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1433: Remove IPA transcription and Latin characters
  if (entryNum === 1433 && entry.id === 'zor-tw5k8') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "зора"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1434: Remove IPA transcription and Latin characters
  if (entryNum === 1434 && entry.id === 'horiznt-xn0jv') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "хоризонт"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1435: Remove IPA transcription and Latin characters
  if (entryNum === 1435 && entry.id === 'meteor-aiv5u') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "метеор"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1436: Remove IPA transcription and Latin characters
  if (entryNum === 1436 && entry.id === 'areola-ccdq1z') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "ареола"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1437: Remove IPA transcription and Latin characters
  if (entryNum === 1437 && entry.id === 'medza-y3at6g') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "медуза"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1438: Remove IPA transcription and Latin characters
  if (entryNum === 1438 && entry.id === 'pijvica-2kebq') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "пиявица"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1439: Remove IPA transcription and Latin characters
  if (entryNum === 1439 && entry.id === 'sjnger-atwwv') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "сюнгер"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1440: Remove IPA transcription and Latin characters
  if (entryNum === 1440 && entry.id === 'morskitaralei-6jd87i') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "морски таралежи"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1441: Remove IPA transcription and Latin characters
  if (entryNum === 1441 && entry.id === 'morskzvezd-4516dw') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "морска звезда"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1442: Remove IPA transcription and Latin characters
  if (entryNum === 1442 && entry.id === 'aktinija-ot6r5o') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "актиния"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1443: Remove IPA transcription and Latin characters
  if (entryNum === 1443 && entry.id === 'strda-uj17pr') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "стрида"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1444: Remove IPA transcription and Latin characters
  if (entryNum === 1444 && entry.id === 'oktopd-sp0xnn') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "октопод"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1445: Remove IPA transcription and Latin characters
  if (entryNum === 1445 && entry.id === 'kalmr-nkus6') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "калмар"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1446: Remove IPA transcription and Latin characters
  if (entryNum === 1446 && entry.id === 'mida-dch21e') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "мида"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1447: Remove IPA transcription and Latin characters
  if (entryNum === 1447 && entry.id === 'golhljuv-qut7v') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "гол охлюв"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1448: Remove IPA transcription and Latin characters
  if (entryNum === 1448 && entry.id === 'sepija-1bbdpj') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "сепия"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1449: Remove IPA transcription and Latin characters
  if (entryNum === 1449 && entry.id === 'rkovina-3ky19e') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "раковина"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1450: Remove IPA transcription and Latin characters
  if (entryNum === 1450 && entry.id === 'morskakrastavica-k92rzt') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "морска краставица"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
});

// Save the corrected data
fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

console.log(`\n📊 Batch 29 Correction Summary:`);
console.log(`  Corrections applied: ${correctionsApplied}`);
console.log(`  Entries processed: ${batch29.length}`);

if (correctionsApplied > 0) {
  console.log('\n✅ Batch 29 corrections completed successfully!');
  console.log('📝 Remember to verify corrections before proceeding.');
} else {
  console.log('\n⚠️  No corrections were applied.');
}

console.log('\n🎉 Batch 29 correction process complete!');