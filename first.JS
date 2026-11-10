
const currentPage = decodeURIComponent(
    window.location.pathname.split("/").pop()
);

document.querySelectorAll("#mainNavigation .nav-link").forEach(link => {

    const linkPage = decodeURIComponent(
        link.getAttribute("href").split("/").pop()
    );

    if (linkPage === currentPage) {

        link.classList.add("active");
        link.setAttribute("aria-current", "page");

    } else {

        link.classList.remove("active");
        link.removeAttribute("aria-current");

    }

});


// Select HTML elements
const galleryGrid = document.getElementById("galleryGrid");
const filterButtons = document.querySelectorAll(".filter-btn");

const lightbox = document.getElementById("lightbox");
const lightboxContent = document.getElementById("lightboxContent");
const lightboxCaption = document.getElementById("lightboxCaption");

const closeLightbox = document.getElementById("closeLightbox");
const previousImage = document.getElementById("previousImage");
const nextImage = document.getElementById("nextImage");

const imageUpload = document.getElementById("imageUpload");
const emptyMessage = document.getElementById("emptyMessage");


// Filter gallery by category
filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove("active"));

        // Activate selected button
        button.classList.add("active");

        const selectedCategory = button.dataset.filter;

        const items = document.querySelectorAll(".gallery-item");

        items.forEach(item => {

            if (
                selectedCategory === "all" ||
                item.dataset.category === selectedCategory
            ) {
                item.style.display = "block";
            } else {
                item.style.display = "none";
            }

        });

        updateEmptyMessage();

    });

});


// Get currently visible gallery items
function getVisibleItems() {
    return [...document.querySelectorAll(".gallery-item")]
        .filter(item => item.style.display !== "none");
}


// Update empty category message
function updateEmptyMessage() {
    const visibleItems = getVisibleItems();
    emptyMessage.hidden = visibleItems.length > 0;
}


// Lightbox navigation
let currentIndex = 0;


// Open image in lightbox
function openLightbox(index) {

    const visibleItems = getVisibleItems();

    if (visibleItems.length === 0) return;

    currentIndex = index;

    const item = visibleItems[currentIndex];

    const media = item.querySelector("img, video");
    const caption = item.querySelector(".image-caption h3");

    lightboxContent.innerHTML = "";

    const preview = media.cloneNode(true);

    if (preview.tagName === "VIDEO") {
        preview.controls = true;
        preview.autoplay = true;
    }

    lightboxContent.appendChild(preview);

    lightboxCaption.textContent = caption
        ? caption.textContent
        : "A beautiful memory";

    lightbox.classList.add("show");

}


// Click gallery item
galleryGrid.addEventListener("click", event => {

    const item = event.target.closest(".gallery-item");

    if (!item) return;

    const visibleItems = getVisibleItems();
    const index = visibleItems.indexOf(item);

    openLightbox(index);

});


// Next image
nextImage.addEventListener("click", () => {

    const visibleItems = getVisibleItems();

    if (visibleItems.length === 0) return;

    currentIndex = (currentIndex + 1) % visibleItems.length;

    openLightbox(currentIndex);

});


// Previous image
previousImage.addEventListener("click", () => {

    const visibleItems = getVisibleItems();

    if (visibleItems.length === 0) return;

    currentIndex =
        (currentIndex - 1 + visibleItems.length) % visibleItems.length;

    openLightbox(currentIndex);

});


// Close lightbox
function closeViewer() {
    lightbox.classList.remove("show");
    lightboxContent.innerHTML = "";
}

closeLightbox.addEventListener("click", closeViewer);


// Close by clicking outside the image
lightbox.addEventListener("click", event => {

    if (event.target === lightbox) {
        closeViewer();
    }

});


// Keyboard controls
document.addEventListener("keydown", event => {

    if (!lightbox.classList.contains("show")) return;

    if (event.key === "Escape") {
        closeViewer();
    }

    if (event.key === "ArrowRight") {
        nextImage.click();
    }

    if (event.key === "ArrowLeft") {
        previousImage.click();
    }

});


// Add new memories from your computer
imageUpload.addEventListener("change", event => {

    const files = Array.from(event.target.files);

    files.forEach(file => {

        if (!file.type.startsWith("image/") &&
            !file.type.startsWith("video/")) {
            return;
        }

        const fileURL = URL.createObjectURL(file);

        const card = document.createElement("article");

        card.className = "gallery-item";
        card.dataset.category = file.type.startsWith("video/")
            ? "videos"
            : "everyday";

        const media = document.createElement(
            file.type.startsWith("video/") ? "video" : "img"
        );

        media.src = fileURL;

        if (media.tagName === "VIDEO") {
            media.muted = true;
            media.playsInline = true;
            media.preload = "metadata";
        } else {
            media.alt = file.name;
        }

        const caption = document.createElement("div");
        caption.className = "image-caption";

        const title = document.createElement("h3");
        title.textContent = file.name.replace(/\.[^/.]+$/, "");

        const description = document.createElement("p");
        description.textContent = "A new memory ❤️";

        caption.appendChild(title);
        caption.appendChild(description);

        card.appendChild(media);
        card.appendChild(caption);

        galleryGrid.appendChild(card);

    });

    // Show all memories after uploading
    filterButtons.forEach(btn => btn.classList.remove("active"));
    document.querySelector('[data-filter="all"]').classList.add("active");

    document.querySelectorAll(".gallery-item").forEach(item => {
        item.style.display = "block";
    });

    updateEmptyMessage();

    // Allow selecting the same file again later
    imageUpload.value = "";

});


// Initial setup
updateEmptyMessage();


// Gallery image information
const galleryImages = [
    {
        src: "images/photo1.jpg",
        caption: "Our First Memory"
    },
    {
        src: "images/photo2.jpg",
        caption: "Special Moments"
    },
    {
        src: "images/photo3.jpg",
        caption: "Our Adventures"
    }
];

// Current image position
let currentImage = 0;

// Open image
function openLightbox(index) {

    currentImage = index;

    const lightbox = document.getElementById("lightbox");

    lightbox.classList.add("active");

    displayImage();
}

// Display selected image
function displayImage() {

    const image = document.getElementById("lightbox-image");
    const caption = document.getElementById("lightbox-caption");

    image.src = galleryImages[currentImage].src;

    caption.textContent = galleryImages[currentImage].caption;
}

// Next and previous images
function changeImage(direction) {

    currentImage += direction;

    if (currentImage >= galleryImages.length) {
        currentImage = 0;
    }

    if (currentImage < 0) {
        currentImage = galleryImages.length - 1;
    }

    displayImage();
}

// Close image viewer
function closeLightbox() {

    document.getElementById("lightbox").classList.remove("active");
}

// Close with Escape and navigate with arrow keys
document.addEventListener("keydown", function(event) {

    const lightbox = document.getElementById("lightbox");

    if (!lightbox.classList.contains("active")) return;

    if (event.key === "Escape") {
        closeLightbox();
    }

    if (event.key === "ArrowRight") {
        changeImage(1);
    }

    if (event.key === "ArrowLeft") {
        changeImage(-1);
    }

});


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

