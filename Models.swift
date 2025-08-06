import Foundation

/// The direction in which a learner studies vocabulary.
///
/// * `.bulgarianToGerman` – German speakers learn Bulgarian words with
///   German explanations.
/// * `.germanToBulgarian` – Bulgarian speakers learn German words with
///   Bulgarian explanations.
enum LearningDirection: String, CaseIterable, Identifiable {
    case bulgarianToGerman = "bgToDe"
    case germanToBulgarian = "deToBg"

    var id: String { rawValue }

    /// Short text used on the toggle button (e.g. "BG→DE").
    var toggleLabel: String {
        self == .bulgarianToGerman ? "BG→DE" : "DE→BG"
    }

    /// Accessibility label describing the action of the toggle.
    var toggleAccessibilityLabel: String {
        self == .bulgarianToGerman ? "Switch to German to Bulgarian" : "Превключи към български към немски"
    }

    /// Label for the "all" filter in lists.
    var allFilterLabel: String {
        self == .bulgarianToGerman ? "Alle" : "Всички"
    }

    /// Message shown when search results are empty.
    var noResultsText: String {
        self == .bulgarianToGerman ? "Keine Ergebnisse." : "Няма резултати."
    }

    /// Text for clearing the search field.
    var clearSearchLabel: String {
        self == .bulgarianToGerman ? "Suche löschen" : "Изчисти търсенето"
    }

    /// Accessibility text for playing pronunciation of a given word.
    func playPronunciationLabel(for word: String) -> String {
        self == .bulgarianToGerman ? "Aussprache für \(word) abspielen" : "Пусни произношението на \(word)"
    }
}

/// A single vocabulary entry consisting of the Bulgarian word, its German
/// translation, the part of speech and the associated CEFR level. A unique
/// identifier is generated automatically so that the objects can be used in
/// SwiftUI lists.
struct VocabularyItem: Identifiable {
    let id = UUID()
    let word: String
    let translation: String
    let type: String
    let level: String
    let notes: String?

    /// Return the word shown to the user depending on the learning
    /// direction. German learners see the Bulgarian word, Bulgarian
    /// learners see the German word.
    func displayedWord(for direction: LearningDirection) -> String {
        direction == .bulgarianToGerman ? word : translation
    }

    /// Return the translation shown to the user depending on the learning
    /// direction.
    func displayedTranslation(for direction: LearningDirection) -> String {
        direction == .bulgarianToGerman ? translation : word
    }

    /// Localise the part of speech for the selected learning direction.
    func displayedType(for direction: LearningDirection) -> String {
        if direction == .bulgarianToGerman {
            return type
        }
        return VocabularyItem.typeMap[type] ?? type
    }

    /// Return note text in both languages so learners can compare the
    /// explanation in their target language with their native language.
    ///
    /// - Returns: A tuple containing the primary note (according to the
    ///   current learning direction) and the secondary note in the other
    ///   language if available.
    func notesPair(for direction: LearningDirection) -> (primary: String?, secondary: String?) {
        if direction == .bulgarianToGerman {
            return (notes, VocabularyItem.bgNotesMap[word])
        } else {
            return (VocabularyItem.bgNotesMap[word], notes)
        }
    }

    /// Return the appropriate language code for pronunciation depending on
    /// the current direction.
    func audioLanguage(for direction: LearningDirection) -> String {
        direction == .bulgarianToGerman ? "bg-BG" : "de-DE"
    }

    /// Mapping between German and Bulgarian part‑of‑speech labels.
    private static let typeMap: [String: String] = [
        "Begrüßung": "Поздрав",
        "Ausdruck": "Израз",
        "Substantiv": "Съществително",
        "Verb": "Глагол",
        "Adjektiv": "Прилагателно",
        "Adverb": "Наречие",
        "Zahl": "Число",
        "Quantor": "Квантор",
        "Tag": "Ден",
        "Natur": "Природа",
        "Familie": "Семейство",
        "Einkauf": "Пазаруване"
    ]

    /// Bulgarian translations for the explanatory notes keyed by the
    /// Bulgarian word.
    private static let bgNotesMap: [String: String] = [
        "Здравей": "Думата \"Здравей\" произлиза от \"здрав\" и е пожелание за здраве.",
        "Село": "\"Село\" означава малко населено място и е сродно с други славянски думи за селище.",
        "Книга": "\"Книга\" идва от старославянски и първоначално е означавала свитък или подвързано произведение.",
        "Вода": "\"Вода\" има същия индоевропейски корен като немската дума \"Wasser\".",
        "Море": "\"Море\" означава море и е сродно на руското \"море\"; думата произхожда от праславянски корен.",
        "Лев": "Българската валута \"лев\" е наречена на старото българско слово за \"лъв\" – национален символ."
    ]
}

/// Audio settings for text-to-speech pronunciation
struct AudioSettings {
    let text: String
    let language: String
    let rate: Float
    let volume: Float
    
    init(text: String, language: String, rate: Float = 0.5, volume: Float = 1.0) {
        self.text = text
        self.language = language
        self.rate = rate
        self.volume = volume
    }
}

/// A grammar topic summarises a single concept such as gender or word order.
/// Text is provided in both Bulgarian and German so it can be shown to the
/// learner depending on the selected learning direction.
struct GrammarTopic: Identifiable {
    let id = UUID()
    let titleBG: String
    let titleDE: String
    let descriptionBG: String
    let descriptionDE: String
    let examplesBG: [String]
    let examplesDE: [String]
    let level: String

    func title(for direction: LearningDirection) -> String {
        direction == .bulgarianToGerman ? titleDE : titleBG
    }

    func description(for direction: LearningDirection) -> String {
        direction == .bulgarianToGerman ? descriptionDE : descriptionBG
    }

    /// Provide description text in both languages to allow cross‑language
    /// comparison in the detail view.
    func descriptionPair(for direction: LearningDirection) -> (primary: String, secondary: String) {
        direction == .bulgarianToGerman ? (descriptionDE, descriptionBG) : (descriptionBG, descriptionDE)
    }

    func examples(for direction: LearningDirection) -> [String] {
        direction == .bulgarianToGerman ? examplesDE : examplesBG
    }

    /// Return example sentences in both languages so learners can see the
    /// equivalent phrasing.
    func examplesPair(for direction: LearningDirection) -> (primary: [String], secondary: [String]) {
        direction == .bulgarianToGerman ? (examplesDE, examplesBG) : (examplesBG, examplesDE)
    }
}