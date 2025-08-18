package main

import (
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"

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
				Name:   "build",
				Usage:  "Build the Hugo site with data processing",
				Action: buildCommand,
			},
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

func buildCommand(c *cli.Context) error {
	log.Println("Building Bulgarian-German learning app...")

	// Run pre-build hooks
	err := preBuildHook()
	if err != nil {
		return err
	}

	// Run Hugo build
	cmd := exec.Command("hugo", "--minify")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	err = cmd.Run()
	if err != nil {
		return fmt.Errorf("Hugo build failed: %w", err)
	}

	// Run post-build hooks
	err = postBuildHook()
	if err != nil {
		return err
	}

	log.Println("Build completed successfully!")
	return nil
}

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

func postBuildHook() error {
	log.Println("Starting post-build optimizations...")

	// Optimize generated files
	err := optimizeStaticAssets()
	if err != nil {
		return fmt.Errorf("asset optimization failed: %w", err)
	}

	// Generate service worker
	err = generateServiceWorker()
	if err != nil {
		return fmt.Errorf("service worker generation failed: %w", err)
	}

	log.Println("Post-build processing completed successfully")
	return nil
}

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

func optimizeStaticAssets() error {
	publicDir := "public/"

	// Check if public directory exists
	if _, err := os.Stat(publicDir); os.IsNotExist(err) {
		log.Println("Public directory doesn't exist, skipping asset optimization")
		return nil
	}

	// Minify CSS files
	cssFiles, err := filepath.Glob(publicDir + "**/*.css")
	if err == nil {
		for _, cssFile := range cssFiles {
			err := minifyCSSFile(cssFile)
			if err != nil {
				log.Printf("Warning: failed to minify CSS file %s: %v", cssFile, err)
			}
		}
	}

	// Minify JavaScript files
	jsFiles, err := filepath.Glob(publicDir + "**/*.js")
	if err == nil {
		for _, jsFile := range jsFiles {
			err := minifyJSFile(jsFile)
			if err != nil {
				log.Printf("Warning: failed to minify JS file %s: %v", jsFile, err)
			}
		}
	}

	return nil
}

func generateServiceWorker() error {
	// Get list of all static assets
	assets, err := getStaticAssetList("public/")
	if err != nil {
		return fmt.Errorf("failed to get asset list: %w", err)
	}

	// Create service worker content
	swContent := createServiceWorkerTemplate(assets)

	// Write service worker file
	err = os.WriteFile("public/sw.js", []byte(swContent), 0644)
	if err != nil {
		return fmt.Errorf("failed to write service worker: %w", err)
	}

	return nil
}

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

// Placeholder functions for asset optimization
func minifyCSSFile(filePath string) error {
	// TODO: Implement CSS minification
	log.Printf("Minifying CSS file: %s", filePath)
	return nil
}

func minifyJSFile(filePath string) error {
	// TODO: Implement JS minification
	log.Printf("Minifying JS file: %s", filePath)
	return nil
}

func getStaticAssetList(dir string) ([]string, error) {
	var assets []string
	
	err := filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() {
			// Convert to relative path from public directory
			relPath, err := filepath.Rel(dir, path)
			if err != nil {
				return err
			}
			assets = append(assets, "/"+relPath)
		}
		return nil
	})
	
	return assets, err
}

func createServiceWorkerTemplate(assets []string) string {
	return fmt.Sprintf(`const CACHE_NAME = 'bg-de-learn-v1';
const urlsToCache = %v;

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});`, fmt.Sprintf("%q", assets))
}
