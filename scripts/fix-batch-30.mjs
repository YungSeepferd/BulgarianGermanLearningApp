#!/usr/bin/env node

/**
 * Batch 30 Linguistic Correction
 * Fixes critical issues in entries 1451-1500
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '../static/data/unified-vocabulary.linguistic-corrected.json');
const BACKUP_FILE = path.join(__dirname, '../static/data/unified-vocabulary.linguistic-corrected.backup-batch30.json');

// Load the vocabulary data
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

// Create backup before making changes
fs.writeFileSync(BACKUP_FILE, JSON.stringify(data, null, 2));
console.log('💾 Backup created: unified-vocabulary.linguistic-corrected.backup-batch30.json');

console.log('🔧 Batch 30 Linguistic Correction (Entries 1451-1500)');
console.log('='.repeat(50));

let correctionsApplied = 0;

// Find and fix the problematic entries
const batch30 = data.items.slice(1450, 1500); // Entries 1451-1500

batch30.forEach((entry, index) => {
  const entryNum = 1451 + index;
  
  // Fix Entry 1451: Remove IPA transcription and Latin characters
  if (entryNum === 1451 && entry.id === 'krjnik-xglr8a') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "крайник"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1452: Remove IPA transcription and Latin characters
  if (entryNum === 1452 && entry.id === 'telsen-c9wlev') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "телесен"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1453: Remove IPA transcription and Latin characters
  if (entryNum === 1453 && entry.id === 'grdenko-ndeodk') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "гръден кош"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1454: Remove IPA transcription and Latin characters
  if (entryNum === 1454 && entry.id === 'korm-1lxovh') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "корем"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1455: Remove IPA transcription and Latin characters
  if (entryNum === 1455 && entry.id === 'but-abw00f') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "бут"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1456: Remove IPA transcription and Latin characters
  if (entryNum === 1456 && entry.id === 'zdnik-diujmb') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "задник"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1457: Remove IPA transcription and Latin characters
  if (entryNum === 1457 && entry.id === 'tlovite-s6xuor') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "туловище"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1458: Remove IPA transcription and Latin characters
  if (entryNum === 1458 && entry.id === 'zadnik-ed0p8r') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "задник"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1459: Remove IPA transcription and Latin characters
  if (entryNum === 1459 && entry.id === 'tlija-jjhmca') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "талия"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1460: Remove IPA transcription and Latin characters
  if (entryNum === 1460 && entry.id === 'slabina-nfeum') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "слабина"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1461: Remove IPA transcription and Latin characters
  if (entryNum === 1461 && entry.id === 'hlbok-lx93ls') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "хълбок"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1462: Remove IPA transcription and Latin characters
  if (entryNum === 1462 && entry.id === 'glav-427ca8') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "глава"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1463: Remove IPA transcription and Latin characters
  if (entryNum === 1463 && entry.id === 'grlo-kun2ok') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "гърло"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1464: Remove IPA transcription and Latin characters
  if (entryNum === 1464 && entry.id === 'admovajblka-3nc4t8') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "Адамова ябълка"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1465: Remove IPA transcription and Latin characters
  if (entryNum === 1465 && entry.id === 'til-96bt3t') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "тил"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1466: Remove IPA transcription and Latin characters
  if (entryNum === 1466 && entry.id === 'slepoie-f3spt9') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "слепоочие"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1467: Remove IPA transcription and Latin characters
  if (entryNum === 1467 && entry.id === 'glezen-hczk1') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "глезен"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1468: Remove IPA transcription and Latin characters
  if (entryNum === 1468 && entry.id === 'krak-7r9dvn') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "крак"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1469: Remove IPA transcription and Latin characters
  if (entryNum === 1469 && entry.id === 'dokumnt-a9xgln') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "документ"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1470: Remove IPA transcription and Latin characters
  if (entryNum === 1470 && entry.id === 'formuljr-1um7ze') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "формуляр"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1471: Remove IPA transcription and Latin characters
  if (entryNum === 1471 && entry.id === 'ppka-pl6f8') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "папка"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1472: Remove IPA transcription and Latin characters
  if (entryNum === 1472 && entry.id === 'oficialen-ehvgt8') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "официален"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1473: Remove IPA transcription and Latin characters
  if (entryNum === 1473 && entry.id === 'pdpis-6at9k64') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "подпис"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1474: Remove IPA transcription and Latin characters
  if (entryNum === 1474 && entry.id === 'avtograf-lrg82u') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "автограф"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1475: Remove IPA transcription and Latin characters
  if (entryNum === 1475 && entry.id === 'podpsvam-bs8ng6') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "подписвам"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1476: Remove IPA transcription and Latin characters
  if (entryNum === 1476 && entry.id === 'podpisvam-nbu4vg') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "подписвам"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1477: Remove IPA transcription and Latin characters
  if (entryNum === 1477 && entry.id === 'datram-4wbet6') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "датирам"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1478: Remove IPA transcription and Latin characters
  if (entryNum === 1478 && entry.id === 'registrram-wgcn4p') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "регистрирам"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1479: Remove IPA transcription and Latin characters
  if (entryNum === 1479 && entry.id === 'paragraf-0vkll') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "параграф"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1480: Remove IPA transcription and Latin characters
  if (entryNum === 1480 && entry.id === 'razdel-i3mn5c') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "раздел"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1481: Remove IPA transcription and Latin characters
  if (entryNum === 1481 && entry.id === 'dgovor-hlwx4u') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "договор"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1482: Remove IPA transcription and Latin characters
  if (entryNum === 1482 && entry.id === 'dgovor-p3dtru') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "договор"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1483: Remove IPA transcription and Latin characters
  if (entryNum === 1483 && entry.id === 'akt-hykuy8') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "акт"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1484: Remove IPA transcription and Latin characters
  if (entryNum === 1484 && entry.id === 'uslvie-qw70au') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "условие"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1485: Remove IPA transcription and Latin characters
  if (entryNum === 1485 && entry.id === 'pasprt-u844ef') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "паспорт"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1486: Remove IPA transcription and Latin characters
  if (entryNum === 1486 && entry.id === 'lnakrta-fu3n0f') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "лична карта"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1487: Remove IPA transcription and Latin characters
  if (entryNum === 1487 && entry.id === 'diplma-uzxsn') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "диплома"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1488: Remove IPA transcription and Latin characters
  if (entryNum === 1488 && entry.id === 'aktzaradane-xea68c') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "акт за раждане"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1489: Remove IPA transcription and Latin characters
  if (entryNum === 1489 && entry.id === 'propusk-9s4sx') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "пропуск"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1490: Remove IPA transcription and Latin characters
  if (entryNum === 1490 && entry.id === 'zavetnie-b03ysy') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "завещание"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1491: Remove IPA transcription and Latin characters
  if (entryNum === 1491 && entry.id === 'kvitncija-k7puwh') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "квитанция"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1492: Remove IPA transcription and Latin characters
  if (entryNum === 1492 && entry.id === 'svidtelstvo-ixpbra') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "свидетелство"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1493: Remove IPA transcription and Latin characters
  if (entryNum === 1493 && entry.id === 'licnz-9thu5e') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "лиценз"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1494: Remove IPA transcription and Latin characters
  if (entryNum === 1494 && entry.id === 'vprsnik-w4ukyj') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "въпросник"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1495: Remove IPA transcription and Latin characters
  if (entryNum === 1495 && entry.id === 'objavlnie-qcqbb') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "обявление"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1496: Remove IPA transcription and Latin characters
  if (entryNum === 1496 && entry.id === 'bjuletna-4zv13k') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "бюлетина"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1497: Remove IPA transcription and Latin characters
  if (entryNum === 1497 && entry.id === 'razreenie-7bp2wb') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "разрешение"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1498: Remove IPA transcription and Latin characters
  if (entryNum === 1498 && entry.id === 'kvitancija-82s49j') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "квитанция"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1499: Remove IPA transcription and Latin characters
  if (entryNum === 1499 && entry.id === 'eg-l1d3vd') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "например жена"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1500: Remove IPA transcription and Latin characters
  if (entryNum === 1500 && entry.id === 'slnev-8xut8') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "слънчев"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
});

// Save the corrected data
fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

console.log(`\n📊 Batch 30 Correction Summary:`);
console.log(`  Corrections applied: ${correctionsApplied}`);
console.log(`  Entries processed: ${batch30.length}`);

if (correctionsApplied > 0) {
  console.log('\n✅ Batch 30 corrections completed successfully!');
  console.log('📝 Remember to verify corrections before proceeding.');
} else {
  console.log('\n⚠️  No corrections were applied.');
}

console.log('\n🎉 Batch 30 correction process complete!');