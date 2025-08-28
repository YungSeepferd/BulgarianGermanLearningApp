package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/urfave/cli/v2"
)

// VocabularyItem represents a vocabulary entry
type VocabularyItem struct {
	ID            string    `json:"id"`
	Word          string    `json:"word"`
	Translation   string    `json:"translation"`
	SourceLang    string    `json:"source_lang"`
	TargetLang    string    `json:"target_lang"`
	Category      string    `json:"category"`
	Level         string    `json:"level"`
	Notes         *string   `json:"notes"`
	Etymology     *string   `json:"etymology"`
	CulturalNote  *string   `json:"cultural_note"`
	LinguisticNote *string  `json:"linguistic_note"`
	Difficulty    int       `json:"difficulty"`
	Frequency     int       `json:"frequency"`
	Examples      []Example `json:"examples,omitempty"`
}

type Example struct {
	Sentence    string `json:"sentence"`
	Translation string `json:"translation"`
	Context     string `json:"context"`
}

// Statistics represents vocabulary statistics
type Statistics struct {
	TotalItems      int                    `json:"total_items"`
	ByLevel         map[string]int         `json:"by_level"`
	ByCategory      map[string]int         `json:"by_category"`
	ByDifficulty    map[int]int            `json:"by_difficulty"`
	ByLanguagePair  map[string]int         `json:"by_language_pair"`
	AverageDifficulty float64              `json:"average_difficulty"`
	AverageFrequency  float64              `json:"average_frequency"`
}

func main() {
	app := &cli.App{
		Name:  "vocab-processor",
		Usage: "Process and analyze vocabulary data for the Bulgarian-German Learning App",
		Commands: []*cli.Command{
			{
				Name:  "stats",
				Usage: "Generate statistics about vocabulary data",
				Flags: []cli.Flag{
					&cli.StringFlag{
						Name:  "input",
						Value: "data/vocabulary.json",
						Usage: "Input vocabulary JSON file",
					},
					&cli.StringFlag{
						Name:  "output",
						Value: "",
						Usage: "Output file for statistics (optional)",
					},
				},
				Action: generateStats,
			},
			{
				Name:  "validate",
				Usage: "Validate vocabulary data structure and content",
				Flags: []cli.Flag{
					&cli.StringFlag{
						Name:  "input",
						Value: "data/vocabulary.json",
						Usage: "Input vocabulary JSON file",
					},
				},
				Action: validateData,
			},
			{
				Name:  "generate-pages",
				Usage: "Generate Hugo content pages for vocabulary items",
				Flags: []cli.Flag{
					&cli.StringFlag{
						Name:  "input",
						Value: "data/vocabulary.json",
						Usage: "Input vocabulary JSON file",
					},
					&cli.StringFlag{
						Name:  "output",
						Value: "content/vocabulary",
						Usage: "Output directory for generated pages",
					},
				},
				Action: generatePages,
			},
			{
				Name:  "optimize",
				Usage: "Optimize vocabulary data (remove duplicates, normalize)",
				Flags: []cli.Flag{
					&cli.StringFlag{
						Name:  "input",
						Value: "data/vocabulary.json",
						Usage: "Input vocabulary JSON file",
					},
					&cli.StringFlag{
						Name:  "output",
						Value: "",
						Usage: "Output file (defaults to input file)",
					},
				},
				Action: optimizeData,
			},
		},
	}

	if err := app.Run(os.Args); err != nil {
		log.Fatal(err)
	}
}

func loadVocabulary(filename string) ([]VocabularyItem, error) {
	data, err := os.ReadFile(filename)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}

	var vocabulary []VocabularyItem
	if err := json.Unmarshal(data, &vocabulary); err != nil {
		return nil, fmt.Errorf("failed to parse JSON: %w", err)
	}

	return vocabulary, nil
}

func saveVocabulary(filename string, vocabulary []VocabularyItem) error {
	data, err := json.MarshalIndent(vocabulary, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal JSON: %w", err)
	}

	if err := os.WriteFile(filename, data, 0644); err != nil {
		return fmt.Errorf("failed to write file: %w", err)
	}

	return nil
}

