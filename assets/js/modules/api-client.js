// API Client for optimized data loading
// Handles vocabulary, grammar, and practice data with caching and pagination

class APIClient {
  constructor() {
    this.baseURL = '';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.requestQueue = new Map();
    
    // Performance monitoring
    this.metrics = {
      requests: 0,
      cacheHits: 0,
      errors: 0,
      avgResponseTime: 0
    };
  }

  // Vocabulary API methods
  async getVocabulary(options = {}) {
    const {
      page = 1,
      limit = 50,
      category = '',
      level = '',
      search = '',
      direction = 'bg-de',
      useCache = true
    } = options;

    const cacheKey = `vocab-${page}-${limit}-${category}-${level}-${search}-${direction}`;
    
    // Check cache first
    if (useCache && this.isCached(cacheKey)) {
      this.metrics.cacheHits++;
      return this.getFromCache(cacheKey);
    }

    // Build URL with query parameters
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      category,
      level,
      search,
      direction
    });

    const url = `/api/vocabulary/?${params.toString()}`;
    
    try {
      const startTime = performance.now();
      const response = await this.fetchWithQueue(url, cacheKey);
      const endTime = performance.now();
      
      this.updateMetrics(endTime - startTime);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache the response
      if (useCache) {
        this.setCache(cacheKey, data);
      }
      
      return data;
    } catch (error) {
      this.metrics.errors++;
      console.error('[API Client] Vocabulary fetch failed:', error);
      
      // Return cached data if available, even if expired
      if (this.cache.has(cacheKey)) {
        console.warn('[API Client] Using stale cache due to error');
        return this.cache.get(cacheKey).data;
      }
      
      throw error;
    }
  }

  async getVocabularyItem(id) {
    const cacheKey = `vocab-item-${id}`;
    
    if (this.isCached(cacheKey)) {
      this.metrics.cacheHits++;
      return this.getFromCache(cacheKey);
    }

    try {
      const startTime = performance.now();
      const response = await this.fetchWithQueue(`/api/vocabulary/${id}/`, cacheKey);
      const endTime = performance.now();
      
      this.updateMetrics(endTime - startTime);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      this.setCache(cacheKey, data);
      
      return data;
    } catch (error) {
      this.metrics.errors++;
      console.error('[API Client] Vocabulary item fetch failed:', error);
      throw error;
    }
  }

  // Grammar API methods
  async getGrammar(options = {}) {
    const {
      page = 1,
      limit = 20,
      category = '',
      level = '',
      useCache = true
    } = options;

    const cacheKey = `grammar-${page}-${limit}-${category}-${level}`;
    
    if (useCache && this.isCached(cacheKey)) {
      this.metrics.cacheHits++;
      return this.getFromCache(cacheKey);
    }

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      category,
      level
    });

    const url = `/api/grammar/?${params.toString()}`;
    
    try {
      const startTime = performance.now();
      const response = await this.fetchWithQueue(url, cacheKey);
      const endTime = performance.now();
      
      this.updateMetrics(endTime - startTime);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (useCache) {
        this.setCache(cacheKey, data);
      }
      
      return data;
    } catch (error) {
      this.metrics.errors++;
      console.error('[API Client] Grammar fetch failed:', error);
      throw error;
    }
  }

  // Practice session API methods
  async getPracticeItems(options = {}) {
    const {
      count = 20,
      categories = [],
      levels = [],
      direction = 'bg-de',
      reviewType = 'due',
      useCache = false // Practice data should be fresh
    } = options;

    const cacheKey = `practice-${count}-${categories.join(',')}-${levels.join(',')}-${direction}-${reviewType}`;
    
    if (useCache && this.isCached(cacheKey)) {
      this.metrics.cacheHits++;
      return this.getFromCache(cacheKey);
    }

    const params = new URLSearchParams({
      count: count.toString(),
      categories: categories.join(','),
      levels: levels.join(','),
      direction,
      review_type: reviewType
    });

    const url = `/api/practice/?${params.toString()}`;
    
    try {
      const startTime = performance.now();
      const response = await this.fetchWithQueue(url, cacheKey);
      const endTime = performance.now();
      
      this.updateMetrics(endTime - startTime);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (useCache) {
        this.setCache(cacheKey, data, 60000); // Short cache for practice data
      }
      
      return data;
    } catch (error) {
      this.metrics.errors++;
      console.error('[API Client] Practice items fetch failed:', error);
      throw error;
    }
  }

  // Search API methods
  async search(query, options = {}) {
    const {
      type = 'all', // 'vocabulary', 'grammar', 'all'
      limit = 50,
      useCache = true
    } = options;

    if (!query || query.trim().length < 2) {
      return { results: [], total: 0 };
    }

    const cacheKey = `search-${query}-${type}-${limit}`;
    
    if (useCache && this.isCached(cacheKey)) {
      this.metrics.cacheHits++;
      return this.getFromCache(cacheKey);
    }

    const params = new URLSearchParams({
      q: query.trim(),
      type,
      limit: limit.toString()
    });

    const url = `/api/search/?${params.toString()}`;
    
    try {
      const startTime = performance.now();
      const response = await this.fetchWithQueue(url, cacheKey);
      const endTime = performance.now();
      
      this.updateMetrics(endTime - startTime);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (useCache) {
        this.setCache(cacheKey, data);
      }
      
      return data;
    } catch (error) {
      this.metrics.errors++;
      console.error('[API Client] Search failed:', error);
      throw error;
    }
  }

  // Utility methods
  async fetchWithQueue(url, queueKey) {
    // Prevent duplicate requests
    if (this.requestQueue.has(queueKey)) {
      return this.requestQueue.get(queueKey);
    }

    const requestPromise = fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

    this.requestQueue.set(queueKey, requestPromise);
    
    try {
      const response = await requestPromise;
      return response;
    } finally {
      this.requestQueue.delete(queueKey);
    }
  }

  isCached(key) {
    if (!this.cache.has(key)) return false;
    
    const cached = this.cache.get(key);
    const isExpired = Date.now() - cached.timestamp > cached.timeout;
    
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    return cached ? cached.data : null;
  }

  setCache(key, data, timeout = this.cacheTimeout) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      timeout
    });

    // Limit cache size to prevent memory issues
    if (this.cache.size > 100) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  clearCache(pattern = null) {
    if (pattern) {
      // Clear cache entries matching pattern
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.cache.clear();
    }
  }

  updateMetrics(responseTime) {
    this.metrics.requests++;
    this.metrics.avgResponseTime = 
      (this.metrics.avgResponseTime * (this.metrics.requests - 1) + responseTime) / 
      this.metrics.requests;
  }

  getMetrics() {
    return {
      ...this.metrics,
      cacheSize: this.cache.size,
      cacheHitRate: this.metrics.requests > 0 ? 
        (this.metrics.cacheHits / this.metrics.requests * 100).toFixed(2) + '%' : '0%'
    };
  }

  // Prefetch methods for performance optimization
  async prefetchVocabulary(categories = [], levels = []) {
    const prefetchPromises = [];
    
    // Prefetch first pages of each category/level combination
    for (const category of categories) {
      for (const level of levels) {
        prefetchPromises.push(
          this.getVocabulary({ 
            page: 1, 
            category, 
            level, 
            useCache: true 
          }).catch(() => {}) // Ignore prefetch errors
        );
      }
    }
    
    // Also prefetch without filters
    prefetchPromises.push(
      this.getVocabulary({ page: 1, useCache: true }).catch(() => {})
    );
    
    await Promise.allSettled(prefetchPromises);
    console.log('[API Client] Prefetch completed');
  }

  async prefetchGrammar() {
    try {
      await this.getGrammar({ page: 1, useCache: true });
      console.log('[API Client] Grammar prefetch completed');
    } catch (error) {
      console.warn('[API Client] Grammar prefetch failed:', error);
    }
  }

  // Batch operations
  async batchGetVocabulary(ids) {
    const batchPromises = ids.map(id => 
      this.getVocabularyItem(id).catch(error => ({ error, id }))
    );
    
    const results = await Promise.allSettled(batchPromises);
    
    return results.map((result, index) => ({
      id: ids[index],
      success: result.status === 'fulfilled' && !result.value.error,
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : 
             (result.value && result.value.error ? result.value.error : null)
    }));
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch('/api/health/', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      return {
        status: response.ok ? 'healthy' : 'unhealthy',
        statusCode: response.status,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Create and export singleton instance
const apiClient = new APIClient();

export default apiClient;

// Also make available globally for non-module usage
if (typeof window !== 'undefined') {
  window.apiClient = apiClient;
}
