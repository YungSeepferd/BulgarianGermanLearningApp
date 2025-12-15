const fs = require('fs');
const filePath = 'data/unified-vocabulary.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
const items = data.items || data;

let updatedCount = 0;

items.forEach(item => {
    if (item.examples && Array.isArray(item.examples)) {
        let itemUpdated = false;
        item.examples = item.examples.map(ex => {
            if (ex.source && ex.target && !ex.german && !ex.bulgarian) {
                itemUpdated = true;
                return {
                    german: ex.source,
                    bulgarian: ex.target,
                    context: ex.context,
                    source: ex.source_origin || 'legacy' // preserve origin if exists
                };
            }
            return ex;
        });
        if (itemUpdated) updatedCount++;
    }
});

if (data.items) {
    data.items = items;
} else {
    // if it was an array
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log(`Migrated examples for ${updatedCount} items.`);
