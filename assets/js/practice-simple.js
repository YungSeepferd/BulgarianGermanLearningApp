/**
 * Simplified Practice Session functionality - Global functions approach
 * No ES modules, just simple global functions for flashcard practice
 */

// Extend global namespace
window.BgDeApp = window.BgDeApp || {};

// Practice session state
BgDeApp.practice = {
  vocabularyData: [],
  sessionCards: [],
  currentIndex: 0,
  currentCard: null,
  isFlipped: false,
  sessionStats: {
    startTime: null,
    totalCards: 0,
    reviewedCards: 0,
    correctAnswers: 0,
    grades: []
  }
};

// Initialize practice session
BgDeApp.initPractice = function() {
  BgDeApp.loadPracticeData();
  BgDeApp.bindPracticeEvents();
  BgDeApp.preparePracticeSession();
};

// Load practice data from Hugo template
BgDeApp.loadPracticeData = function() {
  const dataScript = document.getElementById('practice-vocabulary-data');
  if (dataScript) {
    try {
      BgDeApp.practice.vocabularyData = JSON.parse(dataScript.textContent);
    } catch (error) {
      console.error('Failed to parse practice vocabulary data:', error);
      BgDeApp.practice.vocabularyData = [];
    }
  }
};

// Bind practice events
BgDeApp.bindPracticeEvents = function() {
  const showAnswerBtn = document.getElementById('show-answer');
  const incorrectBtn = document.getElementById('incorrect-btn');
  const correctBtn = document.getElementById('correct-btn');
  const endSessionBtn = document.getElementById('end-session');
  const newSessionBtn = document.getElementById('new-session');
  const flashcard = document.getElementById('flashcard');
  
  // Show answer button
  if (showAnswerBtn) {
    showAnswerBtn.addEventListener('click', BgDeApp.showAnswer);
  }
  
  // Grade buttons
  if (incorrectBtn) {
    incorrectBtn.addEventListener('click', function() {
      BgDeApp.gradeAnswer(false);
    });
  }
  
  if (correctBtn) {
    correctBtn.addEventListener('click', function() {
      BgDeApp.gradeAnswer(true);
    });
  }
  
  // Session controls
  if (endSessionBtn) {
    endSessionBtn.addEventListener('click', BgDeApp.endPracticeSession);
  }
  
  if (newSessionBtn) {
    newSessionBtn.addEventListener('click', BgDeApp.startNewSession);
  }
  
  // Flashcard click to flip
  if (flashcard) {
    flashcard.addEventListener('click', function() {
      if (!BgDeApp.practice.isFlipped) {
        BgDeApp.showAnswer();
      }
    });
  }
  
  // Keyboard shortcuts
  document.addEventListener('keydown', BgDeApp.handlePracticeKeyboard);
};

// Prepare practice session
BgDeApp.preparePracticeSession = function() {
  const loadingState = document.getElementById('loading-state');
  const noItemsState = document.getElementById('no-items-state');
  const practiceSession = document.getElementById('practice-session');
  
  // Get selected items from localStorage
  const selectedItems = JSON.parse(localStorage.getItem('bgde:practice_selection') || '[]');
  
  // Filter vocabulary based on selection or get due items
  let filteredData = BgDeApp.practice.vocabularyData;
  
  if (selectedItems.length > 0) {
    // Practice specific selected items
    filteredData = BgDeApp.practice.vocabularyData.filter(function(item) {
      return selectedItems.includes(item.word);
    });
  } else {
    // Get items that are due for review (simplified - just take first 20)
    filteredData = BgDeApp.practice.vocabularyData.slice(0, 20);
  }
  
  if (filteredData.length === 0) {
    if (loadingState) loadingState.style.display = 'none';
    if (noItemsState) noItemsState.classList.remove('hidden');
    return;
  }
  
  // Shuffle the items
  BgDeApp.practice.sessionCards = BgDeApp.shuffleArray([...filteredData]);
  BgDeApp.practice.sessionStats.totalCards = BgDeApp.practice.sessionCards.length;
  
  // Hide loading, show practice
  if (loadingState) loadingState.style.display = 'none';
  if (practiceSession) practiceSession.classList.remove('hidden');
  
  BgDeApp.startPracticeSession();
};

