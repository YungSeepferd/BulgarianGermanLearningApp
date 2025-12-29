#!/bin/bash

echo "🔄 Adding verb conjugations..."

# Add conjugation for "sein" (to be)
jq '.items[17].grammar = {
  "conjugation": {
    "presentIndicative": {
      "ich": "bin",
      "du": "bist",
      "erSieEs": "ist",
      "wir": "sind",
      "ihr": "seid",
      "sieSie": "sind"
    },
    "simpleStPast": {
      "ich": "war",
      "du": "warst",
      "erSieEs": "war",
      "wir": "waren",
      "ihr": "wart",
      "sieSie": "waren"
    },
    "pastParticiple": "gewesen",
    "presentParticiple": "seiend"
  }
}' ./docs/audit/work-in-progress.json > temp.json && mv temp.json ./docs/audit/work-in-progress.json

echo "✅ Added conjugation for: sein"

# Add conjugation for "machen" (to do/make)
jq '.items[18].grammar = {
  "conjugation": {
    "presentIndicative": {
      "ich": "mache",
      "du": "machst",
      "erSieEs": "macht",
      "wir": "machen",
      "ihr": "macht",
      "sieSie": "machen"
    },
    "simpleStPast": {
      "ich": "machte",
      "du": "machtest",
      "erSieEs": "machte",
      "wir": "machten",
      "ihr": "machtet",
      "sieSie": "machten"
    },
    "pastParticiple": "gemacht",
    "presentParticiple": "machend"
  }
}' ./docs/audit/work-in-progress.json > temp.json && mv temp.json ./docs/audit/work-in-progress.json

echo "✅ Added conjugation for: machen"

# Add conjugation for "sprechen" (to speak)
jq '.items[19].grammar = {
  "conjugation": {
    "presentIndicative": {
      "ich": "spreche",
      "du": "sprichst",
      "erSieEs": "spricht",
      "wir": "sprechen",
      "ihr": "sprecht",
      "sieSie": "sprechen"
    },
    "simpleStPast": {
      "ich": "sprach",
      "du": "sprachst",
      "erSieEs": "sprach",
      "wir": "sprachen",
      "ihr": "spracht",
      "sieSie": "sprachen"
    },
    "pastParticiple": "gesprochen",
    "presentParticiple": "sprechend"
  }
}' ./docs/audit/work-in-progress.json > temp.json && mv temp.json ./docs/audit/work-in-progress.json

echo "✅ Added conjugation for: sprechen"

echo ""
echo "🎉 Verb conjugations added successfully!"
echo "Total verb conjugations added: 3 items"
