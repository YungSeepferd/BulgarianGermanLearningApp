import fs from 'fs/promises';
import path from 'path';

const vocabPath = './data/unified-vocabulary.json';

async function validateComprehensive() {
  try {
    console.log('\n📊 COMPREHENSIVE VOCABULARY VALIDATION\n');
    
    // Load vocabulary
    const vocabContent = await fs.readFile(vocabPath, 'utf-8');
    const vocabData = JSON.parse(vocabContent);
    
    // Analyze items
    const items = vocabData.items || [];
    console.log(`📈 Total items: ${items.length}`);
    
    // CEFR analysis
    const cefrLevels = {
      A1: 0,
      A2: 0,
      B1: 0,
      B2: 0,
      C1: 0,
      undefined: 0
    };
    
    const categorySet = new Set();
    let validItems = 0;
    let invalidItems = 0;
    const errors = [];
    
    items.forEach((item, index) => {
      // CEFR check
      if (item.cefrLevel) {
        cefrLevels[item.cefrLevel]++;
      } else {
        cefrLevels.undefined++;
      }
      
      // Categories check
      if (item.categories && Array.isArray(item.categories)) {
        item.categories.forEach(cat => categorySet.add(cat));
      }
      
      // Validity check
      const isValid = 
        item.id && 
        item.german && 
        item.bulgarian && 
        item.cefrLevel && 
        item.categories && 
        item.categories.length > 0;
      
      if (isValid) {
        validItems++;
      } else {
        invalidItems++;
        errors.push({
          index,
          id: item.id,
          issues: {
            missing_id: !item.id,
            missing_german: !item.german,
            missing_bulgarian: !item.bulgarian,
            missing_cefrLevel: !item.cefrLevel,
            missing_categories: !item.categories || item.categories.length === 0
          }
        });
      }
    });
    
    // Output results
    console.log('\n✅ VALIDITY RESULTS:');
    console.log(`   Valid items: ${validItems}/${items.length} (${((validItems/items.length)*100).toFixed(1)}%)`);
    console.log(`   Invalid items: ${invalidItems}/${items.length} (${((invalidItems/items.length)*100).toFixed(1)}%)`);
    
    console.log('\n📚 CEFR LEVEL DISTRIBUTION:');
    console.log(`   A1 (Elementary): ${cefrLevels.A1} (${((cefrLevels.A1/items.length)*100).toFixed(1)}%)`);
    console.log(`   A2 (Elementary+): ${cefrLevels.A2} (${((cefrLevels.A2/items.length)*100).toFixed(1)}%)`);
    console.log(`   B1 (Intermediate): ${cefrLevels.B1} (${((cefrLevels.B1/items.length)*100).toFixed(1)}%)`);
    console.log(`   B2 (Upper-Int.): ${cefrLevels.B2} (${((cefrLevels.B2/items.length)*100).toFixed(1)}%)`);
    console.log(`   C1 (Advanced): ${cefrLevels.C1} (${((cefrLevels.C1/items.length)*100).toFixed(1)}%)`);
    console.log(`   Undefined: ${cefrLevels.undefined}`);
    
    console.log(`\n🏷️  CATEGORIES (${categorySet.size} unique):`);
    const categories = Array.from(categorySet).sort();
    categories.forEach(cat => {
      const count = items.filter(i => i.categories && i.categories.includes(cat)).length;
      console.log(`   ${cat}: ${count} items`);
    });
    
    // Errors
    if (errors.length > 0) {
      console.log(`\n⚠️  ERRORS FOUND (${errors.length} items):`);
      errors.slice(0, 5).forEach(error => {
        console.log(`   ${error.id}: ${JSON.stringify(error.issues)}`);
      });
      if (errors.length > 5) {
        console.log(`   ... and ${errors.length - 5} more`);
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    if (validItems === items.length) {
      console.log('✅ VALIDATION PASSED - All items valid!');
    } else {
      console.log(`❌ VALIDATION FAILED - ${invalidItems} items invalid`);
    }
    console.log('='.repeat(50) + '\n');
    
    // Save report
    const report = {
      timestamp: new Date().toISOString(),
      totalItems: items.length,
      validItems,
      invalidItems,
      cefrDistribution: cefrLevels,
      categoriesCount: categorySet.size,
      categories: categories,
      errors: errors.slice(0, 10)
    };
    
    await fs.writeFile('reports/validation-comprehensive.json', JSON.stringify(report, null, 2));
    console.log('📄 Report saved to reports/validation-comprehensive.json\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

validateComprehensive();
