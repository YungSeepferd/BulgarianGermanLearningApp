package processor

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/dinz/BulgarianApp-Fresh/tools/internal/models"
)

func TestGenerateSlug(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "simple english word",
			input:    "hello",
			expected: "hello",
		},
		{
			name:     "word with spaces",
			input:    "hello world",
			expected: "hello-world",
		},
		{
			name:     "bulgarian cyrillic",
			input:    "здравей",
			expected: "zdravey",
		},
		{
			name:     "german umlauts",
			input:    "Müller",
			expected: "mueller",
		},
		{
			name:     "mixed case with special chars",
			input:    "Hello, World!",
			expected: "hello-world",
		},
		{
			name:     "bulgarian with spaces",
			input:    "добро утро",
			expected: "dobro-utro",
		},
		{
			name:     "german with ß",
			input:    "Straße",
			expected: "strasse",
		},
		{
			name:     "empty string",
			input:    "",
			expected: "",
		},
		{
			name:     "only special chars",
			input:    "!@#$%",
			expected: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := GenerateSlug(tt.input)
			if result != tt.expected {
				t.Errorf("GenerateSlug(%q) = %q, want %q", tt.input, result, tt.expected)
			}
		})
	}
}

func TestCalculateWeight(t *testing.T) {
	tests := []struct {
		name     string
		item     models.VocabularyItem
		expected int
	}{
		{
			name:     "A1 level",
			item:     models.VocabularyItem{Level: "A1"},
			expected: 10,
		},
		{
			name:     "A2 level",
			item:     models.VocabularyItem{Level: "A2"},
			expected: 20,
		},
		{
			name:     "B1 level",
			item:     models.VocabularyItem{Level: "B1"},
			expected: 30,
		},
		{
			name:     "B2 level",
			item:     models.VocabularyItem{Level: "B2"},
			expected: 40,
		},
		{
			name:     "unknown level",
			item:     models.VocabularyItem{Level: "C1"},
			expected: 100,
		},
		{
			name:     "empty level",
			item:     models.VocabularyItem{Level: ""},
			expected: 100,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := CalculateWeight(tt.item)
			if result != tt.expected {
				t.Errorf("CalculateWeight(%+v) = %d, want %d", tt.item, result, tt.expected)
			}
		})
	}
}

func TestCalculateGrammarWeight(t *testing.T) {
	tests := []struct {
		name     string
		item     models.GrammarItem
		expected int
	}{
		{
			name:     "A1 grammar",
			item:     models.GrammarItem{Level: "A1"},
			expected: 10,
		},
		{
			name:     "A2 grammar",
			item:     models.GrammarItem{Level: "A2"},
			expected: 20,
		},
		{
			name:     "B1 grammar",
			item:     models.GrammarItem{Level: "B1"},
			expected: 30,
		},
		{
			name:     "B2 grammar",
			item:     models.GrammarItem{Level: "B2"},
			expected: 40,
		},
		{
			name:     "unknown level",
			item:     models.GrammarItem{Level: "C1"},
			expected: 100,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := CalculateGrammarWeight(tt.item)
			if result != tt.expected {
				t.Errorf("CalculateGrammarWeight(%+v) = %d, want %d", tt.item, result, tt.expected)
			}
		})
	}
}

func TestGenerateAudioPath(t *testing.T) {
	tests := []struct {
		name     string
		word     string
		expected string
	}{
		{
			name:     "simple word",
			word:     "hello",
			expected: "/audio/hello.mp3",
		},
		{
			name:     "bulgarian word",
			word:     "здравей",
			expected: "/audio/zdravey.mp3",
		},
		{
			name:     "german word with umlauts",
			word:     "Müller",
			expected: "/audio/mueller.mp3",
		},
		{
			name:     "word with spaces",
			word:     "guten Tag",
			expected: "/audio/guten-tag.mp3",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := GenerateAudioPath(tt.word)
			if result != tt.expected {
				t.Errorf("GenerateAudioPath(%q) = %q, want %q", tt.word, result, tt.expected)
			}
		})
	}
}

func TestCreateFillBlankQuestion(t *testing.T) {
	tests := []struct {
		name     string
		text     string
		expected string
	}{
		{
			name:     "simple sentence",
			text:     "Аз съм студент",
			expected: "____ съм студент",
		},
		{
			name:     "single word",
			text:     "здравей",
			expected: "____",
		},
		{
			name:     "empty string",
			text:     "",
			expected: "",
		},
		{
			name:     "multiple words",
			text:     "Как се казваш",
			expected: "____ се казваш",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := CreateFillBlankQuestion(tt.text)
			if result != tt.expected {
				t.Errorf("CreateFillBlankQuestion(%q) = %q, want %q", tt.text, result, tt.expected)
			}
		})
	}
}

func TestExtractBlankAnswer(t *testing.T) {
	tests := []struct {
		name     string
		text     string
		expected string
	}{
		{
			name:     "simple sentence",
			text:     "Аз съм студент",
			expected: "Аз",
		},
		{
			name:     "single word",
			text:     "здравей",
			expected: "здравей",
		},
		{
			name:     "empty string",
			text:     "",
			expected: "",
		},
		{
			name:     "multiple words",
			text:     "Как се казваш",
			expected: "Как",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := ExtractBlankAnswer(tt.text)
			if result != tt.expected {
				t.Errorf("ExtractBlankAnswer(%q) = %q, want %q", tt.text, result, tt.expected)
			}
		})
	}
}

