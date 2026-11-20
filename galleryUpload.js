
import { supabase } from "./supaBase.js";

// Check supabase initialization
console.log("supabase client initialized:", !!supabase);

// Find gallery elements in HTML
const imageUpload = document.getElementById("imageUpload");
const galleryContainer = document.getElementById("galleryContainer");

// Test supabase connection
async function testConnection() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
        console.error("supabase error:", error.message);
        return;
    }

    console.log("supabase connection successful!");
    console.log("Session:", data.session);
}

testConnection();

// Check gallery elements
if (!imageUpload || !galleryContainer) {
    console.error("Gallery HTML elements not found!");
} else {

    // Display selected images and videos temporarily
    imageUpload.addEventListener("change", function () {

        const files = Array.from(this.files);

        files.forEach(file => {

            const fileURL = URL.createObjectURL(file);

            const galleryItem = document.createElement("div");
            galleryItem.classList.add("gallery-item");

            if (file.type.startsWith("image/")) {

                const img = document.createElement("img");
                img.src = fileURL;
                img.alt = file.name;

                galleryItem.appendChild(img);

            } else if (file.type.startsWith("video/")) {

                const video = document.createElement("video");
                video.src = fileURL;
                video.controls = true;

                galleryItem.appendChild(video);
            }

            galleryContainer.appendChild(galleryItem);

        });

        // Allow selecting the same file again
        this.value = "";

    });
}
