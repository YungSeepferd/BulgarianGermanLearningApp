#!/bin/bash

echo "🔍 Simple Validation of Corrections"
echo "===================================="
echo ""

# Count IPA transcriptions
echo "Checking IPA transcriptions..."
ipa_count=$(jq '[.items[0:20][] | select(.ipa != null)] | length' ./docs/audit/work-in-progress.json)
echo "✅ IPA transcriptions: $ipa_count/20 items"

# Count corrected examples
echo "Checking example corrections..."
example_count=$(jq '[.items[2,3,10,11,12][] | select(.examples and (length >= 2) and all(.german; contains("Wo ist") | not))] | length' ./docs/audit/work-in-progress.json)
echo "✅ Example corrections: $example_count/5 items"

# Count corrected grammar
echo "Checking grammar corrections..."
grammar_count=$(jq '[.items[10,11,12,13][] | select(.grammar and .grammar.gender)] | length' ./docs/audit/work-in-progress.json)
echo "✅ Grammar corrections: $grammar_count/4 items"

# Count verb conjugations
echo "Checking verb conjugations..."
conjugation_count=$(jq '[.items[17,18,19][] | select(.grammar.conjugation)] | length' ./docs/audit/work-in-progress.json)
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
