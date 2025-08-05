import Foundation

/// Stores bilingual grammar topics used by the app.  Each topic contains
/// Bulgarian and German text so that explanations can be shown in the
/// learner's native language.
struct GrammarData {
    static let topics: [GrammarTopic] = [
        GrammarTopic(
            titleBG: "Ред на думите",
            titleDE: "Wortstellung",
            descriptionBG: "Българският словоред е гъвкав заради съгласуването между подлог и сказуемо. Неутралният ред е S + V + O + A (подлог, сказуемо, пряко допълнение, обстоятелствено пояснение), но са възможни и други варианти като A + S + V + O или O + S + V + A. Словоредът се променя за акцент без промяна на основния смисъл.",
            descriptionDE: "Die bulgarische Wortstellung ist dank der Kongruenz zwischen Subjekt und Verb flexibel. Das neutrale Muster ist S + V + O + A (Subjekt, Verb, Objekt, Adverbial), aber auch andere Reihenfolgen wie A + S + V + O oder O + S + V + A sind möglich. Man verändert die Stellung, um Teile des Satzes zu betonen, ohne die Grundbedeutung zu ändern.",
            examplesBG: [
                "Той видя момичето в далечината. – Неутрален ред.",
                "В далечината той видя момичето. – Акцент върху обстоятелството.",
                "Момичето той видя в далечината. – Акцент върху обекта."
            ],
            examplesDE: [
                "Той видя момичето в далечината. – Er sah das Mädchen in der Ferne.",
                "В далечината той видя момичето. – In der Ferne sah er das Mädchen.",
                "Момичето той видя в далечината. – Das Mädchen sah er in der Ferne."
            ],
            level: "A1"
        ),
        GrammarTopic(
            titleBG: "Род на съществителните",
            titleDE: "Genus der Substantive",
            descriptionBG: "Българските съществителни имена имат три рода: мъжки, женски и среден. Мъжките често завършват на съгласна (мъж, син). Женските обикновено завършват на –а/–я (жена, ябълка). Средният род завършва на –е/–о (море, месо). Има изключения като баща (мъжки род с –а) или любов (женски род със съгласна).",
            descriptionDE: "Bulgarische Substantive haben drei grammatische Geschlechter: maskulin, feminin und neutrum. Maskuline Nomen enden meist auf einen Konsonanten (мъж – Mann, син – Sohn). Feminine enden oft auf –а/–я (жена – Frau, ябълка – Apfel). Neutra enden typischerweise auf –е/–о (море – Meer, месо – Fleisch). Ausnahmen sind etwa баща (Maskulinum mit –a) oder любов (Femininum mit Konsonant).",
            examplesBG: [
                "мъж – мъжки род",
                "жена – женски род",
                "море – среден род",
                "баща – мъжки род с –а",
                "любов – женски род със съгласна"
            ],
            examplesDE: [
                "мъж – Mann (Maskulinum)",
                "жена – Frau (Femininum)",
                "море – Meer (Neutrum)",
                "баща – Vater (Maskulinum mit –a)",
                "любов – Liebe (Femininum mit Konsonant)"
            ],
            level: "A1"
        ),
        GrammarTopic(
            titleBG: "Единствено и множествено число",
            titleDE: "Singular und Plural",
            descriptionBG: "Съществителните имена имат единствено и множествено число. Мъжките образуват множествено с –и, –е или –ове (стол – столове). Женските заменят –а/–я с –и (жена – жени). Средният род взема –а или –ета (море – морета). Съществува историческа двойствена форма за някои мъжки думи (два стола).",
            descriptionDE: "Bulgarische Nomen stehen im Singular oder Plural. Maskulina bilden den Plural mit Endungen wie –и, –е oder –ове (стол – столове). Feminina ersetzen –а/–я durch –и (жена – жени). Neutra erhalten –а oder –ета (море – морета). Eine historische Dualform überlebt bei einigen unbelebten Maskulina (два стола).",
            examplesBG: [
                "стол – столове",
                "жена – жени",
                "море – морета",
                "два стола – двойствено число"
            ],
            examplesDE: [
                "стол – stolove (Stuhl – Stühle)",
                "жена – jeni (Frau – Frauen)",
                "море – moreta (Meer – Meere)",
                "два стола – zwei Stühle (Dual)"
            ],
            level: "A1"
        ),
        GrammarTopic(
            titleBG: "Определителен член",
            titleDE: "Bestimmter Artikel",
            descriptionBG: "Определителният член в българския се поставя в края на думата. Мъжки род получава –ът/–ят (студент – студентът), женски –та (вода – водата), среден –то (село – селото). При множествено число се използва –те за мъжки и женски и –та за среден род.",
            descriptionDE: "Der bulgarische bestimmte Artikel steht am Wortende. Maskuline Nomen nehmen –ът/–ят (студент – студентът), feminine –та (вода – водата) und neutrale –то (село – селото). Im Plural lautet der Artikel –те für Maskulina und Feminina bzw. –та für Neutra.",
            examplesBG: [
                "студент – студентът",
                "вода – водата",
                "село – селото",
                "мъже – мъжете"
            ],
            examplesDE: [
                "студент – студентът (der Student)",
                "вода – водата (das Wasser)",
                "село – селото (das Dorf)",
                "мъже – мъжете (die Männer)"
            ],
            level: "A1"
        ),
        GrammarTopic(
            titleBG: "Местоимения и падежи",
            titleDE: "Pronomen und Fälle",
            descriptionBG: "Падежите в българския се срещат главно при личните местоимения. Има три падежа: именителен (аз, ти, той, тя, то, ние, вие, те), винителен (ме, те, го, я, го, ни, ви, ги) и дателен (ми, ти, му, ѝ, му, ни, ви, им). Именителният се използва за подлог, винителният за пряко допълнение, а дателният за непряко.",
            descriptionDE: "Fälle im Bulgarischen existieren vor allem bei den Personalpronomen. Es gibt drei: Nominativ (аз, ти, той, тя, то, ние, вие, те), Akkusativ (ме, те, го, я, го, ни, ви, ги) und Dativ (ми, ти, му, ѝ, му, ни, ви, им). Der Nominativ dient dem Subjekt, der Akkusativ dem direkten Objekt und der Dativ dem indirekten Objekt.",
            examplesBG: [
                "Аз го попитах как се чувства. – 'го' винителен.",
                "Аз му дадох моята книга. – 'му' дателен."
            ],
            examplesDE: [
                "Аз го попитах как се чувства. – Ich fragte ihn, wie er sich fühlt. (го – Akkusativ)",
                "Аз му дадох моята книга. – Ich gab ihm mein Buch. (му – Dativ)"
            ],
            level: "A1"
        ),
        GrammarTopic(
            titleBG: "Сегашно и бъдеще време",
            titleDE: "Präsens und Futur",
            descriptionBG: "Българските глаголи се спреждат по лице и число. Сегашното време изразява действащи действия (Аз уча български). Бъдещето време използва частицата ще и сегашно време на глагола (Аз ще уча български).",
            descriptionDE: "Bulgarische Verben konjugieren nach Person und Zahl. Das Präsens beschreibt laufende Handlungen (Аз уча български – Ich lerne Bulgarisch). Das Futur wird mit der Partikel ще und dem Präsens des Verbs gebildet (Аз ще уча български – Ich werde Bulgarisch lernen).",
            examplesBG: [
                "Аз уча български.",
                "Аз ще уча български."
            ],
            examplesDE: [
                "Аз уча български. – Ich lerne Bulgarisch.",
                "Аз ще уча български. – Ich werde Bulgarisch lernen."
            ],
            level: "A1"
        ),
        // A2 topics
        GrammarTopic(
            titleBG: "Минали времена",
            titleDE: "Vergangenheitszeiten",
            descriptionBG: "На ниво А2 е важно да се различават миналото свършено (аорист) и миналото несвършено (имперфект). Аористът описва завършени действия (Аз учих български), а имперфектът – продължителни или обичайни действия в миналото (Аз учех български).",
            descriptionDE: "Für Lernende auf A2 ist es hilfreich, zwischen dem bulgarischen Aorist und Imperfekt zu unterscheiden. Der Aorist beschreibt abgeschlossene Handlungen (Аз учих български – Ich lernte Bulgarisch), während der Imperfekt kontinuierliche oder gewohnheitsmäßige Vergangenheitsaktionen ausdrückt (Аз учех български – Ich lernte gerade Bulgarisch).",
            examplesBG: [
                "Аз учих български.",
                "Аз учех български."
            ],
            examplesDE: [
                "Аз учих български. – Ich lernte Bulgarisch.",
                "Аз учех български. – Ich lernte gerade Bulgarisch."
            ],
            level: "A2"
        ),
        GrammarTopic(
            titleBG: "Количествени думи и числа",
            titleDE: "Quantoren und Zahlen",
            descriptionBG: "На А2 ще срещнете по-често количествени думи като много, малко, всички, няколко, никой. Числата от едно до десет са: едно, две, три, четири, пет, шест, седем, осем, девет, десет.",
            descriptionDE: "Auf Niveau A2 begegnen Ihnen häufiger Quantoren und Zahlen. Wörter wie много (viel), малко (wenig), всички (alle), няколко (einige) und никой (keiner) quantifizieren Nomen. Die bulgarischen Zahlen eins bis zehn lauten: едно, две, три, четири, пет, шест, седем, осем, девет, десет.",
            examplesBG: [
                "Имам много книги.",
                "Имаме няколко стола."
            ],
            examplesDE: [
                "Имам много книги. – Ich habe viele Bücher.",
                "Имаме няколко стола. – Wir haben einige Stühle."
            ],
            level: "A2"
        ),
        GrammarTopic(
            titleBG: "Изрази за време",
            titleDE: "Zeitangaben",
            descriptionBG: "За да говорите за време, трябва думи за дните от седмицата и частите на деня. Дните са понеделник, вторник, сряда, четвъртък, петък, събота, неделя. Частите на деня са сутрин, обед, следобед, вечер, нощ.",
            descriptionDE: "Um über Zeit zu sprechen, benötigt man Wörter für Wochentage und Tageszeiten. Die Wochentage sind понеделник, вторник, сряда, четвъртък, петък, събота, неделя. Tageszeiten sind сутрин (Morgen), обед (Mittag), следобед (Nachmittag), вечер (Abend) und нощ (Nacht).",
            examplesBG: [
                "Срещаме се във вторник сутрин.",
                "Работя всеки ден следобед."
            ],
            examplesDE: [
                "Срещаме се във вторник сутрин. – Wir treffen uns am Dienstagmorgen.",
                "Работя всеки ден следобед. – Ich arbeite jeden Nachmittag."
            ],
            level: "A2"
        ),
        GrammarTopic(
            titleBG: "Храна и пазаруване",
            titleDE: "Essen und Einkaufen",
            descriptionBG: "На А2 често ще говорите за храна и пазаруване. Научете съществителни като хляб, мляко, сирене и глаголи като купувам, продавам, пазарувам. Полезно е да знаете думи за валута като лев и евро.",
            descriptionDE: "Auf A2 spricht man häufig über Essen und Einkaufen. Lernen Sie Nomen wie хляб (Brot), мляко (Milch), сирене (Käse) sowie Verben wie купувам (kaufen), продавам (verkaufen), пазарувам (einkaufen). Hilfreich sind auch Wörter für Währungen wie лев und евро.",
            examplesBG: [
                "Купувам хляб от магазина.",
                "Колко струва това?"
            ],
            examplesDE: [
                "Купувам хляб от магазина. – Ich kaufe Brot im Laden.",
                "Колко струва това? – Wie viel kostet das?"
            ],
            level: "A2"
        ),
        GrammarTopic(
            titleBG: "Пътуване и посоки",
            titleDE: "Reisen und Richtungen",
            descriptionBG: "На А2 може да се наложи да питате за посоки или да говорите за пътуване. Важни думи са автобус, влак, самолет, такси, гара и летище. Думата билет означава билет, а карта – карта.",
            descriptionDE: "Auf A2 müssen Sie möglicherweise nach dem Weg fragen oder über Reisen sprechen. Wichtige Wörter sind автобус (Bus), влак (Zug), самолет (Flugzeug), такси (Taxi), гара (Bahnhof) und летище (Flughafen). билет bedeutet 'Ticket' und карта 'Karte'.",
            examplesBG: [
                "Къде е гарата?",
                "Имам билет за автобуса."
            ],
            examplesDE: [
                "Къде е гарата? – Wo ist der Bahnhof?",
                "Имам билет за автобуса. – Ich habe ein Ticket für den Bus."
            ],
            level: "A2"
        )
    ]
}
