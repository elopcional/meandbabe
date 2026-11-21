
document.addEventListener("DOMContentLoaded", function () {

    const galleryGrid = document.getElementById("galleryGrid");

    const lightbox = document.getElementById("lightbox");

    const lightboxContent = document.getElementById("lightboxContent");

    const lightboxCaption = document.getElementById("lightboxCaption");

    const closeButton = document.getElementById("closeLightbox");

    const previousButton = document.getElementById("previousImage");

    const nextButton = document.getElementById("nextImage");

    let galleryImages = [];

    let currentImage = 0;


    // ==================================
    // GET VISIBLE GALLERY IMAGES
    // ==================================

    function getGalleryImages() {

        return Array.from(
            galleryGrid.querySelectorAll(".gallery-item img")
        ).filter(img => {

            const card = img.closest(".gallery-item");

            return card &&
                   !card.hidden &&
                   card.style.display !== "none";

        });

    }


    // ==================================
    // OPEN SELECTED IMAGE
    // ==================================

    function openLightbox(index) {

        galleryImages = getGalleryImages();

        if (!galleryImages.length) return;

        currentImage = index;

        lightbox.classList.add("active");

        document.body.style.overflow = "hidden";

        displayImage();

    }


    // ==================================
    // DISPLAY ENLARGED IMAGE
    // ==================================

    function displayImage() {

        const selectedImage = galleryImages[currentImage];

        if (!selectedImage) return;

        lightboxContent.innerHTML = "";

        const enlargedImage = document.createElement("img");

        enlargedImage.src = selectedImage.currentSrc || selectedImage.src;

        enlargedImage.alt = selectedImage.alt;

        lightboxContent.appendChild(enlargedImage);


        // Get original caption

        const card = selectedImage.closest(".gallery-item");

        const title = card.querySelector(".image-caption h3");

        const description = card.querySelector(".image-caption p");

        lightboxCaption.textContent = [
            title ? title.textContent.trim() : "",
            description ? description.textContent.trim() : ""
        ].filter(Boolean).join(" — ");

    }


    // ==================================
    // PREVIOUS AND NEXT IMAGES
    // ==================================

    function changeImage(direction) {

        galleryImages = getGalleryImages();

        if (!galleryImages.length) return;

        currentImage += direction;

        if (currentImage >= galleryImages.length) {
            currentImage = 0;
        }

        if (currentImage < 0) {
            currentImage = galleryImages.length - 1;
        }

        displayImage();

    }


    // ==================================
    // CLOSE LIGHTBOX
    // ==================================

    function closeLightbox() {

        lightbox.classList.remove("active");

        lightboxContent.innerHTML = "";

        lightboxCaption.textContent = "";

        document.body.style.overflow = "";

    }


    // ==================================
    // CLICK GALLERY IMAGE
    // ==================================

    galleryGrid.addEventListener("click", function (event) {

        const clickedImage = event.target.closest(".gallery-item img");

        if (!clickedImage) return;

        galleryImages = getGalleryImages();

        const index = galleryImages.indexOf(clickedImage);

        if (index !== -1) {
            openLightbox(index);
        }

    });


    // ==================================
    // BUTTONS
    // ==================================

    closeButton.addEventListener("click", closeLightbox);

    previousButton.addEventListener("click", function () {
        changeImage(-1);
    });

    nextButton.addEventListener("click", function () {
        changeImage(1);
    });


    // ==================================
    // CLICK OUTSIDE IMAGE TO CLOSE
    // ==================================

    lightbox.addEventListener("click", function (event) {

        if (event.target === lightbox) {
            closeLightbox();
        }

    });


    // ==================================
    // KEYBOARD CONTROLS
    // ==================================

    document.addEventListener("keydown", function (event) {

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

});
