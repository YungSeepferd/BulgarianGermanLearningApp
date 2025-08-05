// App state
let currentView = 'home';
let currentLevel = '';
let currentFilter = 'All';
let currentVocabulary = [];
let currentGrammar = [];

// Audio settings
let speechRate = 0.5;
let speechVolume = 1.0;
let speechSynthesis = window.speechSynthesis;

// Vocabulary data (converted from SwiftUI DataStore)
const vocabularyData = [
    // A1 greetings and basic phrases
    { word: "Здравей", translation: "Hallo", type: "Begrüßung", level: "A1", notes: "Das Wort 'Здравей' leitet sich vom bulgarischen Wort 'здрав' (gesund) ab und ist wie ein Wunsch nach Gesundheit." },
    { word: "Добро утро", translation: "Guten Morgen", type: "Begrüßung", level: "A1", notes: null },
    { word: "Добър ден", translation: "Guten Tag", type: "Begrüßung", level: "A1", notes: null },
    { word: "Добър вечер", translation: "Guten Abend", type: "Begrüßung", level: "A1", notes: null },
    { word: "Лека нощ", translation: "Gute Nacht", type: "Begrüßung", level: "A1", notes: null },
    { word: "Довиждане", translation: "Auf Wiedersehen", type: "Begrüßung", level: "A1", notes: null },
    { word: "Моля", translation: "Bitte", type: "Ausdruck", level: "A1", notes: null },
    { word: "Благодаря", translation: "Danke", type: "Ausdruck", level: "A1", notes: null },
    { word: "Извинете", translation: "Entschuldigung", type: "Ausdruck", level: "A1", notes: null },
    { word: "Съжалявам", translation: "Es tut mir leid", type: "Ausdruck", level: "A1", notes: null },

    // A1 essential nouns
    { word: "Човек", translation: "Mensch", type: "Substantiv", level: "A1", notes: null },
    { word: "Семейство", translation: "Familie", type: "Substantiv", level: "A1", notes: null },
    { word: "Къща", translation: "Haus", type: "Substantiv", level: "A1", notes: null },
    { word: "Училище", translation: "Schule", type: "Substantiv", level: "A1", notes: null },
    { word: "Работа", translation: "Arbeit", type: "Substantiv", level: "A1", notes: null },
    { word: "Град", translation: "Stadt", type: "Substantiv", level: "A1", notes: null },
    { word: "Село", translation: "Dorf", type: "Substantiv", level: "A1", notes: "'Село' bedeutet Dorf und ist mit anderen slawischen Wörtern für Siedlung verwandt." },
    { word: "Книга", translation: "Buch", type: "Substantiv", level: "A1", notes: "'Книга' stammt aus dem Altslawischen und war ursprünglich eine Bezeichnung für eine Schriftrolle oder ein gebundenes Werk." },
    { word: "Храна", translation: "Essen", type: "Substantiv", level: "A1", notes: null },
    { word: "Вода", translation: "Wasser", type: "Substantiv", level: "A1", notes: "'Вода' ist Wasser und hat denselben indoeuropäischen Ursprung wie das deutsche 'Wasser'." },

    // A1 important verbs
    { word: "Съм", translation: "sein", type: "Verb", level: "A1", notes: "Das Verb 'съм' entspricht dem deutschen 'sein' und ist unregelmäßig." },
    { word: "Имам", translation: "haben", type: "Verb", level: "A1", notes: null },
    { word: "Правя", translation: "machen", type: "Verb", level: "A1", notes: null },
    { word: "Мога", translation: "können", type: "Verb", level: "A1", notes: null },
    { word: "Ходя", translation: "gehen", type: "Verb", level: "A1", notes: null },
    { word: "Ям", translation: "essen", type: "Verb", level: "A1", notes: "'Ям' ist ein kurzes Verb, das 'essen' bedeutet; es gehört zu den Grundverben wie im Deutschen 'essen'." },
    { word: "Пия", translation: "trinken", type: "Verb", level: "A1", notes: null },
    { word: "Говоря", translation: "sprechen", type: "Verb", level: "A1", notes: null },
    { word: "Виждам", translation: "sehen", type: "Verb", level: "A1", notes: null },
    { word: "Чувам", translation: "hören", type: "Verb", level: "A1", notes: null },

    // A1 common adjectives
    { word: "Добър", translation: "gut", type: "Adjektiv", level: "A1", notes: null },
    { word: "Лош", translation: "schlecht", type: "Adjektiv", level: "A1", notes: null },
    { word: "Голям", translation: "groß", type: "Adjektiv", level: "A1", notes: null },
    { word: "Малък", translation: "klein", type: "Adjektiv", level: "A1", notes: null },
    { word: "Нов", translation: "neu", type: "Adjektiv", level: "A1", notes: null },
    { word: "Стар", translation: "alt", type: "Adjektiv", level: "A1", notes: null },
    { word: "Красив", translation: "schön", type: "Adjektiv", level: "A1", notes: null },
    { word: "Грозен", translation: "hässlich", type: "Adjektiv", level: "A1", notes: null },
    { word: "Топъл", translation: "warm", type: "Adjektiv", level: "A1", notes: null },
    { word: "Студен", translation: "kalt", type: "Adjektiv", level: "A1", notes: null },

    // A1 useful adverbs
    { word: "Тук", translation: "hier", type: "Adverb", level: "A1", notes: null },
    { word: "Там", translation: "dort", type: "Adverb", level: "A1", notes: null },
    { word: "Сега", translation: "jetzt", type: "Adverb", level: "A1", notes: null },
    { word: "Тогава", translation: "dann", type: "Adverb", level: "A1", notes: null },
    { word: "Бързо", translation: "schnell", type: "Adverb", level: "A1", notes: null },
    { word: "Бавно", translation: "langsam", type: "Adverb", level: "A1", notes: null },
    { word: "Често", translation: "oft", type: "Adverb", level: "A1", notes: null },
    { word: "Редко", translation: "selten", type: "Adverb", level: "A1", notes: null },
    { word: "Добре", translation: "gut", type: "Adverb", level: "A1", notes: null },
    { word: "Зле", translation: "schlecht", type: "Adverb", level: "A1", notes: null },

    // A2 nouns and everyday objects
    { word: "Маса", translation: "Tisch", type: "Substantiv", level: "A2", notes: null },
    { word: "Стол", translation: "Stuhl", type: "Substantiv", level: "A2", notes: null },
    { word: "Хладилник", translation: "Kühlschrank", type: "Substantiv", level: "A2", notes: null },
    { word: "Кухня", translation: "Küche", type: "Substantiv", level: "A2", notes: null },
    { word: "Апартамент", translation: "Wohnung", type: "Substantiv", level: "A2", notes: null },
    { word: "Автомобил", translation: "Auto", type: "Substantiv", level: "A2", notes: "'Автомобил' ist ein Lehnwort aus dem Französischen; es setzt sich aus 'auto' (selbst) und 'mobile' (beweglich) zusammen." },
    { word: "Магазин", translation: "Laden", type: "Substantiv", level: "A2", notes: null },
    { word: "Градина", translation: "Garten", type: "Substantiv", level: "A2", notes: null },
    { word: "Часовник", translation: "Uhr", type: "Substantiv", level: "A2", notes: null },

    // A2 common verbs
    { word: "Чета", translation: "lesen", type: "Verb", level: "A2", notes: null },
    { word: "Пиша", translation: "schreiben", type: "Verb", level: "A2", notes: null },
    { word: "Карам", translation: "fahren", type: "Verb", level: "A2", notes: null },
    { word: "Живея", translation: "leben", type: "Verb", level: "A2", notes: null },
    { word: "Работя", translation: "arbeiten", type: "Verb", level: "A2", notes: null },
    { word: "Уча", translation: "lernen", type: "Verb", level: "A2", notes: null },

    // A2 numbers and quantities
    { word: "Едно", translation: "eins", type: "Zahl", level: "A2", notes: null },
    { word: "Две", translation: "zwei", type: "Zahl", level: "A2", notes: null },
    { word: "Три", translation: "drei", type: "Zahl", level: "A2", notes: null },
    { word: "Четири", translation: "vier", type: "Zahl", level: "A2", notes: null },
    { word: "Пет", translation: "fünf", type: "Zahl", level: "A2", notes: null },
    { word: "Шест", translation: "sechs", type: "Zahl", level: "A2", notes: null },
    { word: "Седем", translation: "sieben", type: "Zahl", level: "A2", notes: null },
    { word: "Осем", translation: "acht", type: "Zahl", level: "A2", notes: null },
    { word: "Девет", translation: "neun", type: "Zahl", level: "A2", notes: null },
    { word: "Десет", translation: "zehn", type: "Zahl", level: "A2", notes: null },
    { word: "Много", translation: "viele", type: "Quantor", level: "A2", notes: null },
    { word: "Малко", translation: "wenig", type: "Quantor", level: "A2", notes: null },
    { word: "Всички", translation: "alle", type: "Quantor", level: "A2", notes: null },
    { word: "Няколко", translation: "einige", type: "Quantor", level: "A2", notes: null },
    { word: "Никой", translation: "keiner", type: "Quantor", level: "A2", notes: null },

    // A2 days of the week and time
    { word: "Понеделник", translation: "Montag", type: "Tag", level: "A2", notes: null },
    { word: "Вторник", translation: "Dienstag", type: "Tag", level: "A2", notes: null },
    { word: "Сряда", translation: "Mittwoch", type: "Tag", level: "A2", notes: null },
    { word: "Четвъртък", translation: "Donnerstag", type: "Tag", level: "A2", notes: null },
    { word: "Петък", translation: "Freitag", type: "Tag", level: "A2", notes: null },
    { word: "Събота", translation: "Samstag", type: "Tag", level: "A2", notes: null },
    { word: "Неделя", translation: "Sonntag", type: "Tag", level: "A2", notes: null },
    { word: "Час", translation: "Stunde", type: "Zeit", level: "A2", notes: null },
    { word: "Минута", translation: "Minute", type: "Zeit", level: "A2", notes: null },
    { word: "Сутрин", translation: "Morgen", type: "Zeit", level: "A2", notes: null },
    { word: "Обед", translation: "Mittag", type: "Zeit", level: "A2", notes: null },
    { word: "Следобед", translation: "Nachmittag", type: "Zeit", level: "A2", notes: null },
    { word: "Вечер", translation: "Abend", type: "Zeit", level: "A2", notes: null },
    { word: "Нощ", translation: "Nacht", type: "Zeit", level: "A2", notes: null },

    // A2 common phrases and expressions
    { word: "Как си?", translation: "Wie geht's?", type: "Ausdruck", level: "A2", notes: null },
    { word: "Добре съм", translation: "Mir geht's gut", type: "Ausdruck", level: "A2", notes: null },
    { word: "Извинявай", translation: "Entschuldige", type: "Ausdruck", level: "A2", notes: null },
    { word: "Може ли?", translation: "Darf ich?", type: "Ausdruck", level: "A2", notes: null },

    // A2 food and drink
    { word: "Хляб", translation: "Brot", type: "Lebensmittel", level: "A2", notes: null },
    { word: "Мляко", translation: "Milch", type: "Lebensmittel", level: "A2", notes: null },
    { word: "Сирене", translation: "Käse", type: "Lebensmittel", level: "A2", notes: null },
    { word: "Месо", translation: "Fleisch", type: "Lebensmittel", level: "A2", notes: null },
    { word: "Риба", translation: "Fisch", type: "Lebensmittel", level: "A2", notes: null },
    { word: "Зеленчуци", translation: "Gemüse", type: "Lebensmittel", level: "A2", notes: null },
    { word: "Плодове", translation: "Obst", type: "Lebensmittel", level: "A2", notes: null },
    { word: "Сок", translation: "Saft", type: "Lebensmittel", level: "A2", notes: null },
    { word: "Кафе", translation: "Kaffee", type: "Lebensmittel", level: "A2", notes: null },

    // A2 travel and transportation
    { word: "Автобус", translation: "Bus", type: "Transport", level: "A2", notes: null },
    { word: "Влак", translation: "Zug", type: "Transport", level: "A2", notes: null },
    { word: "Самолет", translation: "Flugzeug", type: "Transport", level: "A2", notes: null },
    { word: "Такси", translation: "Taxi", type: "Transport", level: "A2", notes: null },
    { word: "Гара", translation: "Bahnhof", type: "Transport", level: "A2", notes: null },
    { word: "Летище", translation: "Flughafen", type: "Transport", level: "A2", notes: null },
    { word: "Хотел", translation: "Hotel", type: "Transport", level: "A2", notes: null },
    { word: "Билет", translation: "Ticket", type: "Transport", level: "A2", notes: null },
    { word: "Път", translation: "Straße", type: "Transport", level: "A2", notes: null },
    { word: "Карта", translation: "Karte", type: "Transport", level: "A2", notes: null },

    // A2 health and emergencies
    { word: "Лекар", translation: "Arzt", type: "Gesundheit", level: "A2", notes: null },
    { word: "Болница", translation: "Krankenhaus", type: "Gesundheit", level: "A2", notes: "'Болница' leitet sich von 'болен' (krank) ab und bezeichnet einen Ort für Kranke – wie das deutsche 'Krankenhaus'." },
    { word: "Аптека", translation: "Apotheke", type: "Gesundheit", level: "A2", notes: null },
    { word: "Лекарства", translation: "Medikamente", type: "Gesundheit", level: "A2", notes: null },
    { word: "Спешно", translation: "Notfall", type: "Gesundheit", level: "A2", notes: null },
    { word: "Болка", translation: "Schmerz", type: "Gesundheit", level: "A2", notes: null },
    { word: "Здраве", translation: "Gesundheit", type: "Gesundheit", level: "A2", notes: null },
    { word: "Треска", translation: "Fieber", type: "Gesundheit", level: "A2", notes: null },
    { word: "Настинка", translation: "Erkältung", type: "Gesundheit", level: "A2", notes: null },
    { word: "Помощ", translation: "Hilfe", type: "Gesundheit", level: "A2", notes: null },

    // A2 weather and nature
    { word: "Слънце", translation: "Sonne", type: "Natur", level: "A2", notes: null },
    { word: "Дъжд", translation: "Regen", type: "Natur", level: "A2", notes: null },
    { word: "Сняг", translation: "Schnee", type: "Natur", level: "A2", notes: null },
    { word: "Вятър", translation: "Wind", type: "Natur", level: "A2", notes: null },
    { word: "Температура", translation: "Temperatur", type: "Natur", level: "A2", notes: null },
    { word: "Облаци", translation: "Wolken", type: "Natur", level: "A2", notes: null },
    { word: "Гора", translation: "Wald", type: "Natur", level: "A2", notes: null },
    { word: "Река", translation: "Fluss", type: "Natur", level: "A2", notes: null },
    { word: "Планина", translation: "Berg", type: "Natur", level: "A2", notes: null },
    { word: "Море", translation: "Meer", type: "Natur", level: "A2", notes: "'Море' bedeutet Meer und ist mit dem russischen 'more' verwandt; es geht auf eine urslawische Wurzel zurück." },

    // A2 family and relationships
    { word: "Майка", translation: "Mutter", type: "Familie", level: "A2", notes: null },
    { word: "Баща", translation: "Vater", type: "Familie", level: "A2", notes: null },
    { word: "Брат", translation: "Bruder", type: "Familie", level: "A2", notes: null },
    { word: "Сестра", translation: "Schwester", type: "Familie", level: "A2", notes: null },
    { word: "Съпруг", translation: "Ehemann", type: "Familie", level: "A2", notes: null },
    { word: "Съпруга", translation: "Ehefrau", type: "Familie", level: "A2", notes: null },
    { word: "Дете", translation: "Kind", type: "Familie", level: "A2", notes: null },
    { word: "Приятел", translation: "Freund", type: "Familie", level: "A2", notes: null },
    { word: "Приятелка", translation: "Freundin", type: "Familie", level: "A2", notes: null },

    // A2 shopping and money
    { word: "Пари", translation: "Geld", type: "Einkauf", level: "A2", notes: null },
    { word: "Цена", translation: "Preis", type: "Einkauf", level: "A2", notes: null },
    { word: "Евро", translation: "Euro", type: "Einkauf", level: "A2", notes: null },
    { word: "Лев", translation: "Lew", type: "Einkauf", level: "A2", notes: "Die bulgarische Währung 'лев' ist nach dem alten bulgarischen Wort für 'Löwe' benannt, weil der Löwe ein nationales Symbol ist." },
    { word: "Сметка", translation: "Rechnung", type: "Einkauf", level: "A2", notes: null },
    { word: "Касова бележка", translation: "Quittung", type: "Einkauf", level: "A2", notes: null },
    { word: "Отстъпка", translation: "Rabatt", type: "Einkauf", level: "A2", notes: null },
    { word: "Купувам", translation: "kaufen", type: "Verb", level: "A2", notes: null },
    { word: "Продавам", translation: "verkaufen", type: "Verb", level: "A2", notes: null },
    { word: "Пазарувам", translation: "einkaufen", type: "Verb", level: "A2", notes: null }
];

