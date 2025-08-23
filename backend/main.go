package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
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

func timeHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)

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

	w.Header().Set("Content-Type", "application/json")
	w.Write(tzBody)
}
