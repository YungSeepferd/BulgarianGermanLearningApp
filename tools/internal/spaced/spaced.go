package spaced

import (
	"math"
	"time"

	"github.com/dinz/BulgarianApp-Fresh/tools/internal/models"
)

// CalculateNextReview implements the SM-2 spaced repetition algorithm
func CalculateNextReview(correct bool, state models.ReviewState) (time.Time, models.ReviewState) {
	newState := state
	
	// Initialize quality score (5 for correct, 2 for incorrect)
	var quality float64
	if correct {
		quality = 5.0
	} else {
		quality = 2.0
	}
	
	// SM-2 algorithm logic
	if quality < 3 {
		// Incorrect answer - reset repetitions and interval
		newState.Repetitions = 0
		newState.Interval = 1
	} else {
		// Correct answer - update interval based on repetitions
		newState.Repetitions++
		
		switch newState.Repetitions {
		case 1:
			newState.Interval = 1
		case 2:
			newState.Interval = 6
		default:
			// For subsequent reviews, multiply by ease factor
			newState.Interval = int(math.Round(float64(newState.Interval) * newState.EaseFactor))
		}
	}
	
	// Update ease factor (bounded between 1.3 and 2.5)
	newState.EaseFactor = newState.EaseFactor + (0.1 - (5.0-quality)*(0.08+(5.0-quality)*0.02))
	if newState.EaseFactor < 1.3 {
		newState.EaseFactor = 1.3
	}
	
	// Calculate next review date (current time + interval days)
	nextReview := time.Now().AddDate(0, 0, newState.Interval)
	newState.NextReview = &nextReview
	
	return nextReview, newState
}

// IsDue checks if an item is due for review
func IsDue(state models.ReviewState) bool {
	if state.NextReview == nil {
		return true // New items are always due
	}
	return time.Now().After(*state.NextReview)
}

// GetDueItems filters items that are due for review
func GetDueItems(vocabulary []models.VocabularyItem, reviewStates map[string]models.ReviewState) []models.VocabularyItem {
	var dueItems []models.VocabularyItem
	
	for _, item := range vocabulary {
		state, exists := reviewStates[item.Word]
		if !exists {
			state = models.NewReviewState()
		}
		
		if IsDue(state) {
			dueItems = append(dueItems, item)
		}
	}
	
	return dueItems
}