// Grammar data (converted from SwiftUI DataStore)
const grammarData = [
    {
        title: "Word Order",
        description: "Bulgarian word order is flexible thanks to subject–verb agreement.\nThe neutral pattern is S + V + O + A (Subject, Verb, Object, Adjunct), but other orders such as A + S + V + O, O + S + V + A or S + V + A + O are also possible.\nYou can change the order to emphasise different parts of the sentence without changing the basic meaning.",
        examples: [
            "Той видя момичето в далечината. – He saw the girl in the distance.",
            "В далечината той видя момичето. – In the distance, he saw the girl.",
            "Момичето той видя в далечината. – The girl he saw in the distance."
        ],
        level: "A1"
    },
    {
        title: "Gender of Nouns",
        description: "Bulgarian nouns have three grammatical genders: masculine, feminine and neuter.\nMasculine nouns usually end in a consonant (мъж – man, син – son).\nFeminine nouns often end in –а/–я (жена – woman, ябълка – apple).\nNeuter nouns typically end in –е/–о (море – sea, месо – meat).\nThere are exceptions: some masculine nouns end in –а/–я (баща – father), some feminine nouns end in a consonant (любов – love), and some neuter nouns end in –и or –ю (такси – taxi).",
        examples: [
            "мъж – man (masculine)",
            "жена – woman (feminine)",
            "море – sea (neuter)",
            "баща – father (masculine ending in –а)",
            "любов – love (feminine ending in consonant)"
        ],
        level: "A1"
    },
    {
        title: "Singular and Plural",
        description: "Bulgarian nouns are either singular or plural.\nMasculine nouns form plurals with endings like –и, –е or –ове (стол – столове 'chair – chairs').\nFeminine nouns replace –а/–я with –и (жена – жени 'woman – women').\nNeuter nouns take –а or –ета (море – морета 'sea – seas').\nA historical dual number for pairs of inanimate masculine nouns survives with the ending –а (два стола – two chairs).",
        examples: [
            "стол – столове (chair – chairs)",
            "жена – жени (woman – women)",
            "море – морета (sea – seas)",
            "два стол а (two chairs – dual form)"
        ],
        level: "A1"
    },
    {
        title: "Definite Article",
        description: "The Bulgarian definite article attaches to the end of the noun.\nMasculine nouns take –ът/–ят (студент – студентът 'the student', кон – конят 'the horse').\nFeminine nouns take –та (вода – водата 'the water', чиния – чинията 'the plate').\nNeuter nouns take –то (село – селото 'the village', море – морето 'the sea').\nFor plural nouns the article is –те for masculine and feminine plurals and –та for neuter plurals.",
        examples: [
            "студент – студентът (student – the student)",
            "вода – водата (water – the water)",
            "село – селото (village – the village)",
            "мъже – мъжете (men – the men)"
        ],
        level: "A1"
    },
    {
        title: "Pronouns and Cases",
        description: "Bulgarian cases exist mainly in personal pronouns.\nThere are three cases: nominative (аз, ти, той, тя, то, ние, вие, те), accusative (ме, те, го, я, го, ни, ви, ги) and dative (ми, ти, му, й, му, ни, ви, им).\nUse the nominative for subjects, the accusative for direct objects and the dative for indirect objects.",
        examples: [
            "Аз го попитах как се чувства. – I asked him how he was feeling. (go – accusative)",
            "Аз му дадох моята книга. – I gave my book to him. (mu – dative)"
        ],
        level: "A1"
    },
    {
        title: "Present and Future Tenses",
        description: "Bulgarian verbs conjugate for person and number.\nThe present tense expresses ongoing actions (Аз уча български – I study Bulgarian).\nFuture tense uses the particle ще and the present tense of the verb (Аз ще уча български – I will study Bulgarian).",
        examples: [
            "Аз уча български. – I study Bulgarian.",
            "Аз ще уча български. – I will study Bulgarian."
        ],
        level: "A1"
    },
    {
        title: "Past Tenses",
        description: "For A2 learners it's useful to distinguish between the past aorist and the past imperfect.\nThe past aorist describes completed actions (Аз учих български – I studied Bulgarian), while the past imperfect describes continuous or habitual past actions (Аз учех български – I was studying Bulgarian).",
        examples: [
            "Аз учих български. – I studied Bulgarian.",
            "Аз учех български. – I was studying Bulgarian."
        ],
        level: "A2"
    },
    {
        title: "Quantifiers and Numbers",
        description: "At level A2 you'll encounter quantifiers and numbers more frequently.\nThe words много (many/much), малко (few/little), всички (all), няколко (several) and никой (none) help quantify nouns.\nBulgarian numbers one through ten are: едно, две, три, четири, пет, шест, седем, осем, девет, десет.",
        examples: [
            "Имам много книги. – I have many books.",
            "Имаме няколко стола. – We have several chairs."
        ],
        level: "A2"
    },
    {
        title: "Time Expressions",
        description: "Talking about time requires vocabulary for days and parts of the day.\nThe days of the week are понеделник, вторник, сряда, четвъртък, петък, събота and неделя.\nParts of the day include сутрин (morning), обед (noon), следобед (afternoon), вечер (evening) and нощ (night).",
        examples: [
            "Срещаме се във вторник сутрин. – We meet on Tuesday morning.",
            "Работя всеки ден следобед. – I work every afternoon."
        ],
        level: "A2"
    },
    {
        title: "Food and Shopping Vocabulary",
        description: "Food and shopping conversations are frequent at A2.\nLearn common nouns for food (хляб – bread, мляко – milk, сирене – cheese) and verbs for shopping (купувам – to buy, продавам – to sell, пазарувам – to shop).\nUnderstanding basic currency words like лев (the Bulgarian currency) and евро (euro) is also helpful.",
        examples: [
            "Купувам хляб от магазина. – I buy bread from the shop.",
            "Колко струва това? – How much does this cost?"
        ],
        level: "A2"
    },
    {
        title: "Travel and Directions",
        description: "At A2 you may need to ask for directions or discuss travel.\nKey nouns include автобус (bus), влак (train), самолет (airplane), такси (taxi), гара (train station) and летище (airport).\nThe noun билет means 'ticket', and карта means 'map'.",
        examples: [
            "Къде е гарата? – Where is the train station?",
            "Имам билет за автобуса. – I have a ticket for the bus."
        ],
        level: "A2"
    }
];

