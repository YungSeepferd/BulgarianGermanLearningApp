const fs = require('fs');

const file = 'data/unified-vocabulary.json';
const raw = fs.readFileSync(file, 'utf-8');
const items = JSON.parse(raw);

function idQuality(id) {
  if (/^a[12]_/.test(id)) return 5;
  if (/^[a-z]{2,}_/.test(id) && !id.startsWith('wv_') && !id.startsWith('pdf_')) return 4;
  if (/^ent-/.test(id)) return 3;
  if (id.includes('-')) return 2;
  return 1;
}

function completeness(item) {
  let s = 0;
  const ex = item.examples || [];
  s += ex.length * 2;
  if (item.definition) s += 3;
  if (item.ipa) s += 2;
  if (item.category && item.category.length) s += item.category.length;
  s += idQuality(item.id);
  return s;
}

const seen = new Map();
for (const item of items) {
  const key = item.german.toLowerCase().trim();
  const arr = seen.get(key) || [];
  arr.push(item);
  seen.set(key, arr);
}

const kept = [];
const removed = [];
for (const [german, group] of seen) {
  group.sort((a, b) => completeness(b) - completeness(a));
  kept.push(group[0]);
  for (const r of group.slice(1)) {
    removed.push({ id: r.id, german: r.german, bulgarian: r.bulgarian, reason: 'duplicate of ' + group[0].id });
  }
}

fs.writeFileSync(file, JSON.stringify(kept, null, 2) + '\n');
console.log('Before: ' + items.length);
console.log('After: ' + kept.length);
console.log('Removed: ' + removed.length);
if (removed.length > 0) {
  console.log('Removed IDs sample:');
  for (const r of removed.slice(0, 20)) console.log('  ' + r.id + ' (' + r.german + ' / ' + r.bulgarian + ')');
}
if (removed.length > 20) console.log('  ... and ' + (removed.length - 20) + ' more');