// Start practice session
BgDeApp.startPracticeSession = function() {
  BgDeApp.practice.sessionStats.startTime = new Date();
  BgDeApp.practice.currentIndex = 0;
  BgDeApp.showCurrentCard();
  BgDeApp.updatePracticeProgress();
};

// Show current card
BgDeApp.showCurrentCard = function() {
  if (BgDeApp.practice.currentIndex >= BgDeApp.practice.sessionCards.length) {
    BgDeApp.completePracticeSession();
    return;
  }
  
  BgDeApp.practice.currentCard = BgDeApp.practice.sessionCards[BgDeApp.practice.currentIndex];
  BgDeApp.practice.isFlipped = false;
  
  // Get learning direction
  const direction = localStorage.getItem('bgde:learning_direction') || 'bg_to_de';
  const isReverse = direction === 'de_to_bg';
  const frontText = isReverse ? BgDeApp.practice.currentCard.translation : BgDeApp.practice.currentCard.word;
  const backText = isReverse ? BgDeApp.practice.currentCard.word : BgDeApp.practice.currentCard.translation;
  
  // Update card content
  const currentWord = document.getElementById('current-word');
  const currentTranslation = document.getElementById('current-translation');
  const currentNotes = document.getElementById('current-notes');
  const wordLevel = document.getElementById('word-level');
  const wordCategory = document.getElementById('word-category');
  
  if (currentWord) currentWord.textContent = frontText;
  if (currentTranslation) currentTranslation.textContent = backText;
  if (currentNotes) {
    currentNotes.textContent = BgDeApp.practice.currentCard.notes || '';
    currentNotes.style.display = BgDeApp.practice.currentCard.notes ? 'block' : 'none';
  }
  if (wordLevel) wordLevel.textContent = BgDeApp.practice.currentCard.level || 'A1';
  if (wordCategory) wordCategory.textContent = BgDeApp.practice.currentCard.category || '';
  
  // Reset card state
  const flashcard = document.getElementById('flashcard');
  const showAnswerBtn = document.getElementById('show-answer');
  const responseButtons = document.getElementById('response-buttons');
  
  if (flashcard) flashcard.classList.remove('flipped');
  if (showAnswerBtn) showAnswerBtn.classList.remove('hidden');
  if (responseButtons) responseButtons.classList.add('hidden');
};

// Show answer (flip card)
BgDeApp.showAnswer = function() {
  if (BgDeApp.practice.isFlipped) return;
  
  BgDeApp.practice.isFlipped = true;
  
  const flashcard = document.getElementById('flashcard');
  const showAnswerBtn = document.getElementById('show-answer');
  const responseButtons = document.getElementById('response-buttons');
  
  if (flashcard) flashcard.classList.add('flipped');
  if (showAnswerBtn) showAnswerBtn.classList.add('hidden');
  if (responseButtons) responseButtons.classList.remove('hidden');
};

// Grade answer
BgDeApp.gradeAnswer = function(isCorrect) {
  if (!BgDeApp.practice.isFlipped) return;
  
  const grade = isCorrect ? 4 : 1; // Simplified grading: 4 for correct, 1 for incorrect
  
  // Update session statistics
  BgDeApp.practice.sessionStats.reviewedCards++;
  BgDeApp.practice.sessionStats.grades.push(grade);
  
  if (isCorrect) {
    BgDeApp.practice.sessionStats.correctAnswers++;
  }
  
  // Update spaced repetition (if available)
  if (BgDeApp.spacedRepetition && BgDeApp.practice.currentCard) {
    const wordId = BgDeApp.generateWordId(BgDeApp.practice.currentCard.word);
    let reviewState = BgDeApp.spacedRepetition.loadState(wordId);
    
    if (!reviewState) {
      reviewState = BgDeApp.spacedRepetition.initReviewState(wordId);
    }
    
    BgDeApp.spacedRepetition.scheduleNext(reviewState, grade);
  }
  
  // Show feedback briefly then move to next card
  BgDeApp.showGradeFeedback(isCorrect);
  
  setTimeout(function() {
    BgDeApp.practice.currentIndex++;
    BgDeApp.showCurrentCard();
    BgDeApp.updatePracticeProgress();
  }, 1000);
};

