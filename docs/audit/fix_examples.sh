#!/bin/bash

echo "🔄 Fixing unnatural examples..."

# Fix examples for "dobro_utro_002" (Guten Morgen)
jq '.items[2].examples = [
  {
    "german": "Guten Morgen! Wie haben Sie geschlafen?",
    "bulgarian": "Добро утро! Как спахте?",
    "context": "morning_greeting",
    "formality": "neutral",
    "frequency": "very_common"
  },
  {
    "german": "Guten Morgen, Herr Schmidt!",
    "bulgarian": "Добро утро, господин Шмит!",
    "context": "formal_morning",
    "formality": "formal",
    "frequency": "common"
  }
]' ./docs/audit/work-in-progress.json > temp.json && mv temp.json ./docs/audit/work-in-progress.json

echo "✅ Fixed examples for: dobro_utro_002"

# Fix examples for "guten_abend" (Guten Abend)
jq '.items[3].examples = [
  {
    "german": "Guten Abend! Willkommen in unserem Restaurant.",
    "bulgarian": "Добър вечер! Добре дошли в нашия ресторант.",
    "context": "evening_welcome",
    "formality": "neutral",
    "frequency": "common"
  },
  {
    "german": "Guten Abend, Frau Müller!",
    "bulgarian": "Добър вечер, госпожо Мюлер!",
    "context": "formal_evening",
    "formality": "formal",
    "frequency": "common"
  }
]' ./docs/audit/work-in-progress.json > temp.json && mv temp.json ./docs/audit/work-in-progress.json

echo "✅ Fixed examples for: guten_abend"

# Fix examples for "mensch" (Mensch)
jq '.items[10].examples = [
  {
    "german": "Er ist ein guter Mensch.",
    "bulgarian": "Той е добър човек.",
    "context": "character_description",
    "formality": "neutral",
    "frequency": "very_common"
  },
  {
    "german": "Alle Menschen sind gleich.",
    "bulgarian": "Всички хора са равни.",
    "context": "universal_statement",
    "formality": "neutral",
    "frequency": "common"
  }
]' ./docs/audit/work-in-progress.json > temp.json && mv temp.json ./docs/audit/work-in-progress.json

echo "✅ Fixed examples for: mensch"

# Fix examples for "familie" (Familie)
jq '.items[11].examples = [
  {
    "german": "Meine Familie wohnt in Berlin.",
    "bulgarian": "Моето семейство живее в Берлин.",
    "context": "family_location",
    "formality": "neutral",
    "frequency": "very_common"
  },
  {
    "german": "Wir haben eine große Familie.",
    "bulgarian": "Ние имаме голямо семейство.",
    "context": "family_size",
    "formality": "neutral",
    "frequency": "common"
  }
]' ./docs/audit/work-in-progress.json > temp.json && mv temp.json ./docs/audit/work-in-progress.json

echo "✅ Fixed examples for: familie"

# Fix examples for "haus" (Haus)
jq '.items[12].examples = [
  {
    "german": "Wir haben ein schönes Haus.",
    "bulgarian": "Ние имаме красива къща.",
    "context": "home_description",
    "formality": "neutral",
    "frequency": "very_common"
  },
  {
    "german": "Das Haus ist groß und hell.",
    "bulgarian": "Къщата е голяма и светла.",
    "context": "house_description",
    "formality": "neutral",
    "frequency": "common"
  }
]' ./docs/audit/work-in-progress.json > temp.json && mv temp.json ./docs/audit/work-in-progress.json

echo "✅ Fixed examples for: haus"

echo ""
echo "🎉 Example corrections applied successfully!"
echo "Total examples fixed: 5 items"
