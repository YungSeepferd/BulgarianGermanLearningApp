package main

import (
	"fmt"
	"log"
	"os"
	"os/exec"

	"github.com/fsnotify/fsnotify"
	"github.com/urfave/cli/v2"

	"github.com/dinz/BulgarianApp-Fresh/tools/internal/processor"
)

func main() {
	app := &cli.App{
		Name:  "hugo-bg-de",
		Usage: "Bulgarian-German learning app build tools",
		Commands: []*cli.Command{
			{
				Name:   "dev",
				Usage:  "Start development server with auto-rebuild",
				Action: devCommand,
			},
			{
				Name:   "process-data",
				Usage:  "Process JSON data files only",
				Action: processDataCommand,
			},
			{
				Name:   "validate",
				Usage:  "Validate data files and build output",
				Action: validateCommand,
			},
		},
	}

	err := app.Run(os.Args)
	if err != nil {
		log.Fatal(err)
	}
}

// buildCommand removed - use 'hugo --minify' directly or 'npm run build'

func devCommand(c *cli.Context) error {
	log.Println("Starting development server...")

	// Run initial data processing
	err := processDataCommand(c)
	if err != nil {
		return err
	}

	// Start Hugo development server
	cmd := exec.Command("hugo", "server", "--buildDrafts", "--buildFuture")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	// Set up file watcher for data files
	go watchDataFiles()

	return cmd.Run()
}

func processDataCommand(c *cli.Context) error {
	log.Println("Processing data files...")

	processor := processor.NewDataProcessor("content/")

	// Process vocabulary data
	err := processor.ProcessVocabularyData()
	if err != nil {
		return fmt.Errorf("vocabulary processing failed: %w", err)
	}

	// Process grammar data
	err = processor.ProcessGrammarData()
	if err != nil {
		return fmt.Errorf("grammar processing failed: %w", err)
	}

	// Generate search index
	err = processor.GenerateSearchIndex()
	if err != nil {
		return fmt.Errorf("search index generation failed: %w", err)
	}

	log.Println("Data processing completed successfully!")
	return nil
}

func validateCommand(c *cli.Context) error {
	log.Println("Validating data files and build output...")

	// Check if required files exist
	requiredFiles := []string{
		"data/vocabulary.json",
		"data/grammar.json",
		"hugo.toml",
	}

	for _, file := range requiredFiles {
		if _, err := os.Stat(file); os.IsNotExist(err) {
			return fmt.Errorf("required file missing: %s", file)
		}
	}

	// Validate JSON files
	processor := processor.NewDataProcessor("content/")
	
	_, err := processor.LoadJSONData("data/vocabulary.json")
	if err != nil {
		return fmt.Errorf("vocabulary.json validation failed: %w", err)
	}

	_, err = processor.LoadJSONData("data/grammar.json")
	if err != nil {
		return fmt.Errorf("grammar.json validation failed: %w", err)
	}

	log.Println("Validation completed successfully!")
	return nil
}

func preBuildHook() error {
	log.Println("Starting pre-build data processing...")

	processor := processor.NewDataProcessor("content/")

	// Process vocabulary data
	err := processor.ProcessVocabularyData()
	if err != nil {
		return fmt.Errorf("vocabulary processing failed: %w", err)
	}

	// Process grammar data
	err = processor.ProcessGrammarData()
	if err != nil {
		return fmt.Errorf("grammar processing failed: %w", err)
	}

	// Generate search index
	err = processor.GenerateSearchIndex()
	if err != nil {
		return fmt.Errorf("search index generation failed: %w", err)
	}

	// Generate PWA manifest
	err = generatePWAManifest()
	if err != nil {
		return fmt.Errorf("PWA manifest generation failed: %w", err)
	}

	log.Println("Pre-build processing completed successfully")
	return nil
}

// postBuildHook removed - Hugo's --minify handles asset optimization

func watchDataFiles() {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Printf("Failed to create file watcher: %v", err)
		return
	}
	defer watcher.Close()

	// Watch data directory
	err = watcher.Add("data/")
	if err != nil {
		log.Printf("Failed to watch data directory: %v", err)
		return
	}

	for {
		select {
		case event, ok := <-watcher.Events:
			if !ok {
				return
			}
			if event.Op&fsnotify.Write == fsnotify.Write {
				log.Printf("Data file changed: %s", event.Name)
				err := processDataFiles()
				if err != nil {
					log.Printf("Failed to reprocess data: %v", err)
				}
			}
		case err, ok := <-watcher.Errors:
			if !ok {
				return
			}
			log.Printf("File watcher error: %v", err)
		}
	}
}

func processDataFiles() error {
	processor := processor.NewDataProcessor("content/")

	err := processor.ProcessVocabularyData()
	if err != nil {
		return err
	}

	err = processor.ProcessGrammarData()
	if err != nil {
		return err
	}

	return processor.GenerateSearchIndex()
}

// optimizeStaticAssets removed - Hugo's --minify handles this

// generateServiceWorker removed - should be handled separately from build process

func generatePWAManifest() error {
	manifest := `{
  "name": "Bulgarian-German Learning App",
  "short_name": "BG-DE Learn",
  "description": "Learn Bulgarian and German with spaced repetition",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4a6fa5",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "categories": ["education", "productivity"],
  "lang": "en",
  "dir": "ltr"
}`

	err := os.WriteFile("static/manifest.json", []byte(manifest), 0644)
	if err != nil {
		return fmt.Errorf("failed to write manifest: %w", err)
	}

	return nil
}

// minifyCSSFile and minifyJSFile removed - Hugo handles minification via --minify flag

// Service worker generation functions removed - handle separately from build
// Use static/sw.js or generate via dedicated tool
