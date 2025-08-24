document.getElementById("cityInput").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        fetchTime();
    }
});

function updateDisplay(data) {
    const resultDiv = document.getElementById("result");

    const parts = data.timezone.split("/"); // ["Asia", "Dubai"]
    const regionData = parts[0];            // "Asia"
    const cityData = parts[1];              // "Dubai"

    // Build the UTC string
    const timezone = "UTC" + data.utc_offset; // "UTC+04:00"

    resultDiv.innerHTML = `
    <p>Time in ${cityData}:</p>
    <p>Time: ${data.time}</p>
    <p>Region: ${regionData}</p>
    <p>Timezone: ${timezone}</p>
    <p>Date: ${data.Date}</p>`
}

function fetchTime() {
    const city = document.getElementById("cityInput").value;
    const resultDiv = document.getElementById("result");

    if (!city) {
        alert("Please enter a city name.");
        return;
    }

    fetch(`http://localhost:8080/time?city=${encodeURIComponent(city)}`)
        .then(response => {
            if (!response.ok) {
                return response.text().then(errorText => {
                    throw new Error(errorText || "Network connection was not ok")
                });
            }
            return response.json();
        })
        .then(data => {
            updateDisplay(data);
        })
        .catch(error => {
            alert("Error: " + error.message);
            console.error("Fetch error:", error);
        });
}