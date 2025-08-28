package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

// ReviewState represents the spaced repetition state for a vocabulary item
type ReviewState struct {
	ItemID         string    `json:"item_id"`
	Interval       int       `json:"interval"`
	EaseFactor     float64   `json:"ease_factor"`
	Repetitions    int       `json:"repetitions"`
	NextReview     time.Time `json:"next_review"`
	LastReview     time.Time `json:"last_review"`
	TotalReviews   int       `json:"total_reviews"`
	CorrectStreak  int       `json:"correct_streak"`
	Difficulty     float64   `json:"difficulty"`
}

// ReviewRequest represents a review submission
type ReviewRequest struct {
	ItemID string `json:"item_id"`
	Grade  int    `json:"grade"` // 0-5 scale
}

// ReviewResponse represents the response after a review
type ReviewResponse struct {
	State       ReviewState `json:"state"`
	NextReview  string      `json:"next_review_formatted"`
	Message     string      `json:"message"`
}

// StatsResponse represents user statistics
type StatsResponse struct {
	TotalItems      int     `json:"total_items"`
	DueItems        int     `json:"due_items"`
	ReviewedToday   int     `json:"reviewed_today"`
	AverageAccuracy float64 `json:"average_accuracy"`
	CurrentStreak   int     `json:"current_streak"`
	LongestStreak   int     `json:"longest_streak"`
}

// In-memory storage (in production, use a proper database)
var reviewStates = make(map[string]ReviewState)
var dailyStats = make(map[string]int) // date -> review count

func main() {
	r := mux.NewRouter()

	// API routes
	api := r.PathPrefix("/api/v1").Subrouter()
	api.HandleFunc("/review", handleReview).Methods("POST")
	api.HandleFunc("/state/{itemId}", handleGetState).Methods("GET")
	api.HandleFunc("/due", handleGetDueItems).Methods("GET")
	api.HandleFunc("/stats", handleGetStats).Methods("GET")
	api.HandleFunc("/reset/{itemId}", handleResetItem).Methods("DELETE")

	// Enable CORS
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"*"},
	})

	handler := c.Handler(r)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Spaced Repetition API server starting on port %s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}

