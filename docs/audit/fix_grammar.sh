#!/bin/bash

echo "🔄 Fixing grammar tables..."

# Fix grammar for "mensch" (Mensch)
jq '.items[10].grammar = {
  "declension": {
    "nominative": {"singular": "Mensch", "plural": "Menschen"},
    "accusative": {"singular": "Menschen", "plural": "Menschen"},
    "dative": {"singular": "Menschen", "plural": "Menschen"},
    "genitive": {"singular": "Menschen", "plural": "Menschen"}
  },
  "gender": "m"
}' ./docs/audit/work-in-progress.json > temp.json && mv temp.json ./docs/audit/work-in-progress.json

echo "✅ Fixed grammar for: mensch"

# Fix grammar for "familie" (Familie)
jq '.items[11].grammar = {
  "declension": {
    "nominative": {"singular": "Familie", "plural": "Familien"},
    "accusative": {"singular": "Familie", "plural": "Familien"},
    "dative": {"singular": "Familie", "plural": "Familien"},
    "genitive": {"singular": "Familie", "plural": "Familien"}
  },
  "gender": "f"
}' ./docs/audit/work-in-progress.json > temp.json && mv temp.json ./docs/audit/work-in-progress.json

echo "✅ Fixed grammar for: familie"

# Fix grammar for "haus" (Haus)
jq '.items[12].grammar = {
  "declension": {
    "nominative": {"singular": "Haus", "plural": "Häuser"},
    "accusative": {"singular": "Haus", "plural": "Häuser"},
    "dative": {"singular": "Haus", "plural": "Häusern"},
    "genitive": {"singular": "Hauses", "plural": "Häuser"}
  },
  "gender": "n"
}' ./docs/audit/work-in-progress.json > temp.json && mv temp.json ./docs/audit/work-in-progress.json

echo "✅ Fixed grammar for: haus"

# Fix grammar for "schule" (Schule)
jq '.items[13].grammar = {
  "declension": {
    "nominative": {"singular": "Schule", "plural": "Schulen"},
    "accusative": {"singular": "Schule", "plural": "Schulen"},
    "dative": {"singular": "Schule", "plural": "Schulen"},
    "genitive": {"singular": "Schule", "plural": "Schulen"}
  },
  "gender": "f"
}' ./docs/audit/work-in-progress.json > temp.json && mv temp.json ./docs/audit/work-in-progress.json

echo "✅ Fixed grammar for: schule"

echo ""
echo "🎉 Grammar corrections applied successfully!"
echo "Total grammar tables fixed: 4 items"
