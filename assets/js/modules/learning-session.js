// Learning Session Service
// Manages practice sessions, item selection, and session analytics

class LearningSession {
  constructor(options = {}) {
    this.sessionId = this.generateSessionId();
    this.storageKey = 'bgde:learning-sessions';
    
    // Session configuration
    this.config = {
      maxItems: options.maxItems || 20,
      sessionType: options.sessionType || 'mixed', // 'vocabulary', 'grammar', 'mixed'
      difficulty: options.difficulty || 'adaptive',
      categories: options.categories || [],
      levels: options.levels || ['A1', 'A2'],
      direction: options.direction || 'bg-de',
      reviewType: options.reviewType || 'due', // 'due', 'new', 'review', 'mixed'
      ...options
    };
    
    // Session state
    this.state = {
      status: 'initialized', // 'initialized', 'active', 'paused', 'completed', 'abandoned'
      currentIndex: 0,
      items: [],
      responses: [],
      startTime: null,
      endTime: null,
      pausedTime: 0,
      lastActivityTime: Date.now()
    };
    
    // Session statistics
    this.stats = {
      totalItems: 0,
      completedItems: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      skippedItems: 0,
      hintsUsed: 0,
      averageResponseTime: 0,
      totalTime: 0,
      accuracy: 0,
      streak: 0,
      maxStreak: 0
    };
    
    // Event listeners
    this.listeners = new Map();
    
    // Auto-save interval
    this.autoSaveInterval = null;
    
    // Initialize session
    this.initialize();
  }

  // Session lifecycle
  async initialize() {
    try {
      // Load any existing session data
      this.loadSession();
      
      // Generate items for the session
      await this.generateSessionItems();
      
      // Set up auto-save
      this.setupAutoSave();
      
      this.emit('initialized', { sessionId: this.sessionId, config: this.config });
      
    } catch (error) {
      console.error('[LearningSession] Initialization failed:', error);
      this.emit('error', { type: 'initialization', error });
    }
  }

  async start() {
    if (this.state.status !== 'initialized' && this.state.status !== 'paused') {
      throw new Error('Session cannot be started from current state');
    }
    
    this.state.status = 'active';
    this.state.startTime = this.state.startTime || Date.now();
    this.state.lastActivityTime = Date.now();
    
    this.emit('started', { sessionId: this.sessionId });
    this.saveSession();
    
    return this.getCurrentItem();
  }

  pause() {
    if (this.state.status !== 'active') {
      throw new Error('Session is not active');
    }
    
    this.state.status = 'paused';
    this.state.pausedTime += Date.now() - this.state.lastActivityTime;
    
    this.emit('paused', { sessionId: this.sessionId });
    this.saveSession();
  }

  resume() {
    if (this.state.status !== 'paused') {
      throw new Error('Session is not paused');
    }
    
    this.state.status = 'active';
    this.state.lastActivityTime = Date.now();
    
    this.emit('resumed', { sessionId: this.sessionId });
    this.saveSession();
    
    return this.getCurrentItem();
  }

  complete() {
    this.state.status = 'completed';
    this.state.endTime = Date.now();
    
    this.calculateFinalStats();
    this.emit('completed', { 
      sessionId: this.sessionId, 
      stats: this.stats,
      duration: this.getTotalTime()
    });
    
    this.saveSession();
    this.clearAutoSave();
    
    return this.getSessionSummary();
  }

  abandon() {
    this.state.status = 'abandoned';
    this.state.endTime = Date.now();
    
    this.calculateFinalStats();
    this.emit('abandoned', { sessionId: this.sessionId, stats: this.stats });
    
    this.saveSession();
    this.clearAutoSave();
  }

  // Item management
  async generateSessionItems() {
    try {
      // Get items based on session configuration
      const items = await this.selectItems();
      
      // Shuffle items for variety
      this.state.items = this.shuffleArray([...items]);
      this.stats.totalItems = this.state.items.length;
      
      this.emit('itemsGenerated', { 
        count: this.state.items.length,
        types: this.getItemTypeDistribution()
      });
      
    } catch (error) {
      console.error('[LearningSession] Failed to generate items:', error);
      throw error;
    }
  }

