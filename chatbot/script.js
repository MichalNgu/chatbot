"use strict";

const USE_BACKEND = false;
const BACKEND_URL = "/api/chat";

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

    if (email.length > MAX_EMAIL_LENGTH || (email && !isValidEmail(email))) {
        showMessage("Zadejte platný email.");
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

    showMessage("Zpracovávám dotaz…");

    try {
        if (!USE_BACKEND) {
            await new Promise(resolve => setTimeout(resolve, 500));

            answerText.innerHTML = `
                <strong>Uživatel:</strong>
                ${escapeHtml(email || "Neuvedený email")}
                <br><br>
                <strong>Dotaz:</strong>
                ${escapeHtml(question)}
                <br><br>
            `;

            console.log(payload);
            return;
        }

        const response = await fetch(BACKEND_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            credentials: "same-origin",
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Server vrátil chybu (${response.status}).`);
        }

        const data = await response.json();

        if (typeof data.reply !== "string" || !data.reply.trim()) {
            throw new Error("Server nevrátil platnou odpověď.");
        }

        answerText.textContent = data.reply;

    } catch (error) {
        console.error(error);
        showMessage(error.message || "Nepodařilo se zpracovat dotaz.");
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

function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = String(value);
    return div.innerHTML;
}

function showMessage(message) {
    answerText.textContent = message;
}