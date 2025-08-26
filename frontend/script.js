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
    const time = data.time;
    const date = data.Date;

    resultDiv.innerHTML = `
    <p>Time in ${cityData}:</p>
    <p>Time: ${time}</p>
    <p>Region: ${regionData}</p>
    <p>Timezone: ${timezone}</p>
    <p>Date: ${date}</p>
    <button onclick = "copyData()" id = "copyBtn">Copy</button>`
}

function copyData() {
    const resultDiv = document.getElementById("result");
    const copyBtn = document.getElementById("copyBtn");
    const city = document.getElementById("cityInput").value;
    let textToCopy = "";

    for (let node of resultDiv.childNodes) {
        if (node.nodeType === Node.ELEMENT_NODE && node.tagName === "BUTTON") {
            continue;
        }

        if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE) {
            textToCopy += node.textContent;
        }
    }

    navigator.clipboard.writeText(textToCopy.trim())
        .then(() => {
            copyBtn.innerText = "Copied!";
            setTimeout(() => {copyBtn.innerText = "Copy"}, 3000);
        })
        .catch(err => {
            alert("Failed to copy! Error: ", err);
        });
}

function fetchTime() {
    const city = document.getElementById("cityInput").value;
    const resultDiv = document.getElementById("result");

    if (!city) {
        alert("Please enter a city name.");
        return;
    }

    fetch(`https://clickclock-service.onrender.com/time?city=${encodeURIComponent(city)}`)
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