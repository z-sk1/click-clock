package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"
)

func main() {
	http.HandleFunc("/time", timeHandler)
	fmt.Println("Time server running on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

// what WorldTimeAPI returns
type worldTimeAPI struct {
	DateTime  string `json:"datetime"`
	TimeZone  string `json:"timezone"`
	UTCOffset string `json:"utc_offset"`
}

// what the server will return to client
type timeResponse struct {
	Time      string `json:"time"`         // HH:MM:SS
	Timezone  string `json:"timezone"`     // e.g. Asia/Dubai
	UTCOffset string `json:"utc_offset"`   // e.g. +04:00
	ISO       string `json:"iso_datetime"` // full ISO timestamp
}

func extractClock(iso string) (string, error) {
	if t, err := time.Parse(time.RFC3339Nano, iso); err == nil {
		return t.Format("15:04:05"), nil
	}
	if t, err := time.Parse(time.RFC3339, iso); err == nil {
		return t.Format("15:04:05"), nil
	}
	return "", fmt.Errorf("could not parse datetime")
}

func timeHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	resp, err := http.Get("http://worldtimeapi.org/api/timezone")
	if err != nil {
		http.Error(w, "Failed to fetch time:", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	var timezones []string
	json.NewDecoder(resp.Body).Decode(&timezones)

	city := strings.Title(strings.ToLower(r.URL.Query().Get("city")))
	var tz string
	for _, t := range timezones {
		parts := strings.Split(t, "/")
		if len(parts) == 2 && strings.EqualFold(parts[len(parts)-1], city) {
			tz = t
			break
		}
	}
	if tz == "" {
		http.Error(w, fmt.Sprintf(`{"error": "city '%s' not found"}`, city), http.StatusBadRequest)
		return
	}

	// call timezone
	resp2, err := http.Get(fmt.Sprintf("http://worldtimeapi.org/api/timezone/%s", tz))
	if err != nil {
		http.Error(w, "timezone request failed", http.StatusInternalServerError)
		return
	}
	defer resp2.Body.Close()

	tzBody, _ := io.ReadAll(resp2.Body)

	// decode api resp into struct
	var apiResp worldTimeAPI
	if err := json.Unmarshal(tzBody, &apiResp); err != nil {
		http.Error(w, "failed to decode worldtimeapi response", http.StatusInternalServerError)
		return
	}

	// extract just HH:MM:SS
	clock, err := extractClock(apiResp.DateTime)
	if err != nil {
		http.Error(w, "failed to parse time", http.StatusInternalServerError)
		return
	}

	// build and return clean response
	response := timeResponse{
		Time:      clock,
		Timezone:  apiResp.TimeZone,
		UTCOffset: apiResp.UTCOffset,
		ISO:       apiResp.DateTime,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
