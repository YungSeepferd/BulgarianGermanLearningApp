# UVX Fetch MCP Server Usage Guide

This guide explains how to use the UVX Fetch MCP server with the Bulgarian-German Learning App for web scraping and data fetching tasks.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Configuration](#configuration)
- [Basic Usage](#basic-usage)
- [Advanced Features](#advanced-features)
- [Integration with Project](#integration-with-project)
- [Troubleshooting](#troubleshooting)

## Overview

The UVX Fetch MCP server provides powerful web scraping and data fetching capabilities that can be used for:

- **Vocabulary Enrichment**: Fetch additional examples, definitions, and cultural notes
- **Grammar Data**: Scrape grammar rules and examples from authoritative sources
- **Audio Files**: Retrieve pronunciation audio files
- **Content Updates**: Automatically fetch updated language learning content

## Installation

The UVX Fetch MCP server is already configured in this repository. To use it:

1. **Install the UVX Fetch MCP server globally** (if not already installed):
   ```bash
   npm install -g uvx-fetch-mcp
   ```

2. **Verify installation**:
   ```bash
   uvx-fetch-mcp --version
   ```

## Configuration

The server is pre-configured with the following settings:

- **Server URL**: `http://localhost:3001`
- **Timeout**: 30 seconds
- **Rate Limiting**: 120 requests/minute, 20 burst limit
- **Caching**: Enabled (100MB max, 24-hour TTL)
- **Logging**: Info level with rotation

### Configuration Files

- `config.json` - Main configuration
- `endpoints.json` - API endpoint definitions
- `cache/` - Response caching directory
- `uvx-fetch.log` - Server logs

## Basic Usage

### Starting the Server

```bash
# Start the UVX Fetch MCP server on port 3001
uvx-fetch-mcp start --port 3001

# Check server status
uvx-fetch-mcp status

# Stop the server
uvx-fetch-mcp stop
```

### Testing Configuration

```bash
# Test the configuration
cd .uvx && npm test

# Or directly
node .uvx/test-config.js
```

### Making Requests

The server provides several endpoints for different use cases:

#### 1. Fetch Endpoint

Fetch raw content from URLs:

```javascript
// Example: Fetch vocabulary data
const response = await fetch('http://localhost:3001/fetch', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: 'https://api.language-data.org/vocabulary',
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
});

const data = await response.json();
```

#### 2. Scrape Endpoint

Scrape structured data using CSS selectors:

```javascript
// Example: Scrape grammar examples
const response = await fetch('http://localhost:3001/scrape', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: 'https://bulgarian-grammar.example.com',
    selectors: {
      examples: '.grammar-example',
      title: 'h2',
      content: '.example-content'
    },
    format: 'json'
  })
});

const scrapedData = await response.json();
```

#### 3. Parse Endpoint

Parse HTML content directly:

```javascript
// Example: Parse HTML content
const response = await fetch('http://localhost:3001/parse', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    html: '<div class="vocabulary-item"><h3>Hello</h3><p>Здравей</p></div>',
    selectors: {
      title: 'h3',
      translation: 'p'
    }
  })
});

const parsedData = await response.json();
```

## Advanced Features

### Caching

The server automatically caches responses to improve performance:

- **Cache Directory**: `.uvx/cache/`
- **Max Size**: 100MB
- **TTL**: 24 hours

To clear cache:
```bash
rm -rf .uvx/cache/*
```

### Rate Limiting

The server includes rate limiting to prevent abuse:

- **120 requests per minute**
- **20 burst requests**

### Logging

Server logs are stored in `.uvx/uvx-fetch.log` with rotation:

```bash
# View logs
tail -f .uvx/uvx-fetch.log

# Clear logs
rm .uvx/uvx-fetch.log
```

## Integration with Project

### Vocabulary Enrichment

Use the UVX Fetch MCP server to enrich vocabulary data:

```javascript
// scripts/enrichment/fetch-vocabulary-examples.js
import fetch from 'node-fetch';

async function fetchExamples(word) {
  const response = await fetch('http://localhost:3001/fetch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: `https://language-examples.org/api?word=${encodeURIComponent(word)}`,
      method: 'GET'
    })
  });

  return response.json();
}
```

### Grammar Data Scraping

Scrape grammar rules and examples:

```javascript
// scripts/grammar/scrape-grammar-rules.js
import fetch from 'node-fetch';