  async selectItems() {
    const { maxItems, categories, levels, reviewType } = this.config;
    
    // This would typically call the API client or spaced repetition service
    // For now, we'll simulate the selection logic
    
    let selectedItems = [];
    
    switch (reviewType) {
    case 'due': {
      // Get due items from spaced repetition
      selectedItems = await this.getDueItems();
    
      break;
    }
    case 'new': {
      // Get new items user hasn't seen
      selectedItems = await this.getNewItems();
    
      break;
    }
    case 'review': {
      // Get items for review (recently learned)
      selectedItems = await this.getReviewItems();
    
      break;
    }
    default: {
      // Mixed selection
      const dueItems = await this.getDueItems();
      const newItems = await this.getNewItems();
      const reviewItems = await this.getReviewItems();
      
      // Balance the selection
      selectedItems = [
        ...dueItems.slice(0, Math.floor(maxItems * 0.5)),
        ...newItems.slice(0, Math.floor(maxItems * 0.3)),
        ...reviewItems.slice(0, Math.floor(maxItems * 0.2))
      ];
    }
    }
    
    // Apply filters
    selectedItems = selectedItems.filter(item => {
      if (categories.length > 0 && !categories.includes(item.category)) {
        return false;
      }
      if (levels.length > 0 && !levels.includes(item.level)) {
        return false;
      }
      return true;
    });
    
    // Limit to max items
    return selectedItems.slice(0, maxItems);
  }

  async getDueItems() {
    // Placeholder - would integrate with spaced repetition service
    return [];
  }

  async getNewItems() {
    // Placeholder - would get items user hasn't practiced
    return [];
  }

  async getReviewItems() {
    // Placeholder - would get recently learned items
    return [];
  }

  getCurrentItem() {
    if (this.state.currentIndex >= this.state.items.length) {
      return null;
    }
    
    const item = this.state.items[this.state.currentIndex];
    return {
      ...item,
      index: this.state.currentIndex,
      total: this.state.items.length,
      progress: (this.state.currentIndex / this.state.items.length) * 100
    };
  }

  // Response handling
  submitResponse(response) {
    const currentItem = this.getCurrentItem();
    if (!currentItem) {
      throw new Error('No current item to respond to');
    }
    
    const responseData = {
      itemId: currentItem.id,
      response: response.answer,
      isCorrect: response.isCorrect,
      responseTime: response.responseTime || 0,
      hintsUsed: response.hintsUsed || 0,
      timestamp: Date.now(),
      difficulty: response.difficulty || 'medium'
    };
    
    // Store the response
    this.state.responses.push(responseData);
    
    // Update statistics
    this.updateStats(responseData);
    
    // Update spaced repetition data
    this.updateSpacedRepetition(currentItem, responseData);
    
    // Move to next item
    this.state.currentIndex++;
    this.state.lastActivityTime = Date.now();
    
    this.emit('responseSubmitted', { 
      response: responseData, 
      currentItem,
      nextItem: this.getCurrentItem()
    });
    
    // Check if session is complete
    if (this.state.currentIndex >= this.state.items.length) {
      this.complete();
      return null;
    }
    
    this.saveSession();
    return this.getCurrentItem();
  }

  skipItem(reason = 'user_skip') {
    const currentItem = this.getCurrentItem();
    if (!currentItem) {
      throw new Error('No current item to skip');
    }
    
    const skipData = {
      itemId: currentItem.id,
      reason: reason,
      timestamp: Date.now()
    };
    
    this.state.responses.push({
      ...skipData,
      response: null,
      isCorrect: false,
      responseTime: 0,
      hintsUsed: 0
    });
    
    this.stats.skippedItems++;
    this.stats.streak = 0; // Reset streak on skip
    
    this.state.currentIndex++;
    this.state.lastActivityTime = Date.now();
    
    this.emit('itemSkipped', { skipData, currentItem });
    
    if (this.state.currentIndex >= this.state.items.length) {
      this.complete();
      return null;
    }
    
    this.saveSession();
    return this.getCurrentItem();
  }

  // Statistics and analytics
  updateStats(responseData) {
    this.stats.completedItems++;
    
    if (responseData.isCorrect) {
      this.stats.correctAnswers++;
      this.stats.streak++;
      this.stats.maxStreak = Math.max(this.stats.maxStreak, this.stats.streak);
    } else {
      this.stats.incorrectAnswers++;
      this.stats.streak = 0;
    }
    
    this.stats.hintsUsed += responseData.hintsUsed;
    
    // Update average response time
    const totalResponseTime = this.stats.averageResponseTime * (this.stats.completedItems - 1) + responseData.responseTime;
    this.stats.averageResponseTime = totalResponseTime / this.stats.completedItems;
    
    // Calculate accuracy
    this.stats.accuracy = (this.stats.correctAnswers / this.stats.completedItems) * 100;
  }

  calculateFinalStats() {
    this.stats.totalTime = this.getTotalTime();
    
    // Calculate additional metrics
    this.stats.itemsPerMinute = this.stats.totalTime > 0 ? 
      (this.stats.completedItems / (this.stats.totalTime / 60_000)) : 0;
    
    this.stats.efficiencyScore = this.calculateEfficiencyScore();
    this.stats.difficultyRating = this.calculateDifficultyRating();
  }

