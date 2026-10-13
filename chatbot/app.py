import os
import re

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

# Maximální velikost HTTP požadavku
app.config["MAX_CONTENT_LENGTH"] = 32 * 1024

# CORS pro školní projekt
CORS(app)

MAX_QUESTION_LENGTH = 2000
MAX_EMAIL_LENGTH = 254


def is_valid_email(email):
    """Základní kontrola formátu e-mailu."""
    return bool(
        re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email)
    )


@app.get("/")
def home():
    return "VDF Support Backend is running"


@app.post("/api/chat")
def chat():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "error": "Neplatný JSON požadavek."
        }), 400

    question = data.get("question")
    user = data.get("user", {})

    if not isinstance(question, str):
        return jsonify({
            "error": "Dotaz musí být text."
        }), 400

    question = question.strip()

    if not question:
        return jsonify({
            "error": "Prosím, napište svůj dotaz."
        }), 400

    if len(question) > MAX_QUESTION_LENGTH:
        return jsonify({
            "error": "Dotaz je příliš dlouhý."
        }), 400

    if not isinstance(user, dict):
        return jsonify({
            "error": "Neplatné údaje o uživateli."
        }), 400

    email = user.get("email")

    if email is None:
        email = ""
    elif not isinstance(email, str):
        return jsonify({
            "error": "E-mail musí být text."
        }), 400

    email = email.strip()

    if len(email) > MAX_EMAIL_LENGTH:
        return jsonify({
            "error": "E-mail je příliš dlouhý."
        }), 400

    if email and not is_valid_email(email):
        return jsonify({
            "error": "Zadejte platný e-mail."
        }), 400

    # Zatím pouze demonstrační odpověď.
    if email:
        reply = (
            f"Děkujeme za váš dotaz: „{question}“ "
            f"Vaše kontaktní adresa je {email}. "
            "Váš požadavek byl přijat podporou."
        )
    else:
        reply = (
            f"Děkujeme za váš dotaz: „{question}“ "
            "Váš požadavek byl přijat podporou."
        )

    app.logger.info("Byl přijat nový dotaz.")

    return jsonify({
        "reply": reply
    }), 200


@app.errorhandler(413)
def request_too_large(error):
    return jsonify({
        "error": "Požadavek je příliš velký."
    }), 413


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8000"))

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )