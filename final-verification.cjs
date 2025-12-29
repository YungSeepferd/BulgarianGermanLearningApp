const data = require('./static/data/unified-vocabulary.linguistic-corrected.json');

console.log('🔍 Final Verification Before Proceeding');
console.log('='.repeat(50));

// All corrections applied so far
const allCorrections = [
  // Batch 1
  {id: 'wv_pc_c65c3b24', expected: 'Моля, седнете'},
  {id: 'wv_a57f6890', expected: 'вечер'},
  {id: 'wv_pc_da599994', expected: 'осем'},
  {id: 'wv_5b9be793', expected: 'осемдесет'},
  // Batch 2
  {id: 'wv_pc_f5d1dda2', expected: 'Изгубих се'},
  // Batch 3
  {id: 'wv_pc_876d708b', expected: 'хляб'},
  {id: 'wv_pc_f96ece40', expected: 'Как е на български'},
  {id: 'wv_pc_819555b1', expected: 'Къде е хотелът'},
  // Batch 11
  {id: 'wv_d69a7786', expected: 'три'},
  {id: 'wv_79463138', expected: 'трийсет'},
  {id: 'wv_dc4baeb0', expected: 'тринайсет'},
  {id: 'wv_pc_a482bcb0', expected: 'тринайсет'},
  // Batch 12
  {id: 'wv_22027e6a', expected: 'един'},
  {id: 'wv_pc_41d4f4cd', expected: 'единайсет'},
  {id: 'wv_pc_8ab95651', expected: 'вегетарианска храна'},
  // Batch 13
  {id: 'wv_pc_ad748cdd', expected: 'мъж майка'},
  {id: 'wv_pc_fd8fcbed', expected: 'жена син'},
  {id: 'wv_pc_bfcf863b', expected: 'момче дъщеря'},
  {id: 'wv_pc_b2eef668', expected: 'момиче брат'},
  {id: 'wv_pc_18e42c2b', expected: 'баща сестра'},
  {id: 'wv_pc_0bb8f5e1', expected: 'риба плодове'}
];

let allCorrect = true;
let correctedCount = 0;

allCorrections.forEach(correction => {
  const entry = data.items.find(item => item.id === correction.id);
  if (entry && entry.bulgarian === correction.expected) {
    console.log(`✅ ${correction.id}: "${entry.bulgarian}"`);
    correctedCount++;
  } else {
    console.log(`❌ ${correction.id}: Expected "${correction.expected}", got "${entry ? entry.bulgarian : 'NOT FOUND'}"`);
    allCorrect = false;
  }
});

console.log('\n📊 Summary:');
console.log(`  Corrections verified: ${correctedCount}/${allCorrections.length}`);
console.log(`  Total entries: ${data.items.length}`);
console.log(`  Status: ${allCorrect ? '✅ ALL CORRECTIONS VERIFIED' : '❌ SOME ISSUES REMAIN'}`);

if (allCorrect) {
  console.log('\n🎉 Ready to proceed with Batch 14!');
  
  // Quick check of certified batches
  console.log('\n🔍 Quick check of certified batches (1-650):');
  const certifiedEntries = data.items.slice(0, 650);
  const issues = certifiedEntries.filter(entry => 
    (entry.bulgarian && /[a-zA-Z]/.test(entry.bulgarian)) || 
    (entry.german && entry.bulgarian && entry.german.trim() === entry.bulgarian.trim())
  );
  console.log(`  Entries 1-650: ${issues.length} critical issues found`);
  console.log(issues.length === 0 ? '✅ All certified batches clean!' : '⚠️ Some issues remain!');
} else {
  console.log('\n⚠️  Must fix remaining issues before proceeding!');
}