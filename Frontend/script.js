// =====================================
// StayFlow Reviews V8
// Frontend -> Render Backend -> n8n
// =====================================

// ----------------------------
// URL PARAMETERS
// ----------------------------

const params = new URLSearchParams(window.location.search);

const reviewToken = params.get("token");

let guestId = null;
let guestName = null;

// ----------------------------
// DOM ELEMENTS
// ----------------------------

const welcomeTitle = document.getElementById("welcome-title");
const welcomeMessage = document.getElementById("welcome-message");

const ratingSection = document.querySelector(".rating-section");

const starButtons = document.querySelectorAll(".star");

const happyPanel = document.getElementById("happy-panel");
const googleButton = document.getElementById("google-btn");

const feedbackPanel = document.getElementById("feedback-panel");
const feedbackBox = document.getElementById("feedback-box");
const submitButton = document.getElementById("submit-feedback");

const thankyouPanel = document.getElementById("thankyou-panel");

// ----------------------------
// STATE
// ----------------------------

let selectedRating = 0;

// ----------------------------
// LOAD GUEST DETAILS
// ----------------------------

async function loadGuestDetails() {

    if (!reviewToken) {

        welcomeTitle.textContent = "Invalid Review Link";

        welcomeMessage.textContent =
            "This review link is invalid or incomplete.";

        ratingSection.classList.add("hidden");

        return;

    }

    try {

        const response = await fetch(
            "https://grand-horizon-feedback-system.onrender.com/review-details",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    token: reviewToken
                })
            }
        );

        const result = await response.json();

        console.log("Guest Details:", result);

        if (!result.success) {

            welcomeTitle.textContent = "Review Link Expired";

            welcomeMessage.textContent =
                "This review link is no longer valid.";

            ratingSection.classList.add("hidden");

            return;

        }

        guestId = result.guestId;
        guestName = result.guestName;

        welcomeTitle.textContent = `Hello, ${guestName}`;

    }

    catch (error) {

        console.error(error);

        welcomeTitle.textContent = "Connection Error";

        welcomeMessage.textContent =
            "Unable to verify your review link.";

        ratingSection.classList.add("hidden");

    }

}
// ----------------------------
// INITIALIZE
// ----------------------------

initialize();

async function initialize() {

    welcomeTitle.textContent = "Loading...";

    welcomeMessage.textContent =
        "Thank you for staying at Grand Horizon Hotel. We hope your stay was memorable.";

    happyPanel.classList.add("hidden");
    feedbackPanel.classList.add("hidden");

    if (thankyouPanel) {
        thankyouPanel.classList.add("hidden");
    }

    attachStarEvents();
    await loadGuestDetails();
}

// ----------------------------
// STAR EVENTS
// ----------------------------

function attachStarEvents() {

    starButtons.forEach((star) => {

        star.addEventListener("click", () => {

            selectedRating = Number(star.dataset.rating);

            highlightStars(selectedRating);

            ratingSection.classList.add("hidden");

            if (selectedRating >= 4) {

                happyPanel.classList.remove("hidden");

            } else {

                feedbackPanel.classList.remove("hidden");

            }

        });

    });

}

// ----------------------------
// HIGHLIGHT STARS
// ----------------------------

function highlightStars(rating) {

    starButtons.forEach((btn) => {

        if (Number(btn.dataset.rating) <= rating) {

            btn.classList.add("active");

        } else {

            btn.classList.remove("active");

        }

    });

}

// ----------------------------
// POSITIVE REVIEW
// ----------------------------

googleButton.addEventListener("click", async (e) => {

    e.preventDefault();

    const payload = {

        guestId,
        guestName,
        rating: selectedRating

    };

    console.log("Sending positive review...");
    console.log(payload);

    try {

        const response = await fetch(
            "https://grand-horizon-feedback-system.onrender.com/review",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            }
        );

        const result = await response.json();

        console.log("Backend Response:", result);

        if (result.success && result.action === "google") {

            window.open("https://maps.google.com", "_blank");

        } else if (result.success && result.action === "thankyou") {

            happyPanel.classList.add("hidden");

            if (thankyouPanel) {

                thankyouPanel.classList.remove("hidden");

            }

        } else {

            console.error(result);

        }

    } catch (error) {

        console.error(error);

        alert("Unable to connect to the server.");

    }

});

// ----------------------------
// NEGATIVE REVIEW
// ----------------------------

submitButton.addEventListener("click", async () => {

    const payload = {

        guestId,
        guestName,
        rating: selectedRating,
        feedback: feedbackBox.value

    };

    console.log("Sending negative feedback...");
    console.log(payload);

    try {

        const response = await fetch(
            "https://grand-horizon-feedback-system.onrender.com/review",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            }
        );

        const result = await response.json();

        console.log("Backend Response:", result);

        if (result.success && result.action === "thankyou") {

            feedbackPanel.classList.add("hidden");

            if (thankyouPanel) {

                thankyouPanel.classList.remove("hidden");

            }

        } else if (result.success && result.action === "google") {

            window.open("https://maps.google.com", "_blank");

        } else {

            console.error(result);

        }

    } catch (error) {

        console.error(error);

        alert("Unable to connect to the server.");

    }

});