import Foundation

/// A static store of vocabulary items and grammar topics used by the app.
///
/// The arrays below contain the core data for the beginner (A1) and
/// elementary (A2) levels.  Each entry supplies the Bulgarian word,
/// its German translation, part of speech, level and optional notes.
/// The grammar topics provide concise explanations of major
/// grammatical concepts along with example sentences.
struct DataStore {
    /// All vocabulary items across levels.  You can filter this array by
    /// level to obtain level‑specific lists.
    static let vocabularyItems: [VocabularyItem] = [
        // A1 greetings and basic phrases (German translations)
        VocabularyItem(word: "Здравей", translation: "Hallo", type: "Begrüßung", level: "A1", notes: "Das Wort 'Здравей' leitet sich vom bulgarischen Wort 'здрав' (gesund) ab und ist wie ein Wunsch nach Gesundheit."),
        VocabularyItem(word: "Добро утро", translation: "Guten Morgen", type: "Begrüßung", level: "A1", notes: nil),
        VocabularyItem(word: "Добър ден", translation: "Guten Tag", type: "Begrüßung", level: "A1", notes: nil),
        VocabularyItem(word: "Добър вечер", translation: "Guten Abend", type: "Begrüßung", level: "A1", notes: nil),
        VocabularyItem(word: "Лека нощ", translation: "Gute Nacht", type: "Begrüßung", level: "A1", notes: nil),
        VocabularyItem(word: "Довиждане", translation: "Auf Wiedersehen", type: "Begrüßung", level: "A1", notes: nil),
        VocabularyItem(word: "Моля", translation: "Bitte", type: "Ausdruck", level: "A1", notes: nil),
        VocabularyItem(word: "Благодаря", translation: "Danke", type: "Ausdruck", level: "A1", notes: nil),
        VocabularyItem(word: "Извинете", translation: "Entschuldigung", type: "Ausdruck", level: "A1", notes: nil),
        VocabularyItem(word: "Съжалявам", translation: "Es tut mir leid", type: "Ausdruck", level: "A1", notes: nil),

        // A1 essential nouns (German translations)
        VocabularyItem(word: "Човек", translation: "Mensch", type: "Substantiv", level: "A1", notes: nil),
        VocabularyItem(word: "Семейство", translation: "Familie", type: "Substantiv", level: "A1", notes: nil),
        VocabularyItem(word: "Къща", translation: "Haus", type: "Substantiv", level: "A1", notes: nil),
        VocabularyItem(word: "Училище", translation: "Schule", type: "Substantiv", level: "A1", notes: nil),
        VocabularyItem(word: "Работа", translation: "Arbeit", type: "Substantiv", level: "A1", notes: nil),
        VocabularyItem(word: "Град", translation: "Stadt", type: "Substantiv", level: "A1", notes: nil),
        VocabularyItem(word: "Село", translation: "Dorf", type: "Substantiv", level: "A1", notes: "'Село' bedeutet Dorf und ist mit anderen slawischen Wörtern für Siedlung verwandt."),
        VocabularyItem(word: "Книга", translation: "Buch", type: "Substantiv", level: "A1", notes: "'Книга' stammt aus dem Altslawischen und war ursprünglich eine Bezeichnung für eine Schriftrolle oder ein gebundenes Werk."),
        VocabularyItem(word: "Храна", translation: "Essen", type: "Substantiv", level: "A1", notes: nil),
        VocabularyItem(word: "Вода", translation: "Wasser", type: "Substantiv", level: "A1", notes: "'Вода' ist Wasser und hat denselben indoeuropäischen Ursprung wie das deutsche 'Wasser'."),

        // A1 important verbs (German translations)
        VocabularyItem(word: "Съм", translation: "sein", type: "Verb", level: "A1", notes: "Das Verb 'съм' entspricht dem deutschen 'sein' und ist unregelmäßig."),
        VocabularyItem(word: "Имам", translation: "haben", type: "Verb", level: "A1", notes: nil),
        VocabularyItem(word: "Правя", translation: "machen", type: "Verb", level: "A1", notes: nil),
        VocabularyItem(word: "Мога", translation: "können", type: "Verb", level: "A1", notes: nil),
        VocabularyItem(word: "Ходя", translation: "gehen", type: "Verb", level: "A1", notes: nil),
        VocabularyItem(word: "Ям", translation: "essen", type: "Verb", level: "A1", notes: "'Ям' ist ein kurzes Verb, das 'essen' bedeutet; es gehört zu den Grundverben wie im Deutschen 'essen'."),
        VocabularyItem(word: "Пия", translation: "trinken", type: "Verb", level: "A1", notes: nil),
        VocabularyItem(word: "Говоря", translation: "sprechen", type: "Verb", level: "A1", notes: nil),
        VocabularyItem(word: "Виждам", translation: "sehen", type: "Verb", level: "A1", notes: nil),
        VocabularyItem(word: "Чувам", translation: "hören", type: "Verb", level: "A1", notes: nil),

        // A1 common adjectives (German translations)
        VocabularyItem(word: "Добър", translation: "gut", type: "Adjektiv", level: "A1", notes: nil),
        VocabularyItem(word: "Лош", translation: "schlecht", type: "Adjektiv", level: "A1", notes: nil),
        VocabularyItem(word: "Голям", translation: "groß", type: "Adjektiv", level: "A1", notes: nil),
        VocabularyItem(word: "Малък", translation: "klein", type: "Adjektiv", level: "A1", notes: nil),
        VocabularyItem(word: "Нов", translation: "neu", type: "Adjektiv", level: "A1", notes: nil),
        VocabularyItem(word: "Стар", translation: "alt", type: "Adjektiv", level: "A1", notes: nil),
        VocabularyItem(word: "Красив", translation: "schön", type: "Adjektiv", level: "A1", notes: nil),
        VocabularyItem(word: "Грозен", translation: "hässlich", type: "Adjektiv", level: "A1", notes: nil),
        VocabularyItem(word: "Топъл", translation: "warm", type: "Adjektiv", level: "A1", notes: nil),
        VocabularyItem(word: "Студен", translation: "kalt", type: "Adjektiv", level: "A1", notes: nil),

        // A1 useful adverbs (German translations)
        VocabularyItem(word: "Тук", translation: "hier", type: "Adverb", level: "A1", notes: nil),
        VocabularyItem(word: "Там", translation: "dort", type: "Adverb", level: "A1", notes: nil),
        VocabularyItem(word: "Сега", translation: "jetzt", type: "Adverb", level: "A1", notes: nil),
        VocabularyItem(word: "Тогава", translation: "dann", type: "Adverb", level: "A1", notes: nil),
        VocabularyItem(word: "Бързо", translation: "schnell", type: "Adverb", level: "A1", notes: nil),
        VocabularyItem(word: "Бавно", translation: "langsam", type: "Adverb", level: "A1", notes: nil),
        VocabularyItem(word: "Често", translation: "oft", type: "Adverb", level: "A1", notes: nil),
        VocabularyItem(word: "Редко", translation: "selten", type: "Adverb", level: "A1", notes: nil),
        VocabularyItem(word: "Добре", translation: "gut", type: "Adverb", level: "A1", notes: nil),
        VocabularyItem(word: "Зле", translation: "schlecht", type: "Adverb", level: "A1", notes: nil),

        // A2 nouns and everyday objects (German translations)
        VocabularyItem(word: "Маса", translation: "Tisch", type: "Substantiv", level: "A2", notes: nil),
        VocabularyItem(word: "Стол", translation: "Stuhl", type: "Substantiv", level: "A2", notes: nil),
        VocabularyItem(word: "Хладилник", translation: "Kühlschrank", type: "Substantiv", level: "A2", notes: nil),
        VocabularyItem(word: "Кухня", translation: "Küche", type: "Substantiv", level: "A2", notes: nil),
        VocabularyItem(word: "Апартамент", translation: "Wohnung", type: "Substantiv", level: "A2", notes: nil),
        VocabularyItem(word: "Автомобил", translation: "Auto", type: "Substantiv", level: "A2", notes: "'Автомобил' ist ein Lehnwort aus dem Französischen; es setzt sich aus 'auto' (selbst) und 'mobile' (beweglich) zusammen."),
        VocabularyItem(word: "Магазин", translation: "Laden", type: "Substantiv", level: "A2", notes: nil),
        VocabularyItem(word: "Градина", translation: "Garten", type: "Substantiv", level: "A2", notes: nil),
        VocabularyItem(word: "Часовник", translation: "Uhr", type: "Substantiv", level: "A2", notes: nil),

        // A2 common verbs (German translations)
        VocabularyItem(word: "Чета", translation: "lesen", type: "Verb", level: "A2", notes: nil),
        VocabularyItem(word: "Пиша", translation: "schreiben", type: "Verb", level: "A2", notes: nil),
        VocabularyItem(word: "Карам", translation: "fahren", type: "Verb", level: "A2", notes: nil),
        VocabularyItem(word: "Живея", translation: "leben", type: "Verb", level: "A2", notes: nil),
        VocabularyItem(word: "Работя", translation: "arbeiten", type: "Verb", level: "A2", notes: nil),
        VocabularyItem(word: "Уча", translation: "lernen", type: "Verb", level: "A2", notes: nil),

        // A2 numbers and quantities (German translations)
        VocabularyItem(word: "Едно", translation: "eins", type: "Zahl", level: "A2", notes: nil),
        VocabularyItem(word: "Две", translation: "zwei", type: "Zahl", level: "A2", notes: nil),
        VocabularyItem(word: "Три", translation: "drei", type: "Zahl", level: "A2", notes: nil),
        VocabularyItem(word: "Четири", translation: "vier", type: "Zahl", level: "A2", notes: nil),
        VocabularyItem(word: "Пет", translation: "fünf", type: "Zahl", level: "A2", notes: nil),
        VocabularyItem(word: "Шест", translation: "sechs", type: "Zahl", level: "A2", notes: nil),
        VocabularyItem(word: "Седем", translation: "sieben", type: "Zahl", level: "A2", notes: nil),
        VocabularyItem(word: "Осем", translation: "acht", type: "Zahl", level: "A2", notes: nil),
        VocabularyItem(word: "Девет", translation: "neun", type: "Zahl", level: "A2", notes: nil),
        VocabularyItem(word: "Десет", translation: "zehn", type: "Zahl", level: "A2", notes: nil),
        VocabularyItem(word: "Много", translation: "viele", type: "Quantor", level: "A2", notes: nil),
        VocabularyItem(word: "Малко", translation: "wenig", type: "Quantor", level: "A2", notes: nil),
        VocabularyItem(word: "Всички", translation: "alle", type: "Quantor", level: "A2", notes: nil),
        VocabularyItem(word: "Няколко", translation: "einige", type: "Quantor", level: "A2", notes: nil),
        VocabularyItem(word: "Никой", translation: "keiner", type: "Quantor", level: "A2", notes: nil),

        // A2 days of the week and time (German translations)
        VocabularyItem(word: "Понеделник", translation: "Montag", type: "Tag", level: "A2", notes: nil),
        VocabularyItem(word: "Вторник", translation: "Dienstag", type: "Tag", level: "A2", notes: nil),
        VocabularyItem(word: "Сряда", translation: "Mittwoch", type: "Tag", level: "A2", notes: nil),
        VocabularyItem(word: "Четвъртък", translation: "Donnerstag", type: "Tag", level: "A2", notes: nil),
        VocabularyItem(word: "Петък", translation: "Freitag", type: "Tag", level: "A2", notes: nil),
        VocabularyItem(word: "Събота", translation: "Samstag", type: "Tag", level: "A2", notes: nil),
        VocabularyItem(word: "Неделя", translation: "Sonntag", type: "Tag", level: "A2", notes: nil),
        VocabularyItem(word: "Час", translation: "Stunde", type: "Zeit", level: "A2", notes: nil),
        VocabularyItem(word: "Минута", translation: "Minute", type: "Zeit", level: "A2", notes: nil),
        VocabularyItem(word: "Сутрин", translation: "Morgen", type: "Zeit", level: "A2", notes: nil),
        VocabularyItem(word: "Обед", translation: "Mittag", type: "Zeit", level: "A2", notes: nil),
        VocabularyItem(word: "Следобед", translation: "Nachmittag", type: "Zeit", level: "A2", notes: nil),
        VocabularyItem(word: "Вечер", translation: "Abend", type: "Zeit", level: "A2", notes: nil),
        VocabularyItem(word: "Нощ", translation: "Nacht", type: "Zeit", level: "A2", notes: nil),

        // A2 common phrases and expressions (German translations)
        VocabularyItem(word: "Как си?", translation: "Wie geht's?", type: "Ausdruck", level: "A2", notes: nil),
        VocabularyItem(word: "Добре съм", translation: "Mir geht's gut", type: "Ausdruck", level: "A2", notes: nil),
        VocabularyItem(word: "Извинявай", translation: "Entschuldige", type: "Ausdruck", level: "A2", notes: nil),
        VocabularyItem(word: "Може ли?", translation: "Darf ich?", type: "Ausdruck", level: "A2", notes: nil),

        // A2 food and drink (German translations)
        VocabularyItem(word: "Хляб", translation: "Brot", type: "Lebensmittel", level: "A2", notes: nil),
        VocabularyItem(word: "Мляко", translation: "Milch", type: "Lebensmittel", level: "A2", notes: nil),
        VocabularyItem(word: "Сирене", translation: "Käse", type: "Lebensmittel", level: "A2", notes: nil),
        VocabularyItem(word: "Месо", translation: "Fleisch", type: "Lebensmittel", level: "A2", notes: nil),
        VocabularyItem(word: "Риба", translation: "Fisch", type: "Lebensmittel", level: "A2", notes: nil),
        VocabularyItem(word: "Зеленчуци", translation: "Gemüse", type: "Lebensmittel", level: "A2", notes: nil),
        VocabularyItem(word: "Плодове", translation: "Obst", type: "Lebensmittel", level: "A2", notes: nil),
        VocabularyItem(word: "Сок", translation: "Saft", type: "Lebensmittel", level: "A2", notes: nil),
        VocabularyItem(word: "Кафе", translation: "Kaffee", type: "Lebensmittel", level: "A2", notes: nil),

        // A2 travel and transportation (German translations)
        VocabularyItem(word: "Автобус", translation: "Bus", type: "Transport", level: "A2", notes: nil),
        VocabularyItem(word: "Влак", translation: "Zug", type: "Transport", level: "A2", notes: nil),
        VocabularyItem(word: "Самолет", translation: "Flugzeug", type: "Transport", level: "A2", notes: nil),
        VocabularyItem(word: "Такси", translation: "Taxi", type: "Transport", level: "A2", notes: nil),
        VocabularyItem(word: "Гара", translation: "Bahnhof", type: "Transport", level: "A2", notes: nil),
        VocabularyItem(word: "Летище", translation: "Flughafen", type: "Transport", level: "A2", notes: nil),
        VocabularyItem(word: "Хотел", translation: "Hotel", type: "Transport", level: "A2", notes: nil),
        VocabularyItem(word: "Билет", translation: "Ticket", type: "Transport", level: "A2", notes: nil),
        VocabularyItem(word: "Път", translation: "Straße", type: "Transport", level: "A2", notes: nil),
        VocabularyItem(word: "Карта", translation: "Karte", type: "Transport", level: "A2", notes: nil),

        // A2 health and emergencies (German translations)
        VocabularyItem(word: "Лекар", translation: "Arzt", type: "Gesundheit", level: "A2", notes: nil),
        VocabularyItem(word: "Болница", translation: "Krankenhaus", type: "Gesundheit", level: "A2", notes: "'Болница' leitet sich von 'болен' (krank) ab und bezeichnet einen Ort für Kranke – wie das deutsche 'Krankenhaus'."),
        VocabularyItem(word: "Аптека", translation: "Apotheke", type: "Gesundheit", level: "A2", notes: nil),
        VocabularyItem(word: "Лекарства", translation: "Medikamente", type: "Gesundheit", level: "A2", notes: nil),
        VocabularyItem(word: "Спешно", translation: "Notfall", type: "Gesundheit", level: "A2", notes: nil),
        VocabularyItem(word: "Болка", translation: "Schmerz", type: "Gesundheit", level: "A2", notes: nil),
        VocabularyItem(word: "Здраве", translation: "Gesundheit", type: "Gesundheit", level: "A2", notes: nil),
        VocabularyItem(word: "Треска", translation: "Fieber", type: "Gesundheit", level: "A2", notes: nil),
        VocabularyItem(word: "Настинка", translation: "Erkältung", type: "Gesundheit", level: "A2", notes: nil),
        VocabularyItem(word: "Помощ", translation: "Hilfe", type: "Gesundheit", level: "A2", notes: nil),

        // A2 weather and nature (German translations)
        VocabularyItem(word: "Слънце", translation: "Sonne", type: "Natur", level: "A2", notes: nil),
        VocabularyItem(word: "Дъжд", translation: "Regen", type: "Natur", level: "A2", notes: nil),
        VocabularyItem(word: "Сняг", translation: "Schnee", type: "Natur", level: "A2", notes: nil),
        VocabularyItem(word: "Вятър", translation: "Wind", type: "Natur", level: "A2", notes: nil),
        VocabularyItem(word: "Температура", translation: "Temperatur", type: "Natur", level: "A2", notes: nil),
        VocabularyItem(word: "Облаци", translation: "Wolken", type: "Natur", level: "A2", notes: nil),
        VocabularyItem(word: "Гора", translation: "Wald", type: "Natur", level: "A2", notes: nil),
        VocabularyItem(word: "Река", translation: "Fluss", type: "Natur", level: "A2", notes: nil),
        VocabularyItem(word: "Планина", translation: "Berg", type: "Natur", level: "A2", notes: nil),
        VocabularyItem(word: "Море", translation: "Meer", type: "Natur", level: "A2", notes: "'Море' bedeutet Meer und ist mit dem russischen 'more' verwandt; es geht auf eine urslawische Wurzel zurück."),

        // A2 family and relationships (German translations)
        VocabularyItem(word: "Майка", translation: "Mutter", type: "Familie", level: "A2", notes: nil),
        VocabularyItem(word: "Баща", translation: "Vater", type: "Familie", level: "A2", notes: nil),
        VocabularyItem(word: "Брат", translation: "Bruder", type: "Familie", level: "A2", notes: nil),
        VocabularyItem(word: "Сестра", translation: "Schwester", type: "Familie", level: "A2", notes: nil),
        VocabularyItem(word: "Съпруг", translation: "Ehemann", type: "Familie", level: "A2", notes: nil),
        VocabularyItem(word: "Съпруга", translation: "Ehefrau", type: "Familie", level: "A2", notes: nil),
        VocabularyItem(word: "Дете", translation: "Kind", type: "Familie", level: "A2", notes: nil),
        VocabularyItem(word: "Приятел", translation: "Freund", type: "Familie", level: "A2", notes: nil),
        VocabularyItem(word: "Приятелка", translation: "Freundin", type: "Familie", level: "A2", notes: nil),

        // A2 shopping and money (German translations)
        VocabularyItem(word: "Пари", translation: "Geld", type: "Einkauf", level: "A2", notes: nil),
        VocabularyItem(word: "Цена", translation: "Preis", type: "Einkauf", level: "A2", notes: nil),
        VocabularyItem(word: "Евро", translation: "Euro", type: "Einkauf", level: "A2", notes: nil),
        VocabularyItem(word: "Лев", translation: "Lew", type: "Einkauf", level: "A2", notes: "Die bulgarische Währung 'лев' ist nach dem alten bulgarischen Wort für 'Löwe' benannt, weil der Löwe ein nationales Symbol ist."),
        VocabularyItem(word: "Сметка", translation: "Rechnung", type: "Einkauf", level: "A2", notes: nil),
        VocabularyItem(word: "Касова бележка", translation: "Quittung", type: "Einkauf", level: "A2", notes: nil),
        VocabularyItem(word: "Отстъпка", translation: "Rabatt", type: "Einkauf", level: "A2", notes: nil),
        VocabularyItem(word: "Купувам", translation: "kaufen", type: "Verb", level: "A2", notes: nil),
        VocabularyItem(word: "Продавам", translation: "verkaufen", type: "Verb", level: "A2", notes: nil),
        VocabularyItem(word: "Пазарувам", translation: "einkaufen", type: "Verb", level: "A2", notes: nil)
    ]

    /// Grammar topics for both levels.  Each description summarises key
    /// concepts along with illustrative sentences.  Learners can read
    /// these notes to understand Bulgarian grammar fundamentals such
    /// as word order, gender and verb tenses.
    static let grammarTopics: [GrammarTopic] = GrammarData.topics
}
