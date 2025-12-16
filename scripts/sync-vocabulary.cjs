const fs = require('fs');
const path = require('path');

const SOURCE_FILE = path.join(__dirname, '../data/unified-vocabulary.json');
const TARGET_FILE = path.join(__dirname, '../src/lib/data/unified-vocabulary.json');

function sync() {
  console.log('Syncing vocabulary to src/lib/data...');

  const sourceRaw = fs.readFileSync(SOURCE_FILE, 'utf8');
  const sourceData = JSON.parse(sourceRaw);
  const sourceItems = Array.isArray(sourceData) ? sourceData : sourceData.items;

  const targetRaw = fs.readFileSync(TARGET_FILE, 'utf8');
  const targetData = JSON.parse(targetRaw);

  // Update items
  targetData.items = sourceItems;
  targetData.updatedAt = new Date().toISOString();
  targetData.itemCount = sourceItems.length;

  fs.writeFileSync(TARGET_FILE, JSON.stringify(targetData, null, 2));
  console.log(`Synced ${sourceItems.length} items to ${TARGET_FILE}`);
}

sync();
