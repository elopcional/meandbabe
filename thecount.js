
// OUR LOVE COUNTER ❤️

// IMPORTANT: Change this to your actual relationship date.
// Format: Year, Month (0 = January), Day, Hour, Minute

const relationshipStartDate = new Date(2026, 1, 3, 0, 0, 0);

function updateLoveCounter() {

    const now = new Date();

    const difference = now - relationshipStartDate;

    // Prevent negative time
    if (difference < 0) {
        document.getElementById("days").textContent = "0";
        document.getElementById("hours").textContent = "0";
        document.getElementById("minutes").textContent = "0";
        document.getElementById("seconds").textContent = "0";
        return;
    }

    // Calculate time
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));

    const hours = Math.floor(
        (difference / (1000 * 60 * 60)) % 24
    );

    const minutes = Math.floor(
        (difference / (1000 * 60)) % 60
    );

    const seconds = Math.floor(
        (difference / 1000) % 60
    );

    // Display results
    document.getElementById("days").textContent = days;
    document.getElementById("hours").textContent = hours;
    document.getElementById("minutes").textContent = minutes;
    document.getElementById("seconds").textContent = seconds;

    // Anniversary message
    const message = document.getElementById(
        "love-anniversary-message"
    );

    if (
        now.getMonth() === relationshipStartDate.getMonth() &&
        now.getDate() === relationshipStartDate.getDate()
    ) {
        message.textContent =
            "Happy Anniversary, My Love! ❤️ Every year with you is a blessing.";
    } else {
        message.textContent =
            "Our beautiful journey continues... Every second matters. 💕";
    }
}

// Run immediately
updateLoveCounter();

// Update every second
setInterval(updateLoveCounter, 1000);