// Navigation functions
function showView(viewName) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    
    // Show target view
    document.getElementById(viewName + '-view').classList.add('active');
    currentView = viewName;
}

function goHome() {
    showView('home');
    currentLevel = '';
    currentFilter = 'All';
}

function goBack() {
    if (currentView === 'vocabulary-detail') {
        showView('vocabulary');
    } else if (currentView === 'grammar-detail') {
        showView('grammar');
    }
}

// Vocabulary functions
function showVocabulary(level) {
    currentLevel = level;
    currentVocabulary = vocabularyData.filter(item => item.level === level);
    
    document.getElementById('vocabulary-title').textContent = level + ' Vocabulary';
    showView('vocabulary');
    
    renderVocabularyList();
    renderFilterTabs();
}

function renderVocabularyList() {
    const container = document.getElementById('vocabulary-list');
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value.toLowerCase();
    
    let filteredItems = currentVocabulary;
    
    // Apply search filter
    if (searchTerm) {
        filteredItems = filteredItems.filter(item => 
            item.word.toLowerCase().includes(searchTerm) ||
            item.translation.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply type filter
    if (currentFilter !== 'All') {
        filteredItems = filteredItems.filter(item => item.type === currentFilter);
    }
    
    if (filteredItems.length === 0) {
        container.innerHTML = '<div class="empty-state">No results found.</div>';
        return;
    }
    
    container.innerHTML = filteredItems.map(item => `
        <div class="vocabulary-item" onclick="showVocabularyDetail('${item.word}')">
            <div class="vocabulary-content">
                <div class="vocabulary-word">${item.word}</div>
                <div class="vocabulary-translation">${item.translation}</div>
                <div class="vocabulary-type">${item.type}</div>
            </div>
            <button class="play-btn" onclick="event.stopPropagation(); speakWord('${item.word}')">
                <i class="fas fa-play"></i>
            </button>
        </div>
    `).join('');
}

function renderFilterTabs() {
    const container = document.getElementById('filter-tabs');
    const types = ['All', ...new Set(currentVocabulary.map(item => item.type))];
    
    container.innerHTML = types.map(type => `
        <button class="filter-tab ${type === currentFilter ? 'active' : ''}" 
                onclick="setFilter('${type}')">
            ${type}
        </button>
    `).join('');
}

function setFilter(type) {
    currentFilter = type;
    renderVocabularyList();
    renderFilterTabs();
}

function filterVocabulary() {
    renderVocabularyList();
    
    const searchInput = document.getElementById('search-input');
    const clearBtn = document.querySelector('.clear-btn');
    
    if (searchInput.value) {
        clearBtn.style.display = 'block';
    } else {
        clearBtn.style.display = 'none';
    }
}

function clearSearch() {
    document.getElementById('search-input').value = '';
    renderVocabularyList();
    document.querySelector('.clear-btn').style.display = 'none';
}

function showVocabularyDetail(word) {
    const item = vocabularyData.find(item => item.word === word);
    if (!item) return;
    
    document.getElementById('detail-title').textContent = item.word;
    
    const content = document.getElementById('detail-content');
    content.innerHTML = `
        <div class="detail-word">
            ${item.word}
            <button class="play-btn" onclick="speakWord('${item.word}')">
                <i class="fas fa-play"></i>
            </button>
        </div>
        <div class="detail-translation">${item.translation}</div>
        <div class="detail-type">Part of speech: ${item.type}</div>
        ${item.notes ? `
            <div class="detail-notes">
                <h4>Notes:</h4>
                <p>${item.notes}</p>
            </div>
        ` : ''}
    `;
    
    showView('vocabulary-detail');
}

// Grammar functions
function showGrammar(level) {
    currentGrammar = grammarData.filter(item => item.level === level);
    
    document.getElementById('grammar-title').textContent = level + ' Grammar';
    showView('grammar');
    
    renderGrammarList();
}

function renderGrammarList() {
    const container = document.getElementById('grammar-list');
    
    container.innerHTML = currentGrammar.map(item => `
        <div class="grammar-item" onclick="showGrammarDetail('${item.title}')">
            <div class="grammar-title">${item.title}</div>
            <div class="grammar-description">${item.description.split('\n')[0]}...</div>
        </div>
    `).join('');
}

function showGrammarDetail(title) {
    const item = grammarData.find(item => item.title === title);
    if (!item) return;
    
    document.getElementById('grammar-detail-title').textContent = item.title;
    
    const content = document.getElementById('grammar-detail-content');
    content.innerHTML = `
        <div class="grammar-detail-description">${item.description}</div>
        <div class="grammar-examples">
            <h4>Examples:</h4>
            ${item.examples.map(example => `
                <div class="example-item">${example}</div>
            `).join('')}
        </div>
    `;
    
    showView('grammar-detail');
}

// Audio functions
function speakWord(word) {
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'bg-BG';
    utterance.rate = speechRate;
    utterance.volume = speechVolume;
    
    speechSynthesis.speak(utterance);
}

function testAudio() {
    speakWord('Здравей');
}

// Settings functions
function showSettings() {
    document.getElementById('settings-modal').classList.add('active');
}

function hideSettings() {
    document.getElementById('settings-modal').classList.remove('active');
}

function updateSpeechRate() {
    const slider = document.getElementById('speech-rate');
    const value = document.getElementById('rate-value');
    speechRate = parseFloat(slider.value);
    value.textContent = Math.round(speechRate * 100) + '%';
}

function updateSpeechVolume() {
    const slider = document.getElementById('speech-volume');
    const value = document.getElementById('volume-value');
    speechVolume = parseFloat(slider.value);
    value.textContent = Math.round(speechVolume * 100) + '%';
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Close modal when clicking outside
    document.getElementById('settings-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            hideSettings();
        }
    });
    
    // Initialize settings values
    updateSpeechRate();
    updateSpeechVolume();
}); 