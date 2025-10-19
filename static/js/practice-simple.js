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

BgDeApp.normalizeDirection = function(value) {
  if (!value) {
    return null;
  }

  const normalized = value.toString().toLowerCase();

  if (normalized === 'bg-de' || normalized === 'bg_to_de') {
    return 'bg-de';
  }

  if (normalized === 'de-bg' || normalized === 'de_to_bg') {
    return 'de-bg';
  }

  return normalized === 'bg-de' || normalized === 'de-bg' ? normalized : null;
};

BgDeApp.getLanguageDirection = function() {
  if (window.languageToggle && typeof window.languageToggle.getDirection === 'function') {
    return window.languageToggle.getDirection();
  }

  const stored =
    localStorage.getItem('bgde:language-direction') ||
    localStorage.getItem('bgde:learning_direction');

  return BgDeApp.normalizeDirection(stored) || 'de-bg';
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
      const rawData = dataScript.textContent.trim();
      console.log('Raw data length:', rawData.length);
      console.log('Raw data preview:', rawData.substring(0, 100));
      
      const parsedData = JSON.parse(rawData);
      console.log('Parsed data type:', typeof parsedData);
      console.log('Parsed data is array:', Array.isArray(parsedData));
      console.log('Parsed data length:', parsedData.length);
      console.log('First item:', parsedData[0]);
      
      BgDeApp.practice.vocabularyData = parsedData;
    } catch (error) {
      console.error('Failed to parse practice vocabulary data:', error);
      BgDeApp.practice.vocabularyData = [];
    }
  } else {
    console.error('No practice vocabulary data script found');
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
  
  const currentCard = BgDeApp.practice.sessionCards[BgDeApp.practice.currentIndex];
  if (!currentCard) {
    console.error('No current card found at index:', BgDeApp.practice.currentIndex);
    return;
  }
  
  BgDeApp.practice.currentCard = currentCard;
  BgDeApp.practice.isFlipped = false;
  
  const direction = BgDeApp.getLanguageDirection();
  const isReverse = direction === 'de-bg';
  const frontText = isReverse ? currentCard.translation : currentCard.word;
  const backText = isReverse ? currentCard.word : currentCard.translation;
  
  console.log('Displaying card:', {
    word: currentCard.word,
    translation: currentCard.translation,
    frontText: frontText,
    backText: backText
  });
  
  const currentWord = document.getElementById('current-word');
  const currentTranslation = document.getElementById('current-translation');
  const currentNotes = document.getElementById('current-notes');
  const wordLevel = document.getElementById('word-level');
  const wordCategory = document.getElementById('word-category');
  
  if (currentWord) {
    currentWord.textContent = frontText || 'No word';
    console.log('Set current word to:', frontText);
  }
  if (currentTranslation) {
    currentTranslation.textContent = backText || 'No translation';
    console.log('Set translation to:', backText);
  }
  if (currentNotes) {
    currentNotes.textContent = currentCard.notes || '';
    currentNotes.style.display = currentCard.notes ? 'block' : 'none';
  }
  if (wordLevel) wordLevel.textContent = currentCard.level || 'A1';
  if (wordCategory) wordCategory.textContent = currentCard.category || '';
  
  const flashcard = document.getElementById('flashcard');
  const flashcardFront = document.getElementById('flashcard-front');
  const flashcardBack = document.getElementById('flashcard-back');
  const showAnswerBtn = document.getElementById('show-answer');
  const responseButtons = document.getElementById('response-buttons');
  
  // Reset card to front side
  if (flashcardFront) flashcardFront.style.display = 'block';
  if (flashcardBack) flashcardBack.style.display = 'none';
  if (showAnswerBtn) {
    showAnswerBtn.style.display = 'block';
    showAnswerBtn.classList.remove('hidden');
  }
  if (responseButtons) {
    responseButtons.style.display = 'none';
    responseButtons.classList.add('hidden');
  }
};

// Show answer (flip card)
BgDeApp.showAnswer = function() {
  if (BgDeApp.practice.isFlipped) return;
  
  BgDeApp.practice.isFlipped = true;
  
  const flashcardFront = document.getElementById('flashcard-front');
  const flashcardBack = document.getElementById('flashcard-back');
  const showAnswerBtn = document.getElementById('show-answer');
  const responseButtons = document.getElementById('response-buttons');
  
  // Hide front, show back
  if (flashcardFront) flashcardFront.style.display = 'none';
  if (flashcardBack) flashcardBack.style.display = 'block';
  
  // Hide show answer button, show response buttons
  if (showAnswerBtn) showAnswerBtn.style.display = 'none';
  if (responseButtons) {
    responseButtons.style.display = 'flex';
    responseButtons.classList.remove('hidden');
  }
  
  console.log('Card flipped - showing answer');
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
    console.log('Initializing practice session...');
    
    // Bind event listeners directly without data initialization
    const showAnswerBtn = document.getElementById('show-answer');
    if (showAnswerBtn) {
      showAnswerBtn.addEventListener('click', function() {
        console.log('Show answer clicked');
        BgDeApp.showAnswer();
      });
    }
    
    const correctBtn = document.getElementById('correct-btn');
    const incorrectBtn = document.getElementById('incorrect-btn');
    
    if (correctBtn) {
      correctBtn.addEventListener('click', function() {
        console.log('Correct button clicked');
        BgDeApp.gradeAnswer(true);
      });
    }
    
    if (incorrectBtn) {
      incorrectBtn.addEventListener('click', function() {
        console.log('Incorrect button clicked');
        BgDeApp.gradeAnswer(false);
      });
    }
    
    console.log('Event listeners bound for static content test');
  }
});
