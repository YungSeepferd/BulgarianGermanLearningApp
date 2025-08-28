package processor

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/dinz/BulgarianApp-Fresh/tools/internal/models"
)

// Weight constants for different CEFR levels
const (
	WeightA1      = 10
	WeightA2      = 20
	WeightB1      = 30
	WeightB2      = 40
	WeightDefault = 100
)

// File permissions
const (
	DirPermissions  = 0755
	FilePermissions = 0644
)

// DataProcessor handles JSON data transformation and content generation
type DataProcessor struct {
	vocabularyData []models.VocabularyItem
	grammarData    []models.GrammarItem
	outputDir      string
}

// NewDataProcessor creates a new data processor instance
func NewDataProcessor(outputDir string) *DataProcessor {
	return &DataProcessor{
		outputDir: outputDir,
	}
}

// LoadJSONData loads and validates JSON data files
func (dp *DataProcessor) LoadJSONData(filePath string) ([]byte, error) {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to read file %s: %w", filePath, err)
	}

	// Validate JSON structure
	var temp interface{}
	err = json.Unmarshal(data, &temp)
	if err != nil {
		return nil, fmt.Errorf("invalid JSON in %s: %w", filePath, err)
	}

	return data, nil
}

// ProcessVocabularyData processes vocabulary JSON and generates Hugo content files
func (dp *DataProcessor) ProcessVocabularyData() error {
	vocabJSON, err := dp.LoadJSONData("data/vocabulary.json")
	if err != nil {
		return err
	}

	var vocabularyItems []models.VocabularyItem
	err = json.Unmarshal(vocabJSON, &vocabularyItems)
	if err != nil {
		return fmt.Errorf("failed to parse vocabulary data: %w", err)
	}

	dp.vocabularyData = vocabularyItems

	for i, item := range vocabularyItems {
		// Generate slug for URL
		dp.vocabularyData[i].Slug = GenerateSlug(item.Word)
		dp.vocabularyData[i].Weight = CalculateWeight(item)
		dp.vocabularyData[i].Tags = []string{item.Level, item.Category}

		// Create Hugo front matter
		frontMatter := dp.CreateVocabularyFrontMatter(dp.vocabularyData[i])

		// Generate markdown content
		content := dp.CreateVocabularyContent(dp.vocabularyData[i])

		// Write content file
		filePath := fmt.Sprintf("content/vocabulary/%s.md", dp.vocabularyData[i].Slug)
		err := dp.WriteContentFile(filePath, frontMatter, content)
		if err != nil {
			return fmt.Errorf("failed to write vocabulary file %s: %w", filePath, err)
		}
	}

	return nil
}

// ProcessGrammarData processes grammar JSON and generates Hugo content files
func (dp *DataProcessor) ProcessGrammarData() error {
	grammarJSON, err := dp.LoadJSONData("data/grammar.json")
	if err != nil {
		return err
	}

	var grammarItems []models.GrammarItem
	err = json.Unmarshal(grammarJSON, &grammarItems)
	if err != nil {
		return fmt.Errorf("failed to parse grammar data: %w", err)
	}

	dp.grammarData = grammarItems

	for i, item := range grammarItems {
		dp.grammarData[i].Slug = GenerateSlug(item.Title)
		dp.grammarData[i].Weight = CalculateGrammarWeight(item)

		// Generate exercises if needed
		if len(item.Examples) > 0 {
			dp.grammarData[i].Exercises = GenerateGrammarExercises(item)
		}

		frontMatter := dp.CreateGrammarFrontMatter(dp.grammarData[i])
		content := dp.CreateGrammarContent(dp.grammarData[i])

		filePath := fmt.Sprintf("content/grammar/%s.md", dp.grammarData[i].Slug)
		err := dp.WriteContentFile(filePath, frontMatter, content)
		if err != nil {
			return fmt.Errorf("failed to write grammar file %s: %w", filePath, err)
		}
	}

	return nil
}

