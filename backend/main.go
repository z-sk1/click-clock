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

var cachedTimezones []string
var lastCacheTime time.Time

var client = &http.Client{
	Timeout: 60 * time.Second,
	Transport: &http.Transport{
		TLSHandshakeTimeout: 30 * time.Second,
		ForceAttemptHTTP2:   false,
	},
}

func init() {
	fmt.Println("Fetching timezone list...")
	zones, err := getTimezones()
	if err != nil {
		log.Println("Failed to fetch timezones:", err)
	} else {
		cachedTimezones = zones
		lastCacheTime = time.Now()
		fmt.Printf("Loaded %d timezones\n", len(cachedTimezones))
	}

	go func() {
		for {
			fmt.Println("Refreshing timezone list...")
			zones, err := getTimezones()
			if err != nil {
				log.Println("Failed to refresh timezones:", err)
			} else {
				cachedTimezones = zones
				lastCacheTime = time.Now()
				fmt.Printf("Loaded %d timezones\n", len(cachedTimezones))
			}

			time.Sleep(24 * time.Hour) // wait 24h before refreshing again
		}
	}()
}

func main() {
	http.HandleFunc("/time", timeHandler)
	fmt.Println("Time server running on :8081")
	fmt.Println("Press CTRL+C to exit")
	log.Fatal(http.ListenAndServe(":8081", nil))
}

func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

// what timeAPI returns
type timeAPI struct {
	Year        int     `json:"year"`
	Month       int     `json:"month"`
	Day         int     `json:"day"`
	Hour        int     `json:"hour"`
	Minute      int     `json:"minute"`
	Second      int     `json:"seconds"`
	Millisecond int     `json:"milliSeconds"`
	DateTime    string  `json:"dateTime"`
	TimeZone    string  `json:"timeZone"`
	UTCOffset   *string `json:"utcOffset"`
}

// what the server will return to client
type timeResponse struct {
	Time      string `json:"time"`         // HH:MM
	Timezone  string `json:"timezone"`     // e.g. Asia/Dubai
	UTCOffset string `json:"utc_offset"`   // e.g. +04:00
	ISO       string `json:"iso_datetime"` // full ISO timestamp
	Date      string
}

func getTimezones() ([]string, error) {
	if time.Since(lastCacheTime) < 24*time.Hour && cachedTimezones != nil {
		return cachedTimezones, nil
	}

	req, err := http.NewRequest("GET", "https://timeapi.io/api/TimeZone/AvailableTimeZones", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "curl/7.81.0")

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var zones []string
	if err := json.NewDecoder(resp.Body).Decode(&zones); err != nil {
		return nil, err
	}

	cachedTimezones = zones
	lastCacheTime = time.Now()

	fmt.Printf("Loaded %d timezones", len(cachedTimezones))

	return zones, nil
}

func timeHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	city := strings.Title(strings.ToLower(r.URL.Query().Get("city")))
	var tz string
	for _, t := range cachedTimezones {
		parts := strings.Split(t, "/")
		if strings.EqualFold(parts[len(parts)-1], city) {
			tz = t
			break
		}
	}
	if tz == "" {
		http.Error(w, fmt.Sprintf(`{"error": "city '%s' not found"}`, city), http.StatusBadRequest)
		return
	}

	// call timezone
	req, err := http.NewRequest("GET", fmt.Sprintf("https://timeapi.io/api/Time/current/zone?timeZone=%s", tz), nil)
	if err != nil {
		http.Error(w, "failed to build timezone request", http.StatusInternalServerError)
		return
	}
	req.Header.Set("User-Agent", "curl/7.81.0")

	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, "timezone request failed", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	tzBody, _ := io.ReadAll(resp.Body)

	// decode api resp into struct
	var apiResp timeAPI
	if err := json.Unmarshal(tzBody, &apiResp); err != nil {
		http.Error(w, "failed to decode timeapi response", http.StatusInternalServerError)
		return
	}

	// extract just HH:MM:SS
	clock := fmt.Sprintf("%02d:%02d", apiResp.Hour, apiResp.Minute)

	offset := ""
	if apiResp.UTCOffset != nil {
		offset = *apiResp.UTCOffset
	} else {
		loc, err := time.LoadLocation(apiResp.TimeZone)
		if err == nil {
			t := time.Now().In(loc)
			_, offsetSecs := t.Zone()
			hours := offsetSecs / 3600
			mins := (offsetSecs % 3600) / 60 // handle non-hour offsets like India (+05:30)

			sign := "+"
			if hours < 0 || mins < 0 {
				sign = "-"
				hours = -hours
				mins = -mins
			}

			offset = fmt.Sprintf("%s%02d:%02d", sign, hours, mins)
		}
	}

	dateOnly := strings.Split(apiResp.DateTime, "T")[0]

	// build and return clean response
	response := timeResponse{
		Time:      clock,
		Timezone:  apiResp.TimeZone,
		UTCOffset: offset,
		ISO:       apiResp.DateTime,
		Date:      dateOnly,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
