
import { initializeApp } from
    "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
} from
    "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp
} from
    "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject
} from
    "https://www.gstatic.com/firebasejs/13.2.0/firebase-storage.js";


// ========================================
// 1. YOUR FIREBASE CONFIGURATION
// ========================================

const firebaseConfig = {

    apiKey: "YOUR_API_KEY",

    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",

    projectId: "YOUR_PROJECT_ID",

    storageBucket: "YOUR_STORAGE_BUCKET",

    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",

    appId: "YOUR_APP_ID"

};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const storage = getStorage(app);


// ========================================
// 2. HTML ELEMENTS
// ========================================

const loginForm = document.getElementById("loginForm");

const emailInput = document.getElementById("emailInput");

const passwordInput = document.getElementById("passwordInput");

const createAccountButton =
    document.getElementById("createAccount");

const signOutButton =
    document.getElementById("signOut");

const authMessage =
    document.getElementById("authMessage");

const imageUpload =
    document.getElementById("imageUpload");

const memoryCategory =
    document.getElementById("memoryCategory");

const uploadStatus =
    document.getElementById("uploadStatus");

const uploadProgress =
    document.getElementById("uploadProgress");

const galleryGrid =
    document.getElementById("galleryGrid");

const emptyMessage =
    document.getElementById("emptyMessage");

const filterButtons =
    document.querySelectorAll(".filter-btn");


// ========================================
// 3. APPLICATION STATE
// ========================================

let currentUser = null;

let allMemories = [];

let activeFilter = "all";

let unsubscribeMemories = null;


// ========================================
// 4. LOGIN
// ========================================

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email = emailInput.value.trim();

    const password = passwordInput.value;

    try {

        authMessage.textContent = "Signing in...";

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        authMessage.textContent = "Welcome back ❤️";

    } catch (error) {

        console.error(error);

        authMessage.textContent =
            "Login failed: " + error.message;

    }

});


// ========================================
// 5. CREATE ACCOUNT
// ========================================

createAccountButton.addEventListener("click", async () => {

    const email = emailInput.value.trim();

    const password = passwordInput.value;

    if (!email || !password) {

        authMessage.textContent =
            "Enter your email and password first.";

        return;

    }

    if (password.length < 6) {

        authMessage.textContent =
            "Your password must contain at least 6 characters.";

        return;

    }

    try {

        authMessage.textContent = "Creating your account...";

        await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        authMessage.textContent =
            "Account created successfully ❤️";

    } catch (error) {

        console.error(error);

        authMessage.textContent =
            "Account creation failed: " + error.message;

    }

});


// ========================================
// 6. SIGN OUT
// ========================================

signOutButton.addEventListener("click", async () => {

    await signOut(auth);

});


// ========================================
// 7. AUTHENTICATION STATE
// ========================================

onAuthStateChanged(auth, (user) => {

    currentUser = user;

    if (unsubscribeMemories) {

        unsubscribeMemories();

        unsubscribeMemories = null;

    }

    if (user) {

        authMessage.textContent =
            "Signed in as " + user.email;

        loginForm.hidden = true;

        createAccountButton.hidden = true;

        signOutButton.hidden = false;

        imageUpload.disabled = false;

        loadMemories();

    } else {

        authMessage.textContent =
            "Please sign in to access our memories.";

        loginForm.hidden = false;

        createAccountButton.hidden = false;

        signOutButton.hidden = true;

        galleryGrid.replaceChildren();

        emptyMessage.hidden = false;

        uploadStatus.textContent = "";

        imageUpload.disabled = true;

        allMemories = [];

    }

});


// ========================================
// 8. UPLOAD IMAGES AND VIDEOS
// ========================================