async function scrapeGrammarRules(url) {
  const response = await fetch('http://localhost:3001/scrape', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: url,
      selectors: {
        rules: '.grammar-rule',
        title: 'h3.rule-title',
        description: '.rule-description',
        examples: '.rule-examples li'
      }
    })
  });

  return response.json();
}
```

### Audio File Retrieval

Fetch pronunciation audio files:

```javascript
// scripts/audio/fetch-pronunciation.js
import fetch from 'node-fetch';

async function fetchPronunciation(word, language) {
  const response = await fetch('http://localhost:3001/fetch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: `https://audio-pronunciation.org/${language}/${encodeURIComponent(word)}.mp3`,
      method: 'GET',
      responseType: 'arraybuffer'
    })
  });

  return response.arrayBuffer();
}
```

## Troubleshooting

### Server Won't Start

1. **Check if port 3000 is available**:
   ```bash
   lsof -i :3000
   ```

2. **Kill existing process if needed**:
   ```bash
   kill -9 $(lsof -t -i :3000)
   ```

3. **Check configuration**:
   ```bash
   cd .uvx && npm test
   ```

### Connection Issues

1. **Verify server is running**:
   ```bash
   uvx-fetch-mcp status
   ```

2. **Check logs**:
   ```bash
   tail -f .uvx/uvx-fetch.log
   ```

3. **Test connectivity**:
   ```bash
   curl -v http://localhost:3001/status
   ```

### Rate Limiting Errors

If you encounter rate limiting errors:

1. **Wait for the rate limit to reset** (1 minute)
2. **Adjust rate limiting in config.json** if needed
3. **Use caching** to reduce repeated requests

## Best Practices

1. **Use caching** for repeated requests to the same URLs
2. **Respect rate limits** to avoid being blocked
3. **Handle errors gracefully** in your integration code
4. **Monitor logs** for any issues
5. **Clear cache periodically** to get fresh data

## Examples

### Fetching and Processing Vocabulary Data

```javascript
// Example script to fetch and process vocabulary data
import fetch from 'node-fetch';

async function enrichVocabulary() {
  try {
    // Fetch vocabulary data
    const fetchResponse = await fetch('http://localhost:3001/fetch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'https://api.bulgarian-vocabulary.org/words',
        method: 'GET'
      })
    });

    const vocabularyData = await fetchResponse.json();

    // Process each vocabulary item
    const enrichedItems = await Promise.all(vocabularyData.items.map(async (item) => {
      // Fetch examples for each word
      const examplesResponse = await fetch('http://localhost:3001/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: `https://language-examples.org/${item.word}`,
          method: 'GET'
        })
      });

      const examples = await examplesResponse.json();

      return {
        ...item,
        examples: examples.examples || []
      };
    }));

    // Save enriched data
    fs.writeFileSync('data/enriched-vocabulary.json', JSON.stringify(enrichedItems, null, 2));
    
    console.log('✅ Vocabulary enrichment complete!');
    
  } catch (error) {
    console.error('❌ Error enriching vocabulary:', error);
  }
}

enrichVocabulary();
```

### Scraping Grammar Examples

```javascript
// Example script to scrape grammar examples
import fetch from 'node-fetch';

async function scrapeGrammarExamples() {
  try {
    const grammarUrls = [
      'https://bulgarian-grammar.example.com/nouns',
      'https://bulgarian-grammar.example.com/verbs',
      'https://bulgarian-grammar.example.com/adjectives'
    ];

    const allExamples = [];

    for (const url of grammarUrls) {
      const response = await fetch('http://localhost:3001/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url,
          selectors: {
            examples: '.grammar-example',
            title: 'h3.example-title',
            content: '.example-content',
            translation: '.example-translation'
          }
        })
      });

      const scrapedData = await response.json();
      allExamples.push(...scrapedData.examples);
    }

    // Save scraped examples
    fs.writeFileSync('data/grammar-examples.json', JSON.stringify(allExamples, null, 2));
    
    console.log(`✅ Scraped ${allExamples.length} grammar examples!`);
    
  } catch (error) {
    console.error('❌ Error scraping grammar examples:', error);
  }
}

scrapeGrammarExamples();
```

## Support

For issues with the UVX Fetch MCP server configuration:

1. **Check the logs**: `.uvx/uvx-fetch.log`
2. **Validate configuration**: `cd .uvx && npm test`
3. **Review documentation**: `.uvx/README.md`
4. **Check UVX Fetch MCP server documentation**

## License

This configuration is licensed under the MIT License. See the main project LICENSE for details.