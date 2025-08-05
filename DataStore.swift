import Foundation

/// A static store of vocabulary items and grammar topics used by the app.
///
/// The arrays below contain the core data for the beginner (A1) and
/// elementary (A2) levels.  Each entry supplies the Bulgarian word,
/// English translation, part of speech, level and optional notes.  The
/// grammar topics provide concise explanations of major grammatical
/// concepts along with example sentences.  These descriptions were
/// synthesised from reputable resources on Bulgarian grammar and
/// vocabulary【297331014586003†L90-L126】【297331014586003†L283-L314】.
struct DataStore {
    /// All vocabulary items across levels.  You can filter this array by
    /// level to obtain level‑specific lists.
    static let vocabularyItems: [VocabularyItem] = [
        // A1 greetings and basic phrases (German translations)
        VocabularyItem(word: "Здравей", translation: "Hallo", type: "Begrüßung", level: "A1", notes: "Das Wort „Здравей“ leitet sich vom bulgarischen Wort „здрав“ (gesund) ab und ist wie ein Wunsch nach Gesundheit."),
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
        VocabularyItem(word: "Село", translation: "Dorf", type: "Substantiv", level: "A1", notes: "„Село“ bedeutet Dorf und ist mit anderen slawischen Wörtern für Siedlung verwandt."),
        VocabularyItem(word: "Книга", translation: "Buch", type: "Substantiv", level: "A1", notes: "„Книга“ stammt aus dem Altslawischen und war ursprünglich eine Bezeichnung für eine Schriftrolle oder ein gebundenes Werk."),
        VocabularyItem(word: "Храна", translation: "Essen", type: "Substantiv", level: "A1", notes: nil),
        VocabularyItem(word: "Вода", translation: "Wasser", type: "Substantiv", level: "A1", notes: "„Вода“ ist Wasser und hat denselben indoeuropäischen Ursprung wie das deutsche „Wasser"."),

        // A1 important verbs (German translations)
        VocabularyItem(word: "Съм", translation: "sein", type: "Verb", level: "A1", notes: "Das Verb „съм“ entspricht dem deutschen „sein“ und ist unregelmäßig."),
        VocabularyItem(word: "Имам", translation: "haben", type: "Verb", level: "A1", notes: nil),
        VocabularyItem(word: "Правя", translation: "machen", type: "Verb", level: "A1", notes: nil),
        VocabularyItem(word: "Мога", translation: "können", type: "Verb", level: "A1", notes: nil),
        VocabularyItem(word: "Ходя", translation: "gehen", type: "Verb", level: "A1", notes: nil),
        VocabularyItem(word: "Ям", translation: "essen", type: "Verb", level: "A1", notes: "„Ям“ ist ein kurzes Verb, das „essen“ bedeutet; es gehört zu den Grundverben wie im Deutschen „essen"."),
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
        VocabularyItem(word: "Книга", translation: "Buch", type: "Substantiv", level: "A2", notes: "„Книга“ stammt aus dem Altslawischen und war ursprünglich eine Bezeichnung für eine Schriftrolle oder ein gebundenes Werk."),
        VocabularyItem(word: "Маса", translation: "Tisch", type: "Substantiv", level: "A2", notes: nil),
        VocabularyItem(word: "Стол", translation: "Stuhl", type: "Substantiv", level: "A2", notes: nil),
        VocabularyItem(word: "Хладилник", translation: "Kühlschrank", type: "Substantiv", level: "A2", notes: nil),
        VocabularyItem(word: "Кухня", translation: "Küche", type: "Substantiv", level: "A2", notes: nil),
        VocabularyItem(word: "Апартамент", translation: "Wohnung", type: "Substantiv", level: "A2", notes: nil),
        VocabularyItem(word: "Автомобил", translation: "Auto", type: "Substantiv", level: "A2", notes: "„Автомобил“ ist ein Lehnwort aus dem Französischen; es setzt sich aus „auto“ (selbst) und „mobile“ (beweglich) zusammen."),
        VocabularyItem(word: "Магазин", translation: "Laden", type: "Substantiv", level: "A2", notes: nil),
        VocabularyItem(word: "Градина", translation: "Garten", type: "Substantiv", level: "A2", notes: nil),
        VocabularyItem(word: "Часовник", translation: "Uhr", type: "Substantiv", level: "A2", notes: nil),

        // A2 common verbs (German translations)
        VocabularyItem(word: "Ям", translation: "essen", type: "Verb", level: "A2", notes: "„Ям“ ist ein kurzes Verb, das „essen“ bedeutet; es gehört zu den Grundverben wie im Deutschen „essen"."),
        VocabularyItem(word: "Пия", translation: "trinken", type: "Verb", level: "A2", notes: nil),
        VocabularyItem(word: "Чета", translation: "lesen", type: "Verb", level: "A2", notes: nil),
        VocabularyItem(word: "Пиша", translation: "schreiben", type: "Verb", level: "A2", notes: nil),
        VocabularyItem(word: "Говоря", translation: "sprechen", type: "Verb", level: "A2", notes: nil),
        VocabularyItem(word: "Ходя", translation: "gehen", type: "Verb", level: "A2", notes: nil),
        VocabularyItem(word: "Карам", translation: "fahren", type: "Verb", level: "A2", notes: nil),
        VocabularyItem(word: "Живея", translation: "leben", type: "Verb", level: "A2", notes: nil),
        VocabularyItem(word: "Работя", translation: "arbeiten", type: "Verb", level: "A2", notes: nil),
        VocabularyItem(word: "Уча", translation: "lernen", type: "Verb", level: "A2", notes: nil),

        // A2 adjectives (German translations)
        VocabularyItem(word: "Голям", translation: "groß", type: "Adjektiv", level: "A2", notes: nil),
        VocabularyItem(word: "Малък", translation: "klein", type: "Adjektiv", level: "A2", notes: nil),
        VocabularyItem(word: "Красив", translation: "schön", type: "Adjektiv", level: "A2", notes: nil),
        VocabularyItem(word: "Грозен", translation: "hässlich", type: "Adjektiv", level: "A2", notes: nil),
        VocabularyItem(word: "Нов", translation: "neu", type: "Adjektiv", level: "A2", notes: nil),
        VocabularyItem(word: "Стар", translation: "alt", type: "Adjektiv", level: "A2", notes: nil),
        VocabularyItem(word: "Бърз", translation: "schnell", type: "Adjektiv", level: "A2", notes: nil),
        VocabularyItem(word: "Бавен", translation: "langsam", type: "Adjektiv", level: "A2", notes: nil),
        VocabularyItem(word: "Топъл", translation: "warm", type: "Adjektiv", level: "A2", notes: nil),
        VocabularyItem(word: "Студен", translation: "kalt", type: "Adjektiv", level: "A2", notes: nil),

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
        VocabularyItem(word: "Добро утро", translation: "Guten Morgen", type: "Ausdruck", level: "A2", notes: nil),
        VocabularyItem(word: "Добър ден", translation: "Guten Tag", type: "Ausdruck", level: "A2", notes: nil),
        VocabularyItem(word: "Добър вечер", translation: "Guten Abend", type: "Ausdruck", level: "A2", notes: nil),
        VocabularyItem(word: "Лека нощ", translation: "Gute Nacht", type: "Ausdruck", level: "A2", notes: nil),
        VocabularyItem(word: "Как си?", translation: "Wie geht's?", type: "Ausdruck", level: "A2", notes: nil),
        VocabularyItem(word: "Добре съм", translation: "Mir geht's gut", type: "Ausdruck", level: "A2", notes: nil),
        VocabularyItem(word: "Благодаря", translation: "Danke", type: "Ausdruck", level: "A2", notes: nil),
        VocabularyItem(word: "Моля", translation: "Bitte", type: "Ausdruck", level: "A2", notes: nil),
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
        VocabularyItem(word: "Вода", translation: "Wasser", type: "Lebensmittel", level: "A2", notes: "„Вода“ ist Wasser und hat denselben indoeuropäischen Ursprung wie das deutsche „Wasser"."),
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
        VocabularyItem(word: "Болница", translation: "Krankenhaus", type: "Gesundheit", level: "A2", notes: "„Болница“ leitet sich von „болен“ (krank) ab und bezeichnet einen Ort für Kranke – wie das deutsche „Krankenhaus"."),
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
        VocabularyItem(word: "Море", translation: "Meer", type: "Natur", level: "A2", notes: "„Море“ bedeutet Meer und ist mit dem russischen „more“ verwandt; es geht auf eine urslawische Wurzel zurück."),

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
        VocabularyItem(word: "Лев", translation: "Lew", type: "Einkauf", level: "A2", notes: "Die bulgarische Währung „лев“ ist nach dem alten bulgarischen Wort für „Löwe“ benannt, weil der Löwe ein nationales Symbol ist."),
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
    /// as word order, gender and verb tenses【297331014586003†L469-L510】.
    static let grammarTopics: [GrammarTopic] = [
        GrammarTopic(
            title: "Word Order",
            description: "Bulgarian word order is flexible thanks to subject–verb agreement.\nThe neutral pattern is S + V + O + A (Subject, Verb, Object, Adjunct), but other orders such as A + S + V + O, O + S + V + A or S + V + A + O are also possible.\nYou can change the order to emphasise different parts of the sentence without changing the basic meaning.",
            examples: [
                "Той видя момичето в далечината. – He saw the girl in the distance.",
                "В далечината той видя момичето. – In the distance, he saw the girl.",
                "Момичето той видя в далечината. – The girl he saw in the distance."
            ],
            level: "A1"
        ),
        GrammarTopic(
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
        ),
        GrammarTopic(
            title: "Singular and Plural",
            description: "Bulgarian nouns are either singular or plural.\nMasculine nouns form plurals with endings like –и, –е or –ове (стол – столове ‘chair – chairs’).\nFeminine nouns replace –а/–я with –и (жена – жени ‘woman – women’).\nNeuter nouns take –а or –ета (море – морета ‘sea – seas’).\nA historical dual number for pairs of inanimate masculine nouns survives with the ending –а (два стола – two chairs).", 
            examples: [
                "стол – столове (chair – chairs)",
                "жена – жени (woman – women)",
                "море – морета (sea – seas)",
                "два стол а (two chairs – dual form)"
            ],
            level: "A1"
        ),
        GrammarTopic(
            title: "Definite Article",
            description: "The Bulgarian definite article attaches to the end of the noun.\nMasculine nouns take –ът/–ят (студент – студентът ‘the student’, кон – конят ‘the horse’).\nFeminine nouns take –та (вода – водата ‘the water’, чиния – чинията ‘the plate’).\nNeuter nouns take –то (село – селото ‘the village’, море – морето ‘the sea’).\nFor plural nouns the article is –те for masculine and feminine plurals and –та for neuter plurals.",
            examples: [
                "студент – студентът (student – the student)",
                "вода – водата (water – the water)",
                "село – селото (village – the village)",
                "мъже – мъжете (men – the men)"
            ],
            level: "A1"
        ),
        GrammarTopic(
            title: "Pronouns and Cases",
            description: "Bulgarian cases exist mainly in personal pronouns.\nThere are three cases: nominative (аз, ти, той, тя, то, ние, вие, те), accusative (ме, те, го, я, го, ни, ви, ги) and dative (ми, ти, му, й, му, ни, ви, им).\nUse the nominative for subjects, the accusative for direct objects and the dative for indirect objects.",
            examples: [
                "Аз го попитах как се чувства. – I asked him how he was feeling. (go – accusative)",
                "Аз му дадох моята книга. – I gave my book to him. (mu – dative)"
            ],
            level: "A1"
        ),
        GrammarTopic(
            title: "Present and Future Tenses",
            description: "Bulgarian verbs conjugate for person and number.\nThe present tense expresses ongoing actions (Аз уча български – I study Bulgarian).\nFuture tense uses the particle ще and the present tense of the verb (Аз ще уча български – I will study Bulgarian).",
            examples: [
                "Аз уча български. – I study Bulgarian.",
                "Аз ще уча български. – I will study Bulgarian."
            ],
            level: "A1"
        ),
        // A2 grammar topics
        GrammarTopic(
            title: "Past Tenses",
            description: "For A2 learners it's useful to distinguish between the past aorist and the past imperfect.\nThe past aorist describes completed actions (Аз учих български – I studied Bulgarian), while the past imperfect describes continuous or habitual past actions (Аз учех български – I was studying Bulgarian).",
            examples: [
                "Аз учих български. – I studied Bulgarian.",
                "Аз учех български. – I was studying Bulgarian."
            ],
            level: "A2"
        ),
        GrammarTopic(
            title: "Quantifiers and Numbers",
            description: "At level A2 you'll encounter quantifiers and numbers more frequently.\nThe words много (many/much), малко (few/little), всички (all), няколко (several) and никой (none) help quantify nouns.\nBulgarian numbers one through ten are: едно, две, три, четири, пет, шест, седем, осем, девет, десет.",
            examples: [
                "Имам много книги. – I have many books.",
                "Имаме няколко стола. – We have several chairs."
            ],
            level: "A2"
        ),
        GrammarTopic(
            title: "Time Expressions",
            description: "Talking about time requires vocabulary for days and parts of the day.\nThe days of the week are понеделник, вторник, сряда, четвъртък, петък, събота and неделя.\nParts of the day include сутрин (morning), обед (noon), следобед (afternoon), вечер (evening) and нощ (night).",
            examples: [
                "Срещаме се във вторник сутрин. – We meet on Tuesday morning.",
                "Работя всеки ден следобед. – I work every afternoon."
            ],
            level: "A2"
        ),
        GrammarTopic(
            title: "Food and Shopping Vocabulary",
            description: "Food and shopping conversations are frequent at A2.\nLearn common nouns for food (хляб – bread, мляко – milk, сирене – cheese) and verbs for shopping (купувам – to buy, продавам – to sell, пазарувам – to shop).\nUnderstanding basic currency words like лев (the Bulgarian currency) and евро (euro) is also helpful.",
            examples: [
                "Купувам хляб от магазина. – I buy bread from the shop.",
                "Колко струва това? – How much does this cost?"
            ],
            level: "A2"
        ),
        GrammarTopic(
            title: "Travel and Directions",
            description: "At A2 you may need to ask for directions or discuss travel.\nKey nouns include автобус (bus), влак (train), самолет (airplane), такси (taxi), гара (train station) and летище (airport).\nThe noun билет means ‘ticket’, and карта means ‘map’.",
            examples: [
                "Къде е гарата? – Where is the train station?",
                "Имам билет за автобуса. – I have a ticket for the bus."
            ],
            level: "A2"
        )
    ]
}