func generateStats(c *cli.Context) error {
	inputFile := c.String("input")
	outputFile := c.String("output")

	vocabulary, err := loadVocabulary(inputFile)
	if err != nil {
		return err
	}

	stats := Statistics{
		TotalItems:    len(vocabulary),
		ByLevel:       make(map[string]int),
		ByCategory:    make(map[string]int),
		ByDifficulty:  make(map[int]int),
		ByLanguagePair: make(map[string]int),
	}

	var totalDifficulty, totalFrequency int

	for _, item := range vocabulary {
		stats.ByLevel[item.Level]++
		stats.ByCategory[item.Category]++
		stats.ByDifficulty[item.Difficulty]++
		
		langPair := fmt.Sprintf("%s-%s", item.SourceLang, item.TargetLang)
		stats.ByLanguagePair[langPair]++
		
		totalDifficulty += item.Difficulty
		totalFrequency += item.Frequency
	}

	if len(vocabulary) > 0 {
		stats.AverageDifficulty = float64(totalDifficulty) / float64(len(vocabulary))
		stats.AverageFrequency = float64(totalFrequency) / float64(len(vocabulary))
	}

	// Print statistics
	fmt.Printf("Vocabulary Statistics\n")
	fmt.Printf("====================\n")
	fmt.Printf("Total Items: %d\n", stats.TotalItems)
	fmt.Printf("Average Difficulty: %.2f\n", stats.AverageDifficulty)
	fmt.Printf("Average Frequency: %.2f\n\n", stats.AverageFrequency)

	fmt.Printf("By Level:\n")
	for level, count := range stats.ByLevel {
		fmt.Printf("  %s: %d\n", level, count)
	}

	fmt.Printf("\nBy Category:\n")
	for category, count := range stats.ByCategory {
		fmt.Printf("  %s: %d\n", category, count)
	}

	fmt.Printf("\nBy Difficulty:\n")
	for difficulty := 1; difficulty <= 5; difficulty++ {
		count := stats.ByDifficulty[difficulty]
		fmt.Printf("  %d: %d\n", difficulty, count)
	}

	fmt.Printf("\nBy Language Pair:\n")
	for pair, count := range stats.ByLanguagePair {
		fmt.Printf("  %s: %d\n", pair, count)
	}

	// Save to file if specified
	if outputFile != "" {
		data, err := json.MarshalIndent(stats, "", "  ")
		if err != nil {
			return fmt.Errorf("failed to marshal statistics: %w", err)
		}

		if err := os.WriteFile(outputFile, data, 0644); err != nil {
			return fmt.Errorf("failed to write statistics file: %w", err)
		}

		fmt.Printf("\nStatistics saved to: %s\n", outputFile)
	}

	return nil
}

func validateData(c *cli.Context) error {
	inputFile := c.String("input")

	vocabulary, err := loadVocabulary(inputFile)
	if err != nil {
		return err
	}

	var errors []string
	seenIDs := make(map[string]bool)
	seenWords := make(map[string]bool)

	for i, item := range vocabulary {
		// Check required fields
		if item.Word == "" {
			errors = append(errors, fmt.Sprintf("Item %d: missing word", i))
		}
		if item.Translation == "" {
			errors = append(errors, fmt.Sprintf("Item %d: missing translation", i))
		}
		if item.Category == "" {
			errors = append(errors, fmt.Sprintf("Item %d: missing category", i))
		}
		if item.Level == "" {
			errors = append(errors, fmt.Sprintf("Item %d: missing level", i))
		}

		// Check for duplicates
		if item.ID != "" {
			if seenIDs[item.ID] {
				errors = append(errors, fmt.Sprintf("Item %d: duplicate ID '%s'", i, item.ID))
			}
			seenIDs[item.ID] = true
		}

		if seenWords[item.Word] {
			errors = append(errors, fmt.Sprintf("Item %d: duplicate word '%s'", i, item.Word))
		}
		seenWords[item.Word] = true

		// Check valid ranges
		if item.Difficulty < 1 || item.Difficulty > 5 {
			errors = append(errors, fmt.Sprintf("Item %d: invalid difficulty %d (must be 1-5)", i, item.Difficulty))
		}
		if item.Frequency < 1 || item.Frequency > 100 {
			errors = append(errors, fmt.Sprintf("Item %d: invalid frequency %d (must be 1-100)", i, item.Frequency))
		}

		// Check valid levels
		validLevels := []string{"A1", "A2", "B1", "B2", "C1", "C2"}
		validLevel := false
		for _, level := range validLevels {
			if item.Level == level {
				validLevel = true
				break
			}
		}
		if !validLevel {
			errors = append(errors, fmt.Sprintf("Item %d: invalid level '%s'", i, item.Level))
		}
	}

	if len(errors) == 0 {
		fmt.Printf("✅ Validation passed! All %d vocabulary items are valid.\n", len(vocabulary))
	} else {
		fmt.Printf("❌ Validation failed with %d errors:\n", len(errors))
		for _, err := range errors {
			fmt.Printf("  - %s\n", err)
		}
		return fmt.Errorf("validation failed")
	}

	return nil
}

