#!/usr/bin/env node

/**
 * Batch 28 Linguistic Correction
 * Fixes critical issues in entries 1351-1400
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '../static/data/unified-vocabulary.linguistic-corrected.json');
const BACKUP_FILE = path.join(__dirname, '../static/data/unified-vocabulary.linguistic-corrected.backup-batch28.json');

// Load the vocabulary data
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

// Create backup before making changes
fs.writeFileSync(BACKUP_FILE, JSON.stringify(data, null, 2));
console.log('💾 Backup created: unified-vocabulary.linguistic-corrected.backup-batch28.json');

console.log('🔧 Batch 28 Linguistic Correction (Entries 1351-1400)');
console.log('='.repeat(50));

let correctionsApplied = 0;

// Find and fix the problematic entries
const batch28 = data.items.slice(1350, 1400); // Entries 1351-1400

batch28.forEach((entry, index) => {
  const entryNum = 1351 + index;
  
  // Fix Entry 1351: Remove IPA transcription and Latin characters
  if (entryNum === 1351 && entry.id === 'ravnodnstvie-hamk3') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "равноденствие"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1352: Remove IPA transcription and Latin characters
  if (entryNum === 1352 && entry.id === 'lunnozatmnenie-tx5hw') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "лунно затъмнение"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1353: Remove IPA transcription and Latin characters
  if (entryNum === 1353 && entry.id === 'zimnoslncestoene-q18jj8') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "зимно слънцестоене"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1354: Remove IPA transcription and Latin characters
  if (entryNum === 1354 && entry.id === 'jonosfra-1au1q') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "йоносфера"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1355: Remove IPA transcription and Latin characters
  if (entryNum === 1355 && entry.id === 'severnosijanie-81ri1') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "северно сияние"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1356: Remove IPA transcription and Latin characters
  if (entryNum === 1356 && entry.id === 'zrno-qp0l3') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "зърно"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1357: Remove IPA transcription and Latin characters
  if (entryNum === 1357 && entry.id === 'bedr-2ntb84') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "бедро"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1358: Remove IPA transcription and Latin characters
  if (entryNum === 1358 && entry.id === 'koljno-0yt1ce') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "коляно"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1359: Remove IPA transcription and Latin characters
  if (entryNum === 1359 && entry.id === 'pet-wq3psb') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "пета"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1360: Remove IPA transcription and Latin characters
  if (entryNum === 1360 && entry.id === 'razreitelno-szussb') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "разречително"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1361: Remove IPA transcription and Latin characters
  if (entryNum === 1361 && entry.id === 'patent-rbo5jo') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "патент"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1362: Remove mixed language content
  if (entryNum === 1362 && entry.id === 'mf-2y5akm') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "доброволец"; // Remove English "volunteer"
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content`);
    correctionsApplied++;
  }
  
  // Fix Entry 1363: Remove mixed language content
  if (entryNum === 1363 && entry.id === 'iam-t8c37a') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "не, аз съм"; // Remove English and emoji
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content`);
    correctionsApplied++;
  }
  
  // Fix Entry 1364: Remove IPA transcription and Latin characters
  if (entryNum === 1364 && entry.id === 'urn-fp7bha') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "Уран"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1365: Remove IPA transcription and Latin characters
  if (entryNum === 1365 && entry.id === 'pp-kcenno') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "чужд"; // Remove IPA transcription, keep only Bulgarian
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1366: Remove mixed language content
  if (entryNum === 1366 && entry.id === 'aquestion-0ir08h') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "питам"; // Remove English "to ask"
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content`);
    correctionsApplied++;
  }
  
  // Fix Entry 1367: Remove mixed language content
  if (entryNum === 1367 && entry.id === 'atschool-fixqr9') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "ученик"; // Remove English "student, -s"
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content`);
    correctionsApplied++;
  }
  
  // Fix Entry 1368: Remove mixed language content
  if (entryNum === 1368 && entry.id === 'atschool-5ssgmu') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "междучасие"; // Remove English "break"
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content`);
    correctionsApplied++;
  }
  
  // Fix Entry 1369: Remove mixed language content
  if (entryNum === 1369 && entry.id === 'central-nmw0hi') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "откривам"; // Remove English and formatting
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content`);
    correctionsApplied++;
  }
  
  // Fix Entry 1370: Remove mixed language content
  if (entryNum === 1370 && entry.id === 'adj-nvkhiq') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "детски"; // Remove English "child"
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content`);
    correctionsApplied++;
  }
  
  // Fix Entry 1371: Remove mixed language content
  if (entryNum === 1371 && entry.id === 'adj-90lu9') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "коледен"; // Remove English "Christmas"
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content`);
    correctionsApplied++;
  }
  
  // Fix Entry 1372: Remove mixed language content
  if (entryNum === 1372 && entry.id === 'adj-8uwuf') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "пролетен"; // Remove English "spring"
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content`);
    correctionsApplied++;
  }
  
  // Fix Entry 1373: Remove mixed language content
  if (entryNum === 1373 && entry.id === 'adj-oezvq7') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "християнски"; // Remove English "Christian"
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content`);
    correctionsApplied++;
  }
  
  // Fix Entry 1374: Remove mixed language content
  if (entryNum === 1374 && entry.id === 'forfirst-u6zzg') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "запозная се"; // Remove English and formatting
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content`);
    correctionsApplied++;
  }
  
  // Fix Entry 1375: Remove mixed language content
  if (entryNum === 1375 && entry.id === 'adj-6exjxm') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "морски"; // Remove English "sea"
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content`);
    correctionsApplied++;
  }
  
  // Fix Entry 1376: Remove mixed language content
  if (entryNum === 1376 && entry.id === 'aninstrument-gxee39') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "свиря"; // Remove English "to play"
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content`);
    correctionsApplied++;
  }
  
  // Fix Entry 1377: Remove mixed language content
  if (entryNum === 1377 && entry.id === 'literallytillsoon-dqsoz') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "До скоро"; // Remove English and emoji
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content`);
    correctionsApplied++;
  }
  
  // Fix Entry 1378: Remove mixed language content
  if (entryNum === 1378 && entry.id === 'literallylightday-508ulp') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "Лек ден"; // Remove English and emoji
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content`);
    correctionsApplied++;
  }
  
  // Fix Entry 1379: Remove mixed language content
  if (entryNum === 1379 && entry.id === 'morecasual-vlzivh') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "Чао"; // Remove English and emoji
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content`);
    correctionsApplied++;
  }
  
  // Fix Entry 1380: Remove mixed language content
  if (entryNum === 1380 && entry.id === 'morecasual-moxcu5') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "Мерси"; // Remove English and emoji
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content`);
    correctionsApplied++;
  }
  
  // Fix Entry 1381: Remove mixed language content
  if (entryNum === 1381 && entry.id === 'literallyitcan-rjmt1c') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "може"; // Remove English and formatting
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content`);
    correctionsApplied++;
  }
  
  // Fix Entry 1382: Remove mixed language content
  if (entryNum === 1382 && entry.id === 'neuterwordsendingin-n4315') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "куче"; // Remove English and formatting
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content`);
    correctionsApplied++;
  }
  
  // Fix Entry 1383: Remove mixed language content
  if (entryNum === 1383 && entry.id === 'consonant-8aexje') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "согласна"; // Remove English, keep Bulgarian explanation
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content`);
    correctionsApplied++;
  }
  
  // Fix Entry 1384: Remove mixed language content
  if (entryNum === 1384 && entry.id === 'forneuterwordsending-4mwq1') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "заместване на о с а"; // Remove English, explain in Bulgarian
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content`);
    correctionsApplied++;
  }
  
  // Fix Entry 1385: Remove mixed language content
  if (entryNum === 1385 && entry.id === 'tolike-qpmuu3') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "харесвам"; // Remove English "such as"
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content`);
    correctionsApplied++;
  }
  
  // Fix Entry 1386: Remove mixed language content
  if (entryNum === 1386 && entry.id === 'sginformal-cjwu2r') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "Лека нощ, Здравей"; // Remove English and formatting
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content`);
    correctionsApplied++;
  }
  
  // Fix Entry 1387: Remove mixed language content
  if (entryNum === 1387 && entry.id === 'sginformal-0w0lpl') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "Как си"; // Remove English and formatting
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content`);
    correctionsApplied++;
  }
  
  // Fix Entry 1388: Remove mixed language content
  if (entryNum === 1388 && entry.id === 'sginformal-djbtr') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "А ти"; // Remove English and formatting
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content`);
    correctionsApplied++;
  }
  
  // Fix Entry 1389: Remove mixed language content
  if (entryNum === 1389 && entry.id === 'itismyfault-o1t3l') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "Извинете"; // Remove English "Sorry"
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content`);
    correctionsApplied++;
  }
  
  // Fix Entry 1390: Remove mixed language content
  if (entryNum === 1390 && entry.id === 'saidbyawoman-g25h4s') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "Уморена съм"; // Remove English and formatting
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content`);
    correctionsApplied++;
  }
  
  // Fix Entry 1391: Remove IPA transcription and Latin characters
  if (entryNum === 1391 && entry.id === 'ksmos-ymtwel') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "космос"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1392: Remove IPA transcription and Latin characters
  if (entryNum === 1392 && entry.id === 'vselna-lj5fxr') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "вселена"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1393: Remove IPA transcription and Latin characters
  if (entryNum === 1393 && entry.id === 'slnevvjatr-nrvua2') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "слънчев вятър"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1394: Remove IPA transcription and Latin characters
  if (entryNum === 1394 && entry.id === 'zvezdenvjatr-2nr9va') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "звезден вятър"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1395: Remove IPA transcription and Latin characters
  if (entryNum === 1395 && entry.id === 'zaknnahbl-ik1fpo') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "закон на Хъбъл"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1396: Remove IPA transcription and Latin characters
  if (entryNum === 1396 && entry.id === 'zvezd-lxrsdq') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "звезда"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1397: Remove IPA transcription and Latin characters
  if (entryNum === 1397 && entry.id === 'szvzdie-yfoo7') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "съзвездие"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1398: Remove IPA transcription and Latin characters
  if (entryNum === 1398 && entry.id === 'galktika-di8x9p') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "галактика"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1399: Remove IPA transcription and Latin characters
  if (entryNum === 1399 && entry.id === 'slnce-t7pj9') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "слънце"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
  
  // Fix Entry 1400: Remove IPA transcription and Latin characters
  if (entryNum === 1400 && entry.id === 'mgljavina-bsh82') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    entry.bulgarian = "мъглявина"; // Remove IPA transcription
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed IPA transcription and Latin characters`);
    correctionsApplied++;
  }
});

// Save the corrected data
fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

console.log(`\n📊 Batch 28 Correction Summary:`);
console.log(`  Corrections applied: ${correctionsApplied}`);
console.log(`  Entries processed: ${batch28.length}`);

if (correctionsApplied > 0) {
  console.log('\n✅ Batch 28 corrections completed successfully!');
  console.log('📝 Remember to verify corrections before proceeding.');
} else {
  console.log('\n⚠️  No corrections were applied.');
}

console.log('\n🎉 Batch 28 correction process complete!');