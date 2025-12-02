#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const matter = require('gray-matter');
const { marked } = require('marked');

const contentDir = path.join(__dirname, '../data');
const outputDir = path.join(__dirname, '../src/lib/content');

function processVocabulary() {
  const vocabFiles = glob.sync(`${contentDir}/vocab/*.json`);

  vocabFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const data = JSON.parse(content);

    // Validate vocabulary data
    if (!data.category || !Array.isArray(data.words)) {
      throw new Error(`Invalid vocabulary file: ${file}`);
    }

    // Create output directory if it doesn't exist
    const outputPath = path.join(outputDir, 'vocab');
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    // Write processed vocabulary data
    fs.writeFileSync(
      path.join(outputPath, `${path.basename(file, '.json')}.json`),
      JSON.stringify(data, null, 2)
    );
  });
}

function processGrammar() {
  const grammarFiles = glob.sync(`${contentDir}/grammar/*.md`);

  grammarFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const { data, content: markdownContent } = matter(content);

    // Validate grammar data
    if (!data.title || !data.level) {
      throw new Error(`Invalid grammar file: ${file}`);
    }

    // Convert markdown to HTML
    const htmlContent = marked(markdownContent);

    // Create output directory if it doesn't exist
    const outputPath = path.join(outputDir, 'grammar');
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    // Write processed grammar data
    fs.writeFileSync(
      path.join(outputPath, `${path.basename(file, '.md')}.json`),
      JSON.stringify({
        ...data,
        content: htmlContent
      }, null, 2)
    );
  });
}

function main() {
  try {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Process vocabulary and grammar content
    processVocabulary();
    processGrammar();

    console.log('Content processing completed successfully');
  } catch (error) {
    console.error('Error processing content:', error);
    process.exit(1);
  }
}

main();
