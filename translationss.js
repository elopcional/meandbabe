
const translations = {

    // ENGLISH
    en: {

        home: "Home – Our Little World",
        story: "Our Love Story",
        memories: "Memories & Gallery",
        letters: "Love Letters",
        dreams: "Our Dreams & Bucket List",
        faith: "Faith & Prayers",
        dates: "Our Special Dates",
        playlist: "Our Playlist",
        questions: "Questions for Two",

        mainTitle: "Me+Babe{Raul&Sua}=Eternal (❤️)",

        subtitle: "A little world made for two",

        welcome: "Welcome to our little corner of the world.",

        button: "Click Here To Know More About Us"

    },


    // KOREAN
    ko: {

        home: "홈 – 우리만의 작은 세상",
        story: "우리의 사랑 이야기",
        memories: "추억과 갤러리",
        letters: "사랑의 편지",
        dreams: "우리의 꿈과 버킷리스트",
        faith: "믿음과 기도",
        dates: "우리의 특별한 날",
        playlist: "우리의 플레이리스트",
        questions: "우리 둘을 위한 질문",

        mainTitle: "Me+Babe{Raul&Sua}=영원 (❤️)",

        subtitle: "두 사람을 위한 작은 세상",

        welcome: "우리만의 작은 세상에 오신 것을 환영합니다.",

        button: "우리에 대해 더 알아보려면 여기를 클릭하세요"

    },


    // SPANISH
    es: {

        home: "Inicio – Nuestro pequeño mundo",
        story: "Nuestra historia de amor",
        memories: "Recuerdos y galería",
        letters: "Cartas de amor",
        dreams: "Nuestros sueños y lista de deseos",
        faith: "Fe y oraciones",
        dates: "Nuestras fechas especiales",
        playlist: "Nuestra lista de reproducción",
        questions: "Preguntas para dos",

        mainTitle: "Me+Babe{Raul&Sua}=Eterno (❤️)",

        subtitle: "Un pequeño mundo creado para dos",

        welcome: "Bienvenidos a nuestro pequeño rincón del mundo.",

        button: "Haz clic aquí para conocernos mejor"

    }

};


// FUNCTION TO CHANGE LANGUAGE

function changeLanguage(language) {

    // Find all elements that need translation

    document.querySelectorAll("[data-translate]").forEach(element => {

        const key = element.getAttribute("data-translate");

        if (translations[language] &&
            translations[language][key] !== undefined) {

            element.textContent = translations[language][key];

        }

    });


    // Update the HTML language

    document.documentElement.lang = language;


    // Save the selected language

    localStorage.setItem("selectedLanguage", language);

}



// RESTORE THE PREVIOUSLY SELECTED LANGUAGE

document.addEventListener("DOMContentLoaded", function() {

    const savedLanguage = localStorage.getItem("selectedLanguage") || "en";

    const languageSelect = document.getElementById("languageSelect");

    if (languageSelect) {

        languageSelect.value = savedLanguage;

    }

    changeLanguage(savedLanguage);

});





// COMMENT SYSTEM

const commentForm = document.getElementById("commentForm");
const commentsList = document.getElementById("commentsList");

let comments = JSON.parse(localStorage.getItem("ourComments")) || [];

function displayComments() {

    commentsList.innerHTML = "";

    comments.forEach((comment, index) => {

        const card = document.createElement("div");
        card.className = "comment-card";

        const name = document.createElement("h4");
        name.textContent = comment.name;

        const message = document.createElement("p");
        message.textContent = comment.message;

        const date = document.createElement("small");
        date.textContent = comment.date;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => deleteComment(index));

        card.append(name, message, date, deleteButton);
        commentsList.appendChild(card);

    });

}

if (commentForm) {

    commentForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const name = document.getElementById("commentName").value.trim();
        const message = document.getElementById("commentText").value.trim();

        if (!name || !message) return;

        comments.push({
            name: name,
            message: message,
            date: new Date().toLocaleString()
        });

        localStorage.setItem("ourComments", JSON.stringify(comments));

        commentForm.reset();

        displayComments();

    });

}

function deleteComment(index) {

    comments.splice(index, 1);

    localStorage.setItem("ourComments", JSON.stringify(comments));

    displayComments();

}

displayComments();


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCsuvpY___cUsNOy8jMlxWUeDTYAXP0fPw",
  authDomain: "meandbabe-faf4e.firebaseapp.com",
  projectId: "meandbabe-faf4e",
  storageBucket: "meandbabe-faf4e.firebasestorage.app",
  messagingSenderId: "354205546132",
  appId: "1:354205546132:web:7034eda01f82a384ea2681",
  measurementId: "G-TDWC3C72JY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

