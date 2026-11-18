
// posts.js

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const loginForm = document.getElementById("postsLoginForm");
const loginMessage = document.getElementById("postsLoginMessage");
const authStatus = document.getElementById("postsAuthStatus");
const logoutButton = document.getElementById("postsLogout");

const createSection = document.getElementById("createPostSection");
const createForm = document.getElementById("createPostForm");
const postMessage = document.getElementById("postMessage");
const publishButton = document.getElementById("publishPostButton");

const postsFeed = document.getElementById("postsFeed");

let currentUser = null;
let unsubscribePosts = null;
const commentListeners = new Map();


// Escape user-provided text before inserting it into HTML.
function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

function validURL(value) {
    try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:";
    } catch {
        return false;
    }
}

function formatDate(timestamp) {
    if (!timestamp?.toDate) return "Just now";

    return timestamp.toDate().toLocaleString();
}

function stopCommentListeners() {
    commentListeners.forEach(unsubscribe => unsubscribe());
    commentListeners.clear();
}

function stopPostsFeed() {
    if (unsubscribePosts) {
        unsubscribePosts();
        unsubscribePosts = null;
    }

    stopCommentListeners();
}


// -------------------------------
// SIGN IN AND SIGN OUT
// -------------------------------

loginForm.addEventListener("submit", async event => {
    event.preventDefault();

    const email = document.getElementById("postsEmail").value.trim();
    const password = document.getElementById("postsPassword").value;

    loginMessage.textContent = "Signing in...";

    try {
        await signInWithEmailAndPassword(auth, email, password);
        loginForm.reset();
        loginMessage.textContent = "Welcome!";
    } catch (error) {
        console.error(error);
        loginMessage.textContent =
            "Sign-in failed. Check your email and password.";
    }
});

logoutButton.addEventListener("click", async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error(error);
        loginMessage.textContent = "Could not sign out.";
    }
});


// -------------------------------
// AUTHENTICATION STATE
// -------------------------------

onAuthStateChanged(auth, user => {
    currentUser = user;

    if (user) {
        authStatus.textContent = `Signed in as ${user.email}`;
        loginForm.hidden = true;
        logoutButton.hidden = false;
        createSection.hidden = false;

        startPostsFeed();
    } else {
        authStatus.textContent = "Sign in to view and share posts.";
        loginForm.hidden = false;
        logoutButton.hidden = true;
        createSection.hidden = true;

        stopPostsFeed();

        postsFeed.textContent = "Please sign in to see your shared posts.";
    }
});


// -------------------------------
// CREATE A POST
// -------------------------------

createForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (!currentUser) {
        postMessage.textContent = "Please sign in first.";
        return;
    }

    const text = document.getElementById("postText").value.trim();
    const mediaUrl = document.getElementById("postMediaUrl").value.trim();
    const mediaType = document.getElementById("postMediaType").value;

    if (!text && !mediaUrl) {
        postMessage.textContent =
            "Write something or add an image/video URL.";
        return;
    }

    if (!["none", "image", "video"].includes(mediaType)) {
        postMessage.textContent = "Choose a valid media type.";
        return;
    }

    if (mediaUrl && !validURL(mediaUrl)) {
        postMessage.textContent = "Please enter a valid HTTP or HTTPS URL.";
        return;
    }

    if (mediaType !== "none" && !mediaUrl) {
        postMessage.textContent = "Please enter a media URL.";
        return;
    }

    if (mediaType === "none" && mediaUrl) {
        postMessage.textContent =
            "Choose Image or Video for the URL you entered.";
        return;
    }

    publishButton.disabled = true;
    postMessage.textContent = "Publishing your post...";

    try {
        await addDoc(collection(db, "posts"), {
            text,
            mediaUrl,
            mediaType,
            authorUid: currentUser.uid,
            authorEmail: currentUser.email,
            createdAt: serverTimestamp()
        });

        createForm.reset();
        postMessage.textContent = "Your post has been published! ❤️";

    } catch (error) {
        console.error("Post error:", error);
        postMessage.textContent =
            "Could not publish. Check your Firestore rules.";
    } finally {
        publishButton.disabled = false;
    }
});


// -------------------------------
// LOAD POSTS
// -------------------------------

function startPostsFeed() {
    stopPostsFeed();

    const postsQuery = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc")
    );

    unsubscribePosts = onSnapshot(postsQuery, snapshot => {
        stopCommentListeners();

        postsFeed.replaceChildren();

        if (snapshot.empty) {
            postsFeed.textContent =
                "No posts yet. Share your first moment together! ❤️";
            return;
        }

        snapshot.forEach(postDoc => {
            const post = postDoc.data();
            const card = createPostCard(postDoc.id, post);
            postsFeed.appendChild(card);
            listenToPostComments(postDoc.id);
        });

    }, error => {
        console.error("Loading posts failed:", error);
        postsFeed.textContent =
            "Could not load posts. Please check your Firestore rules.";
    });
}


