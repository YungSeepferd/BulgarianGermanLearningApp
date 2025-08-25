package models

import "time"

// VocabularyItem represents a single vocabulary word/phrase
type VocabularyItem struct {
	Word        string   `json:"word"`
	Translation string   `json:"translation"`
	Category    string   `json:"category"`
	Level       string   `json:"level"`
	Notes       string   `json:"notes,omitempty"`
	Audio       string   `json:"audio,omitempty"`
	Slug        string   `json:"slug,omitempty"`
	Weight      int      `json:"weight,omitempty"`
	Tags        []string `json:"tags,omitempty"`
}

// GrammarItem represents a grammar rule or concept
type GrammarItem struct {
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Examples    []string   `json:"examples"`
	Level       string     `json:"level"`
	Slug        string     `json:"slug,omitempty"`
	Weight      int        `json:"weight,omitempty"`
	Exercises   []Exercise `json:"exercises,omitempty"`
}

// Exercise represents a practice exercise
type Exercise struct {
	Type          string   `json:"type"`
	Question      string   `json:"question"`
	Options       []string `json:"options,omitempty"`
	CorrectAnswer string   `json:"correct_answer"`
	Explanation   string   `json:"explanation,omitempty"`
}

// ReviewState tracks spaced repetition data
type ReviewState struct {
	Interval    int        `json:"interval"`
	EaseFactor  float64    `json:"ease_factor"`
	Repetitions int        `json:"repetitions"`
	NextReview  *time.Time `json:"next_review,omitempty"`
}

// NewReviewState creates a new review state with default values
func NewReviewState() ReviewState {
	return ReviewState{
		Interval:    1,
		EaseFactor:  2.5,
		Repetitions: 0,
		NextReview:  nil,
	}
}

// SearchEntry represents an entry in the search index
type SearchEntry struct {
	ID       string `json:"id"`
	Title    string `json:"title"`
	Content  string `json:"content"`
	Category string `json:"category,omitempty"`
	Level    string `json:"level"`
	URL      string `json:"url"`
	Type     string `json:"type"`
}

// SearchIndex contains all searchable content
type SearchIndex struct {
	Vocabulary []SearchEntry `json:"vocabulary"`
	Grammar    []SearchEntry `json:"grammar"`
}

// HugoConfig represents Hugo configuration parameters
type HugoConfig struct {
	BaseURL   string                 `toml:"baseURL"`
	Title     string                 `toml:"title"`
	Theme     string                 `toml:"theme"`
	Params    map[string]interface{} `toml:"params"`
	Languages map[string]interface{} `toml:"languages"`
}
