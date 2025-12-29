#!/bin/bash

echo "🔍 Final Validation of Batch 1 Corrections"
echo "=========================================="
echo ""

# Count IPA transcriptions
echo "Checking IPA transcriptions..."
ipa_count=$(jq '[.items[0:20][] | select(.ipa != null)] | length' ./docs/audit/work-in-progress.json)
echo "✅ IPA transcriptions: $ipa_count/20 items"

# Count corrected examples (items 2,3,10,11,12)
echo "Checking example corrections..."
example_count=0
for i in 2 3 10 11 12; do
  has_examples=$(jq ".items[$i].examples | length >= 2" ./docs/audit/work-in-progress.json)
  has_wo_ist=$(jq ".items[$i].examples | any(.german | contains("Wo ist"))" ./docs/audit/work-in-progress.json)
  if [ "$has_examples" = "true" ] && [ "$has_wo_ist" = "false" ]; then
    ((example_count++))
  fi
done
echo "✅ Example corrections: $example_count/5 items"

# Count corrected grammar (items 10,11,12,13)
echo "Checking grammar corrections..."
grammar_count=0
for i in 10 11 12 13; do
  has_grammar=$(jq ".items[$i].grammar != null and .items[$i].grammar.gender != null" ./docs/audit/work-in-progress.json)
  if [ "$has_grammar" = "true" ]; then
    ((grammar_count++))
  fi
done
echo "✅ Grammar corrections: $grammar_count/4 items"

# Count verb conjugations (items 17,18,19)
echo "Checking verb conjugations..."
conjugation_count=0
for i in 17 18 19; do
  has_conjugation=$(jq ".items[$i].grammar.conjugation != null" ./docs/audit/work-in-progress.json)
  if [ "$has_conjugation" = "true" ]; then
    ((conjugation_count++))
  fi
done
echo "✅ Verb conjugations: $conjugation_count/3 items"

echo ""
echo "📊 Summary:"
echo "IPA: $ipa_count/20 | Examples: $example_count/5 | Grammar: $grammar_count/4 | Conjugations: $conjugation_count/3"

# Calculate overall score
overall_score=$(( (ipa_count + example_count + grammar_count + conjugation_count) * 100 / 32 ))
echo "Overall Score: $overall_score%"

if [ $overall_score -eq 100 ]; then
  echo ""
  echo "🎉 ALL CORRECTIONS APPLIED SUCCESSFULLY!"
  echo "✅ Batch 1 is ready for merge"
else
  echo ""
  echo "⚠️  Some corrections may be missing"
  echo "Please review the corrections manually"
fi