func TestNewDataProcessor(t *testing.T) {
	outputDir := "/tmp/test"
	processor := NewDataProcessor(outputDir)

	if processor == nil {
		t.Fatal("NewDataProcessor returned nil")
	}

	if processor.outputDir != outputDir {
		t.Errorf("Expected outputDir %q, got %q", outputDir, processor.outputDir)
	}

	if processor.vocabularyData != nil {
		t.Error("Expected vocabularyData to be nil initially")
	}

	if processor.grammarData != nil {
		t.Error("Expected grammarData to be nil initially")
	}
}

func TestLoadJSONData(t *testing.T) {
	// Create temporary test files
	tempDir := t.TempDir()
	
	tests := []struct {
		name        string
		filename    string
		content     string
		expectError bool
	}{
		{
			name:        "valid JSON",
			filename:    "valid.json",
			content:     `{"test": "data"}`,
			expectError: false,
		},
		{
			name:        "invalid JSON",
			filename:    "invalid.json",
			content:     `{"test": "data"`,
			expectError: true,
		},
		{
			name:        "empty file",
			filename:    "empty.json",
			content:     "",
			expectError: true,
		},
		{
			name:        "nonexistent file",
			filename:    "nonexistent.json",
			content:     "",
			expectError: true,
		},
	}

	processor := NewDataProcessor(tempDir)

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var filePath string
			if tt.name != "nonexistent file" {
				filePath = filepath.Join(tempDir, tt.filename)
				err := os.WriteFile(filePath, []byte(tt.content), 0644)
				if err != nil {
					t.Fatalf("Failed to create test file: %v", err)
				}
			} else {
				filePath = filepath.Join(tempDir, tt.filename)
			}

			data, err := processor.LoadJSONData(filePath)

			if tt.expectError {
				if err == nil {
					t.Errorf("Expected error for %s, but got none", tt.name)
				}
			} else {
				if err != nil {
					t.Errorf("Unexpected error for %s: %v", tt.name, err)
				}
				if string(data) != tt.content {
					t.Errorf("Expected data %q, got %q", tt.content, string(data))
				}
			}
		})
	}
}

func TestCreateVocabularyFrontMatter(t *testing.T) {
	processor := NewDataProcessor("/tmp")
	
	item := models.VocabularyItem{
		Word:        "здравей",
		Translation: "hello",
		Category:    "greetings",
		Level:       "A1",
		Weight:      10,
		Audio:       "/audio/zdravey.mp3",
	}

	frontMatter := processor.CreateVocabularyFrontMatter(item)

	// Check that front matter contains expected fields
	expectedFields := []string{
		`title: "здравей"`,
		`translation: "hello"`,
		`category: "greetings"`,
		`level: "A1"`,
		`weight: 10`,
		`audio: "/audio/zdravey.mp3"`,
	}

	for _, field := range expectedFields {
		if !strings.Contains(frontMatter, field) {
			t.Errorf("Front matter missing field: %s", field)
		}
	}

	// Check front matter structure
	if !strings.HasPrefix(frontMatter, "---\n") {
		t.Error("Front matter should start with ---")
	}

	if !strings.Contains(frontMatter, "\n---\n") {
		t.Error("Front matter should end with ---")
	}
}

func TestCreateGrammarFrontMatter(t *testing.T) {
	processor := NewDataProcessor("/tmp")
	
	item := models.GrammarItem{
		Title:       "Definite Article",
		Description: "Usage of definite articles in Bulgarian",
		Level:       "A1",
		Weight:      10,
		Examples:    []string{"example1", "example2"},
	}

	frontMatter := processor.CreateGrammarFrontMatter(item)

	expectedFields := []string{
		`title: "Definite Article"`,
		`description: "Usage of definite articles in Bulgarian"`,
		`level: "A1"`,
		`weight: 10`,
		`examples: 2`,
	}

	for _, field := range expectedFields {
		if !strings.Contains(frontMatter, field) {
			t.Errorf("Front matter missing field: %s", field)
		}
	}
}

func TestGenerateGrammarExercises(t *testing.T) {
	item := models.GrammarItem{
		Examples: []string{
			"Аз съм студент – Ich bin Student",
			"Ти си учител – Du bist Lehrer",
			"invalid example without separator",
		},
	}

	exercises := GenerateGrammarExercises(item)

	// Should generate exercises only for valid examples (those with " – " separator)
	expectedCount := 2
	if len(exercises) != expectedCount {
		t.Errorf("Expected %d exercises, got %d", expectedCount, len(exercises))
	}

	for i, exercise := range exercises {
		if exercise.Type != "fill-blank" {
			t.Errorf("Exercise %d: expected type 'fill-blank', got %q", i, exercise.Type)
		}

		if exercise.Question == "" {
			t.Errorf("Exercise %d: question should not be empty", i)
		}

		if exercise.CorrectAnswer == "" {
			t.Errorf("Exercise %d: correct answer should not be empty", i)
		}

		if len(exercise.Options) == 0 {
			t.Errorf("Exercise %d: options should not be empty", i)
		}
	}
}

// Benchmark tests
func BenchmarkGenerateSlug(b *testing.B) {
	testCases := []string{
		"hello world",
		"здравей свят",
		"Müller Straße",
		"complex string with many special chars!@#$%^&*()",
	}

	for i := 0; i < b.N; i++ {
		for _, tc := range testCases {
			GenerateSlug(tc)
		}
	}
}

func BenchmarkCalculateWeight(b *testing.B) {
	item := models.VocabularyItem{Level: "A1"}
	
	for i := 0; i < b.N; i++ {
		CalculateWeight(item)
	}
}