// -------------------------------
// DISPLAY A POST
// -------------------------------

function createPostCard(postId, post) {
    const card = document.createElement("article");
    card.className = "post-card";

    const author = escapeHTML(post.authorEmail || "Member");
    const postText = escapeHTML(post.text || "");
    const date = escapeHTML(formatDate(post.createdAt));

    const isOwner = currentUser &&
        currentUser.uid === post.authorUid;

    let mediaHTML = "";

    if (post.mediaUrl && validURL(post.mediaUrl)) {
        const url = escapeHTML(post.mediaUrl);

        if (post.mediaType === "image") {
            mediaHTML = `
                <img class="post-media"
                     src="${url}"
                     alt="Shared memory"
                     loading="lazy">
            `;
        } else if (post.mediaType === "video") {
            mediaHTML = `
                <video class="post-media" controls preload="metadata">
                    <source src="${url}">
                    Your browser does not support video playback.
                </video>
            `;
        }
    }

    card.innerHTML = `
        <div class="post-header">
            <div class="post-avatar">❤️</div>

            <div>
                <div class="post-author">${author}</div>
                <div class="post-date">${date}</div>
            </div>

            ${isOwner ? `
                <button type="button"
                        class="btn btn-sm btn-outline-danger post-delete"
                        data-delete-post="${escapeHTML(postId)}">
                    Delete
                </button>
            ` : ""}
        </div>

        ${postText ? `<p class="post-text">${postText}</p>` : ""}

        ${mediaHTML}

        <div class="post-actions">
            <strong>Comments ❤️</strong>

            <div id="post-comments-${escapeHTML(postId)}" class="mt-3">
                Loading comments...
            </div>

            <form class="post-comment-form mt-3"
                  data-post-id="${escapeHTML(postId)}">

                <textarea name="comment"
                          class="form-control mb-2"
                          rows="2"
                          maxlength="1000"
                          placeholder="Write a comment..."
                          required></textarea>

                <button type="submit" class="btn btn-sm btn-dark">
                    Comment
                </button>
            </form>
        </div>
    `;

    return card;
}


// -------------------------------
// ADD A COMMENT
// -------------------------------

postsFeed.addEventListener("submit", async event => {
    const form = event.target.closest(".post-comment-form");
    if (!form) return;

    event.preventDefault();

    if (!currentUser) return;

    const postId = form.dataset.postId;
    const text = form.elements.comment.value.trim();

    if (!text) return;

    try {
        await addDoc(
            collection(db, "posts", postId, "comments"),
            {
                text,
                authorUid: currentUser.uid,
                authorEmail: currentUser.email,
                createdAt: serverTimestamp()
            }
        );

        form.reset();

    } catch (error) {
        console.error("Comment error:", error);
        alert("Could not publish your comment.");
    }
});


// -------------------------------
// DISPLAY COMMENTS
// -------------------------------

function listenToPostComments(postId) {
    const commentsElement =
        document.getElementById(`post-comments-${postId}`);

    if (!commentsElement) return;

    const commentsQuery = query(
        collection(db, "posts", postId, "comments"),
        orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(commentsQuery, snapshot => {
        const container =
            document.getElementById(`post-comments-${postId}`);

        if (!container) return;

        if (snapshot.empty) {
            container.textContent = "No comments yet.";
            return;
        }

        container.innerHTML = snapshot.docs.map(commentDoc => {
            const comment = commentDoc.data();
            const canDelete = currentUser &&
                currentUser.uid === comment.authorUid;

            return `
                <div class="post-comment">
                    <strong>${escapeHTML(comment.authorEmail || "Member")}</strong>

                    <p class="mb-1">${escapeHTML(comment.text || "")}</p>

                    <small>${escapeHTML(formatDate(comment.createdAt))}</small>

                    ${canDelete ? `
                        <button type="button"
                                class="btn btn-sm btn-link text-danger"
                                data-delete-comment="${escapeHTML(commentDoc.id)}"
                                data-post-id="${escapeHTML(postId)}">
                            Delete
                        </button>
                    ` : ""}
                </div>
            `;
        }).join("");

    }, error => {
        console.error("Comment loading error:", error);
        commentsElement.textContent = "Could not load comments.";
    });

    commentListeners.set(postId, unsubscribe);
}


