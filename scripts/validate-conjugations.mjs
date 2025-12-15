import fs from 'fs';

const data = JSON.parse(fs.readFileSync('data/unified-vocabulary.json', 'utf8'));
const items = data.items || data;

const suspicious = [];

items.forEach(item => {
  if (item.grammar && item.grammar.conjugation) {
    const c = item.grammar.conjugation;
    const forms = [];
    if (c.present) Object.values(c.present).forEach(v => forms.push({ t: 'present', v }));
    if (c.past) Object.values(c.past).forEach(v => forms.push({ t: 'past', v }));
    
    forms.forEach(f => {
      // Check for concatenated duplicates like "schaueschau"
      // Simple heuristic: if string length > 6 and first half equals second half
      if (f.v.length > 6 && f.v.length % 2 === 0) {
        const half = f.v.length / 2;
        if (f.v.substring(0, half) === f.v.substring(half)) {
          suspicious.push({ id: item.id, word: item.german, form: f.v, type: f.t });
        }
      }
      // Check for "!" (imperative leaking?)
      if (f.v.includes('!')) {
        suspicious.push({ id: item.id, word: item.german, form: f.v, type: f.t, reason: 'contains !' });
      }
      // Check for newlines
      if (f.v.includes('\n')) {
        suspicious.push({ id: item.id, word: item.german, form: f.v, type: f.t, reason: 'contains newline' });
      }
    });
  }
});

console.log('Suspicious conjugations:', suspicious);