imageUpload.addEventListener("change", async (event) => {

    if (!currentUser) {

        alert("Please sign in first.");

        return;

    }

    const files = Array.from(event.target.files);

    const category = memoryCategory.value;

    if (!files.length) return;

    for (const file of files) {

        const isImage = file.type.startsWith("image/");

        const isVideo = file.type.startsWith("video/");

        if (!isImage && !isVideo) {

            uploadStatus.textContent =
                "Only images and videos are supported.";

            continue;

        }

        // Maximum file size: 100 MB
        if (file.size > 100 * 1024 * 1024) {

            uploadStatus.textContent =
                file.name + " is larger than 100 MB.";

            continue;

        }

        // Store videos in the Videos category
        const selectedCategory = isVideo ? "videos" : category;

        const safeName = file.name.replace(
            /[^a-zA-Z0-9._-]/g,
            "_"
        );

        const filePath =
            `memories/${currentUser.uid}/${crypto.randomUUID()}_${safeName}`;

        const storageReference = ref(storage, filePath);

        try {

            uploadStatus.textContent =
                "Uploading " + file.name + "...";

            uploadProgress.hidden = false;

            uploadProgress.value = 0;

            const uploadTask = uploadBytesResumable(
                storageReference,
                file,
                {
                    contentType: file.type
                }
            );

            await new Promise((resolve, reject) => {

                uploadTask.on(

                    "state_changed",

                    (snapshot) => {

                        const percentage =
                            (snapshot.bytesTransferred /
                            snapshot.totalBytes) * 100;

                        uploadProgress.value = percentage;

                    },

                    reject,

                    resolve

                );

            });

            const downloadURL =
                await getDownloadURL(uploadTask.snapshot.ref);

            // Save memory information in Firestore
            await addDoc(collection(db, "memories"), {

                title: file.name,

                url: downloadURL,

                storagePath: filePath,

                type: isVideo ? "video" : "image",

                category: selectedCategory,

                ownerUid: currentUser.uid,

                ownerEmail: currentUser.email,

                createdAt: serverTimestamp()

            });

            uploadStatus.textContent =
                file.name + " uploaded successfully ❤️";

        } catch (error) {

            console.error(error);

            uploadStatus.textContent =
                "Upload failed: " + error.message;

        }

    }

    uploadProgress.hidden = true;

    imageUpload.value = "";

});


// ========================================
// 9. LOAD MEMORIES FROM FIRESTORE
// ========================================

function loadMemories() {

    const memoriesQuery = query(
        collection(db, "memories"),
        orderBy("createdAt", "desc")
    );

    unsubscribeMemories = onSnapshot(
        memoriesQuery,

        (snapshot) => {

            allMemories = snapshot.docs.map(item => ({

                id: item.id,

                ...item.data()

            }));

            renderGallery();

        },

        (error) => {

            console.error(error);

            uploadStatus.textContent =
                "Could not load memories: " + error.message;

        }
    );

}


// ========================================
// 10. FILTER MEMORIES
// ========================================

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        filterButtons.forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");

        activeFilter = button.dataset.filter;

        renderGallery();

    });

});


// ========================================
// 11. DISPLAY MEMORIES
// ========================================