func generatePages(c *cli.Context) error {
	inputFile := c.String("input")
	outputDir := c.String("output")

	vocabulary, err := loadVocabulary(inputFile)
	if err != nil {
		return err
	}

	// Create output directory
	if err := os.MkdirAll(outputDir, 0755); err != nil {
		return fmt.Errorf("failed to create output directory: %w", err)
	}

	for _, item := range vocabulary {
		// Generate filename from word
		filename := strings.ToLower(item.Word)
		filename = strings.ReplaceAll(filename, " ", "-")
		filename = strings.ReplaceAll(filename, "ä", "ae")
		filename = strings.ReplaceAll(filename, "ö", "oe")
		filename = strings.ReplaceAll(filename, "ü", "ue")
		filename = strings.ReplaceAll(filename, "ß", "ss")
		filename += ".md"

		// Generate Hugo front matter
		frontMatter := fmt.Sprintf(`---
title: "%s"
translation: "%s"
category: "%s"
level: "%s"
difficulty: %d
frequency: %d
source_lang: "%s"
target_lang: "%s"
date: %s
---

# %s

**Translation:** %s

**Category:** %s  
**Level:** %s  
**Difficulty:** %d/5  
**Frequency:** %d/100

`, item.Word, item.Translation, item.Category, item.Level, 
		item.Difficulty, item.Frequency, item.SourceLang, item.TargetLang,
		"2024-01-01", item.Word, item.Translation, item.Category, item.Level,
		item.Difficulty, item.Frequency)

		if item.Notes != nil && *item.Notes != "" {
			frontMatter += fmt.Sprintf("## Notes\n\n%s\n\n", *item.Notes)
		}

		if item.Etymology != nil && *item.Etymology != "" {
			frontMatter += fmt.Sprintf("## Etymology\n\n%s\n\n", *item.Etymology)
		}

		if item.CulturalNote != nil && *item.CulturalNote != "" {
			frontMatter += fmt.Sprintf("## Cultural Note\n\n%s\n\n", *item.CulturalNote)
		}

		if item.LinguisticNote != nil && *item.LinguisticNote != "" {
			frontMatter += fmt.Sprintf("## Linguistic Note\n\n%s\n\n", *item.LinguisticNote)
		}

		if len(item.Examples) > 0 {
			frontMatter += "## Examples\n\n"
			for _, example := range item.Examples {
				frontMatter += fmt.Sprintf("- **%s** - %s\n", example.Sentence, example.Translation)
			}
			frontMatter += "\n"
		}

		// Add shortcode for practice
		frontMatter += fmt.Sprintf("{{< vocab-card data=. >}}\n")

		filePath := filepath.Join(outputDir, filename)
		if err := os.WriteFile(filePath, []byte(frontMatter), 0644); err != nil {
			return fmt.Errorf("failed to write page %s: %w", filename, err)
		}
	}

	fmt.Printf("✅ Generated %d vocabulary pages in %s\n", len(vocabulary), outputDir)
	return nil
}

func optimizeData(c *cli.Context) error {
	inputFile := c.String("input")
	outputFile := c.String("output")
	if outputFile == "" {
		outputFile = inputFile
	}

	vocabulary, err := loadVocabulary(inputFile)
	if err != nil {
		return err
	}

	originalCount := len(vocabulary)

	// Remove duplicates based on word
	seen := make(map[string]bool)
	var optimized []VocabularyItem

	for _, item := range vocabulary {
		if !seen[item.Word] {
			// Normalize data
			item.Word = strings.TrimSpace(item.Word)
			item.Translation = strings.TrimSpace(item.Translation)
			item.Category = strings.TrimSpace(item.Category)
			item.Level = strings.ToUpper(strings.TrimSpace(item.Level))

			// Set defaults
			if item.SourceLang == "" {
				item.SourceLang = "bg"
			}
			if item.TargetLang == "" {
				item.TargetLang = "de"
			}
			if item.Difficulty == 0 {
				item.Difficulty = 1
			}
			if item.Frequency == 0 {
				item.Frequency = 1
			}

			// Generate ID if missing
			if item.ID == "" {
				item.ID = strings.ToLower(strings.ReplaceAll(item.Word, " ", "_"))
			}

			optimized = append(optimized, item)
			seen[item.Word] = true
		}
	}

	// Sort by category, then level, then word
	sort.Slice(optimized, func(i, j int) bool {
		if optimized[i].Category != optimized[j].Category {
			return optimized[i].Category < optimized[j].Category
		}
		if optimized[i].Level != optimized[j].Level {
			return optimized[i].Level < optimized[j].Level
		}
		return optimized[i].Word < optimized[j].Word
	})

	if err := saveVocabulary(outputFile, optimized); err != nil {
		return err
	}

	fmt.Printf("✅ Optimized vocabulary data:\n")
	fmt.Printf("  Original items: %d\n", originalCount)
	fmt.Printf("  Optimized items: %d\n", len(optimized))
	fmt.Printf("  Removed duplicates: %d\n", originalCount-len(optimized))
	fmt.Printf("  Saved to: %s\n", outputFile)

	return nil
}
