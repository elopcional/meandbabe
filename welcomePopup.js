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

    // Function to close the welcome popup
    function closePopup() {

        welcomePopup.classList.add("hidden");

        localStorage.setItem("welcomeSeen", "true");

    }

    // Close using the X button
    closeWelcome.addEventListener("click", closePopup);

    // Close using the Enter Our World button
    enterWebsite.addEventListener("click", closePopup);

    // Close when clicking outside the welcome card
    welcomePopup.addEventListener("click", function(event) {

        if (event.target === welcomePopup) {
            closePopup();
        }

    });

    // Close using the Escape key
    document.addEventListener("keydown", function(event) {

        if (event.key === "Escape") {
            closePopup();
        }

    });

    // Show popup only if visitor has not dismissed it before
    if (localStorage.getItem("welcomeSeen") === "true") {

        welcomePopup.classList.add("hidden");

    } else {

        welcomePopup.classList.remove("hidden");

    }

});