// GenerateSearchIndex creates search index JSON for client-side search
func (dp *DataProcessor) GenerateSearchIndex() error {
	searchIndex := models.SearchIndex{
		Vocabulary: make([]models.SearchEntry, 0),
		Grammar:    make([]models.SearchEntry, 0),
	}

	// Add vocabulary entries
	for _, item := range dp.vocabularyData {
		entry := models.SearchEntry{
			ID:       item.Slug,
			Title:    item.Word,
			Content:  item.Word + " " + item.Translation,
			Category: item.Category,
			Level:    item.Level,
			URL:      "/vocabulary/" + item.Slug + "/",
			Type:     "vocabulary",
		}
		searchIndex.Vocabulary = append(searchIndex.Vocabulary, entry)
	}

	// Add grammar entries
	for _, item := range dp.grammarData {
		entry := models.SearchEntry{
			ID:      item.Slug,
			Title:   item.Title,
			Content: item.Description,
			Level:   item.Level,
			URL:     "/grammar/" + item.Slug + "/",
			Type:    "grammar",
		}
		searchIndex.Grammar = append(searchIndex.Grammar, entry)
	}

	// Write search index file
	indexJSON, err := json.MarshalIndent(searchIndex, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal search index: %w", err)
	}

	err = os.WriteFile("static/search-index.json", indexJSON, FilePermissions)
	if err != nil {
		return fmt.Errorf("failed to write search index: %w", err)
	}

	return nil
}

// Character replacement maps for slug generation
var (
	germanReplacements = map[string]string{
		"ä": "ae", "ö": "oe", "ü": "ue", "ß": "ss",
	}
	
	bulgarianReplacements = map[string]string{
		"а": "a", "б": "b", "в": "v", "г": "g", "д": "d",
		"е": "e", "ж": "zh", "з": "z", "и": "i", "й": "y",
		"к": "k", "л": "l", "м": "m", "н": "n", "о": "o",
		"п": "p", "р": "r", "с": "s", "т": "t", "у": "u",
		"ф": "f", "х": "h", "ц": "ts", "ч": "ch", "ш": "sh",
		"щ": "sht", "ъ": "a", "ь": "y", "ю": "yu", "я": "ya",
	}
)

// GenerateSlug creates URL-friendly slug from text
func GenerateSlug(text string) string {
	if text == "" {
		return ""
	}

	// Convert to lowercase
	slug := strings.ToLower(text)

	// Apply character replacements
	slug = applyCharacterReplacements(slug, germanReplacements)
	slug = applyCharacterReplacements(slug, bulgarianReplacements)

	// Replace spaces and special characters with hyphens
	reg := regexp.MustCompile(`[^\p{L}\p{N}]+`)
	slug = reg.ReplaceAllString(slug, "-")

	// Remove leading/trailing hyphens
	slug = strings.Trim(slug, "-")

	return slug
}

// applyCharacterReplacements applies a map of character replacements to a string
func applyCharacterReplacements(text string, replacements map[string]string) string {
	result := text
	for old, new := range replacements {
		result = strings.ReplaceAll(result, old, new)
	}
	return result
}

// CreateVocabularyFrontMatter creates Hugo front matter for vocabulary items
func (dp *DataProcessor) CreateVocabularyFrontMatter(item models.VocabularyItem) string {
	audioPath := ""
	if item.Audio != "" {
		audioPath = item.Audio
	} else {
		audioPath = GenerateAudioPath(item.Word)
	}

	frontMatter := fmt.Sprintf(`---
title: "%s"
translation: "%s"
category: "%s"
level: "%s"
type: "vocabulary"
weight: %d
tags: ["%s", "%s"]
audio: "%s"
date: %s
---

`, item.Word, item.Translation, item.Category, item.Level,
		item.Weight, item.Level, item.Category,
		audioPath, time.Now().Format("2006-01-02"))

	return frontMatter
}

// CreateGrammarFrontMatter creates Hugo front matter for grammar items
func (dp *DataProcessor) CreateGrammarFrontMatter(item models.GrammarItem) string {
	frontMatter := fmt.Sprintf(`---
title: "%s"
description: "%s"
level: "%s"
type: "grammar"
weight: %d
examples: %d
date: %s
---

`, item.Title, item.Description, item.Level,
		item.Weight, len(item.Examples),
		time.Now().Format("2006-01-02"))

	return frontMatter
}

