#!/bin/bash

echo "🔍 Validating corrections..."

# Validation counters
ipa_count=0
example_count=0
grammar_count=0
conjugation_count=0
errors=0

# Check IPA transcriptions for items 0-19
echo "Checking IPA transcriptions..."
for i in {0..19}; do
  has_ipa=$(jq -r ".items[$i].ipa | if . then "yes" else "no" end" ./docs/audit/work-in-progress.json)
  if [ "$has_ipa" = "yes" ]; then
    ((ipa_count++))
  else
    echo "❌ Missing IPA for item $i: $(jq -r ".items[$i].id" ./docs/audit/work-in-progress.json)"
    ((errors++))
  fi
done
echo "✅ IPA transcriptions: $ipa_count/20"

# Check examples for items 2,3,10,11,12
echo "Checking example corrections..."
for i in 2 3 10 11 12; do
  has_examples=$(jq -r ".items[$i].examples | if . and length >= 2 then "yes" else "no" end" ./docs/audit/work-in-progress.json)
  if [ "$has_examples" = "yes" ]; then
    # Check if examples contain "Wo ist"
    has_wo_ist=$(jq -r ".items[$i].examples | any(.german | contains("Wo ist"))" ./docs/audit/work-in-progress.json)
    if [ "$has_wo_ist" = "false" ]; then
      ((example_count++))
    else
      echo "❌ Unnatural example for item $i: $(jq -r ".items[$i].id" ./docs/audit/work-in-progress.json)"
      ((errors++))
    fi
  else
    echo "❌ Missing examples for item $i: $(jq -r ".items[$i].id" ./docs/audit/work-in-progress.json)"
    ((errors++))
  fi
done
echo "✅ Example corrections: $example_count/5"

# Check grammar for items 10,11,12,13
echo "Checking grammar corrections..."
for i in 10 11 12 13; do
  has_grammar=$(jq -r ".items[$i].grammar | if . then "yes" else "no" end" ./docs/audit/work-in-progress.json)
  if [ "$has_grammar" = "yes" ]; then
    has_gender=$(jq -r ".items[$i].grammar.gender | if . then "yes" else "no" end" ./docs/audit/work-in-progress.json)
    if [ "$has_gender" = "yes" ]; then
      ((grammar_count++))
    else
      echo "❌ Missing gender for item $i: $(jq -r ".items[$i].id" ./docs/audit/work-in-progress.json)"
      ((errors++))
    fi
  else
    echo "❌ Missing grammar for item $i: $(jq -r ".items[$i].id" ./docs/audit/work-in-progress.json)"
    ((errors++))
  fi
done
echo "✅ Grammar corrections: $grammar_count/4"

# Check conjugations for items 17,18,19
echo "Checking verb conjugations..."
for i in 17 18 19; do
  has_conjugation=$(jq -r ".items[$i].grammar.conjugation | if . then "yes" else "no" end" ./docs/audit/work-in-progress.json)
  if [ "$has_conjugation" = "yes" ]; then
    ((conjugation_count++))
  else
    echo "❌ Missing conjugation for item $i: $(jq -r ".items[$i].id" ./docs/audit/work-in-progress.json)"
    ((errors++))
  fi
done
echo "✅ Verb conjugations: $conjugation_count/3"

echo ""
echo "📊 Validation Summary:"
echo "===================="
echo "IPA Transcriptions:     $ipa_count/20 items ✅"
echo "Example Corrections:    $example_count/5 items ✅"
echo "Grammar Corrections:   $grammar_count/4 items ✅"
echo "Verb Conjugations:     $conjugation_count/3 items ✅"
echo ""
echo "Overall Score: $(( (ipa_count + example_count + grammar_count + conjugation_count) * 100 / 32 ))%"
echo ""
if [ $errors -eq 0 ]; then
  echo "🎉 All corrections validated successfully!"
  echo "✅ No errors found"
else
  echo "⚠️  Found $errors issues that need attention"
fi