// Show grade feedback
BgDeApp.showGradeFeedback = function(isCorrect) {
  const responseButtons = document.getElementById('response-buttons');
  if (!responseButtons) return;
  
  // Add feedback class
  responseButtons.classList.add(isCorrect ? 'correct-feedback' : 'incorrect-feedback');
  
  // Remove feedback after animation
  setTimeout(function() {
    responseButtons.classList.remove('correct-feedback', 'incorrect-feedback');
  }, 800);
};

// Update practice progress
BgDeApp.updatePracticeProgress = function() {
  const progressElement = document.getElementById('progress');
  const accuracyElement = document.getElementById('accuracy');
  const progressFill = document.getElementById('progress-fill');
  
  const stats = BgDeApp.practice.sessionStats;
  const progress = stats.totalCards > 0 ? (stats.reviewedCards / stats.totalCards) * 100 : 0;
  const accuracy = stats.reviewedCards > 0 ? Math.round((stats.correctAnswers / stats.reviewedCards) * 100) : 0;
  
  if (progressElement) {
    progressElement.textContent = `${stats.reviewedCards}/${stats.totalCards}`;
  }
  
  if (accuracyElement) {
    accuracyElement.textContent = `${accuracy}%`;
  }
  
  if (progressFill) {
    progressFill.style.width = `${progress}%`;
  }
};

// Complete practice session
BgDeApp.completePracticeSession = function() {
  const practiceSession = document.getElementById('practice-session');
  const sessionComplete = document.getElementById('session-complete');
  
  if (practiceSession) practiceSession.classList.add('hidden');
  if (sessionComplete) sessionComplete.classList.remove('hidden');
  
  // Update final statistics
  const stats = BgDeApp.practice.sessionStats;
  const duration = new Date() - stats.startTime;
  const minutes = Math.round(duration / (1000 * 60));
  const accuracy = stats.reviewedCards > 0 ? Math.round((stats.correctAnswers / stats.reviewedCards) * 100) : 0;
  
  const finalCorrect = document.getElementById('final-correct');
  const finalTotal = document.getElementById('final-total');
  const finalAccuracy = document.getElementById('final-accuracy');
  const finalTime = document.getElementById('final-time');
  
  if (finalCorrect) finalCorrect.textContent = stats.correctAnswers;
  if (finalTotal) finalTotal.textContent = stats.reviewedCards;
  if (finalAccuracy) finalAccuracy.textContent = `${accuracy}%`;
  if (finalTime) finalTime.textContent = `${minutes}m`;
  
  // Clear practice selection
  localStorage.removeItem('bgde:practice_selection');
};

// End practice session early
BgDeApp.endPracticeSession = function() {
  if (confirm('Are you sure you want to end this practice session?')) {
    BgDeApp.completePracticeSession();
  }
};

// Start new session
BgDeApp.startNewSession = function() {
  // Reset session state
  BgDeApp.practice.currentIndex = 0;
  BgDeApp.practice.sessionStats = {
    startTime: null,
    totalCards: BgDeApp.practice.sessionStats.totalCards,
    reviewedCards: 0,
    correctAnswers: 0,
    grades: []
  };
  
  const sessionComplete = document.getElementById('session-complete');
  const practiceSession = document.getElementById('practice-session');
  
  if (sessionComplete) sessionComplete.classList.add('hidden');
  if (practiceSession) practiceSession.classList.remove('hidden');
  
  BgDeApp.startPracticeSession();
};

// Handle keyboard shortcuts
BgDeApp.handlePracticeKeyboard = function(e) {
  // Only handle if practice session is active
  const practiceSession = document.getElementById('practice-session');
  if (!practiceSession || practiceSession.classList.contains('hidden')) return;
  
  switch (e.key) {
    case ' ':
    case 'Enter':
      e.preventDefault();
      if (!BgDeApp.practice.isFlipped) {
        BgDeApp.showAnswer();
      }
      break;
    case '1':
      e.preventDefault();
      if (BgDeApp.practice.isFlipped) {
        BgDeApp.gradeAnswer(false);
      }
      break;
    case '2':
      e.preventDefault();
      if (BgDeApp.practice.isFlipped) {
        BgDeApp.gradeAnswer(true);
      }
      break;
  }
};

// Utility functions
BgDeApp.shuffleArray = function(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

BgDeApp.generateWordId = function(word) {
  return word.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Only initialize if we're on the practice page
  if (document.getElementById('practice-session')) {
    BgDeApp.initPractice();
  }
});
