/**
 * Langenscheidt Dictionary Scraper
 *
 * Scrapes German-Bulgarian and Bulgarian-German translations from Langenscheidt
 * online dictionaries with comprehensive error handling, caching, and validation.
 *
 * URL Patterns:
 * - German→Bulgarian: https://en.langenscheidt.com/german-bulgarian/{TERM}
 * - Bulgarian→German: https://en.langenscheidt.com/bulgarian-german/{URL_ENCODED_TERM}
 *
 * Usage:
 * ```typescript
 * const scraper = new LangenscheidtScraper();
 * await scraper.initialize();
 *
 * // Scrape single term
 * const result = await scraper.scrapeTerm('zusammen', 'de-bg');
 *
 * // Batch scrape with caching
 * const results = await scraper.batchScrape([
 *   { term: 'zusammen', direction: 'de-bg' },
 *   { term: 'заедно', direction: 'bg-de' }
 * ]);
 * ```
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs/promises';
import * as path from 'path';
import pQueue from 'p-queue';

/**
 * Enriched vocabulary entry from Langenscheidt
 */
export interface EnrichedVocabularyEntry {
  term: string;
  direction: 'de-bg' | 'bg-de';
  primaryTranslation: string;
  secondaryTranslations: string[];
  partOfSpeech: string;
  definitions: {
    definition: string;
    example?: string;
    context?: string;
  }[];
  examples: {
    source: string;
    target: string;
    context?: string;
  }[];
  synonyms: string[];
  antonyms: string[];
  grammaticalInfo?: {
    gender?: string;
    pluralForm?: string;
    conjugations?: Record<string, string>;
  };
  culturalNotes: string[];
  sourceUrl: string;
  scrapedAt: string;
  confidence: number; // 0-1 confidence score
  warnings: string[];
}

/**
 * Cache entry for scraped terms
 */
interface CacheEntry {
  data: EnrichedVocabularyEntry;
  timestamp: number;
  ttlMs: number;
}

/**
 * Scraping statistics for reporting
 */
interface ScrapingStats {
  totalRequests: number;
  successfulScraped: number;
  failedRequests: number;
  cacheHits: number;
  rateLimitHits: number;
  averageTimeMs: number;
  startTime: number;
  endTime?: number;
}

/**
 * Langenscheidt scraper with retry logic, caching, and error handling
 */
export class LangenscheidtScraper {
  private browser?: Browser;
  private cache: Map<string, CacheEntry> = new Map();
  private cacheDir: string;
  private stats: ScrapingStats = {
    totalRequests: 0,
    successfulScraped: 0,
    failedRequests: 0,
    cacheHits: 0,
    rateLimitHits: 0,
    averageTimeMs: 0,
    startTime: Date.now()
  };

  private queue: pQueue; // Rate limiting queue
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 1000;
  private readonly RATE_LIMIT_DELAY_MS = 500;
  private readonly CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
  private readonly TIMEOUT_MS = 30000; // 30 seconds per page

  constructor(cacheDir: string = './scraper-cache') {
    this.cacheDir = cacheDir;
    this.queue = new pQueue({
      interval: 60000,
      intervalCap: 30, // Max 30 requests per minute to avoid rate limiting
      concurrency: 1
    });
  }

  /**
   * Initialize the scraper: start browser, load cache
   */
  async initialize(): Promise<void> {
    try {
      this.browser = await chromium.launch({ headless: true });
      await this.loadCache();
      console.log('✅ Langenscheidt scraper initialized');
    } catch (error) {
      console.error('❌ Failed to initialize scraper:', error);
      throw error;
    }
  }

  /**
   * Shutdown browser and save cache
   */
  async shutdown(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
    await this.saveCache();
    this.stats.endTime = Date.now();
    console.log('📊 Scraping stats:', this.getStats());
  }