function renderGallery() {

    galleryGrid.replaceChildren();

    const memories = allMemories.filter(memory => {

        return activeFilter === "all" ||
            memory.category === activeFilter;

    });

    emptyMessage.hidden = memories.length > 0;

    memories.forEach(memory => {

        const card = document.createElement("article");

        card.className = "gallery-item";

        card.dataset.category = memory.category;

        // Display image or video
        let media;

        if (memory.type === "video") {

            media = document.createElement("video");

            media.controls = true;

            media.preload = "metadata";

            media.playsInline = true;

        } else {

            media = document.createElement("img");

            media.alt = memory.title;

            media.loading = "lazy";

        }

        media.src = memory.url;

        media.className = "firebase-media";

        const caption = document.createElement("div");

        caption.className = "image-caption";

        const title = document.createElement("h3");

        title.textContent = memory.title;

        const category = document.createElement("p");

        category.textContent =
            memory.category.replace(/^\w/, letter =>
                letter.toUpperCase()
            );

        caption.append(title, category);

        // Delete button
        const deleteButton = document.createElement("button");

        deleteButton.className = "delete-memory";

        deleteButton.textContent = "Delete Memory";

        deleteButton.addEventListener("click", () => {

            deleteMemory(memory);

        });

        // Comment section
        const commentSection = document.createElement("div");

        commentSection.className = "comment-section";

        const commentHeading = document.createElement("h4");

        commentHeading.textContent = "Our Comments ❤️";

        const commentList = document.createElement("div");

        commentList.className = "comment-list";

        const commentForm = document.createElement("form");

        commentForm.className = "comment-form";

        const commentInput = document.createElement("input");

        commentInput.type = "text";

        commentInput.placeholder = "Write a lovely comment...";

        commentInput.maxLength = 500;

        commentInput.required = true;

        const commentButton = document.createElement("button");

        commentButton.type = "submit";

        commentButton.textContent = "Post";

        commentForm.append(commentInput, commentButton);

        commentForm.addEventListener("submit", async (event) => {

            event.preventDefault();

            const text = commentInput.value.trim();

            if (!text || !currentUser) return;

            try {

                await addDoc(
                    collection(db, "memories", memory.id, "comments"),
                    {

                        text: text,

                        author: currentUser.email,

                        uid: currentUser.uid,

                        createdAt: serverTimestamp()

                    }
                );

                commentInput.value = "";

                await loadComments(memory.id, commentList);

            } catch (error) {

                console.error(error);

                alert("Could not save your comment.");

            }

        });

        commentSection.append(
            commentHeading,
            commentList,
            commentForm
        );

        card.append(
            media,
            caption,
            deleteButton,
            commentSection
        );

        galleryGrid.appendChild(card);

        loadComments(memory.id, commentList);

    });

}


// ========================================
// 12. LOAD COMMENTS
// ========================================

async function loadComments(memoryId, commentList) {

    try {

        const commentsQuery = query(

            collection(db, "memories", memoryId, "comments"),

            orderBy("createdAt", "asc")

        );

        const snapshot = await getDocs(commentsQuery);

        commentList.replaceChildren();

        snapshot.forEach(commentDocument => {

            const comment = commentDocument.data();

            const commentCard = document.createElement("div");

            commentCard.className = "comment-item";

            const author = document.createElement("strong");

            author.textContent = comment.author || "A visitor";

            const text = document.createElement("p");

            text.textContent = comment.text;

            const date = document.createElement("small");

            date.textContent = comment.createdAt
                ? comment.createdAt.toDate().toLocaleString()
                : "Just now";

            const deleteComment = document.createElement("button");

            deleteComment.textContent = "Delete";

            deleteComment.className = "delete-comment";

            deleteComment.addEventListener("click", async () => {

                if (!confirm("Delete this comment?")) return;

                try {

                    await deleteDoc(
                        doc(
                            db,
                            "memories",
                            memoryId,
                            "comments",
                            commentDocument.id
                        )
                    );

                    await loadComments(memoryId, commentList);

                } catch (error) {

                    console.error(error);

                    alert("Could not delete the comment.");

                }

            });

            commentCard.append(
                author,
                text,
                date,
                deleteComment
            );

            commentList.appendChild(commentCard);

        });

    } catch (error) {

        console.error("Comment loading error:", error);

    }

}


// ========================================
// 13. DELETE A MEMORY
// ========================================

async function deleteMemory(memory) {

    if (!confirm(
        "Are you sure you want to delete this memory and its comments?"
    )) return;

    try {

        // Delete comments first
        const commentsSnapshot = await getDocs(
            collection(db, "memories", memory.id, "comments")
        );

        for (const comment of commentsSnapshot.docs) {

            await deleteDoc(comment.ref);

        }

        // Delete original file from Storage
        await deleteObject(
            ref(storage, memory.storagePath)
        );

        // Delete memory document from Firestore
        await deleteDoc(
            doc(db, "memories", memory.id)
        );

        uploadStatus.textContent =
            "Memory and its comments deleted successfully.";

    } catch (error) {

        console.error(error);

        alert("Could not delete memory: " + error.message);

    }

}


import { db, storage } from "./firebase.js";

console.log("Gallery Firebase services loaded!");