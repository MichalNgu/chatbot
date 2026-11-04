
"use strict";

const BACKEND_URL = "https://chatbot-second.onrender.com/api/chat";

const form = document.getElementById("chat-form");
const questionInput = document.getElementById("question");
const emailInput = document.getElementById("email");
const answerText = document.getElementById("answer-text");
const submitButton = form.querySelector("button");

const MAX_QUESTION_LENGTH = 2000;
const MAX_EMAIL_LENGTH = 254;

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (submitButton.disabled) return;

    const question = questionInput.value.trim();
    const email = emailInput.value.trim();

    if (!question) {
        showMessage("Prosím, napište svůj dotaz.");
        questionInput.focus();
        return;
    }

    if (question.length > MAX_QUESTION_LENGTH) {
        showMessage("Dotaz je příliš dlouhý.");
        questionInput.focus();
        return;
    }

    if (
        email.length > MAX_EMAIL_LENGTH ||
        (email && !isValidEmail(email))
    ) {
        showMessage("Zadejte platný e-mail.");
        emailInput.focus();
        return;
    }

    const payload = {
        user: {
            email: email || null
        },
        question
    };

    submitButton.disabled = true;
    questionInput.disabled = true;
    emailInput.disabled = true;

    showMessage("AI připravuje odpověď…");

    try {
        const response = await fetch(BACKEND_URL, {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },

            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error ||
                `Server vrátil chybu (${response.status}).`
            );
        }

        if (
            data.success !== true ||
            typeof data.reply !== "string" ||
            !data.reply.trim()
        ) {
            throw new Error(
                "Server nevrátil platnou odpověď."
            );
        }

        // Zobrazení skutečné odpovědi AI
        answerText.textContent = data.reply;

    } catch (error) {

        console.error("Chatbot error:", error);

        showMessage(
            error.message ||
            "Nepodařilo se spojit s AI."
        );

    } finally {

        submitButton.disabled = false;
        questionInput.disabled = false;
        emailInput.disabled = false;

        questionInput.value = "";
        questionInput.focus();
    }
});


function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


function showMessage(message) {
    answerText.textContent = message;
}
