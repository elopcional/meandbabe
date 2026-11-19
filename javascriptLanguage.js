
/* ==========================================
   LANGUAGE DROPDOWN + TRANSLATION SYSTEM
   English | Korean | Spanish
========================================== */

// LANGUAGE NAMES

const languageNames = {
    en: "English",
    ko: "한국어",
    es: "Español"
};


// CHANGE WEBSITE LANGUAGE

function changeLanguage(language) {

    // Check whether the selected language exists.
    if (!Object.prototype.hasOwnProperty.call(translations, language)) {
        language = "en";
    }

    // Translate all elements containing data-translate.
    document.querySelectorAll("[data-translate]").forEach(element => {

        const key = element.getAttribute("data-translate");

        const translatedText = translations[language][key];

        if (translatedText !== undefined) {

            element.textContent = translatedText;

        } else {

            console.warn(
                `Missing '${language}' translation for key: ${key}`
            );

        }

    });

    // Update document language.
    document.documentElement.lang = language;

    // Save selected language.
    localStorage.setItem("selectedLanguage", language);

    // Update dropdown button.
    const currentLanguage = document.getElementById("currentLanguage");

    if (currentLanguage) {
        currentLanguage.textContent = languageNames[language];
    }

    // Highlight selected language.
    document.querySelectorAll(".language-option").forEach(option => {

        const isSelected = option.dataset.lang === language;

        option.classList.toggle("selected", isSelected);

        option.setAttribute("aria-pressed", String(isSelected));

    });

    // Close dropdown.
    const languageWrapper = document.querySelector(".language-wrapper");

    const languageBtn = document.getElementById("languageBtn");

    languageWrapper?.classList.remove("active");

    languageBtn?.setAttribute("aria-expanded", "false");

}


// INITIALIZE DROPDOWN

function initializeLanguageDropdown() {

    const languageWrapper = document.querySelector(".language-wrapper");

    const languageBtn = document.getElementById("languageBtn");


    // OPEN AND CLOSE DROPDOWN

    if (languageWrapper && languageBtn) {

        languageBtn.addEventListener("click", () => {

            const isOpen = languageWrapper.classList.toggle("active");

            languageBtn.setAttribute("aria-expanded", String(isOpen));

        });

    }


    // SELECT LANGUAGE

    document.querySelectorAll(".language-option[data-lang]").forEach(option => {

        option.addEventListener("click", () => {

            changeLanguage(option.dataset.lang);

        });

    });


    // CLOSE WHEN CLICKING OUTSIDE

    document.addEventListener("click", event => {

        if (languageWrapper && !languageWrapper.contains(event.target)) {

            languageWrapper.classList.remove("active");

            languageBtn?.setAttribute("aria-expanded", "false");

        }

    });


    // CLOSE WITH ESCAPE KEY

    document.addEventListener("keydown", event => {

        if (event.key === "Escape" && languageWrapper) {

            languageWrapper.classList.remove("active");

            languageBtn?.setAttribute("aria-expanded", "false");

            languageBtn?.focus();

        }

    });


    // RESTORE SAVED LANGUAGE

    const savedLanguage = localStorage.getItem("selectedLanguage") || "en";

    changeLanguage(savedLanguage);

}


// WAIT FOR HTML TO LOAD

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeLanguageDropdown,
        { once: true }
    );

} else {

    initializeLanguageDropdown();

}