func handleReview(w http.ResponseWriter, r *http.Request) {
	var req ReviewRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Grade < 0 || req.Grade > 5 {
		http.Error(w, "Grade must be between 0 and 5", http.StatusBadRequest)
		return
	}

	// Get or create review state
	state, exists := reviewStates[req.ItemID]
	if !exists {
		state = initReviewState(req.ItemID)
	}

	// Update state based on SM-2 algorithm
	updatedState := scheduleNext(state, req.Grade)
	reviewStates[req.ItemID] = updatedState

	// Update daily stats
	today := time.Now().Format("2006-01-02")
	dailyStats[today]++

	response := ReviewResponse{
		State:      updatedState,
		NextReview: formatNextReview(updatedState.NextReview),
		Message:    generateFeedbackMessage(req.Grade, updatedState),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func handleGetState(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	itemID := vars["itemId"]

	state, exists := reviewStates[itemID]
	if !exists {
		state = initReviewState(itemID)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(state)
}

func handleGetDueItems(w http.ResponseWriter, r *http.Request) {
	now := time.Now()
	var dueItems []string

	for itemID, state := range reviewStates {
		if state.NextReview.Before(now) || state.NextReview.Equal(now) {
			dueItems = append(dueItems, itemID)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(dueItems)
}

func handleGetStats(w http.ResponseWriter, r *http.Request) {
	now := time.Now()
	today := now.Format("2006-01-02")
	
	stats := StatsResponse{
		TotalItems:    len(reviewStates),
		ReviewedToday: dailyStats[today],
	}

	// Calculate due items
	for _, state := range reviewStates {
		if state.NextReview.Before(now) || state.NextReview.Equal(now) {
			stats.DueItems++
		}
	}

	// Calculate accuracy and streaks
	var totalAccuracy float64
	var accuracyCount int
	var maxStreak int

	for _, state := range reviewStates {
		if state.TotalReviews > 0 {
			// Estimate accuracy based on ease factor and streak
			accuracy := (state.EaseFactor - 1.3) / (2.5 - 1.3) * 100
			if accuracy > 100 {
				accuracy = 100
			}
			if accuracy < 0 {
				accuracy = 0
			}
			
			totalAccuracy += accuracy
			accuracyCount++
		}
		
		if state.CorrectStreak > maxStreak {
			maxStreak = state.CorrectStreak
		}
		if state.CorrectStreak > stats.CurrentStreak {
			stats.CurrentStreak = state.CorrectStreak
		}
	}

	if accuracyCount > 0 {
		stats.AverageAccuracy = totalAccuracy / float64(accuracyCount)
	}
	stats.LongestStreak = maxStreak

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

func handleResetItem(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	itemID := vars["itemId"]

	delete(reviewStates, itemID)
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Item reset successfully"})
}

// SM-2 Algorithm Implementation
func initReviewState(itemID string) ReviewState {
	return ReviewState{
		ItemID:         itemID,
		Interval:       1,
		EaseFactor:     2.5,
		Repetitions:    0,
		NextReview:     time.Now(),
		LastReview:     time.Time{},
		TotalReviews:   0,
		CorrectStreak:  0,
		Difficulty:     1.0,
	}
}

func scheduleNext(state ReviewState, grade int) ReviewState {
	now := time.Now()
	
	// Update counters
	state.TotalReviews++
	state.LastReview = now
	
	// Update streak
	if grade >= 3 {
		state.CorrectStreak++
	} else {
		state.CorrectStreak = 0
	}
	
	// SM-2 Algorithm
	if grade >= 3 {
		if state.Repetitions == 0 {
			state.Interval = 1
		} else if state.Repetitions == 1 {
			state.Interval = 6
		} else {
			state.Interval = int(float64(state.Interval) * state.EaseFactor)
		}
		state.Repetitions++
	} else {
		state.Repetitions = 0
		state.Interval = 1
	}
	
	// Update ease factor
	state.EaseFactor = state.EaseFactor + (0.1 - (5-float64(grade))*(0.08+(5-float64(grade))*0.02))
	if state.EaseFactor < 1.3 {
		state.EaseFactor = 1.3
	}
	
	// Calculate next review date
	state.NextReview = now.AddDate(0, 0, state.Interval)
	
	// Update difficulty based on performance
	if grade < 3 {
		state.Difficulty = state.Difficulty * 1.1
	} else if grade > 3 {
		state.Difficulty = state.Difficulty * 0.95
	}
	
	if state.Difficulty > 5.0 {
		state.Difficulty = 5.0
	}
	if state.Difficulty < 0.5 {
		state.Difficulty = 0.5
	}
	
	return state
}

func formatNextReview(nextReview time.Time) string {
	now := time.Now()
	diff := nextReview.Sub(now)
	
	if diff < 0 {
		return "Due now"
	}
	
	days := int(diff.Hours() / 24)
	if days == 0 {
		return "Due today"
	} else if days == 1 {
		return "Due tomorrow"
	} else if days < 7 {
		return fmt.Sprintf("Due in %d days", days)
	} else if days < 30 {
		weeks := days / 7
		return fmt.Sprintf("Due in %d week%s", weeks, pluralize(weeks))
	} else {
		months := days / 30
		return fmt.Sprintf("Due in %d month%s", months, pluralize(months))
	}
}

func generateFeedbackMessage(grade int, state ReviewState) string {
	switch grade {
	case 0:
		return "Don't worry, this word will come up again soon. Keep practicing!"
	case 1:
		return "Incorrect, but you're learning. This word will be reviewed again shortly."
	case 2:
		return "Close! This word needs more practice."
	case 3:
		return "Correct! This word will be reviewed again in a few days."
	case 4:
		return "Good job! You're getting comfortable with this word."
	case 5:
		return "Excellent! You know this word well."
	default:
		return "Review completed."
	}
}

func pluralize(count int) string {
	if count == 1 {
		return ""
	}
	return "s"
}
