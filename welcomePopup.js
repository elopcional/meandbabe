// WELCOME POPUP


/* =====================================
   WELCOME POPUP FUNCTIONALITY
===================================== */



document.addEventListener("DOMContentLoaded", function () {

    const welcomePopup = document.getElementById("welcomePopup");
    const closeWelcome = document.getElementById("closeWelcome");
    const enterWebsite = document.getElementById("enterWebsite");

    // Check that all required elements exist
    if (!welcomePopup || !closeWelcome || !enterWebsite) {
        console.error("Welcome popup elements could not be found.");
        return;
    }

    // Keep the popup hidden when the page loads
    welcomePopup.classList.add("hidden");

    let popupTimer;

    // Display the popup
    function openPopup() {
        welcomePopup.classList.remove("hidden");
    }

    // Close the popup and schedule it to reopen
    function closePopup() {

        welcomePopup.classList.add("hidden");

        // Reopen the popup after 10 seconds
        clearTimeout(popupTimer);

        popupTimer = setTimeout(function () {
            openPopup();
        }, 10000);
    }

    // Show the popup for the first time after 10 seconds
    popupTimer = setTimeout(function () {
        openPopup();
    }, 10000);

    // Close using the X button
    closeWelcome.addEventListener("click", closePopup);

    // Close using Enter Our World
    enterWebsite.addEventListener("click", closePopup);

    // Close by clicking outside the popup card
    welcomePopup.addEventListener("click", function (event) {
        if (event.target === welcomePopup) {
            closePopup();
        }
    });

    // Close using the Escape key
    document.addEventListener("keydown", function (event) {
        if (
            event.key === "Escape" &&
            !welcomePopup.classList.contains("hidden")
        ) {
            closePopup();
        }
    });

});