  calculateEfficiencyScore() {
    // Combine accuracy, speed, and hint usage into efficiency score
    const accuracyWeight = 0.5;
    const speedWeight = 0.3;
    const hintWeight = 0.2;
    
    const accuracyScore = this.stats.accuracy;
    const speedScore = Math.max(0, 100 - (this.stats.averageResponseTime / 1000) * 10);
    const hintScore = Math.max(0, 100 - (this.stats.hintsUsed / this.stats.completedItems) * 50);
    
    return (accuracyScore * accuracyWeight + speedScore * speedWeight + hintScore * hintWeight);
  }

  calculateDifficultyRating() {
    // Estimate session difficulty based on performance
    if (this.stats.accuracy >= 90) {
      return 'easy';
    }
    if (this.stats.accuracy >= 70) {
      return 'medium';
    }
    if (this.stats.accuracy >= 50) {
      return 'hard';
    }
    return 'very_hard';
  }

  // Spaced repetition integration
  updateSpacedRepetition(item, response) {
    // This would integrate with the spaced repetition service
    // to update review intervals based on performance
    
    const grade = this.responseToGrade(response);
    
    // Emit event for spaced repetition service to handle
    this.emit('updateSpacedRepetition', {
      itemId: item.id,
      grade: grade,
      direction: this.config.direction,
      timestamp: response.timestamp
    });
  }

  responseToGrade(response) {
    // Convert response to SM-2 grade (0-5)
    if (!response.isCorrect) {
      return 0;
    } // Failed
    
    if (response.hintsUsed > 0) {
      return 3;
    } // Correct with hints
    if (response.responseTime > 10_000) {
      return 4;
    } // Slow but correct
    return 5; // Quick and correct
  }

  // Persistence
  saveSession() {
    try {
      const sessionData = {
        sessionId: this.sessionId,
        config: this.config,
        state: this.state,
        stats: this.stats,
        lastSaved: Date.now()
      };
      
      const sessions = this.loadAllSessions();
      sessions[this.sessionId] = sessionData;
      
      localStorage.setItem(this.storageKey, JSON.stringify(sessions));
      
    } catch (error) {
      console.error('[LearningSession] Failed to save session:', error);
    }
  }

  loadSession() {
    try {
      const sessions = this.loadAllSessions();
      const sessionData = sessions[this.sessionId];
      
      if (sessionData) {
        this.config = { ...this.config, ...sessionData.config };
        this.state = { ...this.state, ...sessionData.state };
        this.stats = { ...this.stats, ...sessionData.stats };
      }
      
    } catch (error) {
      console.error('[LearningSession] Failed to load session:', error);
    }
  }

  loadAllSessions() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('[LearningSession] Failed to load sessions:', error);
      return {};
    }
  }

  // Utility methods
  generateSessionId() {
    // Use crypto.getRandomValues for secure randomness
    const array = new Uint8Array(9);
    window.crypto.getRandomValues(array);
    const randomStr = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    return `session_${Date.now()}_${randomStr}`;
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  getTotalTime() {
    if (!this.state.startTime) {
      return 0;
    }
    
    const endTime = this.state.endTime || Date.now();
    return endTime - this.state.startTime - this.state.pausedTime;
  }

  getProgress() {
    return {
      current: this.state.currentIndex,
      total: this.state.items.length,
      percentage: (this.state.currentIndex / this.state.items.length) * 100,
      completed: this.state.status === 'completed'
    };
  }

  getSessionSummary() {
    return {
      sessionId: this.sessionId,
      config: this.config,
      stats: this.stats,
      duration: this.getTotalTime(),
      progress: this.getProgress(),
      status: this.state.status,
      responses: this.state.responses
    };
  }

  getItemTypeDistribution() {
    const distribution = {};
    for (const item of this.state.items) {
      const type = item.type || 'vocabulary';
      distribution[type] = (distribution[type] || 0) + 1;
    }
    return distribution;
  }

  // Auto-save functionality
  setupAutoSave() {
    this.clearAutoSave();
    this.autoSaveInterval = setInterval(() => {
      if (this.state.status === 'active') {
        this.saveSession();
      }
    }, 30_000); // Auto-save every 30 seconds
  }

  clearAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  // Event system
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      for (const callback of this.listeners.get(event)) {
        try {
          callback(data);
        } catch (error) {
          console.error('[LearningSession] Event listener error:', error);
        }
      }
    }
  }

  // Cleanup
  destroy() {
    this.clearAutoSave();
    this.listeners.clear();
    
    if (this.state.status === 'active') {
      this.abandon();
    }
  }
}

export default LearningSession;