  /**
   * Load cache from disk
   */
  private async loadCache(): Promise<void> {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
      const cacheFile = path.join(this.cacheDir, 'cache.json');

      try {
        const data = await fs.readFile(cacheFile, 'utf-8');
        const parsed = JSON.parse(data);

        for (const [key, entry] of Object.entries(parsed)) {
          const cacheEntry = entry as CacheEntry;
          // Only keep entries that haven't expired
          if (Date.now() - cacheEntry.timestamp < cacheEntry.ttlMs) {
            this.cache.set(key, cacheEntry);
          }
        }

        console.log(`📦 Loaded ${this.cache.size} cached entries`);
      } catch {
        console.log('💾 No existing cache found, starting fresh');
      }
    } catch (error) {
      console.error('⚠️  Failed to load cache:', error);
    }
  }

  /**
   * Save cache to disk
   */
  private async saveCache(): Promise<void> {
    try {
      const cacheFile = path.join(this.cacheDir, 'cache.json');
      const cacheObj = Object.fromEntries(this.cache);
      await fs.writeFile(cacheFile, JSON.stringify(cacheObj, null, 2), 'utf-8');
      console.log(`💾 Cache saved (${this.cache.size} entries)`);
    } catch (error) {
      console.error('⚠️  Failed to save cache:', error);
    }
  }

  /**
   * Get cache key for term + direction
   */
  private getCacheKey(term: string, direction: 'de-bg' | 'bg-de'): string {
    return `${direction}:${term.toLowerCase()}`;
  }

  /**
   * Check if term is in cache and not expired
   */
  private getFromCache(term: string, direction: 'de-bg' | 'bg-de'): EnrichedVocabularyEntry | null {
    const key = this.getCacheKey(term, direction);
    const entry = this.cache.get(key);

    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttlMs) {
      this.cache.delete(key);
      return null;
    }

    this.stats.cacheHits++;
    return entry.data;
  }

  /**
   * Store term in cache
   */
  private storeInCache(term: string, direction: 'de-bg' | 'bg-de', data: EnrichedVocabularyEntry): void {
    const key = this.getCacheKey(term, direction);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttlMs: this.CACHE_TTL_MS
    });
  }

  /**
   * Build Langenscheidt URL for term
   */
  private buildUrl(term: string, direction: 'de-bg' | 'bg-de'): string {
    if (direction === 'de-bg') {
      return `https://en.langenscheidt.com/german-bulgarian/${encodeURIComponent(term)}`;
    } else {
      // Bulgarian to German requires URL encoding for Cyrillic
      return `https://en.langenscheidt.com/bulgarian-german/${encodeURIComponent(term)}`;
    }
  }

  /**
   * Scrape a single term with retry logic
   */
  async scrapeTerm(
    term: string,
    direction: 'de-bg' | 'bg-de'
  ): Promise<EnrichedVocabularyEntry | null> {
    this.stats.totalRequests++;

    // Check cache first
    const cached = this.getFromCache(term, direction);
    if (cached) {
      return cached;
    }

    // Add to queue for rate limiting
    return this.queue.add(async () => {
      for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
        try {
          const result = await this.scrapeTermInternal(term, direction);
          if (result) {
            this.stats.successfulScraped++;
            this.storeInCache(term, direction, result);
            return result;
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);

          if (errorMsg.includes('429') || errorMsg.includes('rate limit')) {
            this.stats.rateLimitHits++;
            if (attempt < this.MAX_RETRIES) {
              const delayMs = this.RETRY_DELAY_MS * Math.pow(2, attempt - 1);
              console.warn(
                `⏱️  Rate limited. Retrying in ${delayMs}ms (attempt ${attempt}/${this.MAX_RETRIES})`
              );
              await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
          } else if (attempt === this.MAX_RETRIES) {
            console.error(
              `❌ Failed to scrape "${term}" (${direction}) after ${this.MAX_RETRIES} attempts:`,
              errorMsg
            );
            this.stats.failedRequests++;
            return null;
          }
        }

        if (attempt < this.MAX_RETRIES) {
          await new Promise((resolve) =>
            setTimeout(resolve, this.RETRY_DELAY_MS * Math.pow(2, attempt - 1))
          );
        }
      }

      return null;
    });
  }

  /**
   * Internal scraping logic using Playwright
   */
  private async scrapeTermInternal(
    term: string,
    direction: 'de-bg' | 'bg-de'
  ): Promise<EnrichedVocabularyEntry | null> {
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    const page = await this.browser.newPage();
    const warnings: string[] = [];

    try {
      const url = this.buildUrl(term, direction);
      console.log(`🔍 Scraping: ${term} (${direction}) from ${url}`);

      // Navigate to page
      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: this.TIMEOUT_MS });

      if (!response || !response.ok()) {
        if (response?.status() === 404) {
          warnings.push('Page not found (404)');
          return null;
        }
        if (response?.status() === 429) {
          throw new Error('Rate limited (429)');
        }
        throw new Error(`HTTP ${response?.status()}`);
      }

      // Extract vocabulary data
      const data = await page.evaluate(() => {
        const result: {
          primaryTranslation?: string;
          secondaryTranslations: string[];
          partOfSpeech?: string;
          definitions: { definition: string; example?: string }[];
          examples: { source: string; target: string; context?: string }[];
          synonyms: string[];
          antonyms: string[];
          grammaticalInfo?: Record<string, unknown>;
          culturalNotes: string[];
        } = {
          secondaryTranslations: [],
          definitions: [],
          examples: [],
          synonyms: [],
          antonyms: [],
          culturalNotes: []
        };

        // Try multiple selectors to handle page layout variations
        const mainContent =
          document.querySelector('[data-test="entry"]') ||
          document.querySelector('.entry-header') ||
          document.querySelector('main');

        if (mainContent) {
          // Extract primary translation
          const transEl = mainContent.querySelector('[data-test="translation"], .translation, h2');
          if (transEl) {
            result.primaryTranslation = transEl.textContent?.trim();
          }

          // Extract part of speech
          const posEl = mainContent.querySelector('[data-test="pos"], .part-of-speech, .pos');
          if (posEl) {
            result.partOfSpeech = posEl.textContent?.trim();
          }

          // Extract definitions
          const defElements = mainContent.querySelectorAll('[data-test="definition"], .definition');
          defElements.forEach((el) => {
            const text = el.textContent?.trim();
            if (text) {
              result.definitions.push({ definition: text });
            }
          });

          // Extract examples
          const exampleElements = mainContent.querySelectorAll('[data-test="example"], .example');
          exampleElements.forEach((el) => {
            const text = el.textContent?.trim();
            if (text && text.includes('•')) {
              const [source, target] = text.split('•').map((s) => s.trim());
              if (source && target) {
                result.examples.push({ source, target });
              }
            }
          });

          // Extract synonyms
          const synElements = mainContent.querySelectorAll('[data-test="synonym"], .synonym');
          synElements.forEach((el) => {
            const text = el.textContent?.trim();
            if (text) {
              result.synonyms.push(text);
            }
          });
        }

        return result;
      });

      if (!data.primaryTranslation) {
        warnings.push('No primary translation found');
        return null;
      }

      const entry: EnrichedVocabularyEntry = {
        term,
        direction,
        primaryTranslation: data.primaryTranslation,
        secondaryTranslations: data.secondaryTranslations,
        partOfSpeech: data.partOfSpeech || 'unknown',
        definitions: data.definitions,
        examples: data.examples,
        synonyms: data.synonyms,
        antonyms: data.antonyms,
        grammaticalInfo: data.grammaticalInfo as any,
        culturalNotes: data.culturalNotes,
        sourceUrl: url,
        scrapedAt: new Date().toISOString(),
        confidence: data.definitions.length > 0 && data.examples.length > 0 ? 0.95 : 0.7,
        warnings
      };

      console.log(`✅ Successfully scraped: ${term} (${direction})`);
      return entry;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`❌ Error scraping "${term}" (${direction}):`, errorMsg);
      throw error;
    } finally {
      await page.close();
    }
  }

  /**
   * Batch scrape multiple terms with concurrency control
   */
  async batchScrape(
    requests: Array<{ term: string; direction: 'de-bg' | 'bg-de' }>
  ): Promise<(EnrichedVocabularyEntry | null)[]> {
    console.log(`📦 Starting batch scrape of ${requests.length} terms...`);

    const results = await Promise.all(
      requests.map((req) => this.scrapeTerm(req.term, req.direction))
    );

    console.log(`✅ Batch scrape complete: ${results.filter((r) => r).length}/${requests.length} successful`);
    return results;
  }

  /**
   * Get scraping statistics
   */
  getStats(): Partial<ScrapingStats> {
    const duration = (this.stats.endTime || Date.now()) - this.stats.startTime;
    return {
      totalRequests: this.stats.totalRequests,
      successfulScraped: this.stats.successfulScraped,
      failedRequests: this.stats.failedRequests,
      cacheHits: this.stats.cacheHits,
      rateLimitHits: this.stats.rateLimitHits,
      successRate: this.stats.totalRequests > 0 ? (this.stats.successfulScraped / this.stats.totalRequests) * 100 : 0,
      durationMs: duration,
      requestsPerMinute: (this.stats.totalRequests / (duration / 60000)).toFixed(2)
    };
  }

  /**
   * Export cache for analysis/backup
   */
  async exportCache(): Promise<Record<string, EnrichedVocabularyEntry>> {
    const result: Record<string, EnrichedVocabularyEntry> = {};
    for (const [key, entry] of this.cache) {
      result[key] = entry.data;
    }
    return result;
  }
}

export default LangenscheidtScraper;
