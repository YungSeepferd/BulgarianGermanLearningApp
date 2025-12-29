#!/bin/bash

echo "🔄 Applying IPA transcriptions..."

# Apply IPA to each item using jq
jq '.items[0].ipa = {"bulgarian": "/zɐˈɛdno/", "german": "/t͡suˈzamən/"}' \
./docs/audit/work-in-progress.json > temp.json && mv temp.json ./docs/audit/work-in-progress.json

echo "✅ Applied IPA to: zusammen_bg_zaedno_sample"

jq '.items[1].ipa = {"bulgarian": "/zdraˈvɛj/", "german": "/ˈhalo/"}' \
./docs/audit/work-in-progress.json > temp.json && mv temp.json ./docs/audit/work-in-progress.json

echo "✅ Applied IPA to: zdravej_001"

jq '.items[2].ipa = {"bulgarian": "/ˈdɔbro ˈutro/", "german": "/ˈɡuːtn̩ ˈmɔʁɡn̩/"}' \
./docs/audit/work-in-progress.json > temp.json && mv temp.json ./docs/audit/work-in-progress.json

echo "✅ Applied IPA to: dobro_utro_002"

jq '.items[3].ipa = {"bulgarian": "/doˈbɤr ˈvɛt͡ʃɛr/", "german": "/ˈɡuːtn̩ ˈaːbn̩t/"}' \
./docs/audit/work-in-progress.json > temp.json && mv temp.json ./docs/audit/work-in-progress.json

echo "✅ Applied IPA to: guten_abend"

jq '.items[4].ipa = {"bulgarian": "/ˈlɛka ˈnɔʃt/", "german": "/ˈɡuːtə ˈnaxt/"}' \
./docs/audit/work-in-progress.json > temp.json && mv temp.json ./docs/audit/work-in-progress.json

echo "✅ Applied IPA to: gute_nacht"

jq '.items[5].ipa = {"bulgarian": "/doˈvid͡ʒɐnɛ/", "german": "/aʊ̯f ˈviːdɐzeːən/"}' \
./docs/audit/work-in-progress.json > temp.json && mv temp.json ./docs/audit/work-in-progress.json

echo "✅ Applied IPA to: auf_wiedersehen"

jq '.items[6].ipa = {"bulgarian": "/ˈmɔlʲɐ/", "german": "/ˈbɪtə/"}' \
./docs/audit/work-in-progress.json > temp.json && mv temp.json ./docs/audit/work-in-progress.json

echo "✅ Applied IPA to: bitte"

jq '.items[7].ipa = {"bulgarian": "/blɐɡoˈdarʲɐ/", "german": "/ˈdaŋkə/"}' \
./docs/audit/work-in-progress.json > temp.json && mv temp.json ./docs/audit/work-in-progress.json

echo "✅ Applied IPA to: danke"

jq '.items[8].ipa = {"bulgarian": "/izviˈnɛtɛ/", "german": "/ɛntˈʃʊldɪɡʊŋ/"}' \
./docs/audit/work-in-progress.json > temp.json && mv temp.json ./docs/audit/work-in-progress.json

echo "✅ Applied IPA to: entschuldigung"

jq '.items[9].ipa = {"bulgarian": "/sɐʒɐˈlʲavɐm/", "german": "/ɛs tuːt miːɐ̯ laɪ̯t/"}' \
./docs/audit/work-in-progress.json > temp.json && mv temp.json ./docs/audit/work-in-progress.json

echo "✅ Applied IPA to: es_tut_mir_leid"

jq '.items[10].ipa = {"bulgarian": "/ˈt͡ʃɔvɛk/", "german": "/mɛnʃ/"}' \
./docs/audit/work-in-progress.json > temp.json && mv temp.json ./docs/audit/work-in-progress.json

echo "✅ Applied IPA to: mensch"

jq '.items[11].ipa = {"bulgarian": "/sɛˈmɛjstvɔ/", "german": "/faˈmiːliə/"}' \
./docs/audit/work-in-progress.json > temp.json && mv temp.json ./docs/audit/work-in-progress.json

echo "✅ Applied IPA to: familie"

jq '.items[12].ipa = {"bulgarian": "/ˈkɤʃtɐ/", "german": "/haʊ̯s/"}' \
./docs/audit/work-in-progress.json > temp.json && mv temp.json ./docs/audit/work-in-progress.json

echo "✅ Applied IPA to: haus"

jq '.items[13].ipa = {"bulgarian": "/uˈt͡ʃiliʃtɛ/", "german": "/ˈʃuːlə/"}' \
./docs/audit/work-in-progress.json > temp.json && mv temp.json ./docs/audit/work-in-progress.json

echo "✅ Applied IPA to: schule"

jq '.items[14].ipa = {"bulgarian": "/ɡrat/", "german": "/ʃtat/"}' \
./docs/audit/work-in-progress.json > temp.json && mv temp.json ./docs/audit/work-in-progress.json

echo "✅ Applied IPA to: stadt"

jq '.items[15].ipa = {"bulgarian": "/ˈsɛɫɔ/", "german": "/dɔʁf/"}' \
./docs/audit/work-in-progress.json > temp.json && mv temp.json ./docs/audit/work-in-progress.json

echo "✅ Applied IPA to: dorf"

jq '.items[16].ipa = {"bulgarian": "/ˈxranɐ/", "german": "/ˈɛsn̩/"}' \
./docs/audit/work-in-progress.json > temp.json && mv temp.json ./docs/audit/work-in-progress.json

echo "✅ Applied IPA to: essen"

jq '.items[17].ipa = {"bulgarian": "/sɤm/", "german": "/zaɪ̯n/"}' \
./docs/audit/work-in-progress.json > temp.json && mv temp.json ./docs/audit/work-in-progress.json

echo "✅ Applied IPA to: sein"

jq '.items[18].ipa = {"bulgarian": "/ˈpravʲɐ/", "german": "/ˈmaxn̩/"}' \
./docs/audit/work-in-progress.json > temp.json && mv temp.json ./docs/audit/work-in-progress.json

echo "✅ Applied IPA to: machen"

jq '.items[19].ipa = {"bulgarian": "/ɡoˈvɔrʲɐ/", "german": "/ˈʃprɛçn̩/"}' \
./docs/audit/work-in-progress.json > temp.json && mv temp.json ./docs/audit/work-in-progress.json

echo "✅ Applied IPA to: sprechen"

echo ""
echo "🎉 All IPA transcriptions applied successfully!"
echo "Total items processed: 20"