// CreateVocabularyContent generates markdown content for vocabulary items
func (dp *DataProcessor) CreateVocabularyContent(item models.VocabularyItem) string {
	content := fmt.Sprintf("# %s\n\n", item.Word)
	content += fmt.Sprintf("**Translation:** %s\n\n", item.Translation)
	content += fmt.Sprintf("**Category:** %s\n\n", item.Category)
	content += fmt.Sprintf("**Level:** %s\n\n", item.Level)

	if item.Notes != "" {
		content += fmt.Sprintf("**Notes:** %s\n\n", item.Notes)
	}

	return content
}

// CreateGrammarContent generates markdown content for grammar items
func (dp *DataProcessor) CreateGrammarContent(item models.GrammarItem) string {
	content := fmt.Sprintf("# %s\n\n", item.Title)
	content += fmt.Sprintf("%s\n\n", item.Description)

	if len(item.Examples) > 0 {
		content += "## Examples\n\n"
		for _, example := range item.Examples {
			content += fmt.Sprintf("- %s\n", example)
		}
		content += "\n"
	}

	return content
}

// WriteContentFile writes content with front matter to a file
func (dp *DataProcessor) WriteContentFile(filePath, frontMatter, content string) error {
	// Ensure directory exists
	dir := filepath.Dir(filePath)
	err := os.MkdirAll(dir, DirPermissions)
	if err != nil {
		return fmt.Errorf("failed to create directory %s: %w", dir, err)
	}

	fullContent := frontMatter + content
	err = os.WriteFile(filePath, []byte(fullContent), FilePermissions)
	if err != nil {
		return fmt.Errorf("failed to write file %s: %w", filePath, err)
	}

	return nil
}

// Helper functions
func CalculateWeight(item models.VocabularyItem) int {
	switch item.Level {
	case "A1":
		return WeightA1
	case "A2":
		return WeightA2
	case "B1":
		return WeightB1
	case "B2":
		return WeightB2
	default:
		return WeightDefault
	}
}

func CalculateGrammarWeight(item models.GrammarItem) int {
	switch item.Level {
	case "A1":
		return WeightA1
	case "A2":
		return WeightA2
	case "B1":
		return WeightB1
	case "B2":
		return WeightB2
	default:
		return WeightDefault
	}
}

func GenerateAudioPath(word string) string {
	slug := GenerateSlug(word)
	return fmt.Sprintf("/audio/%s.mp3", slug)
}

func GenerateGrammarExercises(item models.GrammarItem) []models.Exercise {
	exercises := make([]models.Exercise, 0)

	for _, example := range item.Examples {
		// Parse example to extract Bulgarian and German parts
		parts := strings.Split(example, " – ")
		if len(parts) >= 2 {
			bulgarian := strings.TrimSpace(parts[0])
			german := strings.TrimSpace(parts[1])

			// Create fill-in-the-blank exercise
			exercise := models.Exercise{
				Type:          "fill-blank",
				Question:      CreateFillBlankQuestion(bulgarian),
				CorrectAnswer: ExtractBlankAnswer(bulgarian),
				Options:       GenerateMultipleChoiceOptions(bulgarian),
				Explanation:   german,
			}

			exercises = append(exercises, exercise)
		}
	}

	return exercises
}

func CreateFillBlankQuestion(text string) string {
	// Simple implementation - replace the first word with a blank
	words := strings.Fields(text)
	if len(words) > 0 {
		words[0] = "____"
		return strings.Join(words, " ")
	}
	return text
}

func ExtractBlankAnswer(text string) string {
	words := strings.Fields(text)
	if len(words) > 0 {
		return words[0]
	}
	return ""
}

func GenerateMultipleChoiceOptions(text string) []string {
	// Simple implementation - return some basic options
	return []string{"Option A", "Option B", "Option C", "Option D"}
}